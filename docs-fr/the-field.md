# Le terrain

L'architecture du README est declarative. Elle dit ce qu'est la boite, ce qu'elle fait et ce qu'elle refuse. Elle ne dit pas a quoi elle sert, au sens des pieces dans lesquelles elle entre et des problemes qu'elle fait cesser d'etre des problemes.

Ce document, si. Le Terrain est l'endroit ou les operations travaillent — des types de lieux, de personnes et de defaillances bien particuliers. C'est le sol vecu qui donne sa forme a l'architecture. L'architecture n'est pas en colere contre tout cela. L'architecture est ce qui rend une grande partie de tout cela inutile.

Aucune des scenes ci-dessous n'est hypothetique. Les noms et details identifiants ont ete retires ; les motifs sont conserves. Apres plus de vingt ans a travailler dans ces environnements, les motifs se repetent.

## Sommaire

- [Partie I — Scenes](#partie-i--scenes)
  - [La cabane dans le champ de mais](#la-cabane-dans-le-champ-de-mais)
  - [Le tiroir verrouille](#le-tiroir-verrouille)
  - [Les deux reseaux](#les-deux-reseaux)
  - [Lusine midstream](#lusine-midstream)
  - [Deux heures du matin](#deux-heures-du-matin)
  - [Le spanning tree](#le-spanning-tree)
- [Partie II — Les personnes](#partie-ii--les-personnes)
  - [Les electriciens dusine](#les-electriciens-dusine)
  - [La technicienne de montagne](#la-technicienne-de-montagne)
  - [Lingenieur senior systemes de controle](#lingenieur-senior-systemes-de-controle)
- [Partie III — La realite organisationnelle](#partie-iii--la-realite-organisationnelle)
  - [Linfrastructure invisible](#linfrastructure-invisible)
  - [Le centre de cout et le centre de profit](#le-centre-de-cout-et-le-centre-de-profit)
  - [Le revenu recurrent de lintegrateur](#le-revenu-recurrent-de-lintegrateur)
  - [Aucun siege a la table](#aucun-siege-a-la-table)
- [Partie IV — Ce a quoi larchitecture repond](#partie-iv--ce-a-quoi-larchitecture-repond)

---

## Partie I — Scenes

### La cabane dans le champ de mais

On m'a un jour donne des coordonnees GPS pour trouver un site gazier. Pas une adresse. On arrivait au milieu d'un champ de mais, devant une petite cabane rouge. La cabane n'etait pas fermee. A l'interieur : un bureau, une chaise, un chauffage d'appoint, quelques modems cellulaires de differentes compagnies avec leurs IP ecrites sur du ruban adhesif, et un vieux portable Windows XP hors support depuis des annees. Le portable faisait quelque chose d'important. Plusieurs personnes l'utilisaient. En repartant, on m'a precise de ne pas essayer de refermer la cabane : il n'y avait pas de clefs.

Ce portable est une piece d'infrastructure critique. Il l'est depuis des annees. Il le restera encore des annees. Personne n'a planifie cela. C'est ce qu'il fallait, au moment ou il le fallait, avec les moyens de la personne presente.

> Ce a quoi l'architecture repond : l'unite dans cette cabane serait une boite unique sans dependance amont, executant la collecte de la zone, l'historien de la zone, l'audit de la zone et l'editeur sortant securise de la zone. Elle serait toujours dans une petite cabane rouge au milieu d'un champ de mais. Mais elle serait inventoriee, identifiee, authentifiee et recuperable, et ce ne serait pas un systeme d'exploitation grand public en fin de vie. L'architecture ne demande pas au site d'arreter d'etre isole. Elle demande au site d'arreter d'etre non documente.

### Le tiroir verrouille

Dans une usine, un tiroir ferme a clef dans l'atelier de maintenance contenait plusieurs portables non autorises. On les utilisait pour mettre a jour les PLC et les IHM des lignes. On les utilisait aussi pour regarder des videos et aller sur les reseaux sociaux via un hotspot cellulaire. Le portable officiel, robuste, emis par l'entreprise, ne servait pas : impossible d'y installer l'emulateur de terminal, le pilote du cable console ou les installateurs de firmware necessaires au travail quotidien. Le portable officiel prenait la poussiere ; les non autorises restaient dans le tiroir ; les lignes tournaient.

L'IT le savait. Des tickets existaient. Ils ne se fermaient pas.

> Ce a quoi l'architecture repond : la boite fait tourner les services d'infrastructure de la zone — DHCP, DNS, NTP, partages de fichiers, PKI optionnelle en cellule — et l'operateur la possede. Le modele de configuration est un artefact signe, pas une poussee de politique distante, si bien que l'operateur peut installer ce dont il a besoin pour faire tourner l'usine. Les portables clandestins existent parce que l'infrastructure officielle refuse de faire ce dont les operations ont besoin. La reponse de l'architecture est que l'infrastructure officielle fasse enfin ce qu'il faut.

### Les deux reseaux

Dans une usine de gaz, il y avait deux infrastructures reseau paralleles. La premiere etait le reseau corporate : Wi-Fi verrouille, securite aggressive, couverture insuffisante dans les zones de travail reel. La seconde etait le vrai reseau, celui utilise tous les jours : un routeur grand public branche sur un hotspot cellulaire, quelques extendeurs Wi-Fi et parfois une seconde liaison internet arrangee localement.

Les operateurs ne faisaient rien de mal. Ils faisaient la seule chose qui leur restait. Le reseau corporate n'atteignait pas les endroits ou le travail se faisait. Le reseau officieux, si. La productivite continuait. Personne n'admettait que le deuxieme reseau existait, donc rien n'etait surveille, inventorie, durci ou sauvegarde.

> Ce a quoi l'architecture repond : la boite fait tourner le reseau de la zone. Il n'y a plus de deuxieme reseau parce que le premier couvre deja ce qu'il doit couvrir, fournit deja les services qu'il doit fournir et appartient deja a l'operateur qui en a besoin. L'unite est celle de l'operateur ; l'operateur n'a pas a demander la permission pour qu'elle fonctionne.

### Lusine midstream

<figure class="field-figure">
  <img src="/field/field-refinery.jpg" alt="Tours d'une usine de procede sous ciel bleu" loading="lazy" />
  <figcaption>Une usine de procede du type evoque ci-dessous. Site specifique non identifie.</figcaption>
</figure>

Dans une usine midstream, l'ordinateur principal de conduite etait multi-rattache : une interface sur le reseau de controle, une autre sur un reseau avec internet permanent. Un outil gratuit de support a distance, du genre regulierement abuse par des attaquants, tournait en permanence. Le superviseur l'avait configure pour surveiller l'usine depuis sa tablette a la maison.

La configuration n'etait pas malveillante. Le superviseur etait responsable de la disponibilite. Il avait un outil qui lui permettait de voir l'installation quand il n'etait pas sur site, et il l'utilisait. Que cet outil soit un utilitaire de telemaintenance grand public avec un long historique d'abus n'etait pas son probleme principal — son probleme etait de savoir ce qui se passait quand son telephone sonnait a trois heures du matin.

> Ce a quoi l'architecture repond : la boite comprend un role d'acces distant, avec un agent tunnel sortant qui compose en mTLS vers un broker possede par l'operateur. Il n'y a pas d'ecouteur entrant sur la NIC IT. Le superviseur garde sa capacite tablette-a-la-maison, et l'architecture authentifie la session, identifie le principal, audite l'acces et contraint ce qui peut etre fait. Le superviseur n'a plus besoin d'un utilitaire grand public parce que le chemin legitime fonctionne enfin.

### Deux heures du matin

<figure class="field-figure">
  <img src="/field/field-plant-interior.jpg" alt="Interieur d'usine avec escaliers et gaines" loading="lazy" />
</figure>

La ligne tombe a deux heures du matin. Le technicien de nuit commence par faire des pings parce que c'est ce qu'il sait faire. Il n'atteint pas le switch dans le navigateur — HTTPS uniquement, port non standard, IP mal configuree, ou autre. Il appelle l'ingenieur senior systemes de controle, qui lui decrit la topologie par telephone. Si le probleme est du ressort de ce senior et qu'il peut agir depuis son canape, la ligne repart parfois en trente minutes.

Souvent, non. Le probleme est cote IT, ou touche un equipement gere par l'IT, ou exige un changement que l'IT doit approuver. Le senior appelle alors le help desk. Le help desk a un SLA. Le SLA dit qu'une personne repondra dans une fenetre donnee. Il ne dit pas que cette personne sera celle qui peut corriger. Le vendredi soir, l'horloge peut tourner tout le week-end sans violer la politique. A 10 000 dollars l'heure de perte de production, le reseau peut couter 600 000 dollars avant que l'ingenieur reseau se connecte le lundi.

> Ce a quoi l'architecture repond : l'unite detient le reseau de la zone. L'ingenieur senior a l'acces dont il a besoin pour corriger ce qu'il sait corriger, avec une gestion de changement concue pour les contraintes de production plutot que celles du bureau. Le cote IT de la frontiere est atteint par un conduit unique, contractuel et audite, pas par un ticket de help desk. La correction se fait quand elle est possible, c'est-a-dire generalement dans la premiere heure.

### Le spanning tree

Dans une laiterie, des interruptions intermittentes d'environ une heure se produisaient toutes les quelques semaines depuis des mois. Plusieurs personnes etaient passees dessus. Personne n'avait pense au spanning tree. J'ai ete appele. C'etait une mauvaise configuration spanning tree sur un switch de distribution. Correction en un apres-midi. Usine soulagee, et frustree qu'un seul reglage puisse produire autant de chaos.

L'integrateur qui avait construit le reseau etait parti. Il n'avait pas documente la configuration. Il n'avait pas remis les mots de passe. Il n'avait forme personne a l'usine. L'usine avait herite d'un reseau qu'elle ne pouvait ni lire, ni configurer, ni depanner.

> Ce a quoi l'architecture repond : la boite appartient a l'operateur, et sa configuration aussi. La configuration est un artefact declaratif signe et versionne. Le catalogue de roles et le catalogue de contrats sont decouvrables depuis l'unite. Un integrateur peut construire le deploiement, mais il ne peut pas le laisser opaque. Quand l'integrateur a disparu, l'usine peut toujours lire la configuration, auditer les connexions et changer ce qui doit l'etre.

---

## Partie II — Les personnes

### Les electriciens dusine

<figure class="field-figure field-figure-row">
  <img src="/field/field-coal-yard-winter.jpg" alt="Stock de charbon sous la neige avec convoyeurs" loading="lazy" />
  <img src="/field/field-plant-electricians.jpg" alt="Deux travailleurs en EPI sur equipement industriel" loading="lazy" />
  <img src="/field/field-bench-repair.jpg" alt="Composants electroniques demontes sur etabli" loading="lazy" />
  <figcaption>L'operation, les personnes, l'etabli. Les electriciens d'usine demontaient les equipements pour les reparer plutot que les remplacer.</figcaption>
</figure>

L'un des premiers sites vraiment industriels sur lesquels j'ai travaille etait une exploitation de charbon metallurgique en terrain montagneux, avec usine de traitement, concasseur, briseur et chargement ferroviaire. Trois electriciens d'usine. Les meilleurs parmi les meilleurs. Leur capacite a depanner n'importe quoi — mecanique, electrique, reseau, peu importe — venait de gens qui trouvaient plus interessant de corriger eux-memes le probleme que d'attendre quelqu'un d'autre.

Il m'a fallu gagner leur confiance avant qu'ils me laissent aider. Une fois cela fait, nous parlions tous les jours. Le site tournait parce qu'ils le faisaient tourner. La technologie, y compris la plus recente pour l'epoque, fonctionnait parce que les personnes les plus proches d'elle etaient aussi celles qui savaient la reparer.

> Ce a quoi l'architecture repond : l'operateur est nomme. L'architecture est pour lui. Pas pour l'integrateur, pas pour l'IT, pas pour l'editeur. Ces electriciens etaient l'architecture avant qu'elle ne soit ecrite : ils possedaient le substrat, le comprenaient, le reparaient, et accordaient leur confiance de facon exigeante. La boite est la forme-artefact de ce qu'ils etaient deja comme personnes.

### La technicienne de montagne

<figure class="field-figure">
  <img src="/field/field-mountain-mine.jpg" alt="Routes de mine de montagne dans un terrain alpin" loading="lazy" />
  <figcaption>Le type de pays dans lequel la technicienne de montagne roulait jusqu'aux sites. Pas le site precis.</figcaption>
</figure>

La technicienne IT d'un site soeur etait d'une vingtaine d'annees plus agee que moi. Une grande partie de son travail consistait a conduire jusqu'a des sites isoles dans des conditions qui auraient empeche la plupart des gens de sortir de chez eux. Elle etait brillante a tous les aspects du travail : support, reseau, contraintes de terrain, confrontation directe, pression operationnelle.

J'ai essaye de recruter des remplaçants comparables. Je n'ai pas reussi avant la faillite du site. La raison est simple : la plupart des profils IT ne veulent pas monter a la mine dans le blizzard, installer un pont radio sur un toit de 27 metres, ou travailler avec des operateurs furieux pendant qu'ils depannent. Pour la bonne personne, la mine est un paradis. Pour la plupart des recrutements IT, c'est un cauchemar.

> Ce a quoi l'architecture repond : l'architecture est pour les personnes deja dans la montagne. Elle ne suppose pas un bureau, ni un backhaul permanent, ni un help desk au bout du couloir. Elle suppose une personne sur site, avec les outils pour faire le travail elle-meme et la documentation pour le faire correctement. Elle suppose aussi que le reseau doit etre lisible pour quiconque s'en approche.

### Lingenieur senior systemes de controle

<figure class="field-figure">
  <img src="/field/field-control-room.jpg" alt="Salle de controle industrielle vintage avec schema de procede" loading="lazy" />
  <figcaption>Une salle de controle du type dont la configuration n'existe que dans la tete d'un seul ingenieur.</figcaption>
</figure>

Presque chaque usine en a un. C'est lui qui a configure les switches quand la ligne a ete construite, qui sait ou vont les cables et quels interverrouillages traversent quels segments. Quand la ligne tombe a deux heures du matin, c'est lui qu'on appelle. Il est aussi le point unique de defaillance.

Il n'est pas un heros par choix. Il l'est par accumulation. Vingt ans a etre celui qui savait, sans que personne d'autre n'apprenne, puis encore vingt ans. Il est epuise. Il approche de la fin de sa carriere. Son successeur n'a pas ete choisi, pas ete forme, et n'est souvent meme pas embauche.

> Ce a quoi l'architecture repond : la competence distribuee. La boite n'a pas besoin d'un heros. Elle execute une configuration declaree a partir d'un artefact signe. Le catalogue de roles est decouvrable. Le catalogue de contrats est decouvrable. La chaine d'audit est interrogeable. Plusieurs operateurs peuvent etre formes a l'exploitation de la boite, parce qu'elle se presente de la meme facon dans chaque usine et a chaque niveau.

---

## Partie III — La realite organisationnelle

### Linfrastructure invisible

<figure class="field-figure">
  <img src="/field/field-automotive-line.jpg" alt="Chassis sur une ligne d'assemblage automobile" loading="lazy" />
  <figcaption>Une ligne automobile du type dont des centaines d'interverrouillages longue distance reposent sur une infrastructure IT invisible.</figcaption>
</figure>

Le guide canonique de conception EtherNet/IP pour la fabrication discrete explique pourquoi les VLAN compliquent les reseaux de controle. Ses propres exemples, pourtant, montrent des usines automobiles avec des centaines d'interverrouillages longue distance utilisant des garanties de priorite a travers un reseau d'entreprise. Lisez bien : cette priorite etait fournie par l'IT, via des marquages et une infrastructure que le cote OT ne voyait ni ne controlait.

Le livre n'a pas tort sur le resultat recherche. Il voulait un reseau qui fasse ce dont le controle a besoin sans forcer l'ingenieur controle a penser aux couches sous-jacentes. Ce resultat a ete obtenu parce qu'il existait, en dessous, une excellente infrastructure IT operant invisiblement. La plupart des usines n'ont pas cela. Elles ont le pire des deux mondes : une infrastructure invisible qui ne marche pas assez bien.

> Ce a quoi l'architecture repond : la boite possede le substrat dont les operations dependent. Pas invisiblement. Lisiblement. Chaque conduit est contractualise. Chaque contrat est dans le catalogue. Le catalogue est interrogeable. L'operateur ne consomme plus une infrastructure IT qu'il ne peut pas voir.

### Le centre de cout et le centre de profit

L'IT est un centre de cout dans la plupart des organisations. Les centres de cout sont mesures sur le cout. Leur comportement naturel est de refuser ce qui augmente ce cout, meme si ce qui est refuse est necessaire. La production est un centre de profit. Elle optimise la production ; la fiabilite, la maintenabilite et la simplicite viennent avant tout le reste.

Dans l'organisation type, ce desalignement apparait notamment au niveau des patchs et des fenetres de maintenance. L'IT patche parce que c'est son objectif. Le patch redemarre un switch pendant trente secondes. Dans un bureau, c'est invisible. Sur une ligne de production, cela peut perdre le reste du poste. L'IT a eu raison selon ses indicateurs. Les operations ont perdu un poste. Ce n'est pas l'une des deux equipes qui est mal reglee. C'est la structure.

> Ce a quoi l'architecture repond : la boite est du cote operateur de la frontiere. Elle n'est pas patchee selon le calendrier de l'IT. Elle est mise a jour via l'orchestration de mise a jour, sur l'horloge de l'operateur, avec l'approbation de l'operateur, contre l'etat intentionnel de l'operateur.

### Le revenu recurrent de lintegrateur

Une usine appelle un integrateur. L'integrateur construit le reseau. Il ne documente pas la configuration, ne remet pas les mots de passe, ne forme personne, puis part. Quelques mois plus tard, quelque chose casse. L'usine ne peut pas corriger. L'usine rappelle l'integrateur. L'integrateur facture a l'heure. Le correctif prend un apres-midi. L'usine paie.

Ce n'est pas toujours une combine deliberee. Les integrateurs travaillent avec de faibles marges, des clients qui veulent des projets peu chers au depart, et comptent sur le service recurrent pour que le modele economique tienne. Les individus sont souvent tres competents. Mais les forces du marche produisent quand meme une dependance.

> Ce a quoi l'architecture repond : la boite est construite de sorte que l'opacite ne soit pas une option. La configuration est un artefact declaratif signe dans une grammaire contrainte. Le catalogue de contrats est obligatoire et decouvrable. La chaine d'audit est liee par hachage et interrogeable. Un integrateur peut construire le deploiement, mais il ne peut pas laisser le deploiement dans un etat ou lui seul peut le lire.

### Aucun siege a la table

Dans la plupart des grandes organisations, il y a un CIO, un CTO et un CISO. Tous trois representent les interets IT au niveau executif. Il n'y a generalement pas de chief operations technology officer equivalent.

Quand le comite executif discute d'infrastructure, le CIO parle au nom de la technologie. Le responsable d'usine, le directeur operations, l'ingenieur controle senior — ils ne sont pas dans la salle. Les decisions sur les reseaux, la securite, les fournisseurs ou les budgets descendent ensuite jusqu'au plancher comme des faits accomplis. Les operations decouvrent ces decisions lorsque leurs consequences arrivent.

> Ce a quoi l'architecture repond : l'architecture existe *comme* position des operations. C'est un artefact documente, citable, public, qu'elles peuvent apporter en comite executif et dire : voici ce dont nous avons besoin, voici comment cela fonctionne, voici ce que cela coute, voici ce que cela rapporte. Ce n'est pas un pitch editeur. Ce n'est pas un livrable de consultant. C'est une specification CC BY-SA 4.0 que les operations peuvent utiliser comme terrain d'argument.

---

## Partie IV — Ce a quoi larchitecture repond

La boite est faconnee par Le Terrain. Les scenes ne sont pas de la colere. Ce ne sont pas des griefs. Ce sont des conditions. Les operations industrielles existent dans ces conditions, chaque jour, dans chaque usine, dans chaque industrie. Ces conditions ne disparaitront pas. L'architecture est ce qui fait qu'elles cessent largement de compter.

**La connectivite est un luxe.** La cabane est dans un champ de mais. La mine etait dans les montagnes. Beaucoup d'operations sont cellulaires, satellitaires ou totalement deconnectees pendant des heures ou des jours. L'unite fonctionne seule, indefiniment. Si la connectivite existe, elle se compose vers le haut. Si elle tombe, rien ne change sur site.

**Les operations construisent l'infrastructure dont elles ont besoin.** Toujours. Le tiroir verrouille, le routeur grand public, l'outil de support a distance permanent, la cabane du champ — ce ne sont pas des echecs de conformite. Ce sont les operations qui font ce qu'il reste a faire. La reponse de l'architecture est de leur donner une infrastructure officielle qui fait deja ce qu'il faut.

**L'operateur possede le substrat.** C'est la revendication porteuse. La boite, les donnees, l'historien, l'audit, la configuration, les contrats — tout cela vit sur le materiel de l'operateur, en sa possession, sous son controle. Les editeurs sont des consommateurs, pas des gatekeepers. Les integrateurs sont des constructeurs, pas des proprietaires-bailleurs. L'IT est un pair a une interface connue, pas une autorite superieure. Le substrat appartient a ceux qui travaillent dessus.

**L'ingenieur senior n'est pas un point unique de defaillance.** Configuration declarative. Catalogues decouvrables. La figure du heros est remplacee par le motif documente. Quand l'ingenieur senior part a la retraite, l'usine continue de fonctionner.

**La frontiere est appliquee par l'architecture.** Pas par la politique, la confiance ou une poignee de main. La boite termine Zero Trust du cote IT et commence Managed Trust du cote ACS, et cette transition est appliquee par le partitionnement interne a trois cotes, par le pare-feu noyau, par le systeme d'identite des charges, par le catalogue de contrats et par l'absence de tout ecouteur HTTP sur les NIC externes.

**Les normes appartiennent aux praticiens.** IEC 62443 n'est pas de la PI editeur. PERA+ n'est pas de la PI consultant. ISA-95 n'est pas une offre de service. L'architecture est l'instanciation prete pour le terrain de ces normes, pour les operateurs qui devraient les avoir mais qui ne les ont pas aujourd'hui.

---

L'architecture ne demande pas a la cabane du champ de cesser d'etre isolee. Elle demande a la cabane de cesser d'etre non documentee.

Elle ne demande pas a l'usine d'arreter les hotspots cellulaires. Elle demande que le hotspot soit un conduit contractualise, identifie et audite sur du materiel possede par l'operateur.

Elle ne demande pas au superviseur d'arreter de surveiller l'usine depuis sa tablette a la maison. Elle demande que ce chemin soit authentifie, identifie et enregistre, selon les termes de l'operateur.

Elle ne demande pas aux electriciens d'usine d'arreter d'etre ce qu'ils sont. Elle demande que l'architecture soit la leur.

Telles sont les conditions du Terrain. Le Probleme est ce qui fait obstacle. Notre Position est ce que nous tenons. Notre Philosophie est la facon dont nous y pensons. L'Architecture est la reponse.
