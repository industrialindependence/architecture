# Sample Data Contracts

Worked examples of contracts in the IIA contract catalog. **Not normative** — the architecture specifies the *shape* of each contract dimension; the actual format and values are operator policy. Examples below use YAML for readability; CUE, KCL, Dhall, JSON Schema-validated JSON, and TOML are equally valid grammars (see *Reference Implementations*).

Every catalog entry carries:

- A unique identifier (`iia.contract.<scope>.<purpose>`)
- A semantic version (additive within major; breaking change requires major-version bump and deprecation overlap)
- A scope: `internal` (intra-box), `boundary` (cross-domain), `device` (PLC / sensor / fieldbus / wireless), `inbound` (artifacts the box pulls in)
- The declared shape per the dimensions in `internal-architecture.md` *Data Contracts*

A communication that does not match a catalog entry is **prevented** (firewall + SPIFFE drop) or **flagged** (`contract.violation`).

---

## Sample 1 — Internal contract: collector → lake

Inter-zone contract between `collect` and `lake`. Enforced by the kernel firewall, the workload identity issuer (SPIFFE), and mTLS at the application layer.

```yaml
contract:
  id: iia.contract.internal.collect_to_lake
  version: 1.2.0
  scope: internal

  source:
    spiffe_id: spiffe://iia.local/zone/collect/workload/protocol_collector
  destination:
    spiffe_id: spiffe://iia.local/zone/lake/workload/lake_writer

  allowed_operations:
    - WRITE_BATCH      # batched record append
    - WRITE_STREAM     # single record append

  transport:
    protocol: grpc
    over: mTLS
    bus_topic: null    # direct gRPC, not bus-mediated

  cardinality: many-to-one

  failure_semantics:
    on_lake_unreachable: buffer_local
    buffer_max_records: 100000
    buffer_max_age: 30d
    on_buffer_full: drop_oldest_with_alarm

  payload:
    schema_ref: oneof[opcua_record, modbus_record, ethernet_ip_record, lorawan_record]
    max_size_kb: 64
    rate_limit_per_sec: 50000

  audit:
    every_attempt: false
    every_failure: true
    every_buffer_event: true
```

Notes:

- SPIFFE IDs are bound to TPM-attested image hashes. A workload booting from an unsigned image cannot get an SVID and cannot speak under this contract.
- `failure_semantics` declares how the collector behaves when the lake is unreachable — relevant during disconnected operation and reconnect.
- `audit.every_failure: true` ensures `contract.violation` catches catalog-violating attempts.

---

## Sample 2 — Boundary contract: box → BI lake (batch)

External boundary contract between the box's edge publisher and an upstream BI lake consumer at broader scope. Bilateral — both sides commit.

```yaml
contract:
  id: iia.contract.boundary.bi_lake.batch
  version: 2.0.0
  scope: boundary

  publisher:
    role: publish
    spiffe_id: spiffe://iia.local/zone/publish/workload/edge_publisher
  consumer:
    organization: enterprise-bi
    spiffe_id: spiffe://enterprise.example/iia/consumer/bi_ingest
    contact_path: oncall://enterprise-bi/ingest-pipeline

  edge_profile:
    type: bi_lake_batch              # open table format on object storage
    transport:
      protocol: s3+mtls
      endpoint: s3://enterprise-bi-lake/iia-zone-a/
      mTLS_trust_root: enterprise-trust-root-v3
    schedule: hourly_aligned
    catalog_format: iceberg          # or delta, ducklake — operator policy

  data_inventory:
    namespaces:
      - process.*
      - health.*
    excludes:
      - security.*                # security events on a separate contract
      - audit.*

  freshness:
    native_resolution_ms: 100
    published_resolution: hourly_aggregate
    publication_lag_max: 90m

  retention:
    on_box_minimum: 30d
    on_box_aging_policy: oldest_first_after_acked

  order_and_sequencing:
    sequence_per_service: monotonic
    service_id_format: uuid_v7

  delivery_semantics:
    mode: at_least_once
    dedupe_via: sequence_number_per_service
    consumer_dedupe_required: true

  reconnect_and_gap:
    on_box_buffer: 30d
    consumer_gap_detection: sequence_discontinuity
    watermark_endpoint: api://this-box/contract/iia.contract.boundary.bi_lake.batch/watermark

  version_evolution:
    additive_within_major: true
    breaking_requires_major_bump: true
    deprecation_overlap_min: 90d

  authentication:
    publisher_credentials_rotation: 7d
    consumer_credentials_issuer: enterprise-trust-root-v3

  audit_binding:
    consumer_must_validate_chain_head: true
    chain_head_publication_period: 1m
    failure_to_validate: contract_violation

  quota:
    rows_per_hour_max: 50000000
    payload_size_max_mb: 256

  upstream_obligations:
    connectivity:
      bandwidth_min_mbps: 50
      latency_max_p99_ms: 500
      uptime_min: 99.5%
    response:
      ack_window_max_seconds: 30
      query_response_max_seconds: 5
    incident_response:
      on_call_path: pagerduty://enterprise-bi/p2
      response_time_max: 4h
      escalation: pagerduty://enterprise-bi-director/p1
    capacity:
      sustained_rows_per_hour: 50000000
      burst_rows_per_hour: 200000000

  raci:
    connectivity_loss:
      acs_responsible: site-noc-team
      acs_accountable: site-ops-manager
      upstream_responsible: enterprise-network-team
      upstream_accountable: enterprise-cio
      consulted: [acs-architecture-board]
      informed: [audit-team]
    schema_mismatch:
      acs_responsible: site-data-engineering
      acs_accountable: site-ops-manager
      upstream_responsible: enterprise-bi-engineering
      upstream_accountable: enterprise-data-director
      consulted: [acs-architecture-board, regulator-liaison]
      informed: [audit-team]
    audit_chain_mismatch:
      acs_responsible: site-security-team
      acs_accountable: site-security-manager
      upstream_responsible: enterprise-bi-security
      upstream_accountable: enterprise-ciso
      consulted: [forensics-team]
      informed: [legal, audit-team]
    capacity_exhaustion:
      acs_responsible: site-data-engineering
      acs_accountable: site-ops-manager
      upstream_responsible: enterprise-bi-engineering
      upstream_accountable: enterprise-data-director
      consulted: []
      informed: [acs-architecture-board]
    cert_expiry:
      acs_responsible: site-security-team
      acs_accountable: site-security-manager
      upstream_responsible: enterprise-pki-team
      upstream_accountable: enterprise-ciso
      consulted: []
      informed: [audit-team]
```

Notes:

- `upstream_obligations` are stated in concrete numbers — bandwidth, latency, uptime, ack windows, response times. Adjectives ("fast," "reliable") are deployment defects.
- `raci` names roles, not "the team." The architecture requires named accountable parties.
- The contract is published, not implicit — fetchable by the consumer at a well-known endpoint before it subscribes or queries.

---

## Sample 3 — Device contract: PLC tag stream

Contract for an ACS device exchange — a specific PLC publishing tag values via OPC UA.

```yaml
contract:
  id: iia.contract.device.plc_compressor_unit_3.opcua
  version: 1.0.0
  scope: device

  device:
    type: plc
    vendor: '<vendor>'
    model: '<model>'
    serial: '<redacted>'
    location: site/plant_a/area_3/compressor_unit_3

  collector:
    role: collect
    spiffe_id: spiffe://iia.local/zone/collect/workload/opcua_subscriber

  transport:
    protocol: opcua
    endpoint: opc.tcp://10.31.4.42:4840
    security: SignAndEncrypt-Basic256Sha256
    user_auth: x509_client_cert

  observation_mode:
    mode: subscription
    sample_rate_ms: 100
    queue_depth: 100

  declared_tags:
    - id: compressor_unit_3.discharge_pressure
      type: float32
      unit: psi
      sample_rate_ms: 100
    - id: compressor_unit_3.suction_pressure
      type: float32
      unit: psi
      sample_rate_ms: 100
    - id: compressor_unit_3.motor_current
      type: float32
      unit: amperes
      sample_rate_ms: 100
    - id: compressor_unit_3.run_state
      type: enum
      values: [stopped, starting, running, stopping, faulted]
      sample_rate_ms: 1000

  failure_semantics:
    on_device_unreachable: log_and_alarm
    on_subscription_lost: reconnect_with_exponential_backoff
    on_unknown_tag: emit_contract_violation
    on_undeclared_value_range: emit_contract_violation

  io_attestation:
    enabled: true
    cross_check_via: io-master
    tolerance_pct: 0.5
    on_divergence: emit_attestation_io_event
```

Notes:

- `declared_tags` is the data inventory at device granularity. A tag observed but not declared → `contract.violation`. A declared tag that stops appearing → SLA event.
- `io_attestation` engages the redundant IO master to cross-check the device's reported values; discrepancies emit `attestation.io`.

---

## Sample 4 — Wireless IO contract: LoRaWAN sensor field

Contract for a LoRaWAN sensor population observed via a LoRaWAN gateway. Explicit IO-only-never-control classification per the field rule.

```yaml
contract:
  id: iia.contract.device.lorawan.field_env_sensors.zone_a
  version: 1.0.0
  scope: device
  classification: io_only_never_control

  gateway:
    type: lorawan_gateway
    network_server: lns://lorawan-ns.local:8080
    spiffe_id: spiffe://iia.local/zone/collect/workload/lorawan_subscriber

  device_class:
    application_id: field-env-zone-a
    sensor_type: temperature_humidity
    expected_count: 24

  expected_cadence:
    nominal_minutes: 5
    silence_alert_minutes: 30

  observation_mode:
    mode: mqtt_subscription
    topic_prefix: application/field-env-zone-a/+/up
    qos: 1

  declared_payload:
    fields:
      - name: temperature_c
        type: float32
        range: [-40, 85]
      - name: humidity_pct
        type: float32
        range: [0, 100]
      - name: battery_pct
        type: int8
        range: [0, 100]

  failure_semantics:
    on_silence_alert: emit_health_event
    on_payload_out_of_range: emit_contract_violation
    on_unknown_device: emit_contract_violation

  retention:
    on_box_minimum: 30d

  use_constraints:
    not_for_control: true
    not_for_safety_interlock: true
    advisory_only: true
```

Notes:

- `classification: io_only_never_control` is enforceable downstream: consumers receiving this data class are required by their own contracts to not use it for control loops or safety interlocks.
- `expected_cadence.silence_alert_minutes` defines what counts as a "missing" sensor for SLA purposes.

---

## Sample 5 — Boundary contract: MCP server consuming i3X (AI-agent pathway)

External boundary contract between the box's structured query API (speaking CESMII i3X) and a downstream MCP server running at broader scope. The MCP server wraps i3X and exposes it as MCP tools / resources to AI agents. The MCP server lives off-box because MCP's canonical Streamable HTTP transport conflicts with the box's no-HTTP-at-boundary rule.

```yaml
contract:
  id: iia.contract.boundary.mcp_server.i3x_query
  version: 1.0.0
  scope: boundary

  publisher:
    role: api
    spiffe_id: spiffe://iia.local/zone/api/workload/i3x_query_server

  consumer:
    organization: enterprise-ai
    role: mcp_server
    spiffe_id: spiffe://enterprise.example/iia/consumer/mcp_bridge
    contact_path: oncall://enterprise-ai/mcp-bridge

  edge_profile:
    type: structured_query_api
    standard: cesmii_i3x
    standard_version: v1
    transport:
      protocol: mtls
      endpoint: api://this-box/i3x/v1
      mTLS_trust_root: enterprise-trust-root-v3

  data_inventory:
    namespaces:
      - process.*
      - health.*
    excludes:
      - security.*       # do not expose security data through AI consumption pathway
      - audit.*
      - contract.*

  freshness:
    native_resolution_ms: 100
    query_latency_max_p99_ms: 500

  delivery_semantics:
    mode: query_response
    consistency: eventual_with_watermark

  query_constraints:
    max_query_complexity: 100      # i3X complexity score
    max_response_rows: 100000
    rate_limit_qps: 50
    timeout_seconds: 30

  authentication:
    mtls_required: true
    consumer_credentials_rotation: 7d

  use_constraints:
    consumer_must_attribute_data_to_box: true
    consumer_may_relay_to_ai_agents: true     # this is the contract's purpose
    consumer_must_log_queries_for_audit: true
    not_for_control: true                     # AI consumption is advisory, not control

  upstream_obligations:
    response:
      ack_window_max_seconds: 5
      query_response_max_seconds: 5
    incident_response:
      on_call_path: oncall://enterprise-ai/mcp-bridge
      response_time_max: 8h

  raci:
    query_failure:
      acs_responsible: site-data-engineering
      acs_accountable: site-ops-manager
      upstream_responsible: enterprise-ai-engineering
      upstream_accountable: enterprise-data-director
      consulted: []
      informed: [audit-team]
    rate_limit_exceeded:
      acs_accountable: site-ops-manager
      upstream_responsible: enterprise-ai-engineering
      upstream_accountable: enterprise-data-director
    ai_agent_misuse:
      acs_responsible: site-security-team
      acs_accountable: site-security-manager
      upstream_responsible: enterprise-ai-trust-and-safety
      upstream_accountable: enterprise-ciso
      consulted: [legal, regulator-liaison]
      informed: [audit-team]
```

Notes:

- The MCP server is the consumer; AI agents are downstream of the MCP server, not direct consumers of the box. The architecture's no-HTTP-at-boundary rule is preserved because the box only exposes i3X over mTLS.
- `use_constraints.consumer_may_relay_to_ai_agents: true` makes the AI consumption pathway explicit in the contract, not implicit.
- `not_for_control: true` constrains downstream use — the MCP server (and by extension AI agents) can read but cannot use this data class for control-loop decisions.
- The `ai_agent_misuse` RACI row names trust-and-safety as the upstream responsible party. AI-driven access is novel enough that it warrants its own named failure mode.

---

## Sample 6 — Inbound contract: configuration pull

The box's own configuration intake, framed as a contract under the universality rule. The box pulls signed configuration artifacts from upstream; the contract specifies trust roots, grammar, validation behavior, and approval semantics.

```yaml
contract:
  id: iia.contract.inbound.configuration_pull
  version: 1.0.0
  scope: inbound

  puller:
    role: cfg
    spiffe_id: spiffe://iia.local/zone/cfg/workload/config_puller

  source:
    pull_target: https://config-repo.enterprise.example/iia-fleet/box-id-X.cue.signed
    schedule: every_15m
    on_connectivity_restore: true
    transport: mtls
    mTLS_trust_root: enterprise-config-trust-root-v3

  artifact_validation:
    signature_required: true
    signing_keys:
      - enterprise-config-key-v3
      - enterprise-config-key-v4
    grammar: cue
    grammar_version: 0.9
    max_size_kb: 256

  applier:
    requires_approval: true
    approval_artifact_source: https://config-repo.enterprise.example/iia-fleet/approvals/
    approval_grammar: cue
    approval_signing_keys:
      - enterprise-approver-key-A
      - enterprise-approver-key-B
    two_person_integrity: true
    approval_max_age: 24h

  failure_semantics:
    on_signature_invalid: reject_and_alarm
    on_parse_failure: reject_and_alarm
    on_validation_failure: reject_and_stage_for_review
    on_apply_failure: rollback_and_alarm

  attestation:
    running_vs_staged_check_period: 5m
    on_divergence: emit_attestation_config_event
```

Notes:

- This is the contract that governs the box's own configuration intake — itself a contract under the universality rule (every communication is contracted).
- `applier.two_person_integrity: true` requires two distinct operator signatures on every approval artifact (FR2 SR 2.4 control).
- The `artifact_validation.grammar: cue` selects the configuration grammar; deployments can specify KCL, Dhall, JSON-Schema-validated JSON, etc. instead.

---

## Catalog mechanics

The full set of contracts is the **contract catalog**. The catalog is itself a versioned, signed artifact — the same shape as the configuration artifact, validated by the same parser, applied by the same gated applier. Adding a contract, deprecating one, or evolving an existing one is a configuration change that goes through the box's standard verify → parse → validate → stage → authorize → apply pipeline.

Catalog entries are reachable via the structured query API at well-known endpoints:

| Endpoint | Returns |
|---|---|
| `api://this-box/contract/<id>` | Current version of the named contract |
| `api://this-box/contract/<id>/history` | All versions, with deprecation status |
| `api://this-box/contract/<id>/watermark` | Per-consumer reconciliation watermark |
| `api://this-box/catalog/manifest` | Index of all contracts + their current versions |
| `api://this-box/catalog/raci/<event>` | RACI matrix entries for a given failure mode, across all contracts that name it |

Operators wire the catalog into their CI/CD, their incident-response systems, and their consumer onboarding — the catalog is the integration unit that makes the rest of the OT/IT relationship explicit.
