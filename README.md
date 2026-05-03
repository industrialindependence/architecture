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

## The Unit

One box. Runs the complete ACS infrastructure stack: data collection, historian, security monitoring, asset inventory, intrusion detection, visualization, API, remote access, VPN, message brokering, protocol translation. Everything needed to operate, monitor, and secure a zone.

Runs on 4GB RAM, 2 cores, 1TB SSD. It is not a server. It is an appliance. It consumes less power than a monitor.

Every component selection, every protocol choice, every data flow decision traces back to one question: does this box work completely alone with no link? If yes, it ships. If no, it doesn't belong on the box.

## The Fractal

A production zone gets a box. That box IS the zone's entire infrastructure: historian, services, security, networking.

A plant gets a box. Same unit, broader scope. Aggregates the production zone boxes.

A site gets a box. Same unit, broader scope. Aggregates the plant boxes.

The cloud aggregates all boxes. Optional.

```
Production zone: [box]  -- sovereign, complete
Plant zone:      [box]  -- aggregates zone boxes, also sovereign
Site:            [box]  -- aggregates plant boxes, also sovereign
Cloud:           viewport into all boxes, optional
```

Each box meshes with adjacent boxes. If a box can see another box, data routes through. If a box can see a box that can see a box that can see the cloud, data gets there. The mesh finds the path. If no path exists, the box keeps running locally with 30 days of buffered data.

Add a production zone, add a box. Add a site, add a box. Add a region, add a cloud aggregator. The unit of scaling is always the same self-contained block. Scales nearly infinitely by design.

The hard problems are distributed systems problems. When a box reconnects after thirty days off the mesh, the parent has thirty days of state from other paths — convergence at the boundary is conflict resolution, not transport. Schema evolution happens across boxes running different firmware with no coordinated maintenance window. Collection profiles differ by level: a production zone box and a site box are the same unit, not the same configuration. The architecture makes these problems tractable. It does not eliminate them.

## Design Constraints

IIA is shaped by the realities of automation and control system environments, not by enterprise computing assumptions.

**Connectivity is a luxury, not a given.** Production floors, wellheads, substations, feed lots, and remote facilities operate on cellular, satellite, or no backhaul at all. The unit must be the complete system indefinitely, not a thin client waiting for a cloud to come back.

**Safety, Reliability, Performance over Confidentiality, Integrity, Availability.** ACS environments do not operate under the CIA triad. The correct priority ordering, as articulated by Infracritical, is SRP: Safety first, then Reliability, then Performance. A security tool that compromises any of these is not a security tool. Every function on the box must degrade gracefully and never interfere with the process it monitors.

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

IIA applies the convergence to the full ACS stack — collection, processing, storage, visualization, security, API — and applies the boundary enforcement at the seam between ACS and IT. One unit. Every zone. Identical.

## Who This Is For

The underserved triangle. Every manufacturer below the top of the demand curve. The ones who stamp toasters, milk cows, run feed lots, operate discrete machining shops. They cannot afford $150K-$300K security projects. They cannot afford $50K-$100K/year monitoring subscriptions. Their insurance companies are about to require them to have visibility they currently do not have.

They are also the ones without stable internet. Rural. Remote. Satellite or cellular backhaul at best. Any architecture that assumes connectivity is an architecture that does not work for them.

Their network person, if they have one, knows IP and maybe subnetting. They do not know packets. They do not know CVEs. They do not care about CVEs.

The alternatives (Claroty, Nozomi) start at $50-100K/year with $100-150K professional services engagements. There is no other tool in the market that provides zone-level ACS visibility, audit logging, and monitoring at a price point accessible to this population.

## Data Architecture

Data flows unidirectionally. The box receives. It does not command. Marlinspike's passive capture enforces the same principle in software that an optical data diode enforces in hardware: data flows out, nothing flows back in.

Inside the automation cell, data is ACS: time-critical, process-relevant, governed by SRP. The box observes this data passively and stores it locally. At the cell boundary, the box transforms process data into information and publishes it north. Once published, IT rules apply. Nothing from the IT domain flows back into the cell.

```
[ACS domain: automation cell]
[OT devices] --OPC UA/Modbus/etc--> [collectors]
                                         |
                                  [NATS JetStream]
                                    /     |     \
                              security  process  MRP
                                 |        |       |
                          [Marlinspike] [SpB enc] [i3X server]
                                        |              |
- - - - - - - - - - - - domain boundary - - - - - - - - -
                                        |              |
[IT domain: information consumers]
                                  [Mosquitto]       REST API
                                        |              |
                               MQTT+SpB north     i3X queries
                                        |              |
                                  [next box up / cloud]
```

Push (real-time): Sparkplug B over MQTT for event-driven consumers (Ignition, AWS IoT SiteWise, AVEVA, Fathom).

Pull (query): i3X REST API for analytical consumers (AI pipelines, custom dashboards, compliance reporting).

Both read from the same NATS/DuckDB/TimescaleDB backing store. Both work locally when disconnected.

Data classification on the bus:
- `ot.process.*` -- tag values, historian data, analog/digital IO (ACS origin, becomes information at boundary)
- `ot.security.*` -- Marlinspike alerts, asset inventory changes, network events (ACS origin)
- `ot.mrp.*` -- work orders, execution status, ERP API events (IT domain, inbound reference only)
- `ot.health.*` -- collector heartbeats, box diagnostics, uptime (infrastructure)

## Standards

IIA does not derive from any single standard. It is the physical instantiation of what multiple standards describe abstractly, because they share the same first principles: sovereign, independent, autonomous operation in safe and reliable efforts to achieve a shared goal.

**PERA+** (pera.net) defines the reference architecture for industrial enterprise organization, including the hierarchical levels, zone boundaries, and functional requirements that IIA implements physically at every level. The PERA+ Network Design update, incorporating Bode/Nyquist-constrained response latency requirements across levels, directly informs where the domain boundary falls for any given process.

**IEC 62443** defines the cybersecurity management system, security levels, and component requirements that the box satisfies at the zone level, ordered by SRP priority: zone segmentation enforcement protecting safety-critical process boundaries, continuous passive asset inventory and network monitoring preserving operational reliability, and role-based access control with full audit logging (all data time-series, all access logged, session recording) without degrading system performance.

The convergence is not coincidental. These standards arrive at the same place because they are built on the same observation: the unit of industrial operation is the zone, the zone must be self-sufficient, and any dependency on external systems for basic function is an architectural failure. IIA is the first deliberate physical instantiation of that observation. The standards are the formal description of it.

## Product Family

**Fathom** is the enterprise platform. The cloud viewport, multi-site aggregation, the commercial offering.

**Marlinspike** is the open-source core. Passive protocol-aware network capture, asset inventory, security monitoring. The engine inside the box. Named for the nautical tool used to open tightly-wound rope structures.

**WirePilot** is the portable appliance. One box, one SPAN port or tap, live protocol-aware capture, no network footprint, no collectors phoning home. Carry it in, plug it in, see everything, pull it out. No IP stack on the capture side means no attack surface on the monitored network. Electrically present, logically invisible. Same engine as Fathom, different form factor.

## The Thesis

Industrial independence is not a technology position. It is an operational sovereignty position. The entity that controls the automation infrastructure controls the operation. The facility that depends on external connectivity for basic process visibility, historian access, or security monitoring is not sovereign.

The domain boundary between ACS and IT is not a negotiation. Data that acts on the process is governed by SRP. Data that reports on the process is governed by CIA. The box enforces this boundary by architecture, not by policy, and ensures that IT governance never reaches back into the automation cell.

IIA provides the architectural pattern that makes sovereignty the default rather than the aspiration.

## Contact

- LinkedIn: [***REMOVED***](***REMOVED***)

## Trademarks

Industrial Independence Architecture, IIA, Fathom, Marlinspike, and WirePilot are trademarks of ***REMOVED***. The license below covers the text of this document. It does not grant rights to use these marks. Use of the marks to refer to derivative articulations, products, or services requires written permission.

## License

This work is licensed under a [Creative Commons Attribution-ShareAlike 4.0 International License (CC BY-SA 4.0)](https://creativecommons.org/licenses/by-sa/4.0/).

© 2025-2026 ***REMOVED***.
