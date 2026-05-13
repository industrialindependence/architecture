# Glossary

Vocabulary used in IIA documentation. Definitions are normative for the architecture and align with how each term is used in [`README.md`](../README.md), [`internal-architecture.md`](internal-architecture.md), and [`sample-contracts.md`](sample-contracts.md).

Standards and protocols are listed where they carry architectural weight in IIA. External-standard definitions are summaries, not substitutes for the source standards.

---

**4Rs.** Response, Resolution, Reliability, Resilience. PERA+'s criteria for placing applications at the right level of an industrial enterprise. Response time tolerances loosen and resolution requirements coarsen as data moves up the levels; the 4Rs are why the box buffers high-fidelity data locally and aggregates downsampled data centrally.

**ACS.** Automation and Control Systems. The domain where data acts on or controls a physical process. Governed by SRP. The line between ACS and IT is drawn by the criticality of the data — its time sensitivity and its relationship to the physical process — not by network topology, org chart, or vendor label.

**Adherence telemetry.** The receipts a box emits proving how well a contract is being held — by the box and by the upstream consumer. Records connectivity, delivery, authentication, schema, quota, reconciliation, audit verification, SLA breaches, and contract violations. Emitted under `ot.contract.*`. Architecture specifies the shape; operator publishes the values.

**Approval artifact.** A signed authorization that permits specific boxes to apply specific staged updates within specific time windows. Supports per-box, per-fleet, two-person integrity (FR2 SR 2.4), and maintenance-window-conditional rollouts. Rollout strategy — canary, percentage, per-zone, per-plant — is operator policy expressed via which approval artifacts get issued to which boxes when.

**Attestation.** Independent observation that validates whether prevention is actually working. Three layers: SDN-policy attestation (where SDN is deployed), IDS as policy-leak observer, and the IO master observing the physical substrate. Findings emit under `ot.attestation.*` and route to the audit chain at the same severity as security events. The standing answer to "how do you know prevention is actually working?"

**Boundary contract.** A specialization of *data contract* at every connection that exits the ACS. Bilateral: the ACS side commits to data inventory, freshness, resolution, retention, ordering, delivery, reconnect behavior, version evolution, authentication, and audit binding. The upstream side commits to connectivity, authentication, acknowledgment, query response time, schema accommodation, capacity, and incident response. A *RACI matrix* names accountable parties for every failure mode.

**Secure edge gateway.** The canonical architectural element. A self-contained unit deployed at the head of every zone, serving as the secure boundary between control system data inside (governed by SRP) and information published outward (governed by CIA). Witnesses traffic on the ACS substrate, actively polls devices that permit it, hosts the zone's decentralized historian, and publishes securely outbound to whatever the zone's consumers are. Devices inside the zone can be any security level; the security boundary lives at the gateway, not at every device. The secure outbound publish is the only access into the zone from outside. Identical at every zone; only scope changes. Internally partitioned into inbound, internal DMZ, and outbound, plus a management interface. Logical, not physical: realizable as a commodity-hardware appliance, multi-host cluster, virtualized stack, or hyperscale deployment. The architecture invariants travel across all realizations. Has two physical configurations: **single-box (SL3, the floor)** and **two-box + diode (SL4, the ideal)**. See *Two-Box Method*.

**The box / The unit.** Colloquial shorthand for *secure edge gateway*. Used in narrative or informal contexts; the canonical term in formal architectural contexts is *secure edge gateway*.

**Inside box.** In the two-box realization of the secure edge gateway, the unit on the ACS side. Witnesses traffic, actively polls devices that permit it, hosts the decentralized historian for the zone, and publishes outbound across the hardware data diode to the outside subscriber. The inside box is never directly reachable from outside the zone.

**Outside box / outside subscriber.** In the two-box realization of the secure edge gateway, the unit on the IT side. Receives published data from the inside box across the hardware data diode and is what consumers connect to. Compromise of the outside subscriber cannot reach the inside box — physics, not policy, prevents the return path. "Outside subscriber" is the role-precise name; "outside box" is the colloquial.

**Data diode.** Hardware unidirectional optical link with no return path. Sits between the inside box and the outside subscriber in the two-box realization. Buys SL4 by physics: nothing the outside box receives can travel back to the inside.

**CESMII i3X.** The preferred standardized query interface at the L2↔L3 boundary. OpenAPI under the hood. v1 covers time-series and static-state queries; transactional and method semantics are punted to v2 — use a separate transactional channel for MES/MOM-class flows. Source: CESMII (Clean Energy Smart Manufacturing Innovation Institute). Deployed via soft-launch / alpha-with-vendors model. IIA treats i3X as load-bearing alongside MQTT, OPC UA, and Sparkplug B.

**Choreograph.** Verb for telemetry flows: fire-and-forget on the edge profile, no acknowledgment expected at the publisher. Time-series, events, and asset state changes are choreographed. The box's edge publisher handles them. Paired with *orchestrate*; mixing the two in one pipeline is a recurring failure mode.

**CIA.** Confidentiality, Integrity, Availability. The vocabulary for *information* — records, historical by nature. Governs IT systems and ACS data once it has crossed the domain boundary and become information. Not the right substrate for ACS itself; ACS is upstream of CIA, governed by SRP. (See *SAIC* for PERA's safety-prepended extension of CIA used at the IT side of safety-relevant information stores.)

**CIAD.** Control and Information Architecture Diagram. PERA+'s conceptual block diagram drawn during Conceptual Engineering. IIA reference deployments use CIADs to communicate architecture at the conceptual level.

**CIND.** Control and Information Network Diagram. PERA+'s network detail diagram drawn during Preliminary Engineering, with SL1–SL4 annotations. IIA reference deployments use CINDs to communicate network detail.

**Configuration as signed artifact.** The box accepts configuration only as a signed, constrained-grammar text document consumed by a parser, never as a live API. Same pattern as image admission and OS updates. The management UI is a text generator with no privileged access. The parser is the trust boundary. The applier is a gated internal call set that executes when a verified-and-validated artifact is staged, then exits. The box has no live mutation channels — image, OS, and configuration are all artifact-in flows. Pattern is GitOps for an air-gapped industrial appliance.

**Contract catalog.** The deployment's full set of data contracts. Versioned. Discoverable via the structured query API. Communication without a contract entry is a deployment defect: it is *prevented* where the architecture can enforce it (kernel firewall + workload identity + admission policy + mTLS cooperate to refuse uncontracted traffic) and *flagged* where prevention is not possible (passive ACS observation, broadcast, legacy protocols).

**Data contract.** Explicit description of a communication on the box or across its boundaries. Universal: inter-container, inter-zone, cross-side, external, and device-level. Communication without a contract is prevented or flagged. The deployment's full set of contracts is the *contract catalog*. *Boundary contracts* are the bilateral specialization at every connection that exits the ACS. Synonyms in use: *bilateral data contract* (boundary case), *SLA*, *consumer contract* (when single-direction is sufficient).

**Distributed (not federated).** IIA is a distributed mesh of identical units under one operator. It is not a federation of independent parties exchanging data by treaty. *Distributed* describes the topology and the operator model both.

**Edge profile.** The outbound publisher protocol the box speaks at a given deployment. Operator-selectable. The architecture is profile-agnostic and names no default. MQTT + Sparkplug B is appropriate at controller↔area-broker (PERA L1/L2). Above L2, OPC UA pub/sub, structured query on mTLS, or batch-write to a BI lake (Iceberg / Delta / DuckLake on object store) is typically the better fit.

**Fractal.** The IIA deployment property: a box at the head of every zone — the secure edge gateway. Inside the zone is control system data governed by SRP; at the box, it becomes information governed by CIA and is published securely outbound to whatever the zone's consumers are. Devices inside the zone can be any security level — the security boundary lives at the gateway, not at every device. The box witnesses traffic on the ACS substrate and actively polls devices that permit it; both feed the decentralized historian on the box. **The secure outbound publish is the only access into the zone from outside it.** The unit is identical at every zone; the operator defines what counts as a zone, and there is no required PERA L1–L5 tower. Centralized collection — corporate, regional, or cloud — is not a different architecture; it is the same unit at broader scope. The fractal does not collapse at the top. Update orchestration is also fractal: each box at broader scope manages its children's updates.

**IEC 62443.** Industrial cybersecurity standard. Defines security levels (SL1–SL4) and foundational requirements (FR1–FR7). IIA targets SL3 floor in software-only mode and SL4 via the two-box mode with hardware data diode.

**Inter-box mesh substrate.** Distinct architectural role from the in-box bus and the edge publisher. Enables a box at one scope to query or subscribe to a box at another scope, across the fractal. Optional: explicit upstream-pull patterns work without it. Eclipse Zenoh's federated routers fit this role natively; cascading MQTT brokers and custom mTLS overlays are alternatives.

**IO master.** A role: an independent IO substrate observer running in its own zone with its own SPIFFE identity and attestation key. Cross-checks readings from the box's primary capture against an independent observation channel covering analog IO, fieldbus, and industrial Ethernet. Independence of the observation path is the load-bearing property — sharing a NIC or switch port or software stack with the primary defeats the attestation. Findings emit under `ot.attestation.io`.

**ISA-95.** The canonical IT↔ACS interface model, particularly for process industries. Describes the data model the broader-scope consumer expects when ACS data crosses the boundary and becomes information. IIA does not enforce ISA-95 at the edge — schema modeling lives at broader scope — but the box is engineered to feed ISA-95-modeled consumers without friction.

**Managed Trust.** PERA's framing for the ACS side of the domain boundary. Every device and process is known, identified, and accountable to the operational manager. The box terminates Zero Trust on the IT side and begins Managed Trust on the ACS side.

**MCP (Model Context Protocol).** Anthropic-developed open protocol for AI-agent access to tools and resources. In IIA, MCP servers run *off-box at broader scope* (broker, corporate, or operator workstation in a single-box deployment); the box exposes i3X over mTLS, and an MCP server wraps i3X for AI agents. MCP's canonical Streamable HTTP transport conflicts with the box's no-HTTP-at-boundary rule, so MCP server placement is always off-box. This is the *connect-first → model-second → AI-third* pattern made concrete.

**MQTT.** Lightweight pub/sub protocol. Appropriate at controller↔area-broker (PERA L1/L2) when paired with Sparkplug B for the schema layer. Above L2, prefer OPC UA pub/sub, structured query API on mTLS, or batch-write to a BI lake.

**OPC UA.** Industrial pub/sub and request/response protocol. Common edge profile choice above L2. Used by the box for both passive ACS-side observation and outbound publishing depending on deployment.

**Orchestrate.** Verb for transactional flows: synchronous, acknowledged, traceable end-to-end. MES/MOM operations, work-order acks, and recipe downloads are orchestrated. Goes through the structured query API or a dedicated transactional channel — never the edge publisher. Paired with *choreograph*.

**Parser as trust boundary.** The constrained, non-Turing-complete grammar parser that admits configuration onto the box. The same architectural role for configuration that container-runtime admission is for workloads, and that cosign verification is for images. Operator-chosen format (CUE, KCL, Dhall, JSON-Schema-validated JSON, etc.). Small enough to be auditable; Turing-complete grammar loses the security property.

**PERA+.** Reference architecture maintained by Gary Rathwell at Entercon (pera.net), licensed CC BY-SA 4.0. Defines hierarchical levels (typically L0 through L5 or higher), zone boundaries, and the 4Rs. IIA aligns with PERA+ and adopts: the 4Rs, CIAD/CIND diagram conventions, the Zero Trust ↔ Managed Trust framing, and the principle of "secure interfaces, not integration."

**RACI matrix.** In a *boundary contract*, the named accountable parties for every failure mode. Responsible, Accountable, Consulted, Informed. The mechanism by which "ACS is never the side without receipts" is operationalized.

**SAIC.** Safety, Availability, Integrity, Confidentiality. PERA's extension of CIA, prepending Safety. The right frame for IT systems that touch safety-critical *information* — historians, audit stores, regulator-facing dashboards. Does not govern the ACS itself. SRP and SAIC are not variants of one ordering; they describe different substrates.

**SDN policy plane.** An optional prevention layer (recommended where available): programmable network policy compiled from the contract catalog and enforced on the fabric. Where deployed, conduits exist on the wire only where the catalog authorizes. Cilium/eBPF on appliance scope; OVN-class on multi-host. Non-SDN deployments are fine — they rely on the host-layer prevention triad (kernel firewall + SPIFFE + admission) plus mTLS plus the IDS attestation observer being able to alert. The architecture's hard requirement is that *some* network-plane attestation can alert; SDN strengthens prevention but does not replace attestation.

**Security Level (SL1–SL4).** IEC 62443's grading of cybersecurity capability. IIA software-only mode targets SL3 (segmentation + authentication + audit + push-only outbound on the operator-selected edge profile). IIA two-box mode reaches SL4 via hardware data diode and physical one-way separation. SL1 and SL2 are SL3 with controls relaxed by deployment policy, not separate products. SL3 does *not* enforce unidirectional flow — that is the SL4 promise.

**Sovereignty.** The unit is the complete system for its zone and works with no upstream connectivity. Sovereignty is not isolation: historians on adjacent boxes can know about each other without becoming dependent on each other. Awareness is mutual; dependency is not. The constraint is "no dependency," not "no awareness."

**Sparkplug B.** Schema and session-state layer on top of MQTT. Appropriate at controller↔area-broker (PERA L1/L2). Carries process variables and rebirth semantics for known publishers. Not the right edge profile above L2; rebirth-storm and QoS-degraded-integrity behavior outside its design envelope.

**SRP.** Safety, Reliability, Performance. The vocabulary for *physical action and physics*. Governs the ACS substrate. Reliability and Performance are properties of the physical system; Safety is what the system protects. The correct priority ordering for ACS, as articulated by Robert Radvanovsky at Infracritical ([srpmodel.infracritical.com](https://srpmodel.infracritical.com/srpmodel.php)). A security tool that compromises any of the three is not a security tool.

**Structured query API.** The box's pull-mode interface. mTLS-authenticated, non-HTTP. Candidates per deployment include CESMII i3X (preferred industrial standard at L2↔L3), gRPC, NATS req/reply, OPC UA req/reply, Zenoh queryables, and MCP-over-mTLS. The contract catalog is one of the resources discoverable via this API.

**Two-Box Method.** The canonical articulation of physically enforced ACS/IT segmentation: two boxes and a hardware data diode. Documented by John Rinaldi and Gary Workman in *The Everyman's Guide to EtherNet/IP Network Design* (Real Time Automation, 2022, ISBN 9798839986152), drawn from Workman's experience architecting EtherNet/IP networks at General Motors. IIA generalizes the pattern in software at SL3 and deploys natively into it at SL4.

**Update orchestration (fractal).** Each box at broader scope manages its children's updates: publishes intended-state manifest (OS image hash, config hash, rule-set hashes, approval artifacts), receives reported state (running hashes, attestation, audit). No global update server; the fleet's source of truth lives at whatever scope the operator manages from. Children pull manifests on a cadence, reconcile to declared state, and report back. Pull-only, mTLS, no inbound listener, no outbound HTTP. Disconnected boxes converge on intended state when reconnected, at operator pace via still-valid approvals.

**Zenoh.** Eclipse open-source pub/sub plus queryable plus federated-router protocol. Distinctive in IIA because it can fill multiple roles on one protocol: edge publisher (pub/sub), structured query API (queryables), in-flight bus, and inter-box mesh substrate (cross-scope routing across the fractal). No rebirth-storm or QoS-1/2-degraded-integrity pathology. Apache 2.0.

**Zero Trust.** PERA's framing for the IT side of the domain boundary. Every action is unauthenticated until proven. The box terminates Zero Trust on the IT side and begins Managed Trust on the ACS side.

**Zone.** The unit of industrial operation, per IEC 62443. The unit of IIA deployment: a box per zone.
