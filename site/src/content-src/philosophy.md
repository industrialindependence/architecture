# The Philosophy

> Control systems act on physics, not on information. The Industrial Independence Alliance publishes the principles that follow from this distinction and the architecture that operationalizes them. The SRP Triad (Safety, Reliability, Performance — after Robert Radvanovsky, Infracritical) governs the ACS substrate. CIA governs information. SAIC is not a peer; Safety is not an addendum.

## The substrate distinction

Information-domain models — **CIA** and its derivatives — were imported from enterprise IT and applied to systems that operate on physical processes. Architecture got fragile. Security got performative. The vendor-driven model promised seamless integration; what it delivered was extractive complexity and unnecessary attack surface.

The correction is upstream of the architecture: get the substrate right, and the rest follows.

## The vocabulary

- **SRP** — Safety, Reliability, Performance. Governs the ACS substrate. After Robert Radvanovsky, Infracritical. Source: <https://srpmodel.infracritical.com/srpmodel.php>.
- **CIA** — Confidentiality, Integrity, Availability. Governs information — records, historical by nature.
- **SAIC** — Safety prepended to AIC. Right for IT systems handling safety-critical information. Wrong if extended downward to govern the ACS itself.
- **Zero Trust ↔ Managed Trust** — PERA+'s framing for the IT/ACS boundary transition. After Gary Rathwell, Entercon. Source: <https://www.pera.net>.

## Why SAIC fails as an OT model

SAIC takes the information-domain triad — Availability, Integrity, Confidentiality — and prepends Safety. The structure betrays the move: Safety is bolted on, not foundational. The model is right for IT systems that touch safety-critical information — historians, audit stores, regulator-facing dashboards. For those, SAIC is the correct frame.

Extended downward to govern the ACS itself, it fails. The ACS does not operate on records. It operates on action and physics — a valve that moves, an interlock that latches, a loop that closes within its required time. **Reliability and Performance are properties of the physical system. Safety is what the physical system protects.** That is a different substrate than information. It needs a different model.

> "Safety comes first. Always." — The SRP Triad, Robert Radvanovsky, Infracritical.

## The principles

Seven principles. Not negotiable. Principle 00 names the substrate. Principles 01–06 follow from it.

### 00 — Physics overrides information

Control systems act on physics. Information is the record that follows. Treating ACS as information is the wrong starting point — every architectural decision downstream inherits the mistake.

### 01 — Safety. Reliability. Performance. In that order.

SRP governs the ACS substrate. Safety is not an addendum; it is what the physical system protects. Reliability and Performance are properties of that system. Information-centric models — CIA, AIC, SAIC — are the wrong tools for what acts on physics. After Robert Radvanovsky, Infracritical. <https://srpmodel.infracritical.com/srpmodel.php>

### 02 — Operational reality dictates design

Industrial environments are not data centers. There is no singular OT network — a manufacturing site has many control networks (stamping, body, paint, general assembly; the equivalents in food, water, oil and gas), each with its own management entity. There is no executive director of OT. PERA+'s 4Rs — Response, Resolution, Reliability, Resilience — determine where applications belong. Network designs, hardware, software, historians, and zone IP services (DHCP, DNS, NTP, file) must be decentralized to match the substrate they serve. After Gary Workman, Two-Box Method (RTA, 2022). <https://www.pera.net>

### 03 — Complexity is the enemy of Reliability

Robust OT is simple, predictable, deterministic. Every additional dependency, feature, or communication path introduces fragility and increases attack surface. The goal is systems that are easy to understand, easy to maintain, and easy to secure — by virtue of having less to understand, maintain, and secure.

### 04 — Security is an architectural property

The most effective posture for OT is deliberate, managed separation from untrusted networks, especially the enterprise IT environment. PERA+ articulates this as *"secure interfaces, not integration."* IIA rejects "IT/OT convergence" as a frame entirely — there is no merger to design, only an interface to enforce. Cultural rupture escalated when networks were linked through shared infrastructure (switches, L3 routers spanning the boundary) instead of through gateways; a gateway is an end device with one owner. True security is built in, not bolted on, and never bought.

### 05 — Every boundary is formalized

Data flows that exit the ACS are documented, limited, and governed by bilateral contracts with explicit RACI matrices for every failure mode. These conduits are security perimeters requiring the same rigor as external interfaces. Informal "visibility" requests that bypass this process are attacks on the architecture, intentional or not.

### 06 — Empower the practitioner

The most valuable asset is the knowledge of practitioners who design, implement, and maintain these systems. Standards must be field-ready. Practical experience over vendor certifications. The Alliance exists to make standards like IEC 62443 accessible — to restore them to the people who actually operate the plant.

## The thesis

Industrial independence is not a technology position. It is an **operational sovereignty** position. The entity that controls the automation infrastructure controls the operation. The facility that depends on external connectivity for basic process visibility, historian access, or security monitoring is not sovereign. IIA provides the architectural pattern that makes sovereignty the default rather than the aspiration.

## Lineage & standards

- **SRP Triad** — Robert Radvanovsky / Infracritical. The foundation of the ACS substrate model. <https://srpmodel.infracritical.com/srpmodel.php>
- **PERA+** — Gary Rathwell / Entercon. The reference architecture for industrial enterprise organization; source of the 4Rs, the CIAD/CIND diagram conventions, and the "secure interfaces, not integration" stance. <https://www.pera.net>
- **The Two-Box Method** — John Rinaldi & Gary Workman. The canonical articulation of physically enforced ACS/IT segmentation. *The Everyman's Guide to EtherNet/IP Network Design* (RTA, 2022).
- **IEC 62443** — Cybersecurity for industrial automation. SL1–SL4, FR1–FR7. The Architecture targets SL3 floor / SL4 via diode.
- **ISA-95** — The canonical IT↔ACS data-modeling backbone.
