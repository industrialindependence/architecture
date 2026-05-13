# Industrial Independence Architecture (IIA)

**Un principe architectural pour les infrastructures industrielles.**

*Publie par l'[Industrial Independence Alliance](https://industrialindependence.org/). L'Architecture (ce depot) est la consequence de [la Philosophie](https://industrialindependence.org/philosophy/) — lisez-la d'abord si vous cherchez le pourquoi.*

*Vous decouvrez l'automatisation industrielle, les ICS ou les technologies operationnelles ? Commencez par [docs/introduction.md](/architecture/docs/introduction/) — ce document construit le vocabulaire utilise ici.*

IIA est l'abstraction deliberee d'un motif de convergence qui existe deja dans des domaines adjacents, nomme et applique pour la premiere fois aux systemes d'automatisation et de controle. Ce n'est pas un produit. Ce n'est pas un framework. C'est le principe architectural, revendique par son nom.

## Sommaire

- [Le principe](#le-principe)
- [L'unite](#lunite)
- [Le fractal](#le-fractal)
- [La frontiere de domaine](#la-frontiere-de-domaine)
- [La methode deux-boites](#la-methode-deux-boites)
- [Contraintes de conception](#contraintes-de-conception)
- [Architecture de donnees](#architecture-de-donnees)
- [Antecedents](#antecedents)
- [Normes](#normes)
- [Pour qui c'est fait](#pour-qui-cest-fait)
- [La these](#la-these)
- [Pour aller plus loin](#pour-aller-plus-loin)
- [Marques](#marques)
- [Licence](#licence)

## Le principe

Deployer une unite autonome unique a la tete de chaque zone d'un reseau industriel. L'unite est identique a tous les niveaux. La seule chose qui change est l'echelle.

L'unite fonctionne sans connectivite amont. Pas de cloud. Pas de reseau corporate. Pas d'internet. C'est le systeme complet pour sa zone. Si de la connectivite existe, elle se compose vers le haut. Si elle tombe, rien ne change sur site.

Le cloud n'est qu'une fenetre sur la maille des unites. Ce n'est pas la plateforme. Ce n'est pas le cerveau. C'est une vue optionnelle sur quelque chose de deja complet sans lui.

## L'unite

L'unite est la **passerelle de bordure securisee**. Familierement : la boite.

Une passerelle de bordure securisee par zone. Elle fait tourner la pile complete d'infrastructure ACS de cette zone : services IP de zone (DHCP, DNS, NTP, partages de fichiers/configuration, PKI optionnelle dans la cellule), collecte de donnees, **historien decentralise** de la zone, supervision securite, inventaire d'actifs, detection d'intrusion, visualisation, API, acces distant, VPN, messagerie, traduction de protocoles. Tout ce qu'il faut pour exploiter, superviser et securiser la zone.

La passerelle a deux realisations physiques. La realisation **mono-boite** est une unite autonome unique a la frontiere (SL3, le plancher). La realisation **deux-boites + diode** separe la passerelle en une **boite interieure** du cote ACS et un **abonne exterieur** du cote IT, avec une diode materielle entre les deux — la boite interieure publie vers l'abonne exterieur, et les consommateurs accedent a l'abonne exterieur (SL4, l'ideal). Les deux realisations executent le meme logiciel, le meme modele de configuration et la meme experience operateur. L'element architectural est la passerelle ; la topologie physique determine le niveau de securite obtenu.

L'architecture est independante du materiel et invariante a l'echelle. La passerelle de bordure securisee est une unite logique, realisable comme appliance, serveur, cluster ou pile virtualisee. Le dimensionnement depend de l'application et de l'echelle.

Chaque choix de composant, de protocole ou de flux de donnees remonte a une seule question : cette passerelle fonctionne-t-elle completement seule, sans lien ? Si oui, elle appartient a la passerelle. Sinon, elle n'y a pas sa place.

## Le fractal

Une **passerelle de bordure securisee** a la tete de chaque zone.

A l'interieur de la zone se trouvent les donnees du systeme de controle — le substrat de l'action physique — gouvernees par SRP. A la passerelle, ces donnees traversent la frontiere et deviennent de l'information, gouvernee par CIA, publiee de maniere securisee vers les consommateurs de la zone : une autre zone, une usine, un partenaire, un regulateur, internet.

Les dispositifs de la zone peuvent etre a n'importe quel niveau de securite. Du SCADA legacy en SL0, des PLC modernes en SL3, des E/S grand public, des capteurs IoT — tout cela vit dans la zone. La frontiere de securite se trouve a la passerelle, pas sur chaque appareil. Avec la bonne ingenierie, la passerelle est la seule chose qui doive interfacer le monde exterieur de maniere securisee.

La passerelle observe passivement le trafic sur le substrat ACS et interroge activement les equipements qui le permettent. Les deux alimentent l'*historien decentralise* — le lac de donnees local de la passerelle, source de verite de la zone. L'historien ne publie vers le nord que sur l'interface sortante securisee. **Cette publication securisee est le seul acces depuis l'exterieur vers la zone.**

La passerelle est identique dans chaque zone. C'est l'operateur qui decide ce qui constitue une zone — cellule, usine, site, region, fonction corporate, partout ou des donnees traversent une frontiere.

Le cloud n'est pas une architecture speciale. Un historien central n'est qu'une passerelle de portee plus large. Un agregateur regional aussi. Le fractal ne s'effondre pas en haut.

![Le Fractal : une passerelle de bordure securisee a la tete de chaque zone, avec dispositifs de niveaux varies a l'interieur et publication sortante securisee](/diagrams/fractal.png)

Chaque passerelle fonctionne sans connectivite amont. Pas de cloud, pas de reseau corporate, pas d'internet. Si la connectivite existe, elle se compose vers le haut. Si elle tombe, rien ne change sur site.

La souverainete ne signifie pas l'isolement. L'historien de chaque passerelle est l'historien decentralise de sa zone — les donnees de l'operateur, sur le substrat de l'operateur, complet sans cloud. Les historiens de passerelles adjacentes peuvent se connaitre sans devenir dependants les uns des autres. La conscience est mutuelle. La dependance ne l'est pas.

## La frontiere de domaine

La ligne entre ACS et IT n'est pas tracee par la topologie reseau, l'organigramme ou l'etiquette fournisseur. Elle est tracee par la criticite de la donnee, elle-meme determinee par sa sensibilite temporelle et sa relation au processus physique.

Si la finalite de la donnee est d'agir sur le procede ou de le piloter, c'est une donnee ACS. SRP la gouverne. Le systeme qui la transporte doit satisfaire les exigences de securite, fiabilite et performance du procede qu'il sert.

Si la finalite de la donnee est de rendre compte du procede, c'est de l'information. CIA la gouverne. Les regles, infrastructures et gouvernances IT s'appliquent.

Cette distinction est absolue. Une consigne est ACS. L'enregistrement historien de cette consigne est information. Une boucle de controle qui se ferme en 10 ms est ACS. Un tableau de bord montrant sa tendance sur la derniere heure est information. La meme valeur physique traverse la frontiere au moment exact ou elle cesse d'exiger une action temps reel et devient l'enregistrement de ce qui s'est passe.

La passerelle de bordure securisee se tient a cette frontiere. Dans la cellule d'automatisation, elle observe et protege les donnees ACS selon SRP. A la frontiere, elle transforme les donnees ACS en information et les publie vers le nord selon les regles IT. Elle n'autorise pas la gouvernance IT a remonter dans la cellule. La frontiere est appliquee par l'architecture, pas par la politique.

## La methode deux-boites

L'articulation canonique d'une segmentation ACS/IT imposee physiquement precede IIA. John Rinaldi et Gary Workman l'ont documentee dans *[The Everyman's Guide to EtherNet/IP Network Design](https://www.amazon.com/EVERYMANS-GUIDE-ETHERNET-NETWORK-DESIGN/dp/B0B7PSHK7J)*.

Le motif est compose de deux boites et d'une diode materielle. La **boite interieure** se trouve dans la zone ACS — observe le trafic, interroge les equipements et heberge l'historien decentralise. Une **diode materielle** — lien optique unidirectionnel sans chemin retour — se tient entre les deux. La **boite exterieure**, ou **abonne exterieur**, se trouve cote IT ; elle recoit les donnees publiees au travers de la diode et c'est elle que les consommateurs interrogent.

**Mono-boite (SL3, le plancher).** Une unite a la frontiere. L'interface cote ACS est passive — pas d'emission de pile IP, pas d'ecouteurs. L'unite est partitionnee en entree, DMZ interne et sortie ; pare-feu noyau en deny-by-default entre les zones, authentification mTLS a chaque saut interne. La sortie est push-only sur un profil de bordure choisi par l'operateur, plus une API de requete structuree sur mTLS pour le pull. Aucun ecouteur HTTP a la frontiere externe.

**Deux-boites + diode (SL4, l'ideal).** La boite interieure cote ACS. Une diode materielle entre les deux. L'abonne exterieur cote IT. La boite interieure publie vers l'abonne exterieur ; les consommateurs accedent a l'abonne exterieur, jamais a l'interieure. Meme logiciel, meme modele de configuration, meme experience operateur. Seule la topologie physique change.

![Methode deux-boites : realisation mono-boite SL3 et realisation deux-boites-plus-diode SL4 avec boite interieure, diode et abonne exterieur](/diagrams/two-box-method.png)

## Contraintes de conception

IIA est faconne par la realite des environnements d'automatisation et de controle, pas par les hypotheses du calcul d'entreprise.

- **La connectivite est un luxe.** Le plancher de production, les tetes de puits, les sous-stations et les sites isoles tournent sur cellulaire, satellite ou sans backhaul. L'unite doit etre le systeme complet indefiniment.
- **La zone fournit ses propres services d'infrastructure.** DHCP, DNS, NTP, partages de fichiers/configuration, synchronisation de temps, PKI optionnelle dans la cellule — tout ce qu'il faut pour qu'un reseau de cellule soit un reseau.
- **Securite, Fiabilite, Performance, pas Confidentialite, Integrite, Disponibilite.** Le sujet n'est pas l'ordre, c'est la categorie. CIA, AIC et leurs derives decrivent des proprietes de l'information. L'ACS n'opere pas sur des enregistrements ; il opere sur l'action et la physique.
- **La bordure est le lieu ou la valeur est physiquement creee.** L'intelligence appartient au point de production, pas a une centralisation amont.
- **L'integration est la fonction.** Historien, pare-feu, inventaire, IDS, audit et API doivent vivre au meme endroit et continuer de fonctionner quand tout le reste tombe.
- **L'heterogeneite est permanente.** Des PLC vieux de quarante ans tournent a cote d'equipements neufs sur des protocoles qui precedent TCP/IP. La boite observe ; elle ne prescrit pas.
- **Aucune unite n'en commande une autre.** La composition est additive. Les donnees montent. Le controle reste local.

## Architecture de donnees

La boite est partitionnee en trois faces plus une interface de gestion.

La « DMZ interne » ici est une partition *dans* la boite. Elle n'est pas la DMZ IT-OT conventionnelle de PERA L3.5. Celle-ci separe l'IT-touching-control de l'IT-not-touching-control. La DMZ d'IIA est la frontiere entre capture entrante gouvernee par SRP et publication sortante gouvernee par CIA, dans une unite unique possedee par l'operateur.

![La Boite : diagramme conceptuel de type CIAD du partitionnement interne, des zones et des surfaces externes](/diagrams/box-architecture.png)

- **Pas de HTTP a la frontiere, dans aucun sens.** Pas d'ecouteur HTTP sur les NIC ACS ou IT. Pas de HTTP/HTTPS sortant depuis les composants.
- **Le profil de bordure est choisi par l'operateur.** MQTT + Sparkplug B convient au niveau controleur↔courtier de zone. Au-dessus de L2, OPC UA pub/sub, requetes structurees sur mTLS ou ecriture batch vers un lac BI sont generalement plus adaptes.
- **Le lac de donnees local est la source de verite sur la boite.** Toute la capture entrante, la classification, l'audit, les evenements et les series temporelles y atterrissent. Les editeurs sortants siphonnent depuis ce lac ; le bus DMZ est transitoire.
- **Surface runtime minimale.** Chaque ecouteur, demon et connexion sortante existe parce qu'il a ete concu pour un but operationnel precis.
- **La configuration est un artefact signe, pas une API live.** Etat declaratif entrant, signe et valide, applique ou rejete — un GitOps pour une appliance industrielle air-gap.

**Chaque communication est gouvernee par un contrat de donnees explicite.** Interne comme externe. L'ensemble forme le **catalogue de contrats** — versionne, decouvrable. La communication sans contrat est empechee la ou l'architecture peut l'imposer et signalee la ou elle ne le peut pas.

**L'attestation observe la prevention.** Chaque mecanisme de prevention peut fuir ; l'architecture le presume. L'IDS reseau double comme observateur d'attestation des contrats. Un **IO master** observe independamment le substrat physique des E/S et recoupe avec la capture primaire de la boite. Les findings d'attestation sont emis sous `ot.attestation.*`.

## Antecedents

Le motif existe ailleurs. Il n'avait simplement jamais ete nomme et applique deliberement aux systemes d'automatisation et de controle.

- **Unified Threat Management** : une appliance fait pare-feu, routage, VPN, IDS, filtrage de contenu, DNS, DHCP.
- **Hyperconverged Infrastructure** : des noeuds identiques ; chacun fait calcul, stockage et reseau.
- **NAS integre** : une seule boite fait stockage, sauvegarde, conteneurs, VPN, videosurveillance, media.

Toutes ces formes expriment le meme motif : unite souveraine auto-contenue, identique a chaque point de deploiement, qui monte en echelle par composition et fonctionne sans dependance amont. IIA herite de ce motif et l'etend a la frontiere ou les modeles de gouvernance changent entre SRP et CIA.

## Normes

IIA ne derive d'aucune norme unique. C'est l'instanciation physique de ce que plusieurs normes decrivent abstraitement, parce qu'elles partagent les memes premiers principes : operation souveraine, independante, autonome.

- **PERA+** decrit l'architecture de reference de l'entreprise industrielle, les niveaux hierarchiques, les frontieres de zone et les **4R** — Response, Resolution, Reliability, Resilience.
- **ISA-95** est le modele canonique d'interface IT↔ACS.
- **IEC 62443** definit le systeme de management cyber, les niveaux de securite et les exigences de composant que la boite satisfait au niveau zone.

IIA utilise aussi les conventions **CIAD** et **CIND** de PERA+ pour rendre ses deploiements lisibles pour tout ingenieur de controle travaillant dans ce cadre.

## Pour qui c'est fait

Le triangle sous-desservi. Chaque industriel en dessous du sommet de la courbe de demande. Ceux qui frappent des toasters, traitent le lait, exploitent des feed lots, usinent en discret. Ils ne peuvent pas financer des projets securite a six chiffres ni des abonnements de supervision annuels eleves. Ils sont souvent ruraux, isoles, avec internet instable.

Leur « personne reseau », quand il y en a une, connait l'IP, peut-etre le subnetting. Pas les paquets. Pas les CVE. Et elle a raison de ne pas faire des CVE sa responsabilite centrale. Ce dont l'OT a besoin, c'est d'un inventaire exact, d'un reseau visible, d'une trace d'audit et d'un procede qui tourne de facon fiable. Les outils pour faire cela *comme outils operationnels OT possedes et operes par l'OT* n'existent pas vraiment aujourd'hui.

IIA est cette chose.

## La these

L'independance industrielle n'est pas une position technologique. C'est une position de souverainete operationnelle. L'entite qui controle l'infrastructure d'automatisation controle l'operation. L'installation qui depend d'une connectivite externe pour la visibilite de base du procede, l'acces a l'historien ou la supervision de securite n'est pas souveraine.

La frontiere de domaine entre ACS et IT n'est pas une negociation. Les donnees qui agissent sur le procede sont gouvernees par SRP. Les donnees qui rendent compte du procede sont gouvernees par CIA. La boite fait respecter cette frontiere par l'architecture, pas par la politique, et garantit que la gouvernance IT ne remonte jamais dans la cellule d'automatisation.

IIA fournit le motif architectural qui fait de la souverainete l'etat par defaut plutot que l'aspiration.

## Pour aller plus loin

L'Alliance publie sa position en cinq piliers. Ce README est le cinquieme — *L'Architecture*. Les quatre premiers la fondent :

- [`docs/the-field.md`](/field/) — **Le Terrain.** L'endroit ou les operations travaillent. Les lieux, les personnes et les defaillances qui donnent sa forme a l'architecture.
- [`docs/the-problem.md`](/problem/) — **Le Probleme.** Ce qui fait obstacle. Le marche vend la dependance ; l'IT impose des modeles d'entreprise a un mauvais substrat ; les gatekeepers du terrain n'enseignent pas.
- [`docs/our-claim.md`](/claim/) — **Notre Position.** Ce qui est du aux operations. Ce qui doit etre possede, repris, formalise.

Documentation de support :

- [`docs/introduction.md`](/architecture/docs/introduction/) — introduction conceptuelle.
- [`docs/internal-architecture.md`](/architecture/docs/internal-architecture/) — specification canonique d'implementation.
- [`docs/sample-contracts.md`](/architecture/docs/sample-contracts/) — exemples travailles de contrats de donnees.
- [`docs/mcp-single-box.md`](/architecture/docs/mcp-single-box/) — demarrage rapide pour le plus petit deploiement MCP.
- [`docs/glossary.md`](/architecture/docs/glossary/) — vocabulaire utilise dans l'ensemble de la documentation.

## Marques

Industrial Independence Architecture et IIA sont des marques. La licence ci-dessous couvre le texte de ce document. Elle n'accorde aucun droit d'usage de ces marques.

## Licence

Cette oeuvre est publiee sous [Creative Commons Attribution-ShareAlike 4.0 International License (CC BY-SA 4.0)](https://creativecommons.org/licenses/by-sa/4.0/).
