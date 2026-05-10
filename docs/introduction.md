# Introduction to Industrial Independence Architecture

This document is for readers new to industrial automation, operational technology, or the architectural problems they create. If you already work in this space, [the README](../README.md) is the right entry point and this document is optional.

The goal here is to give you enough vocabulary and structural grounding to read the rest of the documentation without external context.

## What problem this architecture addresses

A factory, a refinery, a water-treatment plant, a power station — all of these are made of two systems stitched together. One runs the physical work: valves opening, motors turning, reactions proceeding, conveyors moving. The other runs the information: orders, schedules, records, dashboards, audits. The two systems were not designed together. They were assembled, plant by plant, by integrators paid per project. The result is what every operator inherits: a custom stack, a vendor stranglehold on the data, a security posture that depends on who happened to wire the building, and a rebuild every time anything important needs to change.

Industrial Independence Architecture (IIA) is the architectural answer. It defines a single self-contained unit, identical at every zone of operation, that the operator owns and the integrator builds inside of, not around.

## The two domains

Inside any industrial site there are two domains, and they are different in kind, not just in degree.

**Automation and Control Systems (ACS)** — the substrate of physical action. Sensors that read pressure, flow, temperature, vibration, position. Programmable Logic Controllers (PLCs) that decide what to do about those readings on a millisecond-scale loop. Actuators that open valves, drive motors, adjust setpoints. Safety systems that intervene when a process exceeds a tolerance. Human-Machine Interfaces (HMIs) that operators use to watch and steer. ACS is governed by **SRP — Safety, Reliability, Performance** — the triad articulated by Robert Radvanovsky at Infracritical ([srpmodel.infracritical.com](https://srpmodel.infracritical.com/srpmodel.php)). A control loop that arrives a hundred milliseconds late is a safety problem. A historian that loses records is a recordkeeping problem.

**Information Technology (IT)** — the substrate of information. Production schedules, work orders, quality records, regulator-facing reports, business intelligence, machine-learning models. IT is governed by **CIA — Confidentiality, Integrity, Availability.** (Some standards prepend Safety for IT systems that touch safety-relevant records: **SAIC.**) A leaked record is a compliance problem. A late report is a coordination problem.

SRP and CIA are not the same kind of vocabulary, and they are not two priority orderings of the same list. They describe different substrates. SRP describes physics — what the system does, how reliably, how fast, how safely. CIA describes records — whether they are kept secret, accurate, and reachable. Using CIA for ACS is a category error, not a priority mistake. The thirty-year industry habit of treating ACS as "IT with extra availability" is the source of most of the problems IIA addresses.

A note on vocabulary. "OT" (operational technology) treats the substrate as singular. It isn't. An automotive plant has stamping, body, paint, general assembly, powertrain — each with its own control networks and its own management entity. The same multiplicity holds in food processing, water treatment, oil and gas, and the other industries IIA addresses. There is no executive director of OT. ACS names the substrate without pretending it is one thing.

## Where the boundary actually sits

Most attempts to describe the IT/ACS boundary point at a network diagram and draw a line. That works until somebody plugs a laptop into the wrong switch.

The boundary is not topological. It is a data-criticality boundary. On one side, data describes a physical state that exists right now and is acted on within milliseconds. On the other, data is a record that describes what happened. The same byte means different things on the two sides. ACS turns physical state into a record by capturing it; IT turns a record into action by issuing an instruction. The boundary is where capture and instruction meet — and that boundary is where most industrial breaches live.

IIA names the security model on each side: **Zero Trust** above the boundary (every connection authenticated, every action authorized, nothing assumed by location), and **Managed Trust** below it (every device and process is known, identified, and accountable to the operational manager). The unit that sits on the boundary terminates Zero Trust on the IT side and begins Managed Trust on the ACS side.

## The unit and the fractal

Industrial sites are organized in zones. A control loop runs in a cell. Cells aggregate into a line. Lines aggregate into an area. Areas aggregate into a plant. Plants aggregate into a region. Regions aggregate into a corporate function.

IIA places one unit at every zone. The unit is identical at every level — same software, same partitioning, same boundary rules. Only the *scope* changes. A unit in a cell sees one machine; a unit in a plant sees the plant; a unit at corporate sees the fleet. Same architecture, different aperture.

This is the fractal property. There is no special "central" architecture and no special "edge" architecture. A central historian is a unit with broader scope. A device gateway is a unit with narrower scope. The fractal makes the architecture scale-invariant: deploy on commodity hardware in a single cabinet, or as a hyperscale realization for a multi-plant operator, and the invariants travel.

The architecture is also *distributed*, not federated. Every unit is operated by one operator, under one set of rules. A federation would be independent parties exchanging data by treaty; IIA is one operator running a mesh of their own units. Sovereignty does not mean isolation: units on adjacent boxes know about each other, but no unit depends on another being available.

## Inside the unit

Each unit has four sides:

- An **inbound side** that faces ACS. It captures everything happening on the operational network. It cannot transmit. It is structurally incapable of acting on the things it observes.
- An **internal DMZ** where capture is classified, contracts are evaluated, and records are written.
- An **outbound side** that faces IT. It publishes only what a contract authorizes, only to consumers who have authenticated. It does not accept inbound HTTP. It does not call out over HTTP.
- A **management side** for the operator who runs the unit. The only place a human or a configuration artifact reaches in.

Inside the unit, a local data lake is the source of truth. Capture lands there. Classification lands there. Audit lands there. Outbound publishers siphon from the lake. The lake is owned by the operator and governed by the unit, not by any vendor consuming from it. This is the **decentralized historian**: a per-zone, operator-owned record, working complete without the cloud. The centralized-historian pattern that came before — vendor-owned, off-site, reachable only when the WAN is up — is a sovereignty failure by design.

## Data contracts

This is the load-bearing idea, and the one most newcomers underestimate.

Every communication on the unit and across its boundaries is governed by a **data contract** — an explicit description of what is being sent, by whom, to whom, on what cadence, under what authentication, with what schema, and with what failure semantics. There is no implicit traffic. There is no "we just connected it and it worked." If a connection has no contract, the architecture either *prevents* it (the kernel firewall, the workload identity system, and the admission policy cooperate to refuse uncontracted traffic) or *flags* it (where prevention is not possible — passive observation, broadcast, legacy protocols — the unit emits a contract-violation event).

The full set of contracts is the **contract catalog**, versioned and discoverable. An auditor queries the catalog and sees every authorized communication in the deployment. An operator changes a contract, and the network plane reconfigures to match. An integrator who wants to add a connection publishes a contract; without one, the connection is structurally inadmissible.

Contracts at the boundary — at every connection that exits the ACS — are **bilateral**. The ACS side commits to producing the data on the agreed cadence, with the agreed schema, the agreed retention, the agreed reconnect behavior. The upstream side commits to connectivity, authentication, acknowledgment, query response, capacity, and incident response. Each contract names a **RACI** — Responsible, Accountable, Consulted, Informed — for every failure mode, so when a connection breaks at three in the morning, there is no argument about whose problem it is.

Why data contracts are load-bearing: they are how the operator stays in charge of the substrate. Without them, *operator owns the data* is a slogan. With them, every byte that crosses the boundary is auditable, every consumer is identified, every dependency is reversible. That is what makes the architecture defensible long after the integrator who installed it has left.

## Attestation

Prevention leaks. Kernel firewall rules miss. Workload identity gets spoofed. Admission policies disagree with operator intent.

The architecture assumes leakage and runs **attestation** — independent observation that compares what is *supposed* to happen with what is *actually* happening. The network IDS doubles as a contract-attestation observer: it watches every packet against the catalog and flags traffic the catalog does not authorize, expected traffic that does not appear, and identity sessions that drift out of tolerance. An **IO master** independently observes the physical IO substrate (analog signals, fieldbus traffic, industrial Ethernet) and cross-checks the unit's primary capture; a tampered wire shows up as a discrepancy.

When prevention and attestation agree, the operator has evidence of compliance. When they disagree, the operator has evidence of where to look. This is the difference between a security posture that is *asserted* and a security posture that is *verified.*

## Connect first, model second, AI third

A common failure mode in industrial digital transformation is to build the AI layer first, the model second, and assume the connectivity will come. It does not. The result is an AI dashboard powered by a per-plant integration project that nobody wants to maintain.

IIA orders the work the way the dependency runs:

1. **Connect.** A standardized query interface at the IT/ACS boundary, on every unit. Anyone with a contract queries.
2. **Model.** A consistent information model (ISA-95 is the conventional backbone) lives at broader scope, fed by the connect layer.
3. **AI.** AI agents and applications consume the model, mediated by tool-protocols (such as MCP, the Model Context Protocol) that themselves carry contracts.

You cannot model what you cannot query. You cannot reason on what you cannot model. The architecture forces the order.

## Security level targets

The architecture targets two security levels under IEC 62443, the international standard for industrial cybersecurity:

- **SL3** — strong segmentation, authenticated communication, full audit, push-only outbound on the operator-selected edge profile. Achievable with the standard unit on commodity hardware.
- **SL4** — SL3 plus a hardware data diode that physically prevents inbound traffic on the ACS side. Requires the *two-box method* — two physical units bridged by the diode, an established pattern in industrial network design that IIA generalizes.

SL1 and SL2 deployments are not separate architectures. They are SL3 with controls relaxed by deployment policy. The unit is the same.

## Why this exists as a public spec

IIA is published, claimed by name, signed, and dated. The trademarks (Industrial Independence Architecture, IIA) are asserted; the architecture itself is licensed CC BY-SA 4.0. Anyone implements it. The published spec is the instrument that prevents anyone — including the publisher — from holding a future operator hostage to a private interpretation.

The architecture is not a product. There are products that implement it. There will be more. The architecture stays free.

## Where to go next

- **[README.md](../README.md)** — the canonical statement. Declarative, dense, assumes the vocabulary above.
- **[docs/internal-architecture.md](internal-architecture.md)** — the implementation specification. Names roles, lays out invariants, partitioning, contracts, attestation, configuration, updates, and the SL3/SL4 mappings to IEC 62443.
- **[docs/sample-contracts.md](sample-contracts.md)** — six worked data contracts. The fastest way to understand the contract grammar is to read examples.
- **[docs/glossary.md](glossary.md)** — vocabulary, definitions normative for the architecture. Use as a reference when reading the other documents.
- **[docs/mcp-single-box.md](mcp-single-box.md)** — operator quickstart for the smallest deployment that demonstrates the architecture: one unit, one MCP server off-box, one AI client.
- Diagrams: **[two-box-method.png](two-box-method.png)**, **[box-architecture.png](box-architecture.png)**, **[fractal.png](fractal.png)**.
