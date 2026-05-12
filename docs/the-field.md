# The Field

The architecture in the README is declarative. It says what the box is, what it does, and what it refuses. It does not say what it is *for*, in the sense of which rooms it walks into and which problems it stops being problems.

This document does. The Field is where operations works — specific kinds of places, specific kinds of people, specific kinds of failures. It is the lived ground the architecture is shaped by. The architecture is not angry at any of this. The architecture is what makes most of it stop being necessary.

None of the scenes below are hypothetical. Names and identifying details have been removed; the patterns are kept. After more than two decades working in these environments, the patterns repeat.

## Contents

- [Part I — Scenes](#part-i--scenes)
  - [The Shack in the Corn Field](#the-shack-in-the-corn-field)
  - [The Locked Drawer](#the-locked-drawer)
  - [The Two Networks](#the-two-networks)
  - [The Midstream Plant](#the-midstream-plant)
  - [Two AM](#two-am)
  - [The Spanning Tree](#the-spanning-tree)
- [Part II — People](#part-ii--people)
  - [The Plant Electricians](#the-plant-electricians)
  - [The Mountain Tech](#the-mountain-tech)
  - [The Senior Control System Engineer](#the-senior-control-system-engineer)
- [Part III — The Organizational Reality](#part-iii--the-organizational-reality)
  - [The Invisible Infrastructure](#the-invisible-infrastructure)
  - [The Cost Center and the Profit Center](#the-cost-center-and-the-profit-center)
  - [The Integrator's Recurring Revenue](#the-integrators-recurring-revenue)
  - [No Seat at the Table](#no-seat-at-the-table)
- [Part IV — What the Architecture Answers](#part-iv--what-the-architecture-answers)

---

## Part I — Scenes

### The Shack in the Corn Field

There is a gas site I was directed to once. It reports flow data for a midstream natural gas pipeline. I heard about it at another site and asked how to find it. They gave me a set of coordinates instead of an address.

Drive to the coordinates and you are in the middle of a corn field. There is a small red shack. The shack is not locked. Inside is a desk, a chair, a space heater, a few cellular modems from different gas companies with IP addresses written on duct-tape labels, and an old laptop running Windows XP, fifteen years past end of life. The laptop does something important. It is shared by multiple people, some of whom I never met. On the way out I was told not to try to lock it back up, because there are no keys.

That laptop is critical infrastructure. It has been critical infrastructure for years. It will be critical infrastructure for years longer. Nobody chose this. It is what was needed, and so it is what got built, by whoever happened to be there when it was needed.

> What the architecture answers: the unit in that shack would be a single box with no upstream dependency, running the zone's collection, the zone's historian, the zone's audit, and the zone's secure outbound publisher. It would still be in a small red shack in a corn field. It would also be inventoried, identified, authenticated, and recoverable, and it would not be an end-of-life consumer operating system. The architecture does not require the site to stop being remote. It requires the site to stop being undocumented.

### The Locked Drawer

A factory I visited has a drawer in the maintenance office that is kept locked. Inside the drawer are several unauthorized laptops. The laptops are used to update the PLCs and HMIs that run the lines. They are also used to play videos and check social media over a cellular hotspot. Those sites are blocked on the corporate network, so the unauthorized laptops are also the entertainment.

The official, dedicated, ruggedized plant laptop the company issued to the operators is the laptop they cannot use, because they are not allowed to install a terminal emulator on it, or the driver for their console cable, or the installers for the firmware updates they routinely apply. So the official laptop sits unused on a shelf, and the unauthorized laptops sit in the locked drawer, and the lines run.

IT knows. There are tickets open about it. The tickets do not close.

> What the architecture answers: the box runs the zone's own infrastructure services — DHCP, DNS, NTP, file shares, optional in-cell PKI — and the operator owns it. The configuration model is a signed artifact, not a remote-managed policy push, so the operator can install what the operator needs to run the plant. The unauthorized laptops in the locked drawer exist because the official infrastructure refuses to do what operations needs. The architecture's answer is to make the official infrastructure do what operations needs.

### The Two Networks

A gas plant I worked with has two parallel network infrastructures. The first is the corporate network: locked-down Wi-Fi, aggressive security, limited range. Range was limited because IT did not put access points at the truck laydown or in the shop, where the operators actually do their work.

The second is the real one. The one they use. A consumer router connected to a cellular hotspot. A few wireless extenders spread around the site, serving as access points. Sometimes a secondary broadband connection the operators arranged on their own. I have seen this exact pattern more than once.

The operators are not doing anything wrong. They are doing the only thing left. The corporate network does not reach the parts of the plant that need a network. The unofficial network does. Productivity continues. Nobody admits the second network exists, and so nothing about it is monitored, inventoried, hardened, or backed up.

> What the architecture answers: the box runs the zone's network. There is no second network because the first one already reaches where it needs to reach, runs the services it needs to run, and is owned by the operator who needs it to run. The unit is the operator's, and the operator does not have to ask permission to make it work.

### The Midstream Plant

A midstream plant I visited carries a meaningful share of the natural gas that flows through one of the major regional pipelines. The primary computer controlling the plant was multi-homed when I saw it — one interface on the control network, one on a network with always-on internet. A free remote-support utility, of a kind commonly abused by attackers, was running on the computer at all times. The plant supervisor had configured it so he could check on the plant from a tablet while he was at home.

The configuration was not malicious. The supervisor was responsible for plant uptime. He had a tool that let him watch the plant when he was not on site, and he used it. The fact that the tool was a popular remote-access utility with a long history of being abused was not his concern — his concern was being able to see what was happening when his phone rang at three in the morning.

This is not unusual. Most plants have intentionally installed backdoors so plant personnel can troubleshoot, pull reports, and check status remotely. They exist because the legitimate remote-access path is either too restricted, too slow, or doesn't exist at all.

> What the architecture answers: the box has a remote-access role, with an outbound tunnel agent that dials out over mTLS to a broker the operator owns. There is no inbound listener on the IT NIC. The supervisor gets the tablet-at-home capability, and the architecture gets to authenticate the session, identify the principal, audit the access, and constrain what can be done. The supervisor stops needing the consumer remote-support utility, because the legitimate path actually works.

### Two AM

Production line goes down at two in the morning. The plant engineer suspects the network. The night-shift technician begins by pinging the addresses he knows, because pinging is what he knows how to do. He cannot reach the switch through a browser — the switch is HTTPS-only, or the port is non-standard, or his laptop's IP is wrong for the segment. He cannot reach the next switch either. He cannot find anyone who can answer the question of why.

He calls the senior control system engineer. The senior engineer is the one who configured the switches when the line was built. He walks the technician through the topology by phone. If the problem is something the senior engineer can fix from his couch, the line is back up in thirty minutes. Sometimes it is.

Often it is not. The problem is on the IT side of the boundary, or it touches a switch IT manages, or it requires a change IT has to approve. The senior engineer calls the help desk. The help desk has a service level agreement. The SLA says someone will respond to an urgent ticket within thirty minutes to four hours. The SLA does not say the person who responds will be the one who can fix the problem. Often it is a level-one analyst who creates a ticket and escalates. Escalation has its own SLA. The network engineer who can actually make the change has his own SLA after that.

On Friday evening, the SLA clock can run all weekend without violating policy. Friday-night production emergency: see you Monday morning. A plant that loses ten thousand dollars an hour of production while the SLAs run is losing six hundred thousand dollars by the time the network engineer logs in on Monday.

The fix, when it finally happens, is often something the senior control system engineer could have done in fifteen minutes. A spanning-tree lockup that needed a switch restart. A VLAN configuration that needed a single edit. A failed link that needed a manual failover. The fix is simple. The access is complex. The complexity costs more than the plant.

> What the architecture answers: the unit holds the zone's network. The operator's senior control system engineer has the access he needs to fix what he knows how to fix, with proper internal change management designed for production timelines rather than enterprise ones. The IT side of the boundary is reached through a single, contracted, audited conduit, not through a help desk ticket. The fix happens when the fix is possible, which is usually within the first hour.

### The Spanning Tree

A dairy plant I was called to had hour-long intermittent network outages, every few weeks, for several months. The plant called the contractor's IT group. The contractor's IT group looked at it. Several engineers looked at it. Nobody thought of spanning tree.

I was called in. It was a spanning-tree misconfiguration on one of the distribution switches. I fixed it in an afternoon. The plant paid the emergency-service rate. The reaction in the plant was relief and astonishment that a single setting could cause this much chaos, and frustration that the network had been built without that setting being right in the first place.

The integrator that built the network had moved on. They had not documented the configuration. They had not handed over the passwords. They had not trained anyone at the plant to maintain what they had installed. The plant inherited a network it could not see, could not configure, and could not troubleshoot. It worked until it did not, and then it cost an emergency call to make it work again.

> What the architecture answers: the box is the operator's, and so is its configuration. Configuration is a signed declarative artifact, versioned, that the operator owns. The role catalog and the contract catalog are discoverable from the unit itself. An integrator can build the deployment, but they cannot leave the deployment opaque. When the integrator is gone, the plant can still read the configuration, audit the connections, and change what needs to change.

---

## Part II — People

### The Plant Electricians

The first deeply industrial site I worked at was a metallurgical coal operation in mountainous country, with a process plant, crusher, breaker, and rail loadout. Winters there hit thirty below. The drive to the nearest town with a hospital was hours either direction. The plant handled its own technology. Three plant electricians, eventually best friends. The best of the best.

Their ability to troubleshoot anything — mechanical, electrical, network, whatever — was the kind you only find in people who have decided that fixing the thing is more interesting than waiting for someone else to fix it. They broke equipment down to repair it on the bench rather than replacing it. They could read a fault from a description over the two-way radio. They examined the *why* of every problem. They had hideouts throughout the job site — a shipping container in the corner of a yard with a lounge inside, an alcove formed by the warehouse wall and storage with a tarp and a grill — because they did not want to be involved with everyone else's bullshit, and they were treated as untouchable by the rest of the operation, and they were correct to be.

I had to earn their trust before they would let me help. Once I had it, we were in daily contact. I cannot imagine how I would have been effective otherwise. They were the operators. The mine ran because they ran. The technology, including what was bleeding-edge at the time, worked because the people closest to it were also the people who could fix it.

> What the architecture answers: the operator is named. The architecture is for them. Not for the integrator, not for IT, not for the vendor. The plant electricians were the architecture before anyone wrote it down — they owned the substrate, they understood the substrate, they fixed the substrate when the substrate broke, and they earned trust before they granted it. The box is the artifact form of what those operators already were as people. Empower the practitioner. Restore the standards to the people who actually operate the plant. (Alliance Philosophy #06.)

### The Mountain Tech

The IT technician at one of the sister sites in that same coal operation was about twenty years older than I was. She handled most of the help desk and IT work for the local operations. Half her job was driving service trucks to remote sites in weather that would have stopped most people from leaving the house. She was a long-time local, one of very few. She had grown up the daughter of a hunting guide and trapper, living in the bush without electricity for a significant portion of her upbringing. She was, and remains, smart as hell at every aspect of the work.

I tried to replace another colleague who left not long after I arrived. I could not. I never found anyone before the mine went bankrupt. The reason was simple, and it is the same reason most plants do not have on-site technical staff. IT people do not want to work in the mountains. They do not want to off-road to a mine in a blizzard. They do not want to climb a ninety-foot roof to install a wireless bridge. They do not want surly operators smoking cigarettes and cussing them out while they work. They want stable power, multiple internet connections, a comfortable chair, and a wide SLA. To the right person, the mine is heaven. To most IT hires, it is a nightmare.

She was the exception that proved the rule. She had IT skills and operational temperament at the same time — comfortable with isolation, with physical danger, with direct confrontation, with working under pressure. She could troubleshoot a network problem while a foreman was breathing down her neck about production. She went on, after the mine closed, to do crisis education work in remote communities — same challenging environments, same comfort with unpredictable situations. Effective tech people are often not "tech people."

> What the architecture answers: the architecture is for the people who are already in the mountains. It does not assume an office. It does not assume always-on backhaul. It does not assume a help desk down the hall. It assumes one person, on site, with the tools to do the work themselves and the documentation to do it correctly. It assumes the network has to be legible to whoever walks up to it. The architecture is what gets handed to those operators, and the architecture is what works in their hands.

### The Senior Control System Engineer

Almost every plant has one. He configured the switches when the line was built, knows where the cables go, knows which interlocks are spanning which segments. When the line goes down at two in the morning, he is who gets called. He is also the single point of failure. If he is on vacation, the call goes to whoever is willing to pick up the phone, and the phone often does not get picked up.

He is not a hero by choice. He is a hero by accumulation. Twenty years of being the one who knew, and nobody else learning, and so he kept being the one who knew, and nobody else still learning, and so on. He is exhausted. He is reaching the end of his career. His successor has not been chosen, has not been trained, and is not, in most plants, on the payroll.

> What the architecture answers: distributed competency. The box does not require a hero. It runs declared configuration from a signed artifact. The role catalog is discoverable. The contract catalog is discoverable. The audit chain is queryable. Multiple operators can be trained to operate the box, because the box presents itself the same way at every plant and every level. When the senior engineer retires, the plant is not handing his successor a tangle of switches whose configuration only existed in his head. It is handing the successor the same architecture that exists at every other plant. The hero pattern is replaced by the documented pattern.

---

## Part III — The Organizational Reality

### The Invisible Infrastructure

The canonical EtherNet/IP design guide for discrete manufacturing — *The Everyman's Guide to EtherNet/IP Network Design*, by John Rinaldi and Gary Workman, drawn from Workman's career architecting control networks at a major automotive manufacturer — argues strongly against VLANs in control networks. The book says VLANs make things more difficult to configure and maintain. Its own implementation examples, however, include automotive plants with two hundred or more long-distance interlocks spanning a square mile, with EtherNet/IP traffic given priority guarantees across the enterprise network.

Read the examples carefully. The traffic being prioritized was being prioritized by IT, using DSCP markings, across VLANs the control engineer did not see and did not control. A bug in an early PLC firmware that mishandled DSCP markings is how the existence of the markings became visible from the OT side. The simple, isolated control network of the book's mental model was, in reality, sophisticated IT-owned infrastructure that the OT side was a consumer of.

The book is not wrong about what was wanted. It wanted a network that did what control needed it to do, that the control engineer did not have to think about, and that did not interfere with the work. That outcome was achieved. It was achieved because the organization happened to have IT running good infrastructure underneath operations, invisibly. Most plants do not have that. Most plants have neither the IT capability to run that infrastructure invisibly well, nor the OT ownership to run it themselves, and so they end up with the worst of both — invisible infrastructure that does not work.

> What the architecture answers: the box owns the substrate that operations depends on. Not invisibly. Legibly. Every conduit is contracted. Every contract is in the catalog. The catalog is queryable. The operator does not consume IT infrastructure they cannot see. The operator owns the infrastructure they need, and the integration with IT happens at a known interface, on known terms.

### The Cost Center and the Profit Center

IT is a cost center in most organizations. Cost centers are measured on cost. The natural behavior of a cost center is to refuse anything that increases cost, even when the thing being refused is necessary. The behavior is not malicious. It is the structural consequence of how the organization is measured.

Production is a profit center, often the only one. The behavior of a profit center is to optimize for production. Cost matters, but it sits below reliability, maintainability, and simplicity. A profit center that has to wait on a cost center for permission to operate is structurally subordinate to it.

In the typical organization, this misalignment plays out at the level of patches and maintenance windows. IT patches for critical security issues, because that is what IT is measured on. The patch reboots a switch for thirty seconds. In an office environment, a thirty-second reboot is invisible. On a production line where a conveyor stop requires manual intervention to restart, a thirty-second reboot loses the rest of the shift. IT did the right thing by their metrics. Operations lost a shift's worth of product. Neither party is wrong. The structure is wrong.

> What the architecture answers: the box is on the operator's side of the boundary. It does not get patched on IT's schedule. It is updated through the update orchestration mechanism, on the operator's schedule, with the operator's approval, against the operator's intended-state manifest. The operator controls the substrate that production depends on, because production is the thing the substrate is for.

### The Integrator's Recurring Revenue

A plant calls an integrator. The integrator builds the network. The integrator does not document the configuration, does not hand over the passwords, does not train anyone at the plant, and leaves. The plant inherits a network it cannot configure and cannot troubleshoot.

A few months later, something breaks. The plant cannot fix it. The plant calls the integrator. The integrator bills two hundred to three hundred dollars an hour for the fix. The fix takes an afternoon. The plant pays the bill.

This is not, in most cases, a deliberate scheme. Integrators operate on thin margins, are squeezed by clients demanding low up-front costs, and use recurring service revenue to make the business viable. The individual people are skilled professionals trying to make a living. The market forces create the dependency.

But the market forces also create the incentive structure. An integrator who hands over a fully documented, fully transferable deployment has no recurring revenue from that customer. An integrator who leaves the deployment opaque has recurring revenue forever. The disciplined integrator gets out-competed on price by the integrator who leaves the deployment opaque, because the up-front bid looks the same and the back-end costs are not visible until two months in. The discipline does not get rewarded.

> What the architecture answers: the box is built so that opacity is not an option. Configuration is a signed declarative artifact in a constrained grammar. The contract catalog is mandatory and discoverable. The audit chain is hash-chained and queryable. Integrators can still build the deployment, and good ones should — but they cannot leave the deployment in a state where only they can read it. The architecture takes the lever of opacity out of the integrator's hand. The plant can fire the integrator the day the deployment is signed off, hire a different one in six months, and the second integrator can read what the first one built.

### No Seat at the Table

In most large organizations there is a chief information officer, a chief technology officer, and a chief information security officer. All three represent IT interests at the executive level. There is no chief operations technology officer. There is no equivalent.

When the executive committee discusses infrastructure, the CIO speaks for technology. The plant manager, the operations director, the senior controls engineer — they are not at the meeting. Decisions about networks, about security, about vendor selection, about budgets, get made by people whose worldview is shaped by enterprise IT. The decisions cascade down to the plant floor as facts on the ground. Operations finds out about the decisions when the consequences arrive.

This is not because anyone is being excluded on purpose. It is because the organizational chart never developed a place for operations technology leadership. Operations is run by people whose primary discipline is the physical process — chemistry, metallurgy, mechanical engineering, electrical work. They are not in the boardroom. They are in the plant. The boardroom never noticed they were missing.

> What the architecture answers: the architecture exists *as* operations' position. It is a documented, citable, public artifact that operations can bring to the executive committee and say: this is what we need, this is how it works, this is what it costs, this is what it returns. The architecture is not a vendor pitch. It is not a consultant deliverable. It is a CC BY-SA 4.0 specification, claimed by name, that operations can use as the ground they argue from. The plant manager who does not have a seat at the table still has the architecture.

---

## Part IV — What the Architecture Answers

The box is shaped by The Field. The scenes are not anger. They are not grievance. They are conditions. Industrial operations exists in these conditions, every day, in every plant, in every industry. The conditions are not going away. The architecture is what makes most of them stop mattering.

**Connectivity is a luxury.** The shack is in a corn field. The mine was in the mountains. Most of the operations the architecture serves are remote, satellite-dependent, cellular-dependent, or fully disconnected from upstream for hours or days at a time. The unit works alone, indefinitely. If connectivity exists, it composes upward. If it drops, nothing changes on site.

**Operations builds the infrastructure operations needs.** Always. The locked drawer, the consumer router, the always-on remote-support utility, the corn-field shack — these are not failures of compliance. They are operations doing the only thing left to do. The architecture's response is to give operations infrastructure that already does what operations needs, so the shadow infrastructure stops being necessary.

**The operator owns the substrate.** This is the load-bearing claim. The box, the data, the historian, the audit, the configuration, the contracts — all of it lives on the operator's hardware, in the operator's possession, under the operator's control. Vendors are consumers, not gatekeepers. Integrators are builders, not landlords. IT is a peer at a known interface, not a controlling authority above. The substrate belongs to the people who run on it.

**The senior engineer is not a single point of failure.** Distributed competency. Declarative configuration. Discoverable catalogs. The hero pattern is replaced by the documented pattern. When the senior engineer retires — and they will, all of them, in the next ten years — the plant still works.

**The boundary is enforced by architecture.** Not by policy. Not by trust. Not by handshake agreement. The box terminates Zero Trust on the IT side and begins Managed Trust on the ACS side, and the transition is enforced by the unit's three-side internal partitioning, by the kernel firewall, by the workload identity system, by the contract catalog, and by the absence of any HTTP listener on either external NIC. Policy can change. Architecture is harder to change. The architecture is what makes the boundary durable.

**Standards belong to practitioners.** IEC 62443 is not vendor IP. PERA+ is not consultant IP. ISA-95 is not a service offering. The architecture is the field-ready instantiation of those standards, for the operators who are supposed to have them but currently do not. Restore the standards to the practitioners who actually operate the plant. (Alliance Philosophy #06.)

---

The architecture does not require the corn-field shack to stop being remote. It requires the shack to stop being undocumented.

It does not require the factory to stop using cellular hotspots. It requires the cellular hotspot to be a contracted, identified, audited conduit on operator-owned hardware.

It does not require the supervisor to stop watching the plant from a tablet at home. It requires the tablet-at-home path to be authenticated, identified, and recorded, on the operator's terms.

It does not require the plant electricians to stop being who they are. It requires the architecture to be theirs.

These are the conditions of The Field. The Problem is what stands in their way. Our Claim is what we hold to. Our Philosophy is how we think about it. The Architecture is the response.
