# The Problem

The field is not sovereign because too many actors benefit from it not being sovereign. The market sells the dependence. IT inherits enterprise patterns and enforces them across a substrate they were not built for. The field's own senior practitioners - the ones who could teach the next generation - too often will not.

The problem is everyone with a stake in operations remaining dependent. That includes the vendors, the integrators, the consultants, the auditors, the IT departments that have been handed OT to manage, and the senior engineers in the plant who would rather be the one who knew than train the one who comes next.

This document is plain about all three.

## Contents

- [The 80% problem](#the-80-problem)
- [What the market sells](#what-the-market-sells)
- [What IT imposes](#what-it-imposes)
- [What the field withholds](#what-the-field-withholds)
- [What this produces](#what-this-produces)
- [Why it is structural, not personal](#why-it-is-structural-not-personal)
- [What the architecture refuses to buy](#what-the-architecture-refuses-to-buy)

---

## The 80% problem

Roughly 80% of cyber attacks on operational technology now originate in the corporate IT network. The figure shows up in vendor reports (Rockwell Automation, Dragos, Fortinet) with variation in the exact percentage but consistency in the direction. The attack does not begin on the plant floor. It begins on a help-desk laptop, a phishing email, a compromised VPN appliance, a stolen Active Directory credential - and it ends with a pipeline shut down, a steel mill idle, a meat-processing plant offline.

This is the consequence of what the industry has been selling, IT has been wiring in, and operations has been allowing for the last decade. Industry research finds the resulting state of typical converged deployments:

- **44%** of OT assessments show shared credentials between IT and OT.
- **77%** show improper network segmentation.
- **17%** of organizations run a shared Active Directory domain across IT and OT - the most common vector for lateral movement.
- **70%** of OT attacks now begin in IT.

The 80% problem is the bridges working as designed.

---

## What the market sells

The dominant automation vendors set the terms of the field. Protocols, configuration tools, engineering software, certification programs, support contracts - the vendor owns the stack and rents it back. The pattern is consistent across the major players.

### Closed stacks

- **Closed protocols.** Published to interoperate only with the vendor's own equipment, or with competitors under licensing terms that make integration cost prohibitive.
- **Vendor-locked configuration.** Engineering software runs only on Windows, requires a vendor-issued license dongle, produces project files that cannot be opened by any other software. The configuration is hostage to the toolchain.
- **License dongles.** A piece of $30 software is leashed to a $300 dongle that has to be physically shipped, physically inserted, and physically replaced when it fails. Not a security control. A recurring license fee with hardware on top.
- **Recurring-revenue maintenance.** Annual support is a percentage of equipment cost. The percentage does not decrease over the equipment's life. Hardware lifetime is fifteen to thirty years. The bill is paid forever.

### Reference architectures as security theater

Every major automation vendor publishes a reference architecture. Siemens PCS 7, Rockwell/Cisco CPwE, Schneider EcoStruxure. The diagrams are clean. The zone boundaries are crisp. The IEC 62443 stamps are on the cover page. The vendors hold the certifications.

The implementation guidance, read carefully, violates the standard the cover page claims to implement. Siemens PCS 7 Compendium Part F page 17 acknowledges that its own example configuration is "a negative example from a security point of view" - and then builds the next 189 pages of guidance on top of that negative example. Schneider's documentation acknowledges that flat network architectures aid malicious lateral movement - while providing reference architectures that produce exactly such configurations. CPwE documents end-to-end connectivity across zones 0 through 6, with engineering workstations spanning multiple zones simultaneously.

The vendor *can* implement the standard. The certification proves it. The documentation tells the operator to do something else. The certification on the cover page does the marketing work; the diagrams on the inside pages do the lock-in work. When the audit fails, the operator pays for remediation - back to the same vendor.

### Integrators and the opacity premium

Most plants did not build their own networks. An integrator built the network. The integrator delivered a working system, billed the project, and moved on. The plant inherited a network that worked - and a configuration the plant could not read.

The structure rewards opacity. Up-front bids are competitive; integrators win on price. Margin is recovered later, on service calls. A fully documented, transferable deployment generates no service calls. A deployment that only the integrator can read generates service calls forever. The disciplined integrator who hands over passwords, documentation, and training loses the bid to the integrator who does not.

The market selects for opacity. At scale, the industry has produced a field of plants where the configuration is in the integrator's head, the passwords are in the integrator's safe, and the meter starts when the network breaks at two in the morning.

---

## What IT imposes

IT did not ask to be put in charge of OT. In most organizations, IT was handed responsibility for OT because the org chart did not contain a place for an OT leader. IT then applied to OT the patterns it knew, the patterns its tooling supports, and the patterns its career structure rewards. The patterns do not fit.

### Enterprise authentication on a substrate that acts on physics

Active Directory was designed to manage who can read a corporate file share. It was not designed to gate a valve. IT integrates OT into corporate AD anyway, because that is the management plane IT operates. The result: a single set of compromised credentials grants access to both networks, and most lateral movement happens through this single hinge. Dragos research finds **44% of OT assessments show shared IT/OT credentials**, with **17% of organizations operating a shared AD domain across the two**.

### The engineering workstation as the trojan horse

The workstation that programs the PLC is "managed" by IT - domain-joined, IT-patched, IT-antivirus, IT-monitored, IT-trusted. It is also directly connected to the OT network, because the engineer needs to program PLCs. It is trusted by IT because IT manages it. It is trusted by OT because the engineer needs it. Neither side secures it for what it actually is - a bridge between two substrates, with two threat models, and no single owner.

The Stuxnet and Triton attack patterns did not need to know Modbus or PROFINET. They needed the workstation. Patches arrive on IT's cadence; engineering software is validated by the vendor for specific older versions; the mismatch produces months-long windows of vulnerability. Every dual-homed PLC scales the same pattern down.

### The IT patch cadence imposed on OT

Monthly patches are appropriate for office equipment where a thirty-second reboot is invisible. They are catastrophic for a conveyor where the same reboot drops a shift. The IT industry sells, and operations' IT-side counterparts earnestly insist, that OT must adopt the IT patch cadence anyway. The pitch ignores:

- **OT firmware updates are operationally risky.** New firmware can change communication patterns, break engineering software validated for a specific version, alter interlock behavior, invalidate safety certifications. The change is justified only when the risk of *not* updating exceeds the risk of *updating*.
- **OT equipment runs on fifteen-to-thirty-year lifetimes.** Latest firmware for a fifteen-year-old PLC, if it exists, may be less stable than the firmware running for the last eight years.
- **Stability is the operational property the substrate protects.** A controls network that has run without incident is not a problem to be solved by introducing change.

A common field case study: a major manufacturer, controls network stable for eight years. IT policy mandated quarterly firmware updates. Year one: three production outages, $2.4M in downtime. Year two: compatibility issues forced hardware replacement, $8M. Year three: return to OT-managed firmware policy. Years four through ten: zero firmware-related outages. The cost of running old firmware was zero. The cost of updating it was $10.4M.

### The SLA designed for offices

The help-desk SLA was designed for the office, where a four-hour first-response window is reasonable because nothing physical depends on the resolution. The plant runs on a different clock. A four-hour first-response window during a Friday-night production emergency is not a service level. It is abandonment. The SLA was not designed for the consequence of physical-process failure, and applying it to OT support is applying an IT artifact to a physical-process problem.

### OT under the CIO or CISO

Roughly **52%** of organizations place OT security under the CISO. Both CIO and CISO are appropriate authorities for IT. Neither has a process-engineering background. The decisions cascade down to the plant floor as facts on the ground, and operations learns about the decisions when the consequences arrive. There is no chief operations technology officer in the org chart in most large enterprises. The chair operations would speak from is not in the room.

---

## What the field withholds

This part is the one the field does not like to hear, and is the one operations has to hear most.

A significant share of the institutional knowledge that runs industrial networks lives in the heads of senior practitioners who have decided, consciously or not, that they will not pass it on. The reasons are individual. The pattern is industry-wide.

- **The hero by hoarding.** The senior engineer is exhausted, indispensable, irreplaceable - and the indispensability is the source of their job security. Training a successor is, in this incentive structure, a path to becoming dispensable. So the training does not happen.
- **The undocumented configuration.** The switch configuration that only the senior engineer can read. The PLC program with no comments and a logic that requires a tribal-knowledge translation. The custom integration that exists only because one person knew how to make it work. None of this is documented. Most of it could be.
- **The refusal to mentor.** A young technician shows up wanting to learn. The senior practitioner gives them busywork instead of the work, withholds access to the things that would actually teach them, treats every question as an imposition. The young technician leaves. The field calls it a labor shortage. It is also a teaching shortage.
- **The gatekeeper as identity.** Knowing the thing nobody else knows becomes the practitioner's identity at work. Letting that identity dilute by spreading the knowledge is, for some people, indistinguishable from letting the self dilute. They will not do it.

This is not every senior practitioner. The Reality describes the ones who taught - the plant electricians, the mountain tech, the senior engineers whose competence is paired with willingness to share it. They exist, and where they exist, the field is alive. But where they are absent, the field is hollowing out, and the architecture has to be designed for the world where the gatekeeper will not teach.

The architecture's answer is to make the substrate self-documenting, so that gatekeeping by people is impossible. Configuration is a signed declarative artifact in a constrained grammar - readable by anyone with the standard's documentation. The contract catalog is mandatory and discoverable. The audit chain is hash-chained and queryable. The role catalog can be enumerated from any operator's workstation. The knowledge is in the substrate, not in the head. The senior engineer can retire, refuse to teach, or simply die - and the next operator can still read what the architecture is doing.

---

## What this produces

- **The 80% problem.** Catalogued above.
- **The skills cliff.** Senior practitioners retire without successors. Vendor certifications occupy the labor market in their place - bound to specific stacks, expiring on schedules, non-portable. Engineering as a discipline is underrepresented at the boardroom level.
- **The compliance economy.** A self-sustaining industry of consultants, auditors, certifiers, training providers, GRC tooling. Compliance is not security. The most-cited industrial incidents of the last five years happened to organizations that had passed audits, held certifications, and paid for consulting.
- **Standards-as-paywall.** Individual IEC 62443 documents cost around $470 each; the complete series runs over $2,000. The engineers actually implementing the standard cannot afford copies of it.
- **The hidden cost of doing nothing.** Manufacturing downtime averages around $88,000 per hour; specific industries run far higher. A weekend outage at a plant running at $10K/hour conservative loss is $600,000+. Insurance markets are tightening, excluding what they cannot underwrite - which is most uncatalogued OT exposure. The number on the page is what it costs to not change. Operations is not asking for new spending; operations is asking for the cost of doing nothing to be put on the balance sheet honestly.

---

## Why it is structural, not personal

Vendors respond to procurement teams that select on price up front. Integrators respond to bids that don't reward documentation. Consultants respond to billing structures that reward complexity. Auditors respond to checklist regimes that produce paper. IT teams respond to compliance frameworks built for the information substrate. Senior engineers respond to a labor market that rewards them for being irreplaceable.

Each actor is doing what the incentive in front of them rewards. Each is doing what the market shape requires.

The result is the industry as it stands. Plants buy closed stacks because the closed stack is what's on offer. Networks are inherited opaque because the integrator who would deliver a documented network costs more up front. Patches are pushed on the wrong cadence because the patch-management team is measured on patch coverage. Compliance teams pay for binders because the regulator wants binders. Senior practitioners do not train successors because being the one who knew is what their career is built on.

Nobody decided this. It is what happens when no one is positioned to refuse it.

The architecture exists to give the operator a position to refuse from. Not by going to war with vendors, IT, or anyone else in the field. By being able to buy from the market on the operator's terms - open standards, open protocols, signed configuration, contracted boundaries, attested operation - and walk away from anything that does not meet those terms. By being able to read the substrate without a vendor's permission, without an integrator's safe, without a senior engineer's goodwill.

---

## What the architecture refuses to buy

- **Closed protocols where open ones exist.** OPC UA, MQTT/Sparkplug B, i3X, Zenoh. The vendor's proprietary alternative is on the procurement side of the boundary, not the architecture side.
- **Reference architectures that violate the standard they cite.** Re-evaluate every vendor diagram against the actual standard. The standard wins.
- **IT-managed engineering workstations on the OT substrate.** Engineering workstations are OT compute on OT substrate, under the operator's update orchestration, with project-file integrity verification before the file reaches the workstation.
- **Dual-homed devices outside the box itself.** Every PLC has one network interface. Cross-substrate data flow happens through the box, contracted and audited.
- **Integrator-only configuration.** Configuration is a signed artifact in a constrained grammar. The integrator can build it; the operator owns it.
- **Compliance binders that do not connect to the wire.** Attestation is the load-bearing artifact: the contract catalog, the audit chain, the IDS observer, the IO master. The binder is downstream.
- **Vendor certifications as the labor-pool gate.** Competence is field-ready, standard-aligned, and portable. The architecture is designed to be operable by practitioners who do not hold any particular vendor's certificate.
- **IT patch cadence as OT discipline.** Update orchestration on the operator's clock, against the operator's intended state, with the operator's approval.
- **Tribal knowledge as a substitute for documentation.** Configuration is signed and discoverable; the contract catalog is mandatory; the audit chain is queryable; the role catalog is enumerable from any operator's workstation. Gatekeeping by people becomes impossible because the substrate refuses to be gatekept.

The Field describes the rooms. The Problem describes what stands in the way. Our Claim describes what we hold to. Our Philosophy describes how we think about it. The Architecture is the response.
