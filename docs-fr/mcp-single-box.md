# Utiliser MCP avec une boîte unique

Démarrage rapide orienté exploitant pour le plus petit déploiement possible de consommation par agent IA : une boîte IIA, un serveur MCP, un client IA.

La règle architecturale « pas de HTTP à la frontière » signifie que le serveur MCP ne peut pas tourner sur la boîte. Dans un déploiement mono-boîte, « hors boîte » veut généralement dire **le poste de travail de l'exploitant** ou **un petit hôte annexe sur le réseau local**.

## Topologie

```
[ Poste de travail de l'exploitant / hôte annexe ]             [ La boîte IIA ]

  Client IA ──stdio ou────► Serveur MCP ──mTLS i3X──► NIC IT ──► ot.it.api
  (Claude Desktop,          (local, hors boîte        |              parle
   Cursor, agent            pont entre i3X            │              CESMII i3X
   MCP-aware custom)        et MCP)                   │
                                                      │
                                                      └── mTLS seulement ;
                                                          aucun listener HTTP
                                                          sur la boîte, jamais.
```

**Ce qui tourne où :**

- **Sur la boîte :** l'API de requête structurée (`ot.it.api`) parlant CESMII i3X sur mTLS via la NIC IT. Cela ne change rien à la spécification d'architecture.
- **Hors boîte (poste de travail de l'exploitant ou hôte annexe) :** le serveur MCP. Il détient une identité client mTLS autorisée par le catalogue de contrats de la boîte, exécute des requêtes i3X et expose les réponses comme outils / ressources MCP.
- **Client IA :** tout agent compatible MCP. Il communique avec le serveur MCP local via stdio (le plus protecteur de souveraineté) ou via HTTPS local (aucun trafic ne quitte la machine de l'exploitant).

La boîte ne parle jamais HTTP, n'expose jamais directement de point d'accès MCP et n'a jamais de listener entrant pour des agents IA. Le serveur MCP est un consommateur aval de i3X, exactement comme tout autre consommateur dans le motif des contrats de frontière.

## Ce dont l'exploitant a besoin

- D'une identité de serveur MCP, signée par la racine de confiance de l'exploitant (au format SPIFFE, par exemple `spiffe://<operator-domain>/iia/consumer/mcp_local`).
- D'une entrée de contrat dans le catalogue de la boîte autorisant cette identité à interroger i3X. Utilisez **l'Exemple 5** de [/fr/architecture/docs/sample-contracts/](/fr/architecture/docs/sample-contracts/) comme point de départ.
- D'une implémentation de serveur MCP capable de parler i3X côté source et MCP côté consommateur. Deux voies raisonnables :
  - Un **pont i3X -> MCP** générique (construit par l'exploitant ou par la communauté) ; le pont traduit les ressources i3X en outils et requêtes MCP.
  - Un serveur MCP sur mesure avec client i3X embarqué, configuré vers le point d'accès de la boîte.
- D'un client IA compatible MCP. Claude Desktop, Cursor, Continue, agents custom : n'importe quel client MCP fonctionne, puisque MCP est l'interface standard.

## Mise en place de bout en bout

La mise en place respecte tous les invariants IIA : chaque modification est un artefact de configuration signé, le parseur valide, l'exploitant approuve, l'applier applique.

### 1. Fournir l'identité du serveur MCP

Émettez un certificat client mTLS et une clé pour le serveur MCP à partir de la racine de confiance de l'exploitant. Intégrez l'identité SPIFFE :

```
spiffe://<operator-domain>/iia/consumer/mcp_local
```

Stockez le certificat et la clé sur le poste de travail ou l'hôte annexe. Traitez-les comme des secrets ; le chiffrement au repos hors boîte relève de l'exploitant.

### 2. Ajouter un contrat au catalogue

Rédigez une entrée de contrat en utilisant l'Exemple 5 (`iia.contract.boundary.mcp_server.i3x_query`) comme modèle. Renseignez :

- `consumer.spiffe_id` : l'identité SPIFFE émise à l'étape 1.
- `consumer.organization` : l'organisation de l'exploitant.
- `data_inventory.namespaces` : ce que l'agent IA a le droit de voir (généralement `ot.process.*` et `ot.health.*` ; explicitement *pas* `ot.security.*` ni `ot.audit.*`).
- `query_constraints.rate_limit_qps` : une valeur saine par défaut (par exemple 50 qps) ; augmentez si la charge IA l'exige.
- `use_constraints.not_for_control: true` : laissez cette valeur ; l'usage IA est consultatif, pas de contrôle.
- `raci.*` : nommez les rôles réels de l'exploitant (la ligne `ai_agent_misuse` en particulier doit désigner un responsable sécurité).

Enregistrez-le dans la source de vos artefacts de configuration (CUE / KCL / JSON validé par JSON Schema / YAML, selon la politique opérateur).

### 3. Pousser la mise à jour de configuration dans le pipeline standard

Cela passe par le cycle de vie normal des artefacts de configuration de la boîte :

```
edit (hors boîte) -> sign -> submit -> verify -> parse -> validate -> stage -> approve -> apply
```

Pour un déploiement mono-boîte, le pipeline est le même que pour une flotte ; seule l'audience est plus petite. Utilisez le canal de soumission prévu par le contrat de configuration entrant de la boîte (généralement un pull de bundle signé depuis un dépôt de configuration, ou une soumission directe via l'interface de management `ot.mgmt.ui`).

Quand le changement stagé est appliqué, le nouveau contrat apparaît dans le catalogue à :

```
api://this-box/contract/iia.contract.boundary.mcp_server.i3x_query
```

L'observateur d'attestation de configuration (`ot.attestation.config`) confirme que l'état en cours correspond à l'état stagé. La boîte est maintenant autorisée à accepter des requêtes i3X provenant de l'identité du serveur MCP.

### 4. Exécuter le serveur MCP

Installez / lancez le serveur MCP sur le poste de travail ou l'hôte annexe. Configurez-le avec :

- L'URL du point d'accès i3X de la boîte : `https://<box-it-nic-ip>:<port>/i3x/v1`
- Le certificat et la clé client mTLS de l'étape 1
- La racine de confiance du certificat serveur de la boîte (pour que le serveur MCP valide l'identité de la boîte)

Si vous exécutez le serveur MCP dans un conteneur (recommandé), utilisez :

```yaml
# exemple de quadlet podman — côté opérateur, PAS sur la boîte
[Container]
Image=operator-registry.local/iia-mcp-bridge:latest
Volume=/etc/iia-mcp/certs:/certs:ro
Environment=IIA_BOX_ENDPOINT=https://10.31.4.10:8443/i3x/v1
Environment=IIA_TRUST_ROOT=/certs/box-trust-root.pem
Environment=IIA_CLIENT_CERT=/certs/mcp-client.pem
Environment=IIA_CLIENT_KEY=/certs/mcp-client.key
Environment=MCP_TRANSPORT=stdio   # ou streamable_http pour HTTPS local
PublishPort=127.0.0.1:7900:7900   # seulement si transport HTTPS, localhost uniquement

[Service]
Restart=on-failure
```

Le serveur MCP récupère les données depuis i3X, met en cache les réponses de façon appropriée (selon la fraîcheur et la limite de débit du contrat) et expose :

- la navigation dans le catalogue i3X comme **ressources** MCP (inventaire des actifs, arbre des namespaces)
- les requêtes i3X comme **outils** MCP (`query_timeseries`, `get_asset_state`, `get_finding`, etc.)

### 5. Connecter le client IA

Configurez le client IA (Claude Desktop, Cursor, etc.) pour lancer le processus du serveur MCP ou se connecter à son point d'accès stdio / HTTPS local. Configuration MCP standard ; le client IA lui-même n'a besoin d'aucune connaissance spécifique à l'IIA.

L'agent IA peut maintenant interroger les données de la boîte. Chaque requête passe par le serveur MCP, puis par i3X, puis par l'application des contrats de la boîte. Chaque requête est auditée :

- Le serveur MCP journalise chaque requête pour l'audit (selon `use_constraints.consumer_must_log_queries_for_audit: true` dans le contrat).
- La télémétrie d'adhérence `ot.contract.delivery` de la boîte enregistre chaque requête i3X : envoyée, accusée, limitée.
- `ot.contract.violation` capture toute tentative hors contrat (par exemple, une requête sur `ot.security.*` si ce namespace a été exclu).
- La chaîne d'audit côté entrant de la boîte transporte chaque événement d'authentification pour l'identité du serveur MCP.

## Ce que vous n'obtenez pas, volontairement

- **Aucune API MCP en direct sur la boîte.** La boîte n'expose pas et n'exposera pas MCP directement. Si vous voulez MCP, vous exécutez un serveur hors boîte.
- **Aucun accès aux données de sécurité ou d'audit via ce chemin.** L'Exemple 5 exclut `ot.security.*`, `ot.audit.*` et `ot.contract.*`. Si vous voulez que l'IA assiste des investigations sécurité, rédigez un autre contrat avec un périmètre explicite et un RACI beaucoup plus étroit ; c'est une autre décision de déploiement avec une autre revue.
- **Aucune autorité de contrôle.** `not_for_control: true` est imposé par la sémantique du contrat. Les agents IA qui lisent les données ne doivent pas les utiliser pour des boucles de contrôle ou des interverrouillages de sécurité. Les contrats aval du serveur MCP envers ses consommateurs transportent cette contrainte à leur tour.

## Passer à l'échelle

Quand le déploiement dépasse la boîte unique :

- Le serveur MCP passe du poste de travail de l'exploitant à une broker box à portée plus large. Le chemin mTLS boîte -> broker ne change pas ; le chemin consommateur (broker -> agents IA) gagne les commodités du broker (HA, redondance, accès multi-tenant).
- Le serveur MCP consomme i3X depuis plusieurs boîtes ; chaque connexion est son propre contrat de frontière dans le catalogue de chaque boîte.
- La surface de requête de l'agent IA gagne une portée plus large ; l'agent peut demander « montre-moi l'état des actifs sur toutes les boîtes du site A » ; mais les contrats par boîte continuent à appliquer le périmètre et le RACI de chaque boîte.
- Le fractal se répète : un serveur MCP régional / corporate consomme depuis des serveurs MCP de site, et ainsi de suite.

Le déploiement mono-boîte est l'instance la plus simple du même motif qui fonctionne sur une flotte à l'échelle hyperscale.
