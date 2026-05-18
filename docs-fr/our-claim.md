# Notre position

Le Terrain decrit les pieces dans lesquelles les operations travaillent. Le Probleme decrit ce qui fait obstacle. Ce document decrit ce que nous revendiquons - ce qui est du aux operations, ce qui doit etre possede, ce qui doit etre repris, ce qui doit etre formalise, ce qui doit etre nomme.

Ce ne sont pas des demandes. Ce sont les termes operatoires d'un substrat dont les operations peuvent repondre. L'architecture est ce qui les rend livrables.

## Sommaire

- [Ce que les operations possedent](#ce-que-les-operations-possedent)
- [Ce qui est repris a lIT](#ce-qui-est-repris-a-lit)
- [Des SLA qui correspondent a la production](#des-sla-qui-correspondent-a-la-production)
- [Des contrats avec lIT](#des-contrats-avec-lit)
- [La separation comme architecture, pas comme politique](#la-separation-comme-architecture-pas-comme-politique)
- [La reconnaissance de lIT, de lOT et de lACS comme differents](#la-reconnaissance-de-lit-de-lot-et-de-lacs-comme-differents)
- [La reintroduction de lingenierie](#la-reintroduction-de-lingenierie)

---

## Ce que les operations possedent

Les operations possedent le substrat dont la production depend. Elles ne le consomment pas via un help desk. Elles ne le demandent pas via un ticket de service. Elles le possedent.

- **Le reseau OT.** Les commutateurs, les cables, l'infrastructure sans fil a l'interieur de la zone. Configure, maintenu et possede par l'operateur. Pas une branche aval de la fabrique de commutation de l'entreprise.
- **Les services IP de la zone.** DHCP, DNS, NTP, partages de fichiers, PKI optionnelle dans la cellule. Decentralises. Par zone, pas par entreprise. Fonctionnels sans WAN.
- **L'historien.** Decentralise. Local a la zone. Les donnees de l'operateur, sur le materiel de l'operateur, interrogeables sans dependance externe. Un historien centralise joignable seulement quand le WAN est disponible est un echec de souverainete par conception.
- **La chaine d'audit.** Liee par hachage, append-only, interrogeable. La trace de l'operateur sur qui a fait quoi, quand, du cote operateur de la frontiere.
- **La configuration.** Un artefact declaratif signe. Versionne. Auditable. Applique via un parseur controle, pas pousse par un agent de gestion distant que l'operateur ne possede pas.
- **La frontiere.** Les conduits qui sortent de l'ACS sont a l'operateur : a lui de les declarer, de les formaliser et de les faire respecter.

## Ce qui est repris a lIT

Les operations ne sont pas en guerre avec l'IT. Le sujet n'est pas l'opposition. Le sujet est que le substrat de la production a ete donne au mauvais proprietaire, et que le mauvais proprietaire l'a eu assez longtemps pour que le cout devienne visible. Le substrat revient.

- **Le controle du reseau OT.** Les commutateurs OT sous gestion OT. Pas une extension de la fabrique de commutation de l'entreprise. Pas des VLAN que l'ingenieur controle ne peut ni voir ni atteindre.
- **Le controle des fenetres de patch.** Les mises a jour du materiel OT se font selon le calendrier des operations, contre leur manifeste d'etat intentionnel, avec leur approbation. Pas sur le cycle trimestriel de conformite de l'IT. Un redemarrage de trente secondes d'un switch est invisible dans un bureau et catastrophique sur un convoyeur.
- **Le controle de l'acces distant fournisseur.** Chaque chemin entrant vers l'ACS est un conduit contractuel a travers la boite de l'operateur, identifie, authentifie, audite. Aucun identifiant emis par l'IT ne se termine a l'interieur de l'ACS.
- **Le controle du calcul OT.** L'historien, les postes d'ingenierie, les IHM, les boites passerelles - possedes par les operations, sur le materiel des operations, sur le substrat des operations. Pas dans un datacenter IT que l'operateur ne peut meme pas penetrer.
- **La frontiere elle-meme.** La ligne entre IT et OT a ete tracee par l'IT dans la plupart des usines. Elle est retracee par l'architecture, selon des termes que les operations peuvent articuler et defendre.

## Des SLA qui correspondent a la production

L'accord de niveau de service selon lequel fonctionne le help desk a ete concu pour un bureau. L'usine vit selon une autre horloge. Les pertes de production se composent a la minute. Une premiere reponse sous quatre heures lors d'une urgence du vendredi soir n'est pas un niveau de service. C'est un abandon.

Les operations tiennent l'IT a des SLA qui correspondent a la consequence de la defaillance :

- **Reponse par la personne qui peut corriger.** Pas un createur de ticket. Pas un analyste de niveau un. L'ingenieur qui peut faire le changement.
- **Des horloges qui correspondent aux delais de production.** Des minutes, pas des heures. Des heures, pas des jours. Les week-ends ne sont pas exempts.
- **La reconnaissance que la perte composee est une perte.** Dix mille dollars par heure pendant soixante heures, c'est six cent mille dollars. Un SLA qui permet que cela s'accumule est un SLA qui facture aux operations le processus de l'IT.

Ce sont les termes que les operations imposeraient a un fournisseur qu'elles paient pour le service. L'IT interne, lorsqu'il se trouve du cote operations de la frontiere, est tenu aux memes termes.

## Des contrats avec lIT

Chaque flux de donnees qui traverse la frontiere est un engagement bilateral entre deux parties. L'architecture le formalise.

- **Le flux est decrit.** Schema, rythme, charge utile, destination, identite.
- **Les deux cotes s'engagent.** Les operations a produire selon la spec. L'IT a recevoir, authentifier, accuser reception et repondre dans l'enveloppe convenue.
- **Les modes de defaillance sont nommes.** Une matrice RACI est publiee pour chaque facon dont le flux peut tomber en panne. Qui est responsable. Qui est comptable. Qui est consulte. Qui est informe.
- **L'adherence est mesuree.** La telemetrie sous `ot.contract.*` enregistre la connectivite, la livraison, l'auth, le schema, les quotas, la reconciliation, la verification d'audit, les violations de SLA et les ecarts. Des recus de qui a tenu sa partie.

Une frontiere sans contrats bilateraux n'est qu'une poignee de main. Les poignees de main ne survivent pas aux changements de personnel.

## La separation comme architecture, pas comme politique

La separation n'est pas une posture. C'est une propriete architecturale.

La frontiere entre IT et OT n'est pas appliquee par la politique, par la confiance ou par l'intention. Elle est appliquee par :

- **Zero Trust ↔ Managed Trust.** La boite termine Zero Trust du cote IT et commence Managed Trust du cote ACS. Le cadrage de PERA+, rendu concret.
- **Le partitionnement interne a trois cotes.** Entrant (cote ACS), DMZ interne, sortant (cote IT). L'entree et la sortie ne peuvent pas conduire directement l'une vers l'autre. Tout trafic traverse la DMZ.
- **Pas de HTTP a la frontiere.** Pas d'ecouteur HTTP entrant. Pas de HTTP sortant d'aucun composant. Les mises a jour et deltas arrivent par bundles signes ou deltas tunnels sur mTLS.
- **Le catalogue de contrats qui fait respecter ce qui peut exister sur le fil.** La communication sans contrat est empechee ou signalee. Il n'existe pas de chemin silencieux.
- **L'observateur d'attestation IDS qui recoupe le trafic observe avec le catalogue.** Les findings sont emis sous `ot.attestation.*` avec la meme severite que les evenements de securite.

Une politique peut etre revisee en reunion. L'architecture est plus difficile a reviser. C'est elle qui rend la frontiere durable.

## La reconnaissance de lIT, de lOT et de lACS comme differents

La confusion est la source d'une grande partie des problemes. Trois substrats ont ete traites comme s'ils n'en formaient qu'un. Chacun a une physique differente, un horizon temporel different, un bon modele de securite different.

- **IT** est le domaine de l'information. Des enregistrements. De l'historique. Confidentialite, Integrite, Disponibilite. CIA est le bon modele. L'industrie sait fonctionner ici.
- **OT** est le domaine des technologies operationnelles. Il inclut l'ACS mais est plus large - systemes de supervision, MES, historiens pour des donnees deja-information, pipelines BI, postes operateur, gestion d'actifs. Une grande partie de l'OT est plus proche de l'IT que de l'ACS, mais avec des exigences de temporalite et de fiabilite differentes. SAIC est parfois le bon modele pour les systemes OT qui manipulent une information critique pour la securite.
- **ACS** (Automation and Control Systems) est le substrat qui agit sur la physique. Vannes. Verrouillages. Boucles. SRP - Securite, Fiabilite, Performance - est le bon modele. Les triades du domaine de l'information reposent sur le mauvais substrat, pas dans le mauvais ordre. D'apres Robert Radvanovsky, Infracritical.

Une discipline qui traite ces trois choses comme une seule discipline donne de mauvais conseils dans deux salles sur trois. Les operations s'en tiennent au vocabulaire, aux normes et aux organigrammes qui reconnaissent cette difference.

## La reintroduction de lingenierie

L'automatisation industrielle a ete construite par des ingenieurs. Dans la plupart des usines, elle n'est pas maintenue aujourd'hui par des ingenieurs. Elle est maintenue par des integrateurs sous contrat, par des personnels IT qui ne travaillent pas sur des processus physiques, et par une population en diminution de seniors controle epuises et non remplaces.

L'ingenierie revient :

- **Dans la salle au moment ou l'architecture est decidee.** Pas apres.
- **Au niveau du board.** Un chief operations technology officer, ou l'equivalent, avec un siege la ou siegent le CIO et le CISO.
- **Dans la filiere de formation.** Apprentissages, certifications, parcours compagnon qui produisent des personnes capables de configurer un switch, depanner un bus de terrain, ecrire un contrat et lire un schema unifilaire.
- **Comme discipline, pas comme role.** Le jugement d'ingenierie est la competence porteuse. Les outils et les normes existent pour le soutenir, pas pour le remplacer.
- **Avec les normes entre les mains.** IEC 62443 n'est pas de la PI fournisseur. ISA-95 n'est pas de la PI conseil. PERA+ n'est pas de la PI par abonnement. Les normes pretes pour le terrain appartiennent aux praticiens. L'Alliance existe pour les leur rendre.

L'ingenieur senior systeme de controle n'est pas un heros. C'est un mode de defaillance institutionnel. La reintroduction de l'ingenierie est ce qui le rend inutile.

---

Ce sont les conditions de la souverainete operationnelle. Le Terrain est ce qui est. Le Probleme est ce qui fait obstacle. Notre Position est ce que nous tenons. Notre Philosophie est notre facon d'y penser. L'Architecture est ce que cette position deploie comme reponse.
