# Exemples de contrats de données

Exemples commentés de contrats dans le catalogue de contrats IIA. **Non normatifs** : l'architecture spécifie la *forme* de chaque dimension d'un contrat ; le format et les valeurs réels relèvent de la politique de l'exploitant. Les exemples ci-dessous utilisent YAML pour la lisibilité ; CUE, KCL, Dhall, JSON validé par JSON Schema et TOML sont tout aussi valides (voir *Implémentations de référence*).

Chaque entrée de catalogue contient :

- Un identifiant unique (`iia.contract.<scope>.<purpose>`)
- Une version sémantique (additif dans une version majeure ; un changement cassant exige un incrément de version majeure et une période de recouvrement)
- Un périmètre : `internal` (intra-boîte), `boundary` (inter-domaine), `device` (PLC / capteur / fieldbus / sans fil), `inbound` (artefacts récupérés par la boîte)
- La forme déclarée selon les dimensions de *Data Contracts* dans `internal-architecture.md`

Une communication qui ne correspond pas à une entrée du catalogue est **empêchée** (pare-feu + SPIFFE la bloquent) ou **signalée** (`contract.violation`).

---

## Exemple 1 — Contrat interne : collector -> lake

Contrat inter-zone entre `collect` et `lake`. Appliqué par le pare-feu noyau, l'émetteur d'identité de workload (SPIFFE) et le mTLS au niveau applicatif.

```yaml
contract:
  id: iia.contract.internal.collect_to_lake
  version: 1.2.0
  scope: internal

  source:
    spiffe_id: spiffe://iia.local/zone/collect/workload/protocol_collector
  destination:
    spiffe_id: spiffe://iia.local/zone/lake/workload/lake_writer

  allowed_operations:
    - WRITE_BATCH      # append par lots
    - WRITE_STREAM     # append unitaire

  transport:
    protocol: grpc
    over: mTLS
    bus_topic: null    # gRPC direct, pas médié par le bus

  cardinality: many-to-one

  failure_semantics:
    on_lake_unreachable: buffer_local
    buffer_max_records: 100000
    buffer_max_age: 30d
    on_buffer_full: drop_oldest_with_alarm

  payload:
    schema_ref: oneof[opcua_record, modbus_record, ethernet_ip_record, lorawan_record]
    max_size_kb: 64
    rate_limit_per_sec: 50000

  audit:
    every_attempt: false
    every_failure: true
    every_buffer_event: true
```

Notes :

- Les identités SPIFFE sont liées à des hashes d'image attestés par TPM. Un workload démarré depuis une image non signée ne peut pas obtenir de SVID et ne peut pas parler sous ce contrat.
- `failure_semantics` déclare comment le collecteur se comporte lorsque le lake est indisponible, ce qui est pertinent pendant le fonctionnement déconnecté et la reconnexion.
- `audit.every_failure: true` garantit que `contract.violation` capte les tentatives qui violent le catalogue.

---

## Exemple 2 — Contrat de frontière : box -> BI lake (batch)

Contrat de frontière externe entre l'edge publisher de la boîte et un consumer BI lake amont à une portée plus large. Bilatéral : les deux côtés s'engagent.

```yaml
contract:
  id: iia.contract.boundary.bi_lake.batch
  version: 2.0.0
  scope: boundary

  publisher:
    role: publish
    spiffe_id: spiffe://iia.local/zone/publish/workload/edge_publisher
  consumer:
    organization: enterprise-bi
    spiffe_id: spiffe://enterprise.example/iia/consumer/bi_ingest
    contact_path: oncall://enterprise-bi/ingest-pipeline

  edge_profile:
    type: bi_lake_batch
    transport:
      protocol: s3+mtls
      endpoint: s3://enterprise-bi-lake/iia-zone-a/
      mTLS_trust_root: enterprise-trust-root-v3
    schedule: hourly_aligned
    catalog_format: iceberg

  data_inventory:
    namespaces:
      - process.*
      - health.*
    excludes:
      - security.*
      - audit.*

  freshness:
    native_resolution_ms: 100
    published_resolution: hourly_aggregate
    publication_lag_max: 90m

  retention:
    on_box_minimum: 30d
    on_box_aging_policy: oldest_first_after_acked

  order_and_sequencing:
    sequence_per_service: monotonic
    service_id_format: uuid_v7

  delivery_semantics:
    mode: at_least_once
    dedupe_via: sequence_number_per_service
    consumer_dedupe_required: true

  reconnect_and_gap:
    on_box_buffer: 30d
    consumer_gap_detection: sequence_discontinuity
    watermark_endpoint: api://this-box/contract/iia.contract.boundary.bi_lake.batch/watermark

  version_evolution:
    additive_within_major: true
    breaking_requires_major_bump: true
    deprecation_overlap_min: 90d

  authentication:
    publisher_credentials_rotation: 7d
    consumer_credentials_issuer: enterprise-trust-root-v3

  audit_binding:
    consumer_must_validate_chain_head: true
    chain_head_publication_period: 1m
    failure_to_validate: contract_violation

  quota:
    rows_per_hour_max: 50000000
    payload_size_max_mb: 256

  upstream_obligations:
    connectivity:
      bandwidth_min_mbps: 50
      latency_max_p99_ms: 500
      uptime_min: 99.5%
    response:
      ack_window_max_seconds: 30
      query_response_max_seconds: 5
    incident_response:
      on_call_path: pagerduty://enterprise-bi/p2
      response_time_max: 4h
      escalation: pagerduty://enterprise-bi-director/p1
    capacity:
      sustained_rows_per_hour: 50000000
      burst_rows_per_hour: 200000000

  raci:
    connectivity_loss:
      acs_responsible: site-noc-team
      acs_accountable: site-ops-manager
      upstream_responsible: enterprise-network-team
      upstream_accountable: enterprise-cio
      consulted: [acs-architecture-board]
      informed: [audit-team]
    schema_mismatch:
      acs_responsible: site-data-engineering
      acs_accountable: site-ops-manager
      upstream_responsible: enterprise-bi-engineering
      upstream_accountable: enterprise-data-director
      consulted: [acs-architecture-board, regulator-liaison]
      informed: [audit-team]
    audit_chain_mismatch:
      acs_responsible: site-security-team
      acs_accountable: site-security-manager
      upstream_responsible: enterprise-bi-security
      upstream_accountable: enterprise-ciso
      consulted: [forensics-team]
      informed: [legal, audit-team]
    capacity_exhaustion:
      acs_responsible: site-data-engineering
      acs_accountable: site-ops-manager
      upstream_responsible: enterprise-bi-engineering
      upstream_accountable: enterprise-data-director
      consulted: []
      informed: [acs-architecture-board]
    cert_expiry:
      acs_responsible: site-security-team
      acs_accountable: site-security-manager
      upstream_responsible: enterprise-pki-team
      upstream_accountable: enterprise-ciso
      consulted: []
      informed: [audit-team]
```

Notes :

- `upstream_obligations` est formulé en chiffres concrets : bande passante, latence, disponibilité, fenêtres d'accusé de réception, temps de réponse. Les adjectifs (« rapide », « fiable ») sont des défauts de déploiement.
- `raci` nomme des rôles, pas « l'équipe ». L'architecture exige des responsables désignés.
- Le contrat est publié, pas implicite ; le consumer peut le récupérer sur un point d'accès bien connu avant de s'abonner ou de requêter.

---

## Exemple 3 — Contrat d'équipement : flux de tags PLC

Contrat pour un échange avec un équipement ACS : un PLC précis publiant des valeurs de tags via OPC UA.

```yaml
contract:
  id: iia.contract.device.plc_compressor_unit_3.opcua
  version: 1.0.0
  scope: device

  device:
    type: plc
    vendor: '<vendor>'
    model: '<model>'
    serial: '<redacted>'
    location: site/plant_a/area_3/compressor_unit_3

  collector:
    role: collect
    spiffe_id: spiffe://iia.local/zone/collect/workload/opcua_subscriber

  transport:
    protocol: opcua
    endpoint: opc.tcp://10.31.4.42:4840
    security: SignAndEncrypt-Basic256Sha256
    user_auth: x509_client_cert

  observation_mode:
    mode: subscription
    sample_rate_ms: 100
    queue_depth: 100

  declared_tags:
    - id: compressor_unit_3.discharge_pressure
      type: float32
      unit: psi
      sample_rate_ms: 100
    - id: compressor_unit_3.suction_pressure
      type: float32
      unit: psi
      sample_rate_ms: 100
    - id: compressor_unit_3.motor_current
      type: float32
      unit: amperes
      sample_rate_ms: 100
    - id: compressor_unit_3.run_state
      type: enum
      values: [stopped, starting, running, stopping, faulted]
      sample_rate_ms: 1000

  failure_semantics:
    on_device_unreachable: log_and_alarm
    on_subscription_lost: reconnect_with_exponential_backoff
    on_unknown_tag: emit_contract_violation
    on_undeclared_value_range: emit_contract_violation

  io_attestation:
    enabled: true
    cross_check_via: io-master
    tolerance_pct: 0.5
    on_divergence: emit_attestation_io_event
```

Notes :

- `declared_tags` est l'inventaire des données à la granularité de l'équipement. Un tag observé mais non déclaré -> `contract.violation`. Un tag déclaré qui cesse d'apparaître -> événement SLA.
- `io_attestation` active l'IO master redondant pour recouper les valeurs reportées par l'équipement ; les écarts émettent `attestation.io`.

---

## Exemple 4 — Contrat d'E/S sans fil : champ de capteurs LoRaWAN

Contrat pour une population de capteurs LoRaWAN observée via une gateway LoRaWAN. Classification explicite « E/S uniquement, jamais contrôle » conformément à la règle terrain.

```yaml
contract:
  id: iia.contract.device.lorawan.field_env_sensors.zone_a
  version: 1.0.0
  scope: device
  classification: io_only_never_control

  gateway:
    type: lorawan_gateway
    network_server: lns://lorawan-ns.local:8080
    spiffe_id: spiffe://iia.local/zone/collect/workload/lorawan_subscriber

  device_class:
    application_id: field-env-zone-a
    sensor_type: temperature_humidity
    expected_count: 24

  expected_cadence:
    nominal_minutes: 5
    silence_alert_minutes: 30

  observation_mode:
    mode: mqtt_subscription
    topic_prefix: application/field-env-zone-a/+/up
    qos: 1

  declared_payload:
    fields:
      - name: temperature_c
        type: float32
        range: [-40, 85]
      - name: humidity_pct
        type: float32
        range: [0, 100]
      - name: battery_pct
        type: int8
        range: [0, 100]

  failure_semantics:
    on_silence_alert: emit_health_event
    on_payload_out_of_range: emit_contract_violation
    on_unknown_device: emit_contract_violation

  retention:
    on_box_minimum: 30d

  use_constraints:
    not_for_control: true
    not_for_safety_interlock: true
    advisory_only: true
```

Notes :

- `classification: io_only_never_control` peut être imposé en aval : les consumers recevant cette classe de données sont tenus par leurs propres contrats de ne pas les utiliser pour des boucles de contrôle ou des interverrouillages de sécurité.
- `expected_cadence.silence_alert_minutes` définit ce qui compte comme un capteur « manquant » pour les besoins de SLA.

---

## Exemple 5 — Contrat de frontière : serveur MCP consommant i3X (chemin agent IA)

Contrat de frontière externe entre l'API de requête structurée de la boîte (parlant CESMII i3X) et un serveur MCP aval fonctionnant à une portée plus large. Le serveur MCP encapsule i3X et l'expose comme outils / ressources MCP à des agents IA. Le serveur MCP vit hors boîte parce que le transport canonique Streamable HTTP de MCP entre en conflit avec la règle « pas de HTTP à la frontière ».

```yaml
contract:
  id: iia.contract.boundary.mcp_server.i3x_query
  version: 1.0.0
  scope: boundary

  publisher:
    role: api
    spiffe_id: spiffe://iia.local/zone/api/workload/i3x_query_server

  consumer:
    organization: enterprise-ai
    role: mcp_server
    spiffe_id: spiffe://enterprise.example/iia/consumer/mcp_bridge
    contact_path: oncall://enterprise-ai/mcp-bridge

  edge_profile:
    type: structured_query_api
    standard: cesmii_i3x
    standard_version: v1
    transport:
      protocol: mtls
      endpoint: api://this-box/i3x/v1
      mTLS_trust_root: enterprise-trust-root-v3

  data_inventory:
    namespaces:
      - process.*
      - health.*
    excludes:
      - security.*
      - audit.*
      - contract.*

  freshness:
    native_resolution_ms: 100
    query_latency_max_p99_ms: 500

  delivery_semantics:
    mode: query_response
    consistency: eventual_with_watermark

  query_constraints:
    max_query_complexity: 100
    max_response_rows: 100000
    rate_limit_qps: 50
    timeout_seconds: 30

  authentication:
    mtls_required: true
    consumer_credentials_rotation: 7d

  use_constraints:
    consumer_must_attribute_data_to_box: true
    consumer_may_relay_to_ai_agents: true
    consumer_must_log_queries_for_audit: true
    not_for_control: true

  upstream_obligations:
    response:
      ack_window_max_seconds: 5
      query_response_max_seconds: 5
    incident_response:
      on_call_path: oncall://enterprise-ai/mcp-bridge
      response_time_max: 8h

  raci:
    query_failure:
      acs_responsible: site-data-engineering
      acs_accountable: site-ops-manager
      upstream_responsible: enterprise-ai-engineering
      upstream_accountable: enterprise-data-director
      consulted: []
      informed: [audit-team]
    rate_limit_exceeded:
      acs_accountable: site-ops-manager
      upstream_responsible: enterprise-ai-engineering
      upstream_accountable: enterprise-data-director
    ai_agent_misuse:
      acs_responsible: site-security-team
      acs_accountable: site-security-manager
      upstream_responsible: enterprise-ai-trust-and-safety
      upstream_accountable: enterprise-ciso
      consulted: [legal, regulator-liaison]
      informed: [audit-team]
```

Notes :

- Le serveur MCP est le consumer ; les agents IA sont en aval du serveur MCP, pas des consumers directs de la boîte. La règle « pas de HTTP à la frontière » reste intacte parce que la boîte n'expose qu'i3X sur mTLS.
- `use_constraints.consumer_may_relay_to_ai_agents: true` rend explicite dans le contrat le chemin de consommation par l'IA, au lieu de le laisser implicite.
- `not_for_control: true` contraint l'usage aval : le serveur MCP, et donc les agents IA, peuvent lire mais ne peuvent pas utiliser cette classe de données pour des décisions de boucle de contrôle.
- La ligne RACI `ai_agent_misuse` nomme le trust-and-safety comme responsable côté amont. L'accès piloté par IA est suffisamment nouveau pour justifier son propre mode de défaillance nommé.

---

## Exemple 6 — Contrat entrant : pull de configuration

L'ingestion de configuration par la boîte elle-même, formulée comme contrat sous la règle d'universalité. La boîte récupère des artefacts de configuration signés depuis l'amont ; le contrat spécifie racines de confiance, grammaire, comportement de validation et sémantiques d'approbation.

```yaml
contract:
  id: iia.contract.inbound.configuration_pull
  version: 1.0.0
  scope: inbound

  puller:
    role: cfg
    spiffe_id: spiffe://iia.local/zone/cfg/workload/config_puller

  source:
    pull_target: https://config-repo.enterprise.example/iia-fleet/box-id-X.cue.signed
    schedule: every_15m
    on_connectivity_restore: true
    transport: mtls
    mTLS_trust_root: enterprise-config-trust-root-v3

  artifact_validation:
    signature_required: true
    signing_keys:
      - enterprise-config-key-v3
      - enterprise-config-key-v4
    grammar: cue
    grammar_version: 0.9
    max_size_kb: 256

  applier:
    requires_approval: true
    approval_artifact_source: https://config-repo.enterprise.example/iia-fleet/approvals/
    approval_grammar: cue
    approval_signing_keys:
      - enterprise-approver-key-A
      - enterprise-approver-key-B
    two_person_integrity: true
    approval_max_age: 24h

  failure_semantics:
    on_signature_invalid: reject_and_alarm
    on_parse_failure: reject_and_alarm
    on_validation_failure: reject_and_stage_for_review
    on_apply_failure: rollback_and_alarm

  attestation:
    running_vs_staged_check_period: 5m
    on_divergence: emit_attestation_config_event
```

Notes :

- C'est le contrat qui gouverne l'ingestion de configuration par la boîte elle-même, donc un contrat au sens plein de la règle d'universalité (toute communication est contractuelle).
- `applier.two_person_integrity: true` exige deux signatures distinctes d'opérateurs sur chaque artefact d'approbation (contrôle FR2 SR 2.4).
- `artifact_validation.grammar: cue` choisit la grammaire de configuration ; d'autres déploiements peuvent spécifier KCL, Dhall, JSON validé par JSON Schema, etc.

---

## Mécanique du catalogue

L'ensemble complet des contrats forme le **catalogue de contrats**. Le catalogue est lui-même un artefact signé et versionné — de même forme que l'artefact de configuration, validé par le même parseur et appliqué par le même applier gouverné. Ajouter un contrat, en déprécier un ou en faire évoluer un existant est un changement de configuration qui passe par le pipeline standard de la boîte : verify -> parse -> validate -> stage -> authorize -> apply.

Les entrées du catalogue sont accessibles via l'API de requête structurée à des points d'accès bien connus :

| Endpoint | Retourne |
|---|---|
| `api://this-box/contract/<id>` | Version actuelle du contrat nommé |
| `api://this-box/contract/<id>/history` | Toutes les versions, avec leur statut de dépréciation |
| `api://this-box/contract/<id>/watermark` | Watermark de réconciliation par consumer |
| `api://this-box/catalog/manifest` | Index de tous les contrats et de leurs versions actuelles |
| `api://this-box/catalog/raci/<event>` | Entrées de matrice RACI pour un mode de défaillance donné, à travers tous les contrats qui le nomment |

Les exploitants branchent le catalogue dans leur CI/CD, leurs systèmes de réponse à incident et l'onboarding de leurs consumers ; le catalogue est l'unité d'intégration qui rend explicite le reste de la relation OT/IT.
