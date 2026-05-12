# Industrial Independence Architecture (IIA)

**An architectural principle for industrial infrastructure.**

*Published by the [Industrial Independence Alliance](https://industrialindependence.org/). The Architecture (this repo) is the consequence of [the Philosophy](https://industrialindependence.org/philosophy/) — read that first if you want the why.*

*New to industrial automation, ICS, or operational technology? Start with [docs/introduction.md](docs/introduction.md) — it builds the vocabulary used here.*

IIA is the deliberate abstraction of a convergence pattern that exists in adjacent domains, named and applied for the first time to automation and control systems. It is not a product. It is not a framework. It is the architectural principle, claimed by name.

## Contents

- [The Principle](#the-principle)
- [The Unit](#the-unit)
- [The Fractal](#the-fractal)
- [The Domain Boundary](#the-domain-boundary)
- [The Two-Box Method](#the-two-box-method)
- [Design Constraints](#design-constraints)
- [Data Architecture](#data-architecture)
- [Prior Art](#prior-art)
- [Standards](#standards)
- [Who This Is For](#who-this-is-for)
- [The Thesis](#the-thesis)
- [Further Reading](#further-reading)
- [Trademarks](#trademarks)
- [License](#license)

## The Principle

Deploy a single self-contained unit at every zone of an industrial network. The unit is identical at every level. The only thing that changes is scope.

The unit works with no upstream connectivity. No cloud. No corporate network. No internet. It is the complete system for its zone. If connectivity exists, it composes upward. If connectivity drops, nothing changes on site.

The cloud is a viewport into the mesh of units. It is not the platform. It is not the brain. It is an optional window into something that is already complete without it.

## The Unit

One box. Runs the complete ACS infrastructure stack: zone IP services (DHCP, DNS, NTP, file/config shares, optional in-cell PKI), data collection, the zone's **decentralized historian**, security monitoring, asset inventory, intrusion detection, visualization, API, remote access, VPN, message brokering, protocol translation. Everything needed to operate, monitor, and secure a zone.

The architecture is hardware-independent and scale-invariant. The box is a logical unit, realizable as an appliance, a server, a cluster, or a virtualized stack. Sizing is application- and scale-dependent — the box has run on less than 1GB of RAM with capability tradeoffs and scales up as the workload demands.

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

![The Fractal: identical units deployed at every PERA level boundary, with broader scope as the only thing that changes](docs/fractal.png)

Each box meshes with adjacent boxes. If a box can see another box, data routes through. If a box can see a box that can see a box that can see the cloud, data gets there. The mesh finds the path. If no path exists, the box keeps running locally with 30 days of buffered data.

Sovereignty does not mean isolation. Each box's historian is the *decentralized historian* for its zone — the operator's data, on the operator's substrate, working complete without the cloud. Historians on adjacent boxes can know about each other without becoming dependent on each other. Awareness is mutual. Dependency is not. The centralized-historian pattern that came before — vendor-owned, off-site, reachable only when the WAN is up — is a sovereignty failure by design.

Add a production zone, add a box. Add a site, add a box. Add a region, add a cloud aggregator. The unit of scaling is always the same self-contained block. Scales nearly infinitely by design.

The hard problems are distributed systems problems. When a box reconnects after thirty days off the mesh, the parent has thirty days of state from other paths — convergence at the boundary is conflict resolution, not transport. Schema evolution happens across boxes running different firmware with no coordinated maintenance window. Collection profiles differ by level: a production zone box and a site box are the same unit, not the same configuration. The architecture makes these problems tractable. It does not eliminate them.

## The Domain Boundary

The line between ACS and IT is not drawn by network topology, org chart, or vendor label. It is drawn by the criticality of the data, which is determined by its time sensitivity and its relationship to the physical process.

This distinction is what was lost when CIA-style information-domain models were imported from enterprise IT and applied to systems that operate on physical processes. Architecture got fragile. Security got performative. The vendor-driven model promised seamless integration; what it delivered was extractive complexity and unnecessary attack surface. The correction is upstream of the architecture: get the substrate right, and the rest follows. (Alliance Philosophy #00: physics overrides information.)

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

![Two-Box Method: SL3 software-only mode and SL4 two-box mode with hardware data diode](docs/two-box-method.png)

IIA is fractal across security levels in the same way it is fractal across organizational scope.

## Design Constraints

IIA is shaped by the realities of automation and control system environments, not by enterprise computing assumptions.

**Connectivity is a luxury, not a given.** Production floors, wellheads, substations, feed lots, and remote facilities operate on cellular, satellite, or no backhaul at all. The unit must be the complete system indefinitely, not a thin client waiting for a cloud to come back.

**The zone provides its own infrastructure services.** DHCP, DNS, NTP, file/config shares, time sync, optional in-cell PKI — every IP-infrastructure service the cell network needs to be a network. A cell that depends on corporate DHCP fails when the WAN fails. A cell with corporate DNS as primary loses name resolution on the next enterprise outage. A cell whose HMIs read configs from a corporate fileserver loses HMI capability when that share goes offline. The box runs these services for its zone so disconnection from upstream is operationally invisible to the process. After Gary Workman, *[The Everyman's Guide to EtherNet/IP Network Design](https://www.amazon.com/EVERYMANS-GUIDE-ETHERNET-NETWORK-DESIGN/dp/B0B7PSHK7J)* (Real Time Automation, 2022).

**Safety, Reliability, Performance, not Confidentiality, Integrity, Availability.** The issue is not ordering, it is category. CIA, AIC, and their derivatives describe properties of *information* — and information is historical by nature, a record of what already happened. ACS does not operate on records. ACS operates on action and physics: a valve that moves, an interlock that latches, a loop that closes within its required time. Reliability and Performance in SRP are properties of the physical system. Safety is the property the physical system protects. The correct priority ordering for ACS, as articulated by Robert Radvanovsky at Infracritical ([srpmodel.infracritical.com](https://srpmodel.infracritical.com/srpmodel.php)), is SRP: Safety first, then Reliability, then Performance. A security tool that compromises any of these is not a security tool. Every function on the box must degrade gracefully and never interfere with the process it monitors.

PERA's SAIC (Safety, Availability, Integrity, Confidentiality) extends CIA by prepending Safety. It is the right frame for IT systems that touch safety-critical *information* — historians, audit stores, regulator-facing dashboards. SAIC does not extend down to govern the ACS itself. The ACS is upstream of SAIC, governed by SRP. What crosses the domain boundary is the moment data becomes information.

**The edge is where value is physically created.** The PLC closing a loop, the VFD controlling a motor, the sensor reading a level. Intelligence belongs at the point of production, not centralized upstream.

**Integration is the function.** A historian alone does not secure a zone. A firewall alone does not provide visibility. An asset inventory alone does not detect intrusion. The value is in all of these existing in the same place and continuing to work when everything else goes dark.

**Heterogeneity is permanent.** 40-year-old PLCs run alongside brand-new VFDs on protocols that predate TCP/IP. The box must accommodate whatever it finds. It observes. It does not prescribe.

**No unit commands another.** Composition is additive. You do not need the parent to function. The parent does not command the child. Data flows north. Control stays local.

## Data Architecture

The box is internally partitioned into three sides plus a management interface.

The "internal DMZ" here is a partition inside the box. It is not the conventional IT-OT DMZ at PERA L3.5 — that one separates IT-touching-control from IT-not-touching-control, governed end-to-end by IT. IIA's DMZ is the boundary between SRP-governed inbound capture and CIA-governed outbound publishing, inside one operator-owned unit.

![The Box: CIAD-style conceptual diagram of internal partitioning, zones, and external surfaces](docs/box-architecture.png)

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

- **No HTTP at the boundary, in either direction.** No HTTP listener on the ACS or IT NICs. No outbound HTTP/HTTPS from any component. Updates and deltas arrive via signed bundles in OS updates or mTLS-tunneled deltas.
- **Edge profile is operator-selectable per deployment.** MQTT + Sparkplug B is appropriate at the controller↔area-broker level (PERA L1/L2). Above L2, OPC UA pub/sub, structured query on mTLS, or batch-write to a BI lake (Iceberg / Delta / DuckLake on object store) are typically the better fit. The architecture spec does not pick.
- **The local data lake is the source of truth on the box.** All inbound capture, classification output, audit, events, and time-series land there. Outbound publishers siphon from the lake; the in-flight bus is transient.
- **Minimum runtime surface.** Every listener, daemon, and outbound connection exists because it was designed and engineered for a specific operational purpose. The OS image is built so disabled services cannot be turned on at runtime.
- **Configuration is a signed artifact, not a live API.** The box has no REST endpoint that mutates running state. Declarative state in, signed-and-validated, applied or rejected — GitOps for an air-gapped industrial appliance. (Parser-as-trust-boundary mechanics live in [`docs/internal-architecture.md`](docs/internal-architecture.md).)

Inside the automation cell, data is ACS: time-critical, process-relevant, governed by SRP. The box observes passively and stores locally. At the boundary, the box transforms process data into information and publishes it north under IT rules. Outbound is bidirectional only when authenticated, identified, audited, and minimized — and never via HTTP.

**Every communication is governed by an explicit data contract.** Internal (between containers, between zones) and external (every connection that exits the ACS, including device-level exchanges). The full set is the **contract catalog** — versioned, discoverable. Contractless communication is *prevented* where the architecture can enforce it and *flagged* where it cannot. Contracts at the boundary are **bilateral**: ACS commits to producing per spec; upstream commits to connectivity, authentication, capacity, and incident response. Each contract names a **RACI** matrix for every failure mode. The box emits **adherence telemetry** under `ot.contract.*` — receipts of who held up which side. Contractlessness at any layer is a deployment defect. (Grammar, telemetry shape, and worked examples live in [`docs/internal-architecture.md`](docs/internal-architecture.md) and [`docs/sample-contracts.md`](docs/sample-contracts.md).)

**Attestation observes prevention.** Every prevention mechanism may leak; the architecture assumes this. The network IDS doubles as a contract-attestation observer — it compares observed traffic against the catalog and flags policy leaks. An **IO master** independently observes the physical IO substrate (analog IO, fieldbus, industrial Ethernet) and cross-checks against the box's primary capture; discrepancies indicate substrate-level deviation. Attestation findings emit under `ot.attestation.*`. When prevention and attestation agree, the operator has evidence of compliance. When they disagree, the operator has evidence of where to look.

## Prior Art

The pattern exists elsewhere. It has never been named or applied deliberately to automation and control systems.

**Unified Threat Management (FortiGate, etc.):** One appliance runs firewall, routing, VPN, IDS, content filtering, DNS, DHCP. Two decades ago these were six separate devices from six vendors. Convergence won because integration at the point of deployment reduced attack surface, simplified operations, and eliminated the gaps between specialized tools.

**Hyperconverged Infrastructure (Nutanix, vSAN):** Identical nodes. Each runs compute, storage, networking. Add a node, cluster grows. Remove a node, the rest keeps running. The unit is sovereign. The cluster is scope expansion.

**Integrated NAS (Synology):** One box does storage, backup, containers, VPN, surveillance, media. Complete system, works offline, scales by adding another unit.

These are expressions of the same convergence pattern: self-contained sovereign unit, identical at every deployment point, scales by composition, works without upstream dependency. IIA inherits that pattern and extends it. The new claim is not convergence — convergence is precedented. The pattern is *appliance* convergence, not IT/OT convergence — IIA rejects the IT/OT convergence frame in agreement with PERA+'s "secure interfaces, not integration." The new claim is that the unit enforces two different governance models across a single boundary: SRP inside the automation cell, CIA outside. None of the prior art does this because none of it sits at a boundary where data classification and governance flip.

PERA+ articulates the same first principle from the standards side: *"creating secure interfaces rather than attempting to merge or integrate IT and Industrial Automation and Control Systems."* IIA inherits this stance and operationalizes it as a single appliance. The historical wound this addresses: integration escalated when networks were linked through shared infrastructure — switches and L3 routers spanning the IT/ACS boundary — instead of through gateways. A gateway is an end device with one owner. Shared infrastructure has two owners and one reality. IIA is the gateway promoted to the unit of architecture.

IIA applies the convergence to the full ACS stack — collection, processing, storage, visualization, security, API — and applies the boundary enforcement at the seam between ACS and IT. One unit. Every zone. Identical.

## Standards

IIA does not derive from any single standard. It is the physical instantiation of what multiple standards describe abstractly, because they share the same first principles: sovereign, independent, autonomous operation in safe and reliable efforts to achieve a shared goal.

**PERA+** (pera.net), maintained by Gary Rathwell at Entercon, defines the reference architecture for industrial enterprise organization: hierarchical levels (typically L0 through L5 or higher), zone boundaries, and the **4Rs** — Response, Resolution, Reliability, Resilience — that determine where applications belong in the architecture. IIA implements physically at every level what PERA+ describes structurally. The 4Rs are why the box buffers high-fidelity data locally and aggregates downsampled data centrally; response time tolerances loosen and resolution requirements coarsen as data moves up the levels.

**ISA-95** is the canonical IT↔ACS interface model, particularly for process industries. Where the box transforms ACS data into information and publishes it north, ISA-95 describes the data model the broader-scope consumer expects. IIA does not enforce ISA-95 at the edge — schema modeling lives at broader scope — but the box is engineered to feed ISA-95-modeled consumers without friction.

**IEC 62443** defines the cybersecurity management system, security levels, and component requirements the box satisfies at the zone level, ordered by SRP priority: zone segmentation enforcement protecting safety-critical process boundaries, continuous passive asset inventory and network monitoring preserving operational reliability, and role-based access control with full audit logging (all data time-series, all access logged, session recording) without degrading system performance.

IIA documentation uses PERA+'s **CIAD** (Control and Information Architecture Diagram, conceptual block diagram, drawn during Conceptual Engineering) and **CIND** (Control and Information Network Diagram, network detail with SL1–SL4 annotations, drawn during Preliminary Engineering) conventions for reference deployments. This makes IIA deployments legible to any control engineer working within the PERA framework.

The convergence is not coincidental. These standards arrive at the same place because they are built on the same observation: the unit of industrial operation is the zone, the zone must be self-sufficient, and any dependency on external systems for basic function is an architectural failure. IIA is the first deliberate physical instantiation of that observation. The standards are the formal description of it.

## Who This Is For

The underserved triangle. Every manufacturer below the top of the demand curve. The ones who stamp toasters, milk cows, run feed lots, operate discrete machining shops. They cannot afford $150K-$300K security projects. They cannot afford $50K-$100K/year monitoring subscriptions. Their insurance companies are about to require them to have visibility they currently do not have.

They are also the ones without stable internet. Rural. Remote. Satellite or cellular backhaul at best. Any architecture that assumes connectivity is an architecture that does not work for them.

Their network person, if they have one, knows IP and maybe subnetting. They do not know packets. They do not know CVEs. They do not care about CVEs — and they are right not to. Those are not OT's responsibilities. OT's responsibilities are an accurate asset inventory, a network it can see, an audit trail of what happened, and a process that runs reliably. The tools to do those things, *as OT operational tools owned and operated by OT*, do not exist.

The alternatives (Claroty, Nozomi) are IT security tools retroactively pointed at OT networks — $50-100K/year, $100-150K professional services. They give an IT security team partial visibility into an ACS environment they do not operate. They are not what OT is supposed to have. They are what gets deployed because the thing OT is supposed to have does not exist.

IIA is that thing. Asset inventory, network monitoring, audit, historian, secure interfaces — operator-owned, zone-deployed, operational rather than overlaid. Affordable because the architecture does not depend on a cloud subscription, a permanent integrator, or a single-vendor stack. And legible: the architecture restores standards like IEC 62443 to the practitioners who actually operate the plant — field-ready, not vendor-mediated.

## The Thesis

Industrial independence is not a technology position. It is an operational sovereignty position. The entity that controls the automation infrastructure controls the operation. The facility that depends on external connectivity for basic process visibility, historian access, or security monitoring is not sovereign.

The domain boundary between ACS and IT is not a negotiation. Data that acts on the process is governed by SRP. Data that reports on the process is governed by CIA. The box enforces this boundary by architecture, not by policy, and ensures that IT governance never reaches back into the automation cell. Security here is built in, not bolted on, and never bought. (Alliance Philosophy #04: security is an architectural property.)

IIA provides the architectural pattern that makes sovereignty the default rather than the aspiration.

## Further Reading

- [`docs/introduction.md`](docs/introduction.md) — concept-first introduction for readers new to industrial automation, ICS, or operational technology. Builds the vocabulary the rest of this documentation assumes.
- [`docs/field-notes.md`](docs/field-notes.md) — the lived ground the architecture is shaped by. Specific kinds of places, specific kinds of people, specific kinds of failures, and the architectural response to each. Reads as the answer to "what is this *for*."
- [`docs/internal-architecture.md`](docs/internal-architecture.md) — the canonical implementation specification: invariants, partitioning, contracts, attestation, configuration, updates, and the SL3 / SL4 mappings to IEC 62443 foundational requirements. Names roles, not products.
- [`docs/sample-contracts.md`](docs/sample-contracts.md) — six worked data contracts spanning internal flows, boundary contracts (batch and query), device-level contracts, wireless IO, and AI-agent consumption. Demonstrates the contract grammar and adherence telemetry.
- [`docs/mcp-single-box.md`](docs/mcp-single-box.md) — operator quickstart for the smallest AI-agent consumption deployment: one box, one MCP server off-box, one AI client. Topology, identity, contract, and config-artifact pipeline.
- [`docs/glossary.md`](docs/glossary.md) — vocabulary used across the documentation. Domain terms (ACS, IT, SRP, CIA, SAIC), architectural terms (the box, fractal, contract catalog, attestation, IO master), and the standards IIA aligns with (PERA+, IEC 62443, ISA-95, CESMII i3X, MCP, Zenoh).

## Trademarks

Industrial Independence Architecture and IIA are trademarks. The license below covers the text of this document. It does not grant rights to use these marks. Use of the marks to refer to derivative articulations, products, or services requires written permission from the trademark holder.

## License

This work is licensed under a [Creative Commons Attribution-ShareAlike 4.0 International License (CC BY-SA 4.0)](https://creativecommons.org/licenses/by-sa/4.0/).
