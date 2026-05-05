# Industrial Independence Architecture (IIA)

**An architectural principle for industrial infrastructure.**

IIA is the deliberate abstraction of a convergence pattern that exists in adjacent domains, named and applied for the first time to automation and control systems. It is not a product. It is not a framework. It is the architectural principle, claimed by name.

Authored by ***REMOVED***, ISA-99 (IEC 62443) committee member and founder of Fathom.

## The Principle

Deploy a single self-contained unit at every zone of an industrial network. The unit is identical at every level. The only thing that changes is scope.

The unit works with no upstream connectivity. No cloud. No corporate network. No internet. It is the complete system for its zone. If connectivity exists, it composes upward. If connectivity drops, nothing changes on site.

The cloud is a viewport into the mesh of units. It is not the platform. It is not the brain. It is an optional window into something that is already complete without it.

## The Domain Boundary

The line between ACS and IT is not drawn by network topology, org chart, or vendor label. It is drawn by the criticality of the data, which is determined by its time sensitivity and its relationship to the physical process.

If the purpose of the data is to act on or control the process, it is ACS data. SRP governs it. The system that carries it must meet the safety, reliability, and performance requirements of the process it serves.

If the purpose of the data is to report on the process, it is information. CIA governs it. IT rules, IT infrastructure, and IT governance apply.

This distinction is absolute. A setpoint is ACS. A historian record of that setpoint is information. A control loop closing at 10ms is ACS. A dashboard displaying that loop's trend over the last hour is information. The same physical value crosses the domain boundary the moment it stops requiring real-time action and becomes a record of what happened.

Everything outside the automation cell is IT. Application data, demand planning, process reporting, origin tracking, business intelligence, compliance reporting. All of it. These are consumers of information that originated in the ACS domain, transmitted across the boundary after the time-critical obligation has been met.

The box sits at this boundary. Inside the automation cell, it observes and protects ACS data under SRP rules. At the boundary, it transforms ACS data into information and publishes it north under IT rules. It does not allow IT governance to reach back into the cell. The boundary is enforced by architecture, not by policy.

This boundary maps directly to PERA's articulation: it is where the IT *Zero Trust* environment changes to the ACS *Managed Trust* environment. On the IT side, every action is unauthenticated until proven. On the ACS side, every device and process is known, identified, and accountable to the operational manager. The box terminates one and begins the other.

## The Two-Box Method

The canonical articulation of physically enforced ACS/IT segmentation predates IIA. John Rinaldi and Gary Workman documented it in *[The Everyman's Guide to EtherNet/IP Network Design](https://www.amazon.com/EVERYMANS-GUIDE-ETHERNET-NETWORK-DESIGN/dp/B0B7PSHK7J)* (Real Time Automation, 2022), drawn from Workman's experience architecting EtherNet/IP networks at General Motors.

The pattern is two boxes and a hardware data diode. Box 1 sits in the ACS zone, collects from PLCs and SCADA, produces data. A hardware data diode — a unidirectional optical link with no return path — sits between. Box 2 sits in the IT zone, receives over the diode, and forwards to historians and dashboards. Compromise of Box 2 cannot reach Box 1. Compromise of the IT network cannot reach the ACS network. The boundary is enforced by physics, not by policy.

IIA inherits the method and extends it into two deployment modes governed by the same architecture.

**Software-only mode (SL3).** A single IIA box at the boundary. The ACS-facing interface is passive — no IP stack transmit, no listeners. The box is internally partitioned into inbound, internal DMZ, and outbound; default-deny kernel firewall conduits between zones, mTLS authentication at every internal hop. Outbound is push-only on an operator-selected edge profile, plus a structured query API on mTLS for pull. No HTTP listener at the external boundary in any direction. Reaches Security Level 3 against motivated adversaries with ACS-specific skills.

**Two-box mode (SL4).** One IIA box on the ACS side, hardware data diode between, one IIA box on the IT side with physical one-way separation from the external consumer. Same software, same configuration model, same operator experience. The architecture does not change. Only the physical topology does.

SL3 does not promise unidirectional flow. SL3 promises a hardened, segmented, authenticated, audited boundary. Unidirectional flow is the SL4 property, reached only via hardware data diode and physical one-way separation. The software architecture is invariant across both modes; the physical topology is what determines the security level achieved.

IIA is fractal across security levels in the same way it is fractal across organizational scope.

## The Unit

One box. Runs the complete ACS infrastructure stack: data collection, historian, security monitoring, asset inventory, intrusion detection, visualization, API, remote access, VPN, message brokering, protocol translation. Everything needed to operate, monitor, and secure a zone.

Runs on 4GB RAM, 2 cores, 1TB SSD. It is not a server. It is an appliance. It consumes less power than a monitor.

Every component selection, every protocol choice, every data flow decision traces back to one question: does this box work completely alone with no link? If yes, it ships. If no, it doesn't belong on the box.

## The Fractal

A production zone gets a box. That box IS the zone's entire infrastructure: historian, services, security, networking.

A plant gets a box. Same unit, broader scope. Aggregates the production zone boxes.

A site gets a box. Same unit, broader scope. Aggregates the plant boxes.

In PERA terms, IIA boxes deploy at any adjacent-level boundary across Levels 0–5. The L3/L4 boundary is the canonical *Plant Firewall* placement; IIA generalizes the same role across every level boundary.

The cloud aggregates all boxes. Optional. Centralized collection — corporate, regional, or cloud — is not a different architecture; it is the same unit at broader scope. The fractal does not collapse at the top.

```
Production zone: [box]  -- sovereign, complete
Plant zone:      [box]  -- aggregates zone boxes, also sovereign
Site:            [box]  -- aggregates plant boxes, also sovereign
Cloud:           viewport into all boxes, optional
```

Each box meshes with adjacent boxes. If a box can see another box, data routes through. If a box can see a box that can see a box that can see the cloud, data gets there. The mesh finds the path. If no path exists, the box keeps running locally with 30 days of buffered data.

Sovereignty does not mean isolation. Historians on adjacent boxes can know about each other without becoming dependent on each other. Awareness is mutual. Dependency is not.

Add a production zone, add a box. Add a site, add a box. Add a region, add a cloud aggregator. The unit of scaling is always the same self-contained block. Scales nearly infinitely by design.

The hard problems are distributed systems problems. When a box reconnects after thirty days off the mesh, the parent has thirty days of state from other paths — convergence at the boundary is conflict resolution, not transport. Schema evolution happens across boxes running different firmware with no coordinated maintenance window. Collection profiles differ by level: a production zone box and a site box are the same unit, not the same configuration. The architecture makes these problems tractable. It does not eliminate them.

## Design Constraints

IIA is shaped by the realities of automation and control system environments, not by enterprise computing assumptions.

**Connectivity is a luxury, not a given.** Production floors, wellheads, substations, feed lots, and remote facilities operate on cellular, satellite, or no backhaul at all. The unit must be the complete system indefinitely, not a thin client waiting for a cloud to come back.

**Safety, Reliability, Performance, not Confidentiality, Integrity, Availability.** The issue is not ordering, it is category. CIA, AIC, and their derivatives describe properties of *information* — and information is historical by nature, a record of what already happened. ACS does not operate on records. ACS operates on action and physics: a valve that moves, an interlock that latches, a loop that closes within its required time. Reliability and Performance in SRP are properties of the physical system. Safety is the property the physical system protects. The correct priority ordering for ACS, as articulated by Infracritical, is SRP: Safety first, then Reliability, then Performance. A security tool that compromises any of these is not a security tool. Every function on the box must degrade gracefully and never interfere with the process it monitors.

PERA's SAIC (Safety, Availability, Integrity, Confidentiality) extends CIA by prepending Safety. It is the right frame for IT systems that touch safety-critical *information* — historians, audit stores, regulator-facing dashboards. SAIC does not extend down to govern the ACS itself. The ACS is upstream of SAIC, governed by SRP. What crosses the domain boundary is the moment data becomes information.

**The edge is where value is physically created.** The PLC closing a loop, the VFD controlling a motor, the sensor reading a level. Intelligence belongs at the point of production, not centralized upstream.

**Integration is the function.** A historian alone does not secure a zone. A firewall alone does not provide visibility. An asset inventory alone does not detect intrusion. The value is in all of these existing in the same place and continuing to work when everything else goes dark.

**Heterogeneity is permanent.** 40-year-old PLCs run alongside brand-new VFDs on protocols that predate TCP/IP. The box must accommodate whatever it finds. It observes. It does not prescribe.

**No unit commands another.** Composition is additive. You do not need the parent to function. The parent does not command the child. Data flows north. Control stays local.

## Prior Art

The pattern exists elsewhere. It has never been named or applied deliberately to automation and control systems.

**Unified Threat Management (FortiGate, etc.):** One appliance runs firewall, routing, VPN, IDS, content filtering, DNS, DHCP. Two decades ago these were six separate devices from six vendors. Convergence won because integration at the point of deployment reduced attack surface, simplified operations, and eliminated the gaps between specialized tools.

**Hyperconverged Infrastructure (Nutanix, vSAN):** Identical nodes. Each runs compute, storage, networking. Add a node, cluster grows. Remove a node, the rest keeps running. The unit is sovereign. The cluster is scope expansion.

**Integrated NAS (Synology):** One box does storage, backup, containers, VPN, surveillance, media. Complete system, works offline, scales by adding another unit.

These are expressions of the same convergence pattern: self-contained sovereign unit, identical at every deployment point, scales by composition, works without upstream dependency. IIA inherits that pattern and extends it. The new claim is not convergence — convergence is precedented. The new claim is that the unit enforces two different governance models across a single boundary: SRP inside the automation cell, CIA outside. None of the prior art does this because none of it sits at a boundary where data classification and governance flip.

PERA+ articulates the same first principle from the standards side: *"creating secure interfaces rather than attempting to merge or integrate IT and Industrial Automation and Control Systems."* IIA inherits this stance and operationalizes it as a single appliance.

IIA applies the convergence to the full ACS stack — collection, processing, storage, visualization, security, API — and applies the boundary enforcement at the seam between ACS and IT. One unit. Every zone. Identical.

## Who This Is For

The underserved triangle. Every manufacturer below the top of the demand curve. The ones who stamp toasters, milk cows, run feed lots, operate discrete machining shops. They cannot afford $150K-$300K security projects. They cannot afford $50K-$100K/year monitoring subscriptions. Their insurance companies are about to require them to have visibility they currently do not have.

They are also the ones without stable internet. Rural. Remote. Satellite or cellular backhaul at best. Any architecture that assumes connectivity is an architecture that does not work for them.

Their network person, if they have one, knows IP and maybe subnetting. They do not know packets. They do not know CVEs. They do not care about CVEs.

The alternatives (Claroty, Nozomi) start at $50-100K/year with $100-150K professional services engagements. There is no other tool in the market that provides zone-level ACS visibility, audit logging, and monitoring at a price point accessible to this population.

## Data Architecture

The box is internally partitioned into three sides plus a management interface.

```
                    ACS DOMAIN  (Managed Trust, SRP)
                                 │
                                 │ OPC UA / Modbus / EtherNet/IP / fieldbus
                                 ▼
              ┌────── INBOUND ──────────────────────────────┐
              │ passive collectors                          │
              │ continuous capture                          │
              │ network IDS                                 │
              │ scan engine + enrichment                    │
              │ local data lake  ◄── source of truth        │
              └─────────────────────┬───────────────────────┘
                                    │
              ┌────── INTERNAL DMZ ─┼───────────────────────┐
              │ in-flight message bus (transient, no raw)   │
              │ audit chain head publisher                  │
              └─────────────────────┬───────────────────────┘
                                    │
- - - - - - - - DOMAIN BOUNDARY  (Zero Trust ↔ Managed Trust) - - - - -
                                    │
              ┌────── OUTBOUND ─────┼───────────────────────┐
              │ edge publisher  (push, operator-selected    │
              │                  profile)                   │
              │ structured query API  (pull, mTLS,          │
              │                        non-HTTP)            │
              │ outbound tunnel agent  (mTLS dial out,      │
              │                         no listener)        │
              └─────────────────────┬───────────────────────┘
                                    │
                                    ▼
                       [next box at broader scope /
                        BI lake / remote-access broker]

                    IT DOMAIN  (Zero Trust, CIA)


              [management NIC: local-network only.
               Optional HTTPS UI, OIDC + 2FA.
               Never routed to WAN.]
```

The box's external surface is engineered for minimum runtime exposure:

- **No HTTP at the boundary, in either direction.** No HTTP listener on the ACS or IT NICs. No outbound HTTP/HTTPS from any component — no registry pulls, no rule-feed updates, no telemetry, no CRL/OCSP. Updates and deltas arrive via signed bundles in OS updates or mTLS-tunneled deltas.
- **Edge profile is operator-selectable per deployment.** The architecture is profile-agnostic. MQTT + Sparkplug B is appropriate at the controller↔area-broker level (PERA L1/L2). Above L2, OPC UA pub/sub, structured query on mTLS, or batch-write to a BI lake (Iceberg / Delta / DuckLake on object store) are typically the better fit. The architecture spec does not pick.
- **The local data lake is the source of truth on the box.** All inbound capture, classification output, audit, events, and time-series land there. Outbound publishers siphon from the lake; the in-flight bus is transient and holds no durable raw data. Broader-scope BI lakes are downstream of the on-box lake, not a substitute for it.
- **Minimum runtime surface.** Every listener, daemon, and outbound connection exists because it was designed and engineered for a specific operational purpose. Anything not in this document is off, and the OS image is built so disabled services cannot be turned on at runtime.
- **Configuration is a signed artifact, not a live API.** The box has no REST endpoint that mutates running state. Configuration is a signed text document consumed by a constrained-grammar parser — same pattern as image admission and OS updates. The management UI is a text generator with no privileged access; the parser is the trust boundary; the applier executes a gated internal call set, then exits. A configuration attestation observer cross-checks running state against the staged artifact and emits divergence events. The pattern is GitOps for an air-gapped industrial appliance: declarative state in, signed-and-validated, applied or rejected. The box accepts no live mutations.

Inside the automation cell, data is ACS: time-critical, process-relevant, governed by SRP. The box observes passively and stores locally. At the boundary, the box transforms process data into information and publishes it north under IT rules. Outbound is bidirectional only when authenticated, identified, audited, and minimized — and never via HTTP.

**Every communication is governed by an explicit data contract** — internal (between containers, between zones, between layers within the box) and external (every connection that exits the ACS, including device-level exchanges with PLCs, sensors, actuators, and HMIs). Communication without a contract is **prevented** where the architecture can enforce it (kernel firewall + workload identity + admission control + mTLS compile from the catalog and refuse uncontracted traffic; an SDN policy plane strengthens this on the network fabric where deployed but is not required) and **flagged** where prevention is not possible (passive observation on the ACS NIC, broadcast, legacy protocols). The deployment's full set of contracts is the **contract catalog** — a versioned, discoverable artifact. Contractlessness at any layer is a deployment defect.

**Attestation observes prevention.** Every prevention mechanism may leak. The architecture assumes this and runs independent observation in parallel. The network IDS doubles as a contract-attestation observer — it compares observed traffic against the catalog and flags policy leaks. **In non-SDN deployments the IDS observer is the only network-plane attestation, and it must be able to alert.** An **IO master** runs an independent observation channel for the physical substrate (analog IO, fieldbus, industrial Ethernet) and cross-checks against the box's primary capture; discrepancies indicate substrate-level deviation — tampered wires, man-in-the-middle, misreporting devices, frame modification. Attestation findings emit under `ot.attestation.*` — network, IO, policy drift, identity continuity, audit-chain integrity. When attestation and prevention agree, the operator has cryptographic-grade evidence of compliance. When they disagree, the operator has evidence of where to look.

Boundary contracts — at every connection that exits the ACS — are **bilateral**. The ACS side commits to data inventory, freshness, resolution, retention, ordering, delivery, reconnect, version evolution, authentication, and audit binding. The upstream side commits to connectivity, authentication, acknowledgment, query response time, schema accommodation, capacity, and incident response. A **RACI matrix** names accountable parties for every failure mode. The box catalogs its own **adherence telemetry** — connectivity, delivery, auth, schema, quota, reconciliation, audit verification, SLA breaches, and contract violations — so ACS is never the side without receipts.

## Standards

IIA does not derive from any single standard. It is the physical instantiation of what multiple standards describe abstractly, because they share the same first principles: sovereign, independent, autonomous operation in safe and reliable efforts to achieve a shared goal.

**PERA+** (pera.net), maintained by Gary Rathwell at Entercon, defines the reference architecture for industrial enterprise organization: hierarchical levels (typically L0 through L5 or higher), zone boundaries, and the **4Rs** — Response, Resolution, Reliability, Resilience — that determine where applications belong in the architecture. IIA implements physically at every level what PERA+ describes structurally. The 4Rs are why the box buffers high-fidelity data locally and aggregates downsampled data centrally; response time tolerances loosen and resolution requirements coarsen as data moves up the levels.

**ISA-95** is the canonical IT↔ACS interface model, particularly for process industries. Where the box transforms ACS data into information and publishes it north, ISA-95 describes the data model the broader-scope consumer expects. IIA does not enforce ISA-95 at the edge — schema modeling lives at broader scope — but the box is engineered to feed ISA-95-modeled consumers without friction.

**IEC 62443** defines the cybersecurity management system, security levels, and component requirements the box satisfies at the zone level, ordered by SRP priority: zone segmentation enforcement protecting safety-critical process boundaries, continuous passive asset inventory and network monitoring preserving operational reliability, and role-based access control with full audit logging (all data time-series, all access logged, session recording) without degrading system performance.

IIA documentation uses PERA+'s **CIAD** (Control and Information Architecture Diagram, conceptual block diagram, drawn during Conceptual Engineering) and **CIND** (Control and Information Network Diagram, network detail with SL1–SL4 annotations, drawn during Preliminary Engineering) conventions for reference deployments. This makes IIA deployments legible to any control engineer working within the PERA framework.

The convergence is not coincidental. These standards arrive at the same place because they are built on the same observation: the unit of industrial operation is the zone, the zone must be self-sufficient, and any dependency on external systems for basic function is an architectural failure. IIA is the first deliberate physical instantiation of that observation. The standards are the formal description of it.

## The Thesis

Industrial independence is not a technology position. It is an operational sovereignty position. The entity that controls the automation infrastructure controls the operation. The facility that depends on external connectivity for basic process visibility, historian access, or security monitoring is not sovereign.

The domain boundary between ACS and IT is not a negotiation. Data that acts on the process is governed by SRP. Data that reports on the process is governed by CIA. The box enforces this boundary by architecture, not by policy, and ensures that IT governance never reaches back into the automation cell.

IIA provides the architectural pattern that makes sovereignty the default rather than the aspiration.

## Contact

- LinkedIn: [***REMOVED***](***REMOVED***)

## Trademarks

Industrial Independence Architecture, IIA, Eris Witness, Marlinspike, Fathom, and WirePilot are trademarks of ***REMOVED***. The license below covers the text of this document. It does not grant rights to use these marks. Use of the marks to refer to derivative articulations, products, or services requires written permission.

## License

This work is licensed under a [Creative Commons Attribution-ShareAlike 4.0 International License (CC BY-SA 4.0)](https://creativecommons.org/licenses/by-sa/4.0/).

© 2025-2026 ***REMOVED***.
