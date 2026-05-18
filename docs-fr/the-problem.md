# Le probleme

Le terrain n'est pas souverain parce que trop d'acteurs profitent du fait qu'il ne le soit pas. Le marche vend la dependance. L'IT herite de modeles d'entreprise et les impose sur un substrat pour lequel ils n'ont pas ete construits. Les propres praticiens seniors du terrain - ceux qui pourraient former la generation suivante - trop souvent ne le font pas.

Le probleme, c'est tout le monde qui a interet a ce que les operations restent dependantes. Cela inclut les editeurs, les integrateurs, les consultants, les auditeurs, les equipes IT a qui l'on a confie l'OT, et les ingenieurs seniors de l'usine qui preferent rester celui qui savait plutot que former celui qui arrive ensuite.

Ce document parle clairement des trois.

## Sommaire

- [Le probleme des 80 %](#le-probleme-des-80-)
- [Ce que le marche vend](#ce-que-le-marche-vend)
- [Ce que lIT impose](#ce-que-lit-impose)
- [Ce que le terrain retient](#ce-que-le-terrain-retient)
- [Ce que cela produit](#ce-que-cela-produit)
- [Pourquoi c'est structurel, pas personnel](#pourquoi-cest-structurel-pas-personnel)
- [Ce que larchitecture refuse dacheter](#ce-que-larchitecture-refuse-dacheter)

---

## Le probleme des 80 %

Environ 80 % des cyberattaques contre les technologies operationnelles proviennent des reseaux IT corporate. Le chiffre apparait dans des rapports editeurs avec des variations de pourcentage exactes, mais une direction stable. L'attaque ne commence pas sur le plancher de production. Elle commence sur un portable de help desk, un e-mail de phishing, un VPN compromis, un identifiant Active Directory vole - et elle se termine par un pipeline arrete, une aciérie a l'arret, une usine agroalimentaire hors ligne.

C'est la consequence de ce que l'industrie vend, de ce que l'IT cable et de ce que les operations ont laisse s'installer depuis une decennie. Les recherches de terrain montrent l'etat type des deploiements converges :

- **44 %** des evaluations OT montrent des identifiants partages entre IT et OT.
- **77 %** montrent une segmentation reseau incorrecte.
- **17 %** des organisations executent un domaine Active Directory partage entre IT et OT - le vecteur lateral le plus courant.
- **70 %** des attaques OT commencent maintenant dans l'IT.

Le probleme des 80 % est celui de ponts qui fonctionnent exactement comme ils ont ete concus.

---

## Ce que le marche vend

Les grands fournisseurs d'automatisation fixent les termes du terrain. Protocoles, outils de configuration, logiciels d'ingenierie, programmes de certification, contrats de support - l'editeur possede la pile et la loue en retour. Le motif est constant chez les grands acteurs.

### Piles fermees

- **Protocoles fermes.** Publies pour n'interoperer qu'avec l'equipement du fournisseur, ou avec les concurrents sous des licences qui rendent l'integration prohibitive.
- **Configuration verrouillee fournisseur.** Le logiciel d'ingenierie ne tourne que sur Windows, exige un dongle editeur, produit des fichiers projet qu'aucun autre logiciel ne peut ouvrir. La configuration est otage de la chaine d'outils.
- **Dongles de licence.** Un logiciel a 30 dollars est attache a un dongle a 300 dollars qu'il faut expedier, brancher et remplacer physiquement lorsqu'il casse. Ce n'est pas un controle de securite. C'est une redevance recurrente avec du materiel en plus.
- **Maintenance a revenu recurrent.** Le support annuel represente un pourcentage du cout de l'equipement. Ce pourcentage ne baisse pas sur la duree de vie de l'equipement. La duree de vie du materiel est de quinze a trente ans. La facture est payee pour toujours.

### Architectures de reference comme theatre securitaire

Tous les grands fournisseurs publient des architectures de reference. Les diagrammes sont propres. Les frontieres de zone sont nettes. Les tampons IEC 62443 sont sur la couverture. Les fournisseurs detiennent les certifications.

Les guides d'implementation, lus attentivement, violent pourtant la norme que la couverture pretend mettre en oeuvre. La page 17 du compendium Siemens PCS 7 Part F reconnait que son propre exemple est « un exemple negatif d'un point de vue securitaire » - puis construit 189 pages de guide sur cet exemple negatif. D'autres documents reconnaissent qu'une architecture plate facilite le mouvement lateral malveillant tout en publiant des schemas qui y conduisent. CPwE documente des connectivites de bout en bout au travers de multiples zones avec des postes d'ingenierie qui les traversent simultanement.

Le fournisseur *peut* implementer la norme. La certification le prouve. La documentation dit a l'operateur de faire autre chose. La certification sur la couverture fait le travail marketing ; les diagrammes des pages interieures font le travail de verrouillage. Lorsque l'audit echoue, c'est l'operateur qui paie la remediation - au meme fournisseur.

### Integrateurs et prime a l'opacite

La plupart des usines n'ont pas construit leur reseau elles-memes. Un integrateur l'a fait. L'integrateur a livre un systeme fonctionnel, facture le projet, puis est parti. L'usine a herite d'un reseau qui marchait - et d'une configuration qu'elle ne pouvait pas lire.

La structure recompense l'opacite. Les offres initiales sont competitives ; les integrateurs gagnent au prix. La marge se recupere ensuite sur les interventions de service. Un deploiement totalement documente et transferables ne genere pas d'intervention. Un deploiement que seul l'integrateur peut lire en genere pour toujours. L'integrateur discipline qui remet les mots de passe, la documentation et la formation perd l'appel d'offres face a celui qui ne le fait pas.

Le marche selectionne l'opacite. A l'echelle, l'industrie a produit un parc d'usines ou la configuration est dans la tete de l'integrateur, les mots de passe dans son coffre, et ou le compteur demarre quand le reseau tombe a deux heures du matin.

---

## Ce que lIT impose

L'IT n'a pas demande a prendre en charge l'OT. Dans la plupart des organisations, l'IT s'est vu remettre l'OT parce que l'organigramme ne prevoyait pas de place pour un leader OT. L'IT a donc applique a l'OT les modeles qu'il connaissait, ceux que ses outils supportent et ceux que sa progression de carriere recompense. Ces modeles ne conviennent pas.

### Authentification d'entreprise sur un substrat qui agit sur la physique

Active Directory a ete concu pour gerer qui peut lire un partage de fichiers. Il n'a pas ete concu pour piloter une vanne. L'IT integre tout de meme l'OT dans l'AD corporate, parce que c'est le plan de gestion qu'il opere. Le resultat : un seul jeu d'identifiants compromis ouvre les deux reseaux, et la plupart des mouvements lateraux passent par cette charniere unique.

### Le poste d'ingenierie comme cheval de Troie

Le poste qui programme le PLC est « gere » par l'IT - joint au domaine, patche IT, antivirus IT, supervise IT, confiance IT. Il est aussi directement connecte au reseau OT, parce que l'ingenieur doit programmer les PLC. Il est digne de confiance pour l'IT parce que l'IT le gere. Il est digne de confiance pour l'OT parce que l'ingenieur en a besoin. Aucun des deux mondes ne le securise pour ce qu'il est reellement : un pont entre deux substrats, avec deux modeles de menace, et sans proprietaire unique.

### La cadence de patch IT imposee a lOT

Les patchs mensuels conviennent au materiel de bureau ou un reboot de trente secondes est invisible. Ils sont catastrophiques sur un convoyeur ou ce meme reboot fait perdre le reste du poste. L'industrie IT vend, et ses homologues cote operations insistent de bonne foi, pour que l'OT adopte cette meme cadence. Le discours ignore :

- **Les mises a jour de firmware OT sont risquées operationnellement.** Elles peuvent changer des patterns de communication, casser un logiciel d'ingenierie valide pour une version donnee, modifier un comportement d'interverrouillage, invalider des certifications securite. Le changement n'est justifie que si le risque de *ne pas* mettre a jour depasse celui de *mettre a jour*.
- **L'equipement OT tourne sur quinze a trente ans.** Le dernier firmware d'un PLC vieux de quinze ans, s'il existe, peut etre moins stable que celui qui tourne deja depuis huit ans.
- **La stabilite est la propriete operationnelle que le substrat protege.** Un reseau de controle qui tourne sans incident n'est pas un probleme a resoudre en y injectant du changement.

Etude de cas de terrain frequente : un grand fabricant, reseau controle stable depuis huit ans. La politique IT impose des mises a jour trimestrielles. Premiere annee : plusieurs arrets de production. Deuxieme annee : des incompatibilites qui forcent des remplacements materiels. Troisieme annee : retour a une politique firmware geree par l'OT. Les annees suivantes : zero incident firmware. Le cout de l'ancien firmware etait nul. Le cout de sa mise a jour etait massif.

### Le SLA concu pour les bureaux

Le SLA du help desk a ete concu pour le bureau, ou une premiere reponse sous quatre heures est raisonnable parce que rien de physique n'en depend. L'usine tourne a une autre vitesse. Une premiere reponse sous quatre heures pendant une urgence du vendredi soir n'est pas un niveau de service. C'est un abandon. Le SLA n'a pas ete concu pour la consequence d'une panne de processus physique, et l'appliquer au support OT revient a appliquer un artefact IT a un probleme de processus physique.

### L'OT sous le CIO ou le CISO

Une grande part des organisations placent la securite OT sous le CISO. CIO comme CISO sont des autorites adaptees pour l'IT. Aucun n'a, dans le cas general, de formation d'ingenierie procede. Les decisions descendent ensuite jusqu'au plancher comme des faits accomplis, et les operations decouvrent ces decisions quand les consequences arrivent. Il n'y a pas de chief operations technology officer dans l'organigramme de la plupart des grandes entreprises. Le siege depuis lequel les operations parleraient n'est pas dans la salle.

---

## Ce que le terrain retient

C'est la partie que le terrain n'aime pas entendre, et c'est pourtant celle que les operations doivent entendre le plus.

Une part importante de la connaissance institutionnelle qui fait tourner les reseaux industriels vit dans la tete de praticiens seniors qui ont decide, consciemment ou non, de ne pas la transmettre. Les raisons sont individuelles. Le motif est industriel.

- **Le heros par retention.** L'ingenieur senior est epuisé, indispensable, irremplacable - et cette indispensabilite est aussi sa securite d'emploi. Former un successeur est, dans cette structure d'incitations, un chemin vers le fait de devenir remplaçable. Donc la formation n'a pas lieu.
- **La configuration non documentee.** La configuration du switch que seul le senior peut lire. Le programme PLC sans commentaires et avec une logique qui exige une traduction tribale. L'integration custom qui n'existe que parce qu'une personne savait la faire fonctionner. Rien de tout cela n'est documente. Presque tout pourrait l'etre.
- **Le refus de mentorat.** Un jeune technicien arrive en voulant apprendre. Le praticien senior lui donne des taches d'occupation plutot que le vrai travail, lui cache l'acces a ce qui lui apprendrait reellement, traite chaque question comme une nuisance. Le jeune technicien s'en va. Le terrain appelle cela une penurie de main-d'oeuvre. C'est aussi une penurie d'enseignement.
- **Le gardien comme identite.** Savoir la chose que personne d'autre ne sait devient l'identite du praticien au travail. Laisser cette identite se diluer en partageant la connaissance ressemble, pour certains, a laisser se diluer le soi. Ils ne le feront pas.

Ce n'est pas vrai de tous les praticiens seniors. The Reality decrit aussi ceux qui ont enseigne. Ils existent, et la ou ils existent, le terrain vit. Mais la ou ils manquent, le terrain se creuse, et l'architecture doit etre concue pour le monde ou le gardien n'enseignera pas.

La reponse de l'architecture est de rendre le substrat auto-documentant, de sorte que le gatekeeping humain devienne impossible. La configuration est un artefact declaratif signe dans une grammaire contrainte - lisible par quiconque dispose de la documentation de la norme. Le catalogue de contrats est obligatoire et decouvrable. La chaine d'audit est liee par hachage et interrogeable. Le catalogue de roles peut etre enumere depuis n'importe quel poste operateur. Le savoir est dans le substrat, pas dans la tete. L'ingenieur senior peut partir a la retraite, refuser d'enseigner ou simplement mourir - l'operateur suivant peut toujours lire ce que fait l'architecture.

---

## Ce que cela produit

- **Le probleme des 80 %.** Decrit plus haut.
- **La falaise des competences.** Les praticiens seniors partent sans successeurs. Les certifications editeurs occupent le marche du travail a leur place - liees a des piles specifiques, expirant selon un calendrier, non portables. L'ingenierie comme discipline est sous-representee au niveau du board.
- **L'economie de la conformite.** Une industrie auto-entretenue de consultants, auditeurs, certificateurs, fournisseurs de formation, outils GRC. La conformite n'est pas la securite. Les incidents industriels les plus cites des dernieres annees ont frappe des organisations ayant passe des audits, detenu des certifications et paye du conseil.
- **Les normes comme paywall.** Les documents IEC 62443 individuels coutent cher ; la serie complete coute plus encore. Les ingenieurs qui doivent mettre la norme en oeuvre n'ont souvent pas les moyens d'y acceder.
- **Le cout cache de l'inaction.** Le downtime de fabrication se chiffre en dizaines de milliers de dollars par heure. Un week-end de panne sur un site a 10 k$/h de perte conservative fait plus de 600 k$. Les marches de l'assurance se durcissent et excluent ce qu'ils ne savent pas souscrire - c'est-a-dire l'essentiel de l'exposition OT non cataloguee. Le nombre sur la page, c'est le cout de ne pas changer.

---

## Pourquoi c'est structurel, pas personnel

Les editeurs repondent a des achats qui selectionnent sur le prix initial. Les integrateurs repondent a des appels d'offres qui ne recompensent pas la documentation. Les consultants repondent a des structures de facturation qui recompensent la complexite. Les auditeurs repondent a des regimes de checklist qui produisent du papier. Les equipes IT repondent a des cadres de conformite concus pour le substrat informationnel. Les ingenieurs seniors repondent a un marche du travail qui les recompense parce qu'ils sont irremplacables.

Chaque acteur fait ce que l'incitation en face de lui recompense. Chacun fait ce que la forme du marche exige.

Le resultat est l'industrie telle qu'elle existe. Personne n'a decide cela seul. C'est ce qui arrive quand personne n'est en position de le refuser.

L'architecture existe pour donner a l'operateur une position de refus. Pas pour entrer en guerre avec les editeurs, l'IT ou qui que ce soit d'autre. Mais pour pouvoir acheter au marche selon les termes de l'operateur - standards ouverts, protocoles ouverts, configuration signee, frontieres contractuelles, operation attestee - et s'eloigner de tout ce qui ne respecte pas ces termes. Pour pouvoir lire le substrat sans permission fournisseur, sans coffre d'integrateur, sans bonne volonte d'un senior.

---

## Ce que larchitecture refuse dacheter

- **Des protocoles fermes la ou des protocoles ouverts existent.** OPC UA, MQTT/Sparkplug B, i3X, Zenoh. L'alternative proprietaire du fournisseur reste cote procurement de la frontiere, pas cote architecture.
- **Des architectures de reference qui violent la norme qu'elles citent.** Reevaluer chaque diagramme fournisseur contre la norme reelle. La norme gagne.
- **Des postes d'ingenierie geres par l'IT sur le substrat OT.** Les postes d'ingenierie sont du calcul OT sur substrat OT, sous orchestration de mise a jour operateur, avec verification d'integrite du fichier projet avant que le fichier n'atteigne le poste.
- **Des equipements bi-rattaches hors de la boite elle-meme.** Chaque PLC a une seule interface reseau. Le flux de donnees inter-substrats passe par la boite, contracte et audite.
- **Une configuration lisible seulement par l'integrateur.** La configuration est un artefact signe dans une grammaire contrainte. L'integrateur peut la construire ; l'operateur la possede.
- **Des classeurs de conformite qui ne rejoignent jamais le fil.** L'attestation est l'artefact porteur : catalogue de contrats, chaine d'audit, observateur IDS, IO master. Le classeur est en aval.
- **Les certifications fournisseur comme porte d'entree de la main-d'oeuvre.** La competence doit etre prete pour le terrain, alignee sur les normes et portable.
- **La cadence de patch IT comme discipline OT.** Orchestration de mise a jour sur l'horloge de l'operateur, contre l'etat intentionnel de l'operateur, avec son approbation.
- **Le savoir tribal a la place de la documentation.** La configuration est signee et decouvrable ; le catalogue de contrats est obligatoire ; la chaine d'audit est interrogeable ; le catalogue de roles est enumerable depuis n'importe quel poste operateur. Le gatekeeping humain devient impossible parce que le substrat refuse d'etre gatekept.

Le Terrain decrit les pieces. Le Probleme decrit ce qui fait obstacle. Notre Position decrit ce que nous tenons. Notre Philosophie decrit la facon dont nous y pensons. L'Architecture est la reponse.
