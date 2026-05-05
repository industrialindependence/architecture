# Using MCP with a Single Box

Operator-facing quickstart for the smallest possible AI-agent consumption deployment: one IIA box, one MCP server, one AI client.

The architecture's no-HTTP-at-boundary rule means the MCP server cannot run on the box. In a single-box deployment, "off-box" usually means the **operator's own workstation** or a **small adjunct host on the local network**.

## Topology

```
[ Operator's workstation / adjunct host ]                     [ The IIA box ]
                                                              
  AI client ──stdio or────► MCP server ──mTLS i3X──► IT NIC ──► ot.it.api
  (Claude Desktop,           (local, off-box           |              speaks
   Cursor, custom            wrapper from i3X          │              CESMII i3X
   MCP-aware agent)          to MCP)                   │
                                                       │
                                                       └── mTLS only;
                                                           no HTTP listener
                                                           on the box, ever.
```

**What runs where:**

- **On the box:** the structured query API (`ot.it.api`) speaking CESMII i3X over mTLS on the IT NIC. This is unchanged from the architecture spec.
- **Off-box (operator's workstation or adjunct host):** the MCP server. It holds an mTLS client identity authorized by the box's contract catalog, makes i3X queries, and exposes the responses as MCP tools / resources.
- **AI client:** any MCP-aware agent. Communicates with the local MCP server over stdio (most sovereignty-preserving) or local HTTPS (no traffic leaves the operator's machine).

The box never speaks HTTP, never exposes an MCP endpoint directly, never has an inbound listener for AI agents. The MCP server is a downstream consumer of i3X — exactly like any other consumer in the boundary-contract pattern.

## What the operator needs

- An MCP-server identity, signed by the operator's trust root (SPIFFE-format, e.g. `spiffe://<operator-domain>/iia/consumer/mcp_local`).
- A contract entry in the box's catalog authorizing that identity to query i3X. Use **Sample 5** in [`sample-contracts.md`](sample-contracts.md) as a starting point.
- An MCP-server implementation that can speak i3X on the source side and MCP on the consumer side. Two reasonable paths:
  - A generic **i3X → MCP bridge** (operator-built or community); the bridge translates i3X resources into MCP tools and queries.
  - A custom MCP server with i3X client baked in, configured against the box's endpoint.
- An MCP-aware AI client. Claude Desktop, Cursor, Continue, custom agents — any MCP client works, since MCP is the standard interface.

## Setup, end to end

The setup respects every IIA invariant — every change is a signed configuration artifact, the parser validates, the operator approves, the applier commits.

### 1. Provision the MCP-server identity

Issue an mTLS client cert and key for the MCP server against the operator's trust root. Embed the SPIFFE ID:

```
spiffe://<operator-domain>/iia/consumer/mcp_local
```

Store the cert and key on the workstation / adjunct host. Treat them as secrets — at-rest encryption is the operator's concern off-box.

### 2. Add a contract to the catalog

Author a contract entry, using Sample 5 (`iia.contract.boundary.mcp_server.i3x_query`) as the template. Fill in:

- `consumer.spiffe_id` — the SPIFFE ID issued in step 1.
- `consumer.organization` — the operator's organization.
- `data_inventory.namespaces` — what the AI agent is allowed to see (typically `ot.process.*` and `ot.health.*`; explicitly *not* `ot.security.*` or `ot.audit.*`).
- `query_constraints.rate_limit_qps` — a sane default (e.g., 50 qps); raise if the AI workload demands more.
- `use_constraints.not_for_control: true` — keep this set; AI consumption is advisory, not control.
- `raci.*` — name the actual operator roles (the `ai_agent_misuse` row in particular should name a security owner).

Save it as part of your configuration artifact source (CUE / KCL / JSON-Schema-validated JSON / YAML — operator policy).

### 3. Push the config update through the standard pipeline

This goes through the box's normal configuration-artifact lifecycle:

```
edit (off-box) → sign → submit → verify → parse → validate → stage → approve → apply
```

For a single-box deployment, the pipeline is the same as for a fleet — only the audience is smaller. Use whatever submission channel the box's inbound configuration contract specifies (typically a signed-bundle pull from a config repo, or direct submission via the management UI in `ot.mgmt.ui`).

When the staged change is applied, the new contract appears in the catalog at:

```
api://this-box/contract/iia.contract.boundary.mcp_server.i3x_query
```

The configuration attestation observer (`ot.attestation.config`) confirms running state matches staged. The box is now authorized to accept i3X queries from the MCP server identity.

### 4. Run the MCP server

Install / launch the MCP server on the workstation or adjunct host. Configure it with:

- The box's i3X endpoint URL — `https://<box-it-nic-ip>:<port>/i3x/v1` (HTTPS to the operator; the box terminates as mTLS-on-non-HTTP at the boundary, but i3X over mTLS is the wire format)
- The mTLS client cert + key from step 1
- The box's server cert trust root (so the MCP server validates the box's identity)

If running the MCP server in a container (recommended), use:

```yaml
# example podman quadlet — operator-side, NOT on the box
[Container]
Image=operator-registry.local/iia-mcp-bridge:latest
Volume=/etc/iia-mcp/certs:/certs:ro
Environment=IIA_BOX_ENDPOINT=https://10.31.4.10:8443/i3x/v1
Environment=IIA_TRUST_ROOT=/certs/box-trust-root.pem
Environment=IIA_CLIENT_CERT=/certs/mcp-client.pem
Environment=IIA_CLIENT_KEY=/certs/mcp-client.key
Environment=MCP_TRANSPORT=stdio   # or streamable_http for local HTTPS
PublishPort=127.0.0.1:7900:7900   # only if using HTTPS transport, localhost only

[Service]
Restart=on-failure
```

The MCP server pulls from i3X, caches responses appropriately (per the contract's freshness + rate-limit), and exposes:

- i3X catalog browsing as MCP **resources** (asset inventory, namespace tree)
- i3X queries as MCP **tools** (`query_timeseries`, `get_asset_state`, `get_finding`, etc.)

### 5. Connect the AI client

Configure the AI client (Claude Desktop, Cursor, etc.) to launch the MCP server process or connect to its stdio / localhost-HTTPS endpoint. Standard MCP client configuration — no IIA-specific knowledge required by the AI client itself.

The AI agent can now query the box's data. Every query goes through the MCP server, through i3X, into the box's contract enforcement. Every query is audited:

- The MCP server logs every query for audit (per `use_constraints.consumer_must_log_queries_for_audit: true` in the contract).
- The box's `ot.contract.delivery` adherence telemetry records every i3X request — sent, acknowledged, rate-limit-hit.
- The box's `ot.contract.violation` catches anything attempted outside the contract (e.g., a query for `ot.security.*` if that namespace was excluded).
- The audit chain on the box's inbound side carries every authentication event for the MCP server identity.

## What you don't get, by design

- **No live MCP API on the box.** The box doesn't and won't expose MCP directly. If you want MCP, you run a server off-box.
- **No access to security or audit data via this pathway.** Sample 5's data inventory excludes `ot.security.*`, `ot.audit.*`, and `ot.contract.*`. If you want AI to assist with security investigation, write a different contract with explicit scope and a much narrower RACI — that's a different deployment decision with different review.
- **No control authority.** `not_for_control: true` is enforced by contract semantics. AI agents reading the data must not use it for control loops or safety interlocks. The downstream MCP server's contracts to its consumers carry this constraint forward.

## Scaling up

When the deployment grows past one box:

- The MCP server moves from the operator's workstation to a broker box at broader scope. The box→broker mTLS path is unchanged; the consumer path (broker→AI agents) gets the broker's amenities (HA, redundancy, multi-tenant access).
- The MCP server now consumes i3X from multiple boxes; each connection is its own boundary contract in each box's catalog.
- The AI agent's query surface gets broader scope — agent can ask "show me asset state across all plant-A boxes" — but the per-box contracts still enforce per-box scope and RACI.
- The fractal recurses: a regional / corporate MCP server consumes from site MCP servers, and so on.

The single-box deployment is the simplest instance of the same pattern that runs across a hyperscale fleet.
