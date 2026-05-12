# Our Claim

The Field describes the rooms operations works in. The Problem describes what stands in the way. This document describes what we claim — what operations is owed, what must be owned, what has to be taken back, what has to be formalized, what has to be named.

These are not requests. They are the working terms for a substrate operations can answer for. The architecture is what makes them deliverable.

## Contents

- [What operations owns](#what-operations-owns)
- [What is taken back from IT](#what-is-taken-back-from-it)
- [SLAs that match production](#slas-that-match-production)
- [Contracts with IT](#contracts-with-it)
- [Separation as architecture, not policy](#separation-as-architecture-not-policy)
- [Recognition of IT, OT, and ACS as different](#recognition-of-it-ot-and-acs-as-different)
- [The reintroduction of engineering](#the-reintroduction-of-engineering)

---

## What operations owns

Operations owns the substrate that production depends on. Not consumes it through a help desk. Not requests it through a service ticket. Owns it.

- **The OT network.** The switches, the cables, the wireless infrastructure inside the zone. Operator-configured, operator-maintained, operator-owned. Not a downstream branch of the enterprise switch fabric.
- **The zone's IP services.** DHCP, DNS, NTP, file shares, optional in-cell PKI. Decentralized. Per-zone, not per-enterprise. Working without WAN.
- **The historian.** Decentralized. Local to the zone. The operator's data, on the operator's hardware, queryable without external dependency. A centralized historian reachable only when the WAN is up is a sovereignty failure by design.
- **The audit chain.** Hash-chained, append-only, queryable. The operator's record of who did what when, on the operator's side of the boundary.
- **The configuration.** Signed declarative artifact. Versioned. Auditable. Applied through a controlled parser, not pushed by a remote management agent the operator does not own.
- **The boundary.** The conduits that exit the ACS are the operator's to declare, formalize, and enforce.

## What is taken back from IT

Operations is not at war with IT. The point is not opposition. The point is that the substrate of production was given to the wrong owner, and the wrong owner has had it long enough that the cost has become visible. The substrate comes back.

- **Control of the OT network.** OT switches under OT management. Not an extension of the enterprise switch fabric. Not VLANs the control engineer cannot see and cannot reach.
- **Control of patch windows.** Updates to OT hardware happen on operations' schedule, against operations' intended-state manifest, with operations' approval. Not on IT's quarterly compliance cycle. A thirty-second reboot of a switch is invisible in an office and catastrophic on a conveyor.
- **Control of vendor remote access.** Every inbound path to the ACS is a contracted conduit through the operator's box, identified, authenticated, audited. No IT-issued credentials terminate inside the ACS.
- **Control of the OT compute.** The historian, the engineering workstations, the HMIs, the gateway boxes — owned by operations, on operations' hardware, on operations' substrate. Not in an IT data center the operator cannot enter.
- **The boundary itself.** The line between IT and OT was drawn by IT in most plants. It is redrawn by the architecture, on terms operations can articulate and defend.

## SLAs that match production

The service-level agreement the help desk operates on was designed for an office. The plant runs on a different clock. Production losses compound by the minute. A four-hour first-response window during a Friday-night emergency is not a service level. It is abandonment.

Operations holds IT to SLAs that match the consequence of failure:

- **Response by the person who can fix it.** Not a ticket creator. Not a level-one analyst. The engineer who can make the change.
- **Clocks that match production timelines.** Minutes, not hours. Hours, not days. Weekends are not exempt.
- **Acknowledgement that compounding loss is loss.** Ten thousand dollars an hour for sixty hours is six hundred thousand dollars. An SLA that allows that to accrue is an SLA that bills operations for IT's process.

These are the terms operations would impose on a vendor it was paying for the service. Internal IT, when it sits on the operations side of the boundary, is held to the same terms.

## Contracts with IT

Every data flow that crosses the boundary is a bilateral commitment between two parties. The architecture formalizes this.

- **The flow is described.** Schema, rate, payload, sink, identity.
- **Both sides commit.** Operations to producing per spec. IT to receiving, authenticating, acknowledging, and responding within the agreed envelope.
- **Failure modes are named.** A RACI matrix is published for every way the flow can fail. Who is responsible. Who is accountable. Who is consulted. Who is informed.
- **Adherence is measured.** Telemetry under `ot.contract.*` records connectivity, delivery, auth, schema, quota, reconciliation, audit verification, SLA breaches, and violations. Receipts of who held up which side.

A boundary without bilateral contracts is a handshake. Handshakes do not survive the personnel change.

## Separation as architecture, not policy

Separation is not a posture. It is an architectural property.

The boundary between IT and OT is not enforced by policy, not enforced by trust, not enforced by intention. It is enforced by:

- **Zero Trust ↔ Managed Trust.** The box terminates Zero Trust on the IT side and begins Managed Trust on the ACS side. PERA+'s framing, made concrete.
- **The three-side internal partitioning.** Inbound (ACS-facing), Internal DMZ, Outbound (IT-facing). Inbound and outbound cannot conduit directly to each other. All cross-side traffic transits the DMZ.
- **No HTTP at the boundary.** No inbound HTTP listener. No outbound HTTP from any component. Updates and deltas come via signed bundles or mTLS-tunneled deltas.
- **The contract catalog enforcing what may exist on the wire.** Communication without a contract is prevented or flagged. There is no quiet path.
- **The IDS attestation observer cross-checking observed traffic against the catalog.** Findings emit under `ot.attestation.*` at the same severity as security events.

Policy can be revised in a meeting. Architecture is harder to revise. Architecture is what makes the boundary durable.

## Recognition of IT, OT, and ACS as different

The conflation is the source of most of the trouble. Three substrates have been treated as one. Each has a different physics, a different time horizon, a different correct security model.

- **IT** is the information domain. Records. History. Confidentiality, Integrity, Availability. CIA is the right model. Industry knows how to operate here.
- **OT** is the operations-technology domain. It includes ACS but is broader — supervisory systems, MES, historians for already-information data, BI pipelines, operator workstations, asset management. Much of OT is closer to IT than to ACS, but with different timeliness and reliability requirements. SAIC is sometimes the right model for OT systems that handle safety-critical information.
- **ACS** (Automation and Control Systems) is the substrate that acts on physics. Valves. Interlocks. Loops. SRP — Safety, Reliability, Performance — is the right model. Information-domain triads are the wrong substrate, not the wrong order. After Robert Radvanovsky, Infracritical.

A discipline that treats these three as one discipline gives bad advice in two rooms out of three. Operations holds to the vocabulary, the standards, and the organizational charts that recognize the difference.

## The reintroduction of engineering

Industrial automation was built by engineers. It is not currently maintained by engineers, in most plants. It is maintained by integrators on retainer, IT staff who do not work on physical processes, and a shrinking population of senior controls personnel who are exhausted and unreplaced.

Engineering comes back:

- **In the room when architecture is decided.** Not after.
- **At the boardroom level.** A chief operations technology officer, or the equivalent, with a seat where the CIO and CISO sit.
- **In the training pipeline.** Apprenticeships, certifications, journeyman programs that produce people who can configure a switch, debug a fieldbus, write a contract, and read a one-line diagram.
- **As a discipline, not a role.** Engineering judgment is the load-bearing competence. Tools and standards exist to support it, not to replace it.
- **With the standards in their hands.** IEC 62443 is not vendor IP. ISA-95 is not consulting IP. PERA+ is not subscription IP. Field-ready standards belong to practitioners. The Alliance exists to restore them.

The senior control system engineer is not a hero. They are an institutional failure mode. The reintroduction of engineering is what makes them unnecessary.

---

These are the conditions for operational sovereignty. The Field is what is. The Problem is what stands in the way. Our Claim is what we hold to. Our Philosophy is how we think about it. The Architecture is what the claim deploys as.
