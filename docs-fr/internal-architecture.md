# Architecture interne

Ce document décrit ce qui tourne à l'intérieur de la **secure edge gateway** IIA (dans le langage courant : la boîte) : l'inventaire des rôles, le partitionnement, les invariants de frontière, le modèle d'identité des workloads, la posture d'audit, les réalisations physiques mappées aux niveaux de sécurité IEC 62443, et les implémentations candidates que les exploitants peuvent choisir.

Dans tout ce document, « secure edge gateway », « gateway », « box » et « unit » désignent le même élément architectural. *Secure edge gateway* est le nom canonique ; les formes plus courtes sont utilisées librement dans le corps du texte lorsqu'elles se lisent plus naturellement.

La spécification d'architecture nomme des **rôles** et les **contrats** qu'ils satisfont. Elle ne nomme pas de produits. Les exploitants choisissent les implémentations qui correspondent à leurs exigences opérationnelles : posture de licence, enveloppe de ressources, relations fournisseurs, éléments de preuve d'audit. L'appendice non normatif *Implémentations de référence* à la fin liste des logiciels candidats par rôle.

Pour le principe architectural que ce document met en œuvre, voir le [README](/fr/architecture/). Pour le déploiement two-box qui atteint le Security Level 4, voir [The Two-Box Method](/fr/architecture/#the-two-box-method) au même endroit.

Des exemples commentés de contrats dans des catalogues déployés par des opérateurs sont disponibles dans [/fr/architecture/docs/sample-contracts/](/fr/architecture/docs/sample-contracts/) : périmètres internal / boundary / device / inbound avec YAML concret.

Diagrammes de style CIAD :

- La boîte et ses surfaces externes — [/diagrams/box-architecture.png](/diagrams/box-architecture.png)
- The Two-Box Method, SL3 vs SL4 — [/diagrams/two-box-method.png](/diagrams/two-box-method.png)
- Le fractal — la même unité à chaque portée PERA — [/diagrams/fractal.png](/diagrams/fractal.png)

![Architecture de la boîte](/diagrams/box-architecture.png)

![The Two-Box Method](/diagrams/two-box-method.png)

![Le fractal](/diagrams/fractal.png)

## Invariants

Ce sont les règles dures de l'architecture. Les choix d'implémentation doivent tous les respecter.

1. **Pas de HTTP à la frontière externe de la boîte, dans aucun sens, à l'exécution.** Pas de listener HTTP sur les NIC ACS ou IT. Pas de HTTP/HTTPS sortant depuis quelque composant que ce soit : pas de pull de registre, pas de flux de règles, pas de télémétrie, pas de CRL/OCSP. Les mises à jour et deltas arrivent via bundles signés ou deltas en mTLS tirés par les canaux sortants de la boîte. L'interface locale de management sur la NIC de management est le seul listener HTTPS de l'architecture, et il est limité au réseau local.
2. **Surface minimale à l'exécution.** Chaque listener, daemon et connexion sortante existe parce qu'il a été conçu pour un but opérationnel précis. Aucun service activé par défaut. Aucun listener de convenance. Aucune interface de debug à l'exécution. L'image OS est construite de sorte qu'un service désactivé ne puisse pas être réactivé à chaud ; il faut reconstruire l'image. *La complexité est l'ennemi de la fiabilité* est le principe opérationnalisé ici.
3. **L'interface d'observation tournée vers l'ACS est passive.** Aucun TX de pile IP, aucun listener, jamais, sur la NIC d'observation ACS. Les services IP de zone (DHCP, DNS, NTP, fichiers) tournent sur une interface active séparée limitée au réseau de cellule et jamais routée au-delà. Le canal d'observation et le canal de services peuvent partager une NIC physique via VLAN ; la distinction est fonctionnelle, pas physique.
4. **Tout trafic inter-zone transite par la DMZ interne.** Les zones entrantes ne peuvent pas conduire directement vers les zones sortantes.
5. **Des rôles, pas des produits.** Les sections normatives décrivent le rôle de chaque composant. Les logiciels précis vivent uniquement dans l'appendice *Implémentations de référence*.
6. **Les standards et protocoles restent nommés.** MQTT, Sparkplug B, OPC UA, Zenoh, CESMII i3X, MCP, OIDC, FIDO2, SPIFFE SVID, OCI, TPM 2.0, UEFI Secure Boot, TLS 1.3, IEC 62443, ISA-95 et PERA+ font partie de la surface d'interopérabilité et appartiennent donc à la spécification.
7. **Toute communication est contractuelle.** Inter-conteneurs, inter-zones, inter-côtés et externe : chaque conduit, chaque appairage mTLS, chaque échange d'équipement doit être soutenu par un contrat explicite dans le catalogue de contrats du déploiement. La communication sans contrat est **empêchée** là où l'architecture peut l'imposer et **signalée** là où elle ne le peut pas.
8. **L'attestation observe la prévention.** Tout mécanisme de prévention peut fuir. L'architecture le suppose. Des observateurs d'attestation indépendants recoupent ce qui s'est vraiment produit avec ce que le catalogue disait devoir se produire et émettent des signaux lorsque les deux divergent. **L'observateur d'attestation réseau basé IDS est obligatoire même sans SDN.**
9. **La configuration est un artefact signé, pas une API live.** La boîte accepte la configuration comme document texte signé consommé par un parseur à grammaire contrainte, jamais comme endpoint REST qui mute l'état courant. Admission d'image, mise à jour d'OS et configuration suivent le même motif : artefact entrant, vérification, validation, application ou rejet.

## Alignment with PERA+

L'architecture s'aligne sur PERA+.

- **Les 4Rs** — Response, Resolution, Reliability, Resilience — déterminent quelles fonctions vivent sur la boîte et lesquelles vivent à une portée plus large.
- **« Secure interfaces, not integration. »** La boîte est une interface entre ACS et IT, pas une fusion des deux.
- **Transition Zero Trust ↔ Managed Trust.** La boîte termine l'environnement Zero Trust côté IT et commence l'environnement Managed Trust côté ACS.
- **Placement canonique L3/L4.** La portée archétypale de la boîte est la frontière PERA L3/L4, mais le déploiement peut se faire à n'importe quelle frontière entre niveaux adjacents.
- **Conventions de diagrammes CIAD et CIND.** Utilisées dans les déploiements de référence IIA.

## Physical Realizations

L'architecture est logique. La secure edge gateway est un agrégat de rôles à la frontière d'une zone, réalisable à l'échelle que demande la portée de l'exploitant.

- **Appliance sur matériel standard** : la réalisation small-shop, en châssis unique.
- **Pile multi-hôte** : broker, capture, lake et IDS répartis sur plusieurs machines.
- **Infrastructure virtualisée** : mêmes zones logiques réalisées en VM.
- **Cluster Kubernetes** : raisonnable au niveau site, régional ou corporate quand la surcharge du plan de contrôle est justifiée.
- **Déploiement hyperscale en data center** : même architecture réalisée à l'échelle flotte.

Les invariants voyagent à travers toutes ces réalisations : pas de HTTP à la frontière, surface minimale, ACS passif, tout trafic inter-côtés via DMZ, mTLS à chaque saut interne, intégrité de la chaîne d'audit.

## Security Level Targets

La secure edge gateway a deux réalisations physiques, gouvernées par la même architecture logicielle.

| Réalisation | Cible SL | Topologie |
|---|---|---|
| **Single-box** | SL3 | Une unité IIA à la frontière de cellule. NIC ACS passive. Partitionnement interne en trois côtés (inbound / DMZ / outbound) avec conduits default-deny et mTLS à chaque saut. Push-only outbound sur profil edge choisi par l'exploitant ; structured query API sur mTLS pour le pull. Aucun HTTP à la frontière. |
| **Two-box + diode** | SL4 | **Inside box** côté ACS. Diode de données matérielle entre les deux. **Outside box** côté IT. L'inside box publie vers l'outside subscriber au travers de la diode ; les consumers accèdent à l'outside subscriber, jamais à l'inside. Même logiciel, même modèle de configuration. |

Le SL3 ne promet pas l'unidirectionnalité. Il promet une frontière durcie, segmentée, authentifiée et auditée. Le SL4 n'est atteignable qu'avec diode matérielle et séparation physique. Aucune réalisation single-box ne revendique le SL4.

Les déploiements SL1 et SL2 ne sont pas des produits séparés. Ce sont des déploiements SL3 avec des contrôles relaxés par politique opérateur.

## Hardware Capabilities

L'architecture se fixe sur un petit ensemble de capacités matérielles, pas sur des tailles précises.

| Capacité | Exigence | Notes |
|---|---|---|
| Ancre de confiance | TPM 2.0 avec UEFI Secure Boot, measured boot et secrets scellés aux PCR | Obligatoire au SL3 |
| Accélération crypto matérielle | AES-NI x86_64, extensions cryptographiques ARMv8 ou équivalent | mTLS à chaque saut interne |
| Stockage | SED ou chiffrement complet du disque avec clé scellée à l'ancre matérielle | |
| Réseau | **3 NIC physiques idéales — ACS / IT / Management.** **2 NIC + VLAN acceptables** sur matériel standard. | Le two-box exige TX-only fibre côté ACS et RX-only fibre côté IT, couplés à la diode. |

La topologie 3-NIC est préférable car elle sépare physiquement le plan de données IT et le plan de management local. La variante 2-NIC + VLAN est acceptée pour des raisons de coût mais exige une configuration VLAN disciplinée et une preuve d'audit claire.

## External Surfaces

La boîte a, au maximum, trois interfaces réseau externes plus une console.

| Interface | Listeners | Sortie | Notes |
|---|---|---|---|
| NIC ACS | aucun, jamais | aucune | Capture passive uniquement. RX-only au niveau noyau. |
| Interface de services de zone | DHCP, DNS, NTP, SMB / NFS, PKI in-cell optionnelle | Réponses standards limitées au réseau de cellule | Participant actif dans la cellule. Peut partager une NIC physique avec l'observation ACS via VLAN. |
| NIC IT | structured query API sur mTLS uniquement, transport non HTTP | edge publisher, agent de tunnel mTLS, pull de bundles signés sur mTLS | **Aucun listener HTTP/HTTPS, jamais.** |
| NIC Management | UI locale (HTTPS, OIDC + 2FA), seulement lorsque l'exploitant l'active | aucune | Réseau local seulement. Source-IP-restricted. Jamais routée vers le WAN. |
| Console | Série liée au TPM, dernier recours | aucune | Aucun listener réseau. |

## Internal Partitioning

La boîte est partitionnée en trois plus une interface de management. Chaque partition est une zone protégée par pare-feu noyau avec une politique de conduits explicite.

**Adressage des rôles.** Les rôles architecturaux sont nommés avec des labels hiérarchiques, leaf-first et tirets ASCII.

```text
<role>.<gateway>.<work-unit>.<work-center>.<area>.<site>.local
```

Exemple pour une gateway `seg01` à la tête de `Palletizer.Packout.Zone4.Milwaukee` :

```text
witness.seg01.Palletizer.Packout.Zone4.Milwaukee.local
lake.seg01.Palletizer.Packout.Zone4.Milwaukee.local
publish.seg01.Palletizer.Packout.Zone4.Milwaukee.local
```

La partition est une métadonnée documentée, pas une partie du FQDN. Les topics d'événements de broker restent root-first (`attestation.policy-drift`, `contract.violation`, `security.audit`).

```text
+---------------------------------------------------------------+
|                   SECURE EDGE GATEWAY                         |
|                                                               |
|  INBOUND (ACS-FACING)      DMZ              OUTBOUND (IT)     |
|                                                               |
|  collect ─┐                                                   |
|  witness ─┤                                                   |
|           ├──► bus ───────┬──► publish ──► (edge profile)     |
|           │  (transient)  │                                   |
|  lake ◄───┘               ├──► api ──────► (mTLS query)       |
|  (durable, source         │                                   |
|   of truth, historian)    └──► tunnel ───► (mTLS dial-out)    |
|                                                               |
|                  audit ────────────────► (chain head north)   |
|                                                               |
|  Management:  ui (management NIC, local-network only)         |
+---------------------------------------------------------------+
```

**Inventaire des rôles.**

| Rôle | But | Partition | Conduits entrants | Conduits sortants |
|---|---|---|---|---|
| `collect` | Collecteurs orientés protocole pour les trafics horizontaux et verticaux | acs | NIC ACS passive ; radio LoRaWAN on-box si présente | `bus`, `lake` |
| `witness` | Capture continue, IDS réseau, moteur de scan, enrichissement | acs | NIC ACS passive | `lake`, `audit`, `attest` |
| `io-master` | Observation indépendante du substrat d'E/S | acs | Tap NIC / interface E/S indépendante | `attest` |
| `lake` | Data lake local, durable, append-only, source de vérité | acs | `collect`, `witness`, `bus` | `publish`, `api`, `audit` |
| `netservices` | DHCP, DNS, NTP, partage de fichiers et PKI in-cell de zone | acs | Interface active de services de zone | `audit`, `lake` |
| `bus` | Bus de messages in-flight, sans persistance durable | dmz | `acs.*`, `it.*` | `lake`, `publish`, `api` |
| `audit` | Publication de la tête de chaîne d'audit | dmz | toutes zones | `publish` |
| `attest` | Agrégateur d'attestation et corrélateur SDN / catalogue | dmz | `witness`, `io-master`, contrôleur SDN, émetteur SPIFFE | `lake`, `audit`, `publish` |
| `publish` | Edge publisher lisant le lake et publiant selon le profil configuré | it | `lake`, `bus`, `audit` | NIC IT |
| `api` | Structured query API sur mTLS, non HTTP | it | `lake`, `bus` | NIC IT |
| `tunnel` | Agent de tunnel mTLS sortant pour le broker d'accès distant | it | aucun | NIC IT |
| `ui` | UI locale de management, générateur de texte uniquement | mgmt | NIC Management | `lake` lecture seule, `api` lecture seule, `cfg` soumission d'artefacts |
| `cfg` | Parseur, validateur, staging et observateur d'attestation de configuration | mgmt | `ui`, canal de mise à jour sortant | applier privilégié à la demande, `audit`, `attest` |

**Politique de conduits.** L'application se fait par couches :

1. **Plan de politique SDN** optionnel, compilé à partir du catalogue.
2. **Réseaux de conteneurs par zone**, sans routage direct entre bridges.
3. **Pare-feu noyau**, allowlist de conduits par source, destination et port.
4. **mTLS au niveau applicatif**, via identités SPIFFE.

Une connexion qui échoue à une couche active est rejetée et journalisée. Les déploiements sans SDN restent supportés ; l'observateur IDS d'attestation compense comme seul observateur réseau et doit être capable d'alerter.

**Application inter-côtés.** Les zones inbound (`acs.*`) et outbound (`it.*`) ne peuvent pas conduire directement l'une vers l'autre. Tout trafic inter-côtés transite par une zone DMZ (`bus`, `audit`).

## Data Plane

**Le data lake local est la source de vérité.** Toute capture entrante, toute sortie de classification, tout audit, tout événement et toute série temporelle atterrit dans `lake`. Le lake est durable, append-only et constitue le seul endroit où les données brutes persistent sur la boîte. Les publishers sortants siphonnent depuis le lake.

**Le bus in-flight est transitoire.** Il sert à la livraison d'événements à faible latence entre zones. Il ne retient aucune donnée durable. Les subscribers le talonnent pour les événements live ; les consumers qui attendent un état historique lisent dans le lake.

**Haute fidélité à l'edge, sous-échantillonné au centre.** Le lake stocke à la résolution native ; les lacs BI de portée supérieure reçoivent des vues sous-échantillonnées pour l'analytics. Les tranches pleine fidélité se tirent à la demande depuis le lake via la structured query API.

**Le schéma est observé, pas imposé, à l'edge.** La boîte publie des enregistrements typés mais flexibles. La modélisation ISA-95, l'observabilité de charge utile et la conformité de schéma vivent à une portée plus large.

**Les data contracts sont l'unité d'intégration à la frontière L2↔L3.** Ils spécifient quelles données la boîte expose, quels déclencheurs tirent, quels codes de faute sont émis et quelles sémantiques de retour s'appliquent. Les contrats sont versionnés ; l'architecture traite leur évolution comme un sujet de premier ordre.

## Outbound Edge Profile

Le profil edge est **choisi par l'exploitant, par déploiement**. L'architecture est agnostique au profil.

| Profil | Où il convient | Notes |
|---|---|---|
| MQTT + Sparkplug B | Contrôleur ↔ broker de zone (PERA L1/L2) | Validé sur le terrain à cette portée. Au-dessus de L2/L3, les tempêtes de rebirth et pathologies QoS deviennent des passifs. |
| OPC UA pub/sub | Cellule ↔ site, site ↔ enterprise | Natif ACS, ordre déterministe, conscient du schéma. |
| Zenoh pub/sub + queryables | Toute portée, surtout appliance ↔ maillage de portée supérieure | Un seul protocole couvre pub/sub, queryables et routage fédéré. |
| **CESMII i3X** | Consumers pull-mode et accès haute fidélité à la demande | Interface standard préférée à la frontière L2/L3. La v1 couvre séries temporelles et états statiques. |
| Structured query API sur mTLS | Consumers pull-mode quand i3X n'est pas retenu | gRPC, NATS req/reply, OPC UA req/reply, Zenoh queryables, MCP-over-mTLS. |
| Écriture batch vers object store | Consumers BI / analytics | Versionné, sous-échantillonné et séparé du pipeline temps réel. |

**Chemin de consommation par agent IA.** Quand le déploiement demande un accès IA, la boîte expose une structured query API parlant **CESMII i3X** sur mTLS ; un **serveur MCP** fonctionnant à portée supérieure la consomme et l'expose comme outils / ressources MCP. Le serveur MCP vit hors boîte parce que son transport canonique Streamable HTTP contredit la règle « pas de HTTP à la frontière ».

Pour les déploiements single-box sans broker de portée supérieure, le serveur MCP tourne typiquement sur le poste de travail de l'exploitant ou sur un petit hôte annexe sur le réseau local. Les invariants ne changent pas.

**Orchestrer les transactions, chorégraphier la télémétrie.** Les flux de télémétrie sont chorégraphiés ; les flux transactionnels sont orchestrés et passent par l'API de requête structurée ou un canal transactionnel dédié.

## Data Contracts

**Chaque communication sur la boîte et à travers ses frontières est gouvernée par un contrat de données explicite.** Cela vaut pour les échanges inter-conteneurs, inter-zones, inter-côtés, externes et au niveau équipement. Une communication sans contrat est empêchée ou signalée ; dans les deux cas il s'agit d'un défaut de déploiement.

La raison est la défendabilité. Quand un système demande « cela s'est-il produit, et était-ce autorisé ? », la réponse doit remonter à un contrat.

### The contract catalog

L'ensemble complet des contrats du déploiement forme le **catalogue de contrats**, artefact versionné accessible via la structured query API à un endpoint bien connu. Chaque conduit référencé par le pare-feu noyau, chaque appairage mTLS, chaque endpoint externe et chaque échange d'équipement doivent être soutenus par une entrée de catalogue.

### Enforcement: prevention, flagging, attestation

Trois modes opèrent ensemble, et les trois sont requis.

**Prévention** est la posture par défaut pour le trafic interne et pour les chemins externes explicitement permis. Les couches requises se compilent à partir du catalogue comme source de vérité unique :

- **Pare-feu noyau** : conduits par zone en allowlist, politique par défaut `drop`
- **Émetteur d'identité de workload (SPIFFE)** : aucun contrat -> aucun SVID
- **Admission du runtime conteneur** : refuse les workloads sans entrée de contrat et sans vérification de signature d'image
- **mTLS** : chaque connexion inter-zone authentifie les deux extrémités

Un **plan de politique SDN** est recommandé quand l'exploitant en dispose : le même catalogue est compilé en politique de fabric, empêchant les flux non contractuels avant même qu'ils atteignent l'hôte.

**Signalement** est le repli pour les chemins observés mais impossibles à préempter : capture passive sur NIC ACS, broadcast local, protocoles legacy sans authentification. La pipeline de capture continue consulte le catalogue et émet des événements `contract.violation` pour les échanges non contractuels.

**Attestation** est la couche d'observation indépendante qui capte ce que la prévention laisse passer.

### Internal contracts (intra-box)

Les contrats internes gouvernent la communication entre workloads et zones dans une même boîte. Ils sont plus simples que les boundary contracts parce que les deux extrémités sont sous contrôle opérateur. Chaque contrat interne spécifie :

| Champ | Ce qu'il spécifie |
|---|---|
| Workload source | SPIFFE ID du workload initiateur / publisher |
| Workload destination | SPIFFE ID du workload récepteur |
| Opérations permises | Types de messages, méthodes RPC, patterns de requête |
| Transport | mTLS sur topic de bus, méthode gRPC, chemin de lecture/écriture du lake |
| Cardinalité | one-to-one, fan-out, fan-in, broadcast |
| Sémantiques d'échec | drop, retry borné, fail-closed, fail-open avec alarme |

Le pare-feu noyau, le courtage mTLS basé SPIFFE et la politique d'abonnement du bus appliquent les contrats internes.

### Boundary contracts (cross-domain)

Les boundary contracts gouvernent chaque connexion qui sort de l'ACS. Ils sont **bilatéraux** : les deux côtés s'engagent, les deux côtés sont redevables et observables.

#### ACS-side obligations (what the box commits to producing)

| Dimension | Ce à quoi la boîte s'engage |
|---|---|
| Inventaire de données | Records exposés, namespaces, identifiants et types |
| Profils edge et endpoints | Profil(s), endpoints, identités et sémantiques de transport |
| Fraîcheur et résolution | Résolution native sur la boîte, sous-échantillonnage avant publication, pleine fidélité accessible via le lake |
| Rétention | Plancher de rétention on-box, comportement de vieillissement, compensation des gaps |
| Ordonnancement et séquencement | Numéros de séquence et identifiants de service ; ordre monotone par service |
| Sémantiques de livraison | Télémétrie chorégraphiée, transactionnel orchestré |
| Reconnexion et gaps | Buffer local, relecture et détection de discontinuité |
| Version et évolution du contrat | Changements additifs dans une même majeure ; cassures en nouvelle majeure |
| Authentification et autorisation | Consumers autorisés par identité SPIFFE sur mTLS |
| Liaison à l'audit | Consumer capable de récupérer et vérifier la tête de chaîne d'audit |
| Quotas | Limites de débit et de charge utile par profil |

#### Upstream obligations (what the consumer commits to providing)

| Dimension | Ce à quoi le consumer s'engage |
|---|---|
| Connectivité | Bande passante, latence, disponibilité, redondance |
| Authentification | Émission et rotation de credentials, garde des clés |
| Accusés de réception | Sémantiques et bornes temporelles quand le profil les exige |
| Réponse aux requêtes | Fenêtre de réponse pour les interactions pull-mode |
| Accommodation de schéma | Le consumer observe le schéma lâche ; la modélisation vit à sa portée |
| Réponse à incident | Chemin d'astreinte, délai de réponse, escalade |
| Capacité et quota | Débit soutenu et pointes absorbables |
| Vérification d'audit | Validation de la tête de chaîne d'audit à la cadence spécifiée |

#### RACI matrix

Pour chaque mode de défaillance nommé, le contrat spécifie qui est **R**esponsible, **A**ccountable, **C**onsulted et **I**nformed. L'architecture exige que la matrice existe, qu'elle soit spécifique et qu'elle soit accessible à la boîte pour l'aide à la décision en incident.

### Adherence telemetry

La boîte catalogue et émet ses propres observations de performance contractuelle, pour les contrats internes comme de frontière. Cette classe de données forme l'enregistrement de référence de qui a tenu quel côté.

| Flux de télémétrie | Ce qu'il enregistre |
|---|---|
| `contract.violation` | Toute tentative de communication sans entrée de catalogue correspondante |
| `contract.connectivity` | Disponibilité, indisponibilité, latence, débit, changements de route |
| `contract.delivery` | Messages envoyés, accusés, retransmis, rejetés |
| `contract.auth` | Expiration de certificats, rotations, échecs d'authentification |
| `contract.schema` | Usage de version dépréciée, mismatch de schéma |
| `contract.quota` | Rate limit et taille de charge utile dépassés |
| `contract.reconciliation` | Gaps de séquence, watermarks et replays |
| `contract.audit-verify` | Vérifications de tête de chaîne d'audit côté consumer |
| `contract.sla-breach` | Tout indicateur contractuel franchissant un seuil SLA |

L'adhérence contractuelle existe pour que l'ACS ne soit jamais « le côté sans reçus ».

### Discoverability and ownership

Le catalogue de contrats et chaque entrée qu'il contient sont **publiés, pas implicites**. Un consumer doit pouvoir récupérer un contrat avant de s'abonner ou de requêter. La publication du catalogue fait partie de la structured query API.

Le contrat est **l'engagement de l'exploitant**, pas celui de l'architecture. L'IIA spécifie que les contrats existent, que le catalogue est universel, que les boundary contracts sont bilatéraux et découvrables, et que l'adhérence est enregistrée. Les valeurs précises relèvent de la politique opérateur.

## Attestation

Tout mécanisme de prévention peut fuir. La politique SDN peut dériver, les règles de pare-feu peuvent être mal appliquées, les sessions mTLS peuvent être mal émises, l'admission d'image peut être contournée. La couche de contrats suppose ces modes de défaillance possibles et exécute une **observation indépendante** en parallèle pour vérifier que la prévention fonctionne réellement.

L'attestation n'est pas un remplacement de la prévention. C'est la réponse à la question : *comment savez-vous que la prévention fonctionne vraiment ?*

### Network attestation (IDS as policy-leak observer)

L'IDS réseau dans `witness` joue deux rôles :

- **Détection par signatures** des patterns d'attaque connus
- **Observateur d'attestation des contrats**, qui compare les flux observés au catalogue de contrats et à la compilation SDN

L'observateur signale :

- du trafic qu'aucun contrat n'autorise
- du trafic attendu qui n'apparaît pas dans la fenêtre SLA
- des sessions mTLS qui tombent hors tolérance
- de la dérive de compilation de politique SDN, là où le SDN est déployé
- des émissions d'identité sans entrée correspondante dans le catalogue

Dans les déploiements sans SDN, l'observateur IDS est la seule preuve réseau de conformité contractuelle. Il doit pouvoir alerter.

### IO attestation (redundant IO master)

Un **IO master** maintient un canal indépendant d'observation du substrat physique : analogique, numérique, interfaces point à point comme IO-Link et HART, fieldbus et Ethernet industriel. Il recoupe ses lectures avec celles de la capture primaire de la boîte.

Des écarts entre la lecture de l'IO master et celle de la boîte indiquent une **déviation au niveau du substrat** : fil altéré, homme-du-milieu sur le fieldbus, équipement qui ment, trame perdue ou modifiée, dérive d'horloge, valeur différemment mise à l'échelle. Les divergences hors tolérance émettent `attestation.io`.

L'IO master est un rôle, pas un produit. L'architecture exige que son chemin d'observation soit **indépendant** du chemin de capture primaire.

### The attestation data class

Tous les constats d'attestation sont émis sous `attestation.*` et vont à la même chaîne d'audit que les événements de sécurité.

| Flux | Observateur | Ce qu'il enregistre |
|---|---|---|
| `attestation.network` | Observateur IDS | Violations contractuelles observées sur le plan réseau |
| `attestation.io` | IO master | Écarts de lecture entre IO master et capture primaire |
| `attestation.policy-drift` | Contrôleur SDN + corrélateur | Politique chargée vs politique dérivée du catalogue |
| `attestation.identity` | Émetteur SPIFFE + corrélateur | Émissions de SVID vs catalogue de contrats |
| `attestation.audit-chain` | Vérificateur de chaîne d'audit | Intégrité de la chaîne locale vs tête répliquée |
| `attestation.config` | Observateur de configuration | État courant vs artefact stagé |
| `attestation.image` | Attesteur lié au TPM | Hash de l'image courante vs hash voulu |

Une alerte d'attestation est la réponse structurelle de l'architecture à la question de savoir si la prévention fonctionne réellement.

## Workload Identity

**Rôle : émetteur d'identité de workload produisant des SVID au format SPIFFE, liés à des preuves d'attestation.**

Chaque conteneur reçoit une identité du type `spiffe://iia.local/zone/<zone>/workload/<name>`. Les SVID sont de courte durée et émis via la SPIFFE Workload API. L'identité est liée au hash d'image attesté par TPM via le node attestor. Un workload démarré depuis une image non signée ne peut pas obtenir de SVID ni parler en mTLS à un pair.

Cela implémente FR1 (Identification & Authentication Control) au niveau composant.

## Image Provenance

**Rôle : vérification cryptographique de signature d'image à l'admission.**

Toutes les images de conteneur sont :

1. construites de façon reproductible depuis le code source ;
2. signées à la build contre une racine de confiance journalisée ;
3. **intégrées à l'image OS de l'appliance au moment de la build** ;
4. vérifiées à l'admission par une politique de runtime exigeant une signature valide.

Un workload dont l'image échoue la vérification est refusé avant même que le superviseur puisse le démarrer.

## Secrets

**Rôle : magasin de secrets chiffré au repos, scellé à l'ancre matérielle, avec émission courte durée aux workloads.**

- Les secrets sont chiffrés avec un outillage choisi par l'exploitant compatible avec le scellement à l'ancre matérielle.
- La clé de déchiffrement est scellée à des valeurs PCR du TPM correspondant à l'état attendu du measured boot.
- Au boot, après validation de Secure Boot et du rootfs, le TPM dé-scelle la clé du magasin de secrets.
- Les workloads ne reçoivent que les secrets dont ils ont besoin, montés comme fichiers tmpfs au démarrage.

Les secrets ne sont jamais écrits en clair sur un stockage durable.

## Audit Logging

**Rôle : journal append-only à chaîne de hachage, répliqué vers le nord avant que la suppression ne soit possible.**

- Chaque événement lié à la sécurité (authentification, autorisation, cycle de vie des conteneurs, rejet de conduit, échec de signature, émission de SVID, ouverture / fermeture de session) est émis comme enregistrement structuré.
- Les enregistrements arrivent dans `audit` et sont écrits dans un journal append-only côté inbound avec une chaîne de hachage.
- La tête de chaîne est publiée chaque minute via `publish` sous `security.audit-head`.
- La rétention on-box est d'au moins 30 jours ; la rétention hors boîte dépend de la politique du receiver.

## Remote Access

**Rôle : gateway d'accès distant sans client, médiée par navigateur, avec enregistrement natif de session, située à portée supérieure et rejointe par la boîte via un tunnel mTLS sortant uniquement.**

```text
[ IIA box ] -- reverse mTLS --> [ broker box / remote-access gateway ] <-- navigateur opérateur
```

Propriétés :

- **Aucun entrant sur la NIC IT.** L'agent `tunnel` compose en sortie vers le broker.
- **Le broker est juste une autre box à portée supérieure.** Pas de nouvelle architecture.
- **Authentification opérateur au broker.** IdP externe via OIDC, avec FIDO2 / WebAuthn / PIV comme second facteur.
- **Crédentials just-in-time.** L'autorisation de l'opérateur au broker déclenche l'émission d'un credential court qui expire à la fin de session.
- **Enregistrement de session.** Chaque session enregistre frappes et écran dans un magasin append-only / object-locked sur le broker.
- **UI locale de management.** Sur NIC management uniquement, activée à la demande, avec le même modèle d'authentification.

## Local Last-Resort Access

Une console série est présente sur chaque boîte. C'est le seul chemin qui ne demande ni broker ni réseau de management. Elle sert quand les deux sont indisponibles et qu'une intervention locale est nécessaire.

- Authentification locale avec jeton matériel lié au TPM
- Journalisation de chaque session via le sous-système d'audit noyau
- Aucun listener SSH sur la NIC IT, jamais

## Updates

**Rôle : OS hôte immuable avec mises à jour A/B atomiques et rollback.**

- L'image OS est composée à la build, signée contre la même racine que les images de conteneur et publiée sur le canal de distribution opérateur.
- La boîte tire et stage un nouveau déploiement mais ne l'active pas tant qu'un redémarrage autorisé par l'exploitant n'a pas lieu.
- La mise à jour s'applique entièrement ou pas du tout.
- Un échec de boot du nouveau déploiement déclenche un rollback automatique vers le précédent.

Les mises à jour d'images de conteneurs sont embarquées dans les mises à jour d'OS. Aucune registry pull live depuis la boîte.

## Configuration

La boîte accepte la configuration comme **artefact texte signé**, jamais comme API live. Le motif correspond à l'admission d'image et aux mises à jour d'OS : artefact entrant, vérification, validation, application ou rejet.

### Why no configuration API

Une API de configuration est une surface de mutation live. Chaque endpoint cumule décision d'authentification, décision d'autorisation, validation d'entrée et mutation d'état en temps réel sous conditions adversariales. L'artefact texte consommé par un parseur réduit la surface à deux questions : l'attaquant peut-il modifier l'artefact, et peut-il tromper le parseur ?

L'autre propriété décisive est l'entrefer entre l'UI de management et le système courant. L'UI génère du texte ; elle n'a aucun accès privilégié. Même compromise, elle ne fait que produire un artefact devant encore franchir la signature, le parseur, le validateur et l'ensemble d'appels internes gouvernés.

### The configuration artifact

L'artefact est un document déclaratif plat, dans une **grammaire contrainte et non Turing-complete**. S'il exige un interpréteur Turing-complete, la propriété de sécurité est perdue.

L'artefact couvre :

- définitions de zones et politique de conduits
- entrées du catalogue de contrats
- sélection de profils edge par endpoint consumer
- bindings d'identité de workload
- références IdP et credentials
- configuration des endpoints edge publisher / structured query API
- bindings de jeux de règles IDS et scan engine
- seuils de tolérance de l'IO master
- racines de confiance opérateur et références de clés de signature

### Lifecycle

```text
edit (off-box) -> sign (operator key) -> submit -> verify -> parse -> validate -> stage -> apply
```

1. **Edit** : l'exploitant ou son outillage produit un artefact candidat.
2. **Sign** : l'artefact est signé avec un credential opérateur.
3. **Submit** : l'artefact arrive via l'interface de management ou via le canal sortant de mise à jour.
4. **Verify** : la signature est vérifiée.
5. **Parse** : le parseur produit une représentation intermédiaire structurée.
6. **Validate** : références, contrats, identités, profils et conduits sont vérifiés.
7. **Stage** : la configuration validée devient l'état désiré stagé.
8. **Apply** : un ensemble d'appels internes gouvernés, exécuté par un applier privilégié, fait converger l'état courant vers l'état stagé.

L'applier est le seul composant ayant accès privilégié à l'état mutable de la boîte.

### Gated internal calls

L'ensemble étroit d'appels internes — charger la politique nftables, enregistrer des bindings SPIFFE, mettre à jour une politique SDN, installer des credentials IdP, enregistrer des entrées du catalogue, configurer des endpoints de publication — constitue des **événements d'audit de premier ordre**.

### Configuration attestation

Un observateur d'attestation de configuration recoupe **l'état courant contre l'artefact stagé**, en émettant `attestation.config` :

- correspondance -> événement de confirmation périodique
- divergence -> événement de divergence avec delta

Cela ferme la boucle du plan de management comme l'IDS ferme celle du plan de données.

### GitOps for an air-gapped industrial appliance

Le motif est du GitOps adapté aux contraintes d'une appliance industrielle air-gap : configuration déclarative comme source de vérité, artefacts signés comme mécanisme de propagation, parseur comme frontière d'admission, convergence vers l'état déclaré et divergence observable.

## Update Orchestration

Le cycle local de mise à jour n'est que la moitié du tableau. L'autre moitié est la coordination d'une flotte de boîtes : un site, une région, un parc entier. Le même motif d'artefact entrant se récursive à l'échelle flotte.

### What gets updated

Chaque aspect mutable de la boîte est un artefact signé :

| Classe d'artefact | Ce qu'il transporte | Cadence |
|---|---|---|
| Image OS | OS hôte + images de conteneur embarquées | lente |
| Configuration | zones, conduits, contrats, profils edge, bindings d'identité, refs IdP | opérationnelle |
| Jeux de règles IDS / scan / enrichissement | contenu de détection | plus rapide |
| Racines de confiance opérateur | références de clés de signature | rare |
| Artefacts d'approbation | autorisation opérateur d'appliquer une mise à jour stagée | par mise à jour |

Tous suivent la même pipeline : **verify signature -> parse / validate -> stage -> authorize -> apply -> report**.

### Distribution: pull, never push

Une boîte n'accepte jamais une mutation entrante. Chaque artefact arrive par pull mTLS initié par la boîte vers son manager amont. Le canal de pull est le même que celui déjà utilisé pour la publication sortante. Aucun nouveau listener. Aucun HTTP.

### The fleet is a fractal

```text
[boîte corporate / régionale] gère -> [boîtes de site] -> [boîtes d'usine] -> [boîtes de zone]
```

Chaque boîte de portée supérieure agit comme orchestrateur pour ses enfants. Les enfants tirent l'état désiré depuis leur parent et rapportent leur état réel en retour. Il n'existe pas de « serveur global de mise à jour ».

### Authorization

Les mises à jour stagées ne s'appliquent pas automatiquement. Un **artefact d'approbation** signé autorise une boîte précise à appliquer une mise à jour précise pendant une fenêtre de temps précise.

L'architecture prend en charge :

- approbation par boîte
- approbation par flotte
- intégrité à deux personnes
- fenêtres temporelles bornées
- validité conditionnée à une fenêtre de maintenance

L'applier refuse d'agir sans artefact d'approbation valide et courant.

### Rollout strategy is operator policy

L'architecture ne choisit pas la stratégie de rollout. L'exploitant l'implémente via le jeu d'artefacts d'approbation qu'il émet, à quelles boîtes, et à quel moment.

- canari
- pourcentage
- par zone
- par fenêtre de maintenance d'usine
- retenue pour cause, lorsqu'une boîte est déjà signalée par l'attestation ou l'audit

### Reconciliation

Après application, la boîte rapporte son état courant : hash de l'image, hash de configuration, hashes des jeux de règles et résultats d'attestation. Le manager le compare à l'état désiré.

Trois résultats :

- **Convergent** : l'état courant correspond à l'état voulu
- **Pending** : l'état est stagé mais non encore appliqué
- **Divergent** : l'état courant ne correspond pas à l'état voulu malgré une application apparente

Une boîte divergente est un candidat à l'analyse forensique, pas à d'autres mises à jour.

### Disconnected reconciliation

Une boîte peut rester hors ligne trente jours. Lorsqu'elle se reconnecte :

1. elle rapporte l'état qu'elle détenait ;
2. elle tire le manifeste courant d'état désiré ;
3. elle tire les artefacts d'approbation encore valides qui lui sont adressés ;
4. si mise à jour stagée et approbation courante existent, elle applique et rapporte ;
5. si les approbations sont expirées, elle attend des approbations fraîches.

Une boîte longtemps déconnectée converge donc vers son état voulu au rythme de l'exploitant, pas au rythme du rollout en cours pendant son absence.

### Image attestation

Après application d'une mise à jour, le hash d'image attesté par TPM est publié sous `attestation.image` pour vérification par le manager. L'attestation d'image ferme la boucle de la même façon que l'attestation de configuration.

| Flux d'attestation | Ce qu'il enregistre |
|---|---|
| `attestation.image` | Hash d'image courant attesté par TPM vs hash d'image voulu déclaré en amont |

### Emergency rollback

Deux chemins :

- **Rollback distant** : l'exploitant émet un artefact d'approbation de revert identifiant le hash précédent comme état voulu.
- **Rollback local de dernier recours** : via la console série liée au TPM.

Un échec de boot après mise à jour déclenche automatiquement le retour au déploiement précédent.

### Putting it together

Pour pousser une mise à jour vers une boîte :

1. construire une nouvelle image OS et la signer ;
2. la publier sur le canal de distribution du manager amont ;
3. mettre à jour le manifeste d'état désiré ;
4. émettre un artefact d'approbation signé ;
5. la boîte tire le manifeste et stage la nouvelle image ;
6. la boîte tire l'approbation et applique pendant la fenêtre configurée ;
7. la boîte redémarre et publie `attestation.image` ;
8. le manager compare le hash rapporté au hash voulu et clôt la réconciliation.

Pour une flotte, répéter la même séquence selon la stratégie de rollout choisie.

## SL3 Foundational Requirements Mapping

| FR | Exigence | Implémentation |
|---|---|---|
| FR1 | Identification & Authentication Control | Identité SPIFFE des workloads ; IdP externe + FIDO2 pour l'opérateur ; console liée au TPM ; aucun compte opérateur permanent sur la boîte |
| FR2 | Use Control | Conteneurs rootless, capability drops, RBAC broker, credentials JIT, workflow d'approbation |
| FR3 | System Integrity | UEFI Secure Boot + measured boot + secrets scellés aux PCR ; admission par images signées ; log d'audit chaîné ; mises à jour A/B atomiques |
| FR4 | Data Confidentiality | Chiffrement complet du disque avec clé scellée TPM ; mTLS entre chaque zone ; store de secrets scellé TPM ; TLS 1.3 minimum sur chaque conduit externe |
| FR5 | Restricted Data Flow | Réseaux de conteneurs par zone ; conduits pare-feu par défaut en deny ; NIC ACS passive ; **aucun HTTP à la frontière dans aucun sens** ; tout trafic inbound→outbound via la DMZ ; diode matérielle en two-box |
| FR6 | Timely Response to Events | IDS réseau avec jeux de règles à jour ; publication de tête de chaîne d'audit chaque minute ; alertes sous `security.*` ; automatisation runbook côté broker |
| FR7 | Resource Availability | Limites de ressources par zone ; graphe de dépendances superviseur ; rollback atomique ; buffer local de 30 jours ; broker redondant à portée supérieure |

## SL4 Two-Box + Diode Realization (the ideal)

La réalisation two-box + diode est la configuration préférée lorsque le déploiement peut la supporter. La même secure edge gateway est scindée en deux unités physiques reliées par une diode matérielle ; les consumers accèdent à l'outside subscriber et jamais à l'inside box.

```text
inside box -> hardware data diode -> outside subscriber -> consumer
```

**Occupation des rôles sur les deux unités :**

| Rôle | Inside box (côté ACS) | Outside subscriber (côté IT) |
|---|---|---|
| `witness` | ✓ | — |
| `collect` | ✓ | — |
| `io-master` | ✓ | — |
| `netservices` | ✓ | — |
| `diode-in` | — | ✓ |
| `lake` | ✓ (historien canonique) | ✓ (miroir lisible par les consumers) |
| `bus` | ✓ | ✓ |
| `audit` | ✓ | ✓ |
| `attest` | ✓ | ✓ |
| `publish` | ✓ (vers la diode) | ✓ (vers les consumers réels) |
| `api` | — | ✓ |
| `tunnel` | — | ✓ |
| `ui` | — | ✓ |
| `cfg` | — | ✓ |

La diode elle-même est un appareil matériel, pas une zone IIA. L'inside box configure `publish` pour un transport compatible diode ; l'outside subscriber configure `diode-in` pour recevoir ce flux.

Effet net : l'accès opérateur n'atterrit jamais sur l'inside box. Une compromission de l'outside subscriber ou d'un consumer ne peut pas atteindre l'inside ; la physique bloque le chemin retour.

## Reference Implementations (non-normative)

Cette section liste des logiciels candidats par rôle. **Aucun ne fait partie de la spécification normative.** Les exploitants choisissent selon leurs exigences.

Certaines technologies couvrent plusieurs rôles. Zenoh, en particulier, peut remplir l'edge publisher, la structured query API, le bus in-flight et le maillage inter-boîtes sur un même protocole.

| Rôle | Implémentations candidates | Notes |
|---|---|---|
| OS hôte immuable | Fedora IoT, CentOS Stream Image Mode, Ubuntu Core, Talos Linux | |
| Superviseur de processus | systemd, runit, OpenRC | |
| Runtime conteneur | Podman + Quadlets, containerd, CRI-O | Rootless et daemonless obligatoires au SL3 |
| Runtime OCI | crun, runc | |
| Émetteur d'identité SPIFFE | SPIRE, smallstep CA + plugin SPIFFE | |
| Vérification de signature d'image | cosign + Sigstore TUF, notation | |
| Store de secrets | sops + age, HashiCorp Vault, Mozilla Trousseau | Clé de déchiffrement scellée TPM requise |
| Capture continue | Zeek, Arkime, tshark custom en ring buffer | |
| Services IP de zone | dnsmasq, ISC Kea, BIND, NSD, Unbound, chrony, Samba, nfs-kernel-server, step-ca | Choix selon taille de zone et compétences |
| Ingest LoRaWAN / LPWAN | ChirpStack, The Things Stack, Lorabasics | IO only, jamais contrôle |
| IDS réseau | Suricata, Snort, Zeek | |
| Scan engine | Analyseur custom orienté protocole, plateformes OSS existantes | |
| Plugins d'enrichissement | Matchers MITRE ATT&CK, IOC, YARA | |
| Data lake local | DuckLake, Apache Iceberg, Delta Lake, TimescaleDB | |
| Bus in-flight | NATS JetStream, Apache Pulsar, Redis Streams, Zenoh | |
| Edge publisher MQTT | Mosquitto, EMQX, HiveMQ | |
| Edge publisher OPC UA | open62541, FreeOpcUa, Eclipse Milo | |
| Edge publisher Zenoh | Eclipse Zenoh | Un protocole, plusieurs rôles |
| Maillage inter-boîtes | Eclipse Zenoh, cascades MQTT, overlay mTLS custom | Optionnel |
| Structured query API | **CESMII i3X**, gRPC, MT Connect, Zenoh queryables, MCP-over-mTLS | **i3X est la norme préférée à la frontière L2↔L3** |
| Chemin de consommation IA | Serveur MCP hors boîte encapsulant i3X | **Hors boîte, jamais sur la boîte** |
| Agent de tunnel sortant | frp, WireGuard userspace, mTLS custom | |
| Gateway d'accès distant | Apache Guacamole, Teleport, HashiCorp Boundary | |
| Broker de credentials JIT | HashiCorp Vault, Boundary, Teleport | |
| IdP externe | Keycloak, FreeIPA, Auth0, Okta | |
| UI locale / visualisation | Grafana, UI custom, Apache Superset | Si on-box, doit rester local-network-only |
| Plan de politique SDN | Cilium, Open vSwitch + OVN, Tigera Calico, Antrea, eBPF custom | Recommandé quand disponible |
| IO master | Firmware custom sur SoC indépendant, process dédié avec NIC indépendante, module matériel séparé | Le chemin d'observation doit rester indépendant |
| Agrégation UNS hors boîte | United Manufacturing Hub, Apache StreamPipes, HiveMQ + Kafka + TimescaleDB custom | Réalisation de portée supérieure |
| Format de description de contrat consumer | OpenAPI, AsyncAPI, JSON Schema / Avro / Protobuf, Smithy, CUE | Découvrable, versionné, lisible machine |
| Grammaire de configuration | CUE, KCL, Dhall, JSON validé par schéma, TOML validé, Jsonnet contraint, HCL parsé | Le parseur doit rester auditable |
| Signature de configuration | cosign, age, minisign, GPG | Même racine de confiance que pour les images préférée |

Les mises à jour de cet appendice doivent préserver le cadrage « rôles, pas produits » dans les sections normatives.

Ce document a été réaligné avec PERA+ et les décisions architecturales arrêtées jusqu'au 4 mai 2026.
