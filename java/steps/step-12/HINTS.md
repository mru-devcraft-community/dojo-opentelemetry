# Indices — Étape 12

<details>
<summary>💡 SigNoz ne démarre pas — erreur de port</summary>

Les ports 4317 et 4318 sont peut-être déjà utilisés par le Collector OTel de l'infra de base.

Solutions :
1. Arrêtez la stack de base : `docker compose down`
2. Ou modifiez les ports dans `docker-compose-signoz.yml` :

```yaml
otel-collector:
  ports:
    - "4327:4317"   # gRPC sur un port différent
    - "4328:4318"   # HTTP sur un port différent
```

N'oubliez pas d'adapter `application.yml` :
```yaml
otel:
  exporter:
    otlp:
      endpoint: http://localhost:4327
```

</details>

<details>
<summary>💡 SigNoz est lent à démarrer</summary>

SigNoz nécessite ClickHouse, qui peut prendre 30 à 60 secondes pour s'initialiser.

Vérifiez le statut :
```bash
docker compose -f docker-compose-signoz.yml ps
docker compose -f docker-compose-signoz.yml logs -f
```

Attendez que tous les services soient `healthy` ou `running`.

Si vous avez très peu de RAM disponible (< 4 Go), SigNoz peut avoir du mal à démarrer. Fermez d'autres applications ou augmentez la RAM allouée à Docker.

</details>

<details>
<summary>💡 Les données n'apparaissent pas dans SigNoz</summary>

Vérifiez :
1. L'application pointe vers le bon endpoint OTLP (port correct)
2. Le Collector SigNoz est bien démarré : `docker compose -f docker-compose-signoz.yml ps`
3. Vérifiez les logs du Collector SigNoz :
   ```bash
   docker compose -f docker-compose-signoz.yml logs otel-collector
   ```
4. Attendez 15-30 secondes après avoir généré des données

</details>

<details>
<summary>💡 Comment accéder à SigNoz ?</summary>

- URL par défaut : http://localhost:3301
- Au premier accès, créez un compte admin (email + mot de passe)
- Si vous utilisez un port différent, ajustez l'URL

</details>

<details>
<summary>💡 Peut-on utiliser SigNoz et la stack Jaeger+Grafana en même temps ?</summary>

Oui, en utilisant un **fan-out** dans le Collector OpenTelemetry :

```yaml
exporters:
  otlp/signoz:
    endpoint: signoz-otel-collector:4317
  otlp/jaeger:
    endpoint: jaeger:4317

service:
  pipelines:
    traces:
      exporters: [otlp/signoz, otlp/jaeger]
```

Cela permet de comparer les deux UIs avec les mêmes données.

Attention : cela double la bande passante et le stockage.

</details>

<details>
<summary>💡 Quand choisir SigNoz vs la stack séparée ?</summary>

**Choisissez SigNoz si** :
- Vous voulez une mise en place rapide
- Votre équipe est petite
- Vous préférez une UI unifiée
- Vous n'avez pas besoin de personnalisation avancée

**Choisissez la stack séparée si** :
- Vous avez des besoins avancés de dashboarding (Grafana)
- Vous utilisez déjà Prometheus
- Vous avez besoin de flexibilité maximale
- Vous avez une grande équipe d'infra/SRE

</details>
