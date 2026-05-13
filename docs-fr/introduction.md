# Introduction à l'Industrial Independence Architecture

Ce document s'adresse aux lecteurs nouveaux dans l'automatisation industrielle, les technologies opérationnelles ou les problèmes d'architecture qu'elles créent. Si vous travaillez déjà dans cet espace, le [README](/fr/architecture/) est le bon point d'entrée et ce document est facultatif.

L'objectif ici est de vous donner suffisamment de vocabulaire et d'assise structurelle pour lire le reste de la documentation sans contexte externe.

## Quel problème cette architecture traite

Une usine, une raffinerie, une station de traitement des eaux, une centrale électrique : tous sont faits de deux systèmes cousus ensemble. L'un fait tourner le travail physique : des vannes qui s'ouvrent, des moteurs qui tournent, des réactions qui se poursuivent, des convoyeurs qui avancent. L'autre fait tourner l'information : ordres, plannings, enregistrements, tableaux de bord, audits. Les deux systèmes n'ont pas été conçus ensemble. Ils ont été assemblés, site par site, par des intégrateurs payés projet par projet. Le résultat est ce dont hérite chaque exploitant : une pile sur mesure, une emprise du fournisseur sur les données, une posture de sécurité qui dépend de la personne qui a câblé le bâtiment, et une reconstruction à chaque fois qu'un changement important devient nécessaire.

L'Industrial Independence Architecture (IIA) est la réponse architecturale. Elle définit une unité unique et autonome, identique à chaque zone d'exploitation, que l'exploitant possède et dans laquelle l'intégrateur construit, et non autour de laquelle il construit.

## Les deux domaines

À l'intérieur de tout site industriel se trouvent deux domaines, et ils sont différents par nature, pas seulement par degré.

**Automation and Control Systems (ACS)** : le substrat de l'action physique. Des capteurs qui lisent la pression, le débit, la température, la vibration, la position. Des automates programmables industriels (PLC) qui décident quoi faire de ces mesures dans une boucle à l'échelle de la milliseconde. Des actionneurs qui ouvrent des vannes, entraînent des moteurs, ajustent des consignes. Des systèmes de sécurité qui interviennent quand un procédé dépasse une tolérance. Des interfaces homme-machine (HMI) que les opérateurs utilisent pour observer et piloter. L'ACS est gouverné par **SRP — Safety, Reliability, Performance** — le triptyque formulé par Robert Radvanovsky chez Infracritical ([srpmodel.infracritical.com](https://srpmodel.infracritical.com/srpmodel.php)). Une boucle de contrôle qui arrive avec cent millisecondes de retard est un problème de sécurité. Un historien qui perd des enregistrements est un problème de tenue des registres.

**Information Technology (IT)** : le substrat de l'information. Plannings de production, ordres de travail, enregistrements qualité, rapports à destination du régulateur, business intelligence, modèles de machine learning. L'IT est gouvernée par **CIA — Confidentiality, Integrity, Availability**. (Certaines normes y ajoutent la sécurité en préfixe pour les systèmes IT qui touchent à des enregistrements liés à la sécurité : **SAIC**.) Un enregistrement divulgué est un problème de conformité. Un rapport en retard est un problème de coordination.

SRP et CIA ne sont pas le même type de vocabulaire, et ce ne sont pas deux ordres de priorité d'une même liste. Ils décrivent des substrats différents. SRP décrit la physique : ce que fait le système, avec quelle fiabilité, à quelle vitesse, avec quelle sûreté. CIA décrit les enregistrements : s'ils restent secrets, exacts et accessibles. Utiliser CIA pour l'ACS est une erreur de catégorie, pas une erreur de priorité. L'habitude de trente ans qui consiste à traiter l'ACS comme de « l'IT avec un peu plus de disponibilité » est la source de la plupart des problèmes auxquels l'IIA répond.

Une note sur le vocabulaire. « OT » (operational technology) traite le substrat comme s'il était singulier. Il ne l'est pas. Une usine automobile possède l'emboutissage, la caisse, la peinture, l'assemblage général, le groupe motopropulseur : chacun avec ses propres réseaux de contrôle et sa propre entité de gestion. La même multiplicité vaut pour l'agroalimentaire, le traitement de l'eau, le pétrole et le gaz, et les autres industries auxquelles l'IIA s'adresse. Il n'existe pas de directeur exécutif unique de l'OT. ACS nomme le substrat sans prétendre qu'il s'agit d'une seule chose.

## Là où se situe réellement la frontière

La plupart des tentatives de décrire la frontière IT/ACS pointent un schéma réseau et tracent une ligne. Cela fonctionne jusqu'à ce que quelqu'un branche un portable sur le mauvais switch.

La frontière n'est pas topologique. C'est une frontière de criticité des données. D'un côté, les données décrivent un état physique qui existe maintenant et sur lequel on agit dans les millisecondes. De l'autre, les données sont un enregistrement qui décrit ce qui s'est passé. Le même octet signifie des choses différentes de part et d'autre. L'ACS transforme un état physique en enregistrement en le capturant ; l'IT transforme un enregistrement en action en émettant une instruction. La frontière est l'endroit où capture et instruction se rencontrent, et cette frontière est l'endroit où vivent la plupart des compromissions industrielles.

L'IIA nomme le modèle de sécurité de chaque côté : **Zero Trust** au-dessus de la frontière (chaque connexion authentifiée, chaque action autorisée, rien n'est supposé fiable en raison de son emplacement), et **Managed Trust** en dessous (chaque équipement et chaque procédé est connu, identifié et imputable au responsable opérationnel). L'unité placée sur la frontière termine le Zero Trust côté IT et commence le Managed Trust côté ACS.

## L'unité et le fractal

Les sites industriels sont organisés en zones. Une boucle de contrôle fonctionne dans une cellule. Les cellules s'agrègent en ligne. Les lignes s'agrègent en atelier. Les ateliers s'agrègent en usine. Les usines s'agrègent en région. Les régions s'agrègent en fonction d'entreprise. Chacun est une zone : une frontière déclarée par l'exploitant, avec des données qui la traversent.

L'IIA place une unité à la tête de chaque zone : la **secure edge gateway**. À l'intérieur de la zone se trouvent des données de système de contrôle, gouvernées par SRP. Au niveau de la boîte, ces données franchissent la frontière et deviennent de l'information, gouvernée par CIA, publiée de façon sécurisée vers tout consommateur de la zone : une autre zone, une usine, un partenaire, un régulateur, Internet. Les équipements à l'intérieur de la zone peuvent être de n'importe quel niveau de sécurité : SCADA legacy, PLC modernes, E/S grand public, capteurs IoT, parce que la frontière de sécurité vit à la passerelle, pas dans chaque équipement.

L'unité est identique à chaque zone. Même logiciel, même partitionnement, mêmes règles de frontière. Seule l'*étendue* change. Une unité dans une cellule voit une machine ; une unité dans une usine voit l'usine ; une unité au niveau corporate voit la flotte. Même architecture, ouverture différente.

C'est la propriété fractale. Il n'existe pas d'architecture « centrale » spéciale ni d'architecture « edge » spéciale. Un historien central est une unité avec une portée plus large. Une passerelle d'équipement est une unité avec une portée plus étroite. Le fractal rend l'architecture invariante à l'échelle : déployée sur du matériel standard dans une seule armoire, ou réalisée à l'échelle hyperscale pour un opérateur multi-sites, ses invariants voyagent. Il n'existe aucune tour PERA L1-L5 obligatoire ; c'est la topologie de l'exploitant qui décide où se trouvent les zones, et une boîte existe à la tête de chacune.

L'architecture est aussi *distribuée*, pas fédérée. Chaque unité est exploitée par un seul opérateur, sous un seul ensemble de règles. Une fédération serait un ensemble de parties indépendantes échangeant des données par traité ; l'IIA est un opérateur unique qui exécute un maillage de ses propres unités. La souveraineté ne veut pas dire l'isolement : des unités sur des boîtes adjacentes se connaissent, mais aucune unité ne dépend de la disponibilité d'une autre.

## À l'intérieur de l'unité

Chaque unité a quatre côtés :

- Un **côté entrant** tourné vers l'ACS. Il capture tout ce qui se passe sur le réseau opérationnel. Il ne peut pas transmettre. Il est structurellement incapable d'agir sur les choses qu'il observe.
- Une **DMZ interne** où la capture est classifiée, où les contrats sont évalués et où les enregistrements sont écrits.
- Un **côté sortant** tourné vers l'IT. Il ne publie que ce qu'un contrat autorise, uniquement vers des consommateurs qui se sont authentifiés. Il n'accepte pas de HTTP entrant. Il ne fait pas d'appel sortant en HTTP.
- Un **côté management** pour l'opérateur qui exploite l'unité. Le seul endroit où un humain ou un artefact de configuration peut entrer.

À l'intérieur de l'unité, un lac de données local est la source de vérité. La capture y atterrit. La classification y atterrit. L'audit y atterrit. Les éditeurs sortants y puisent. Le lac appartient à l'exploitant et est gouverné par l'unité, pas par un fournisseur qui le consomme. C'est l'**historien décentralisé** : un enregistrement par zone, appartenant à l'exploitant, complet et fonctionnel sans cloud. Le modèle d'historien centralisé qui l'a précédé — appartenant au fournisseur, hors site, accessible uniquement quand le WAN fonctionne — est un échec de souveraineté par conception.

## Contrats de données

C'est l'idée porteuse, et celle que la plupart des nouveaux venus sous-estiment.

Chaque communication sur l'unité et à travers ses frontières est gouvernée par un **contrat de données** : une description explicite de ce qui est envoyé, par qui, à qui, à quelle cadence, sous quelle authentification, avec quel schéma et avec quelles sémantiques d'échec. Il n'existe aucun trafic implicite. Il n'existe aucun « on l'a juste connecté et ça a marché ». Si une connexion n'a pas de contrat, l'architecture soit l'*empêche* (le pare-feu noyau, le système d'identité des workloads et la politique d'admission coopèrent pour refuser le trafic non contractuel), soit la *signale* (là où la prévention n'est pas possible : observation passive, broadcast, protocoles legacy, l'unité émet un événement de violation de contrat).

L'ensemble complet des contrats est le **catalogue de contrats**, versionné et découvrable. Un auditeur interroge le catalogue et voit chaque communication autorisée dans le déploiement. Un exploitant modifie un contrat, et le plan réseau se reconfigure pour s'y conformer. Un intégrateur qui veut ajouter une connexion publie un contrat ; sans contrat, la connexion est structurellement irrecevable.

Les contrats à la frontière, pour chaque connexion qui sort de l'ACS, sont **bilatéraux**. Le côté ACS s'engage à produire la donnée à la cadence convenue, avec le schéma convenu, la rétention convenue, le comportement de reconnexion convenu. Le côté amont s'engage sur la connectivité, l'authentification, l'accusé de réception, le temps de réponse aux requêtes, la capacité et la réponse à incident. Chaque contrat nomme un **RACI** — Responsible, Accountable, Consulted, Informed — pour chaque mode de défaillance, de sorte que lorsqu'une connexion casse à trois heures du matin, il n'y a plus de débat sur la responsabilité.

Pourquoi les contrats de données sont porteurs : c'est ainsi que l'exploitant reste maître du substrat. Sans eux, *l'exploitant possède les données* n'est qu'un slogan. Avec eux, chaque octet qui franchit la frontière est auditable, chaque consommateur est identifié, chaque dépendance est réversible. C'est ce qui rend l'architecture défendable longtemps après le départ de l'intégrateur qui l'a installée.

## Attestation

La prévention fuit. Les règles du pare-feu noyau ratent. L'identité de workload est usurpée. Les politiques d'admission divergent de l'intention de l'exploitant.

L'architecture suppose qu'il y aura des fuites et exécute une **attestation** : une observation indépendante qui compare ce qui est *censé* se produire avec ce qui se produit *réellement*. Le NIDS réseau joue aussi le rôle d'observateur d'attestation des contrats : il regarde chaque paquet à l'aune du catalogue et signale le trafic que le catalogue n'autorise pas, le trafic attendu qui n'apparaît pas et les sessions d'identité qui dérivent hors tolérance. Un **IO master** observe indépendamment le substrat physique d'E/S (signaux analogiques, trafic fieldbus, Ethernet industriel) et recoupe la capture primaire de l'unité ; un fil altéré apparaît comme une divergence.

Quand prévention et attestation convergent, l'exploitant a une preuve de conformité. Quand elles divergent, l'exploitant a une preuve d'où regarder. C'est la différence entre une posture de sécurité *affirmée* et une posture de sécurité *vérifiée*.

## Connect first, model second, AI third

Un mode d'échec fréquent dans la transformation numérique industrielle consiste à construire d'abord la couche IA, ensuite le modèle, et à supposer que la connectivité suivra. Ce n'est pas le cas. Le résultat est un tableau de bord IA alimenté par un projet d'intégration par usine que personne ne veut maintenir.

L'IIA ordonne le travail dans l'ordre réel des dépendances :

1. **Connecter.** Une interface de requête standardisée à la frontière IT/ACS, sur chaque unité. Toute personne dotée d'un contrat interroge.
2. **Modéliser.** Un modèle d'information cohérent (ISA-95 est l'ossature conventionnelle) vit à une portée plus large, alimenté par la couche de connexion.
3. **IA.** Les agents et applications IA consomment le modèle, médiés par des protocoles d'outils (comme MCP, Model Context Protocol) qui portent eux-mêmes des contrats.

On ne peut pas modéliser ce qu'on ne peut pas interroger. On ne peut pas raisonner sur ce qu'on ne peut pas modéliser. L'architecture impose cet ordre.

## Cibles de niveau de sécurité

L'architecture vise deux niveaux de sécurité au titre de l'IEC 62443, la norme internationale de cybersécurité industrielle :

- **SL3** : segmentation forte, communication authentifiée, audit complet, sortie en push uniquement sur le profil edge choisi par l'exploitant. Atteignable avec l'unité standard sur matériel standard.
- **SL4** : SL3 plus une diode de données matérielle qui empêche physiquement tout trafic entrant côté ACS. Nécessite la *two-box method* : deux unités physiques reliées par la diode, un motif établi dans le design réseau industriel que l'IIA généralise.

Les déploiements SL1 et SL2 ne sont pas des architectures séparées. Ils correspondent à du SL3 avec des contrôles assouplis par politique de déploiement. L'unité reste la même.

## Pourquoi ceci existe comme spécification publique

L'IIA est publiée, revendiquée par son nom, signée et datée. Les marques (Industrial Independence Architecture, IIA) sont revendiquées ; l'architecture elle-même est licenciée sous CC BY-SA 4.0. N'importe qui peut l'implémenter. La spécification publiée est l'instrument qui empêche quiconque, y compris l'éditeur, de prendre en otage un futur exploitant avec une interprétation privée.

L'architecture n'est pas un produit. Il existe des produits qui l'implémentent. Il y en aura davantage. L'architecture reste libre.

## Où aller ensuite

- **[/fr/architecture/](/fr/architecture/)** : l'énoncé canonique. Déclaratif, dense, suppose le vocabulaire ci-dessus.
- **[/fr/architecture/docs/internal-architecture/](/fr/architecture/docs/internal-architecture/)** : la spécification d'implémentation. Nomme les rôles, pose les invariants, le partitionnement, les contrats, l'attestation, la configuration, les mises à jour et les mappings SL3/SL4 vers l'IEC 62443.
- **[/fr/architecture/docs/sample-contracts/](/fr/architecture/docs/sample-contracts/)** : six contrats de données commentés. Le moyen le plus rapide de comprendre la grammaire des contrats est de lire des exemples.
- **[/fr/architecture/docs/glossary/](/fr/architecture/docs/glossary/)** : vocabulaire et définitions normatives de l'architecture. À utiliser comme référence lors de la lecture des autres documents.
- **[/fr/architecture/docs/mcp-single-box/](/fr/architecture/docs/mcp-single-box/)** : démarrage rapide opérateur pour le plus petit déploiement démontrant l'architecture : une unité, un serveur MCP hors boîte, un client IA.
- Diagrammes : **[/diagrams/two-box-method.png](/diagrams/two-box-method.png)**, **[/diagrams/box-architecture.png](/diagrams/box-architecture.png)**, **[/diagrams/fractal.png](/diagrams/fractal.png)**.
