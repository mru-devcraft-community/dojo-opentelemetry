# Indices — Étape 10

<details>
<summary>💡 Les métriques orders_created_total n'apparaissent pas dans Prometheus</summary>

Vérifiez que :
1. L'application tourne et a reçu au moins une requête de création de commande
2. Les métriques OTel sont bien exportées vers le Collector (vérifiez les logs du Collector)
3. Prometheus scrape le Collector : http://localhost:9090/targets
4. Le nom de la métrique peut avoir des underscores au lieu de points : `orders_created_total` au lieu de `orders.created`

OpenTelemetry convertit automatiquement les `.` en `_` pour Prometheus.

</details>

<details>
<summary>💡 histogram_quantile retourne NaN</summary>

`histogram_quantile` retourne NaN quand :
1. Il n'y a pas assez de données — générez plus de requêtes
2. L'intervalle `[5m]` est trop court — essayez `[15m]`
3. Les noms de métriques ont changé avec la version d'OTel

Vérifiez les noms exacts dans Prometheus : http://localhost:9090/graph
Tapez `orders` et regardez l'auto-complétion.

</details>

<details>
<summary>💡 Le dashboard provisionné n'apparaît pas</summary>

Vérifiez :
1. Le fichier `dashboard-provider.yml` est dans `infra/grafana/provisioning/dashboards/`
2. Le fichier JSON du dashboard est dans le même dossier
3. Le volume Docker est correctement monté
4. Redémarrez Grafana : `docker compose restart grafana`
5. Vérifiez les logs : `docker compose logs grafana | grep -i "provision"`

</details>

<details>
<summary>💡 Comment trouver le bon nom de métrique ?</summary>

Allez dans Prometheus (http://localhost:9090) et utilisez l'explorateur de métriques :
1. Tapez un préfixe dans le champ de requête (ex: `orders`, `http_server`)
2. L'auto-complétion montre les métriques disponibles
3. Cliquez sur une métrique pour voir ses labels

Les métriques HTTP auto-instrumentées par OTel suivent les conventions sémantiques :
- `http_server_request_duration_seconds` — durée des requêtes
- `http_server_active_requests` — requêtes en cours

</details>

<details>
<summary>💡 Comment configurer les seuils de couleur dans un panel Stat ?</summary>

1. Dans l'éditeur du panel, onglet à droite
2. Section **Thresholds**
3. Ajoutez des seuils :
   - Base (vert) : 0
   - Orange : 1
   - Rouge : 5
4. Les couleurs changent automatiquement selon la valeur

</details>

<details>
<summary>💡 Le JSON du dashboard est très long — comment le simplifier ?</summary>

Le JSON exporté de Grafana contient beaucoup de métadonnées. Les champs essentiels sont :
- `panels[]` : la liste des panels
- `templating` : les variables
- `time` : la plage temporelle par défaut
- `title` : le nom du dashboard

Vous pouvez supprimer `__requires`, `__inputs` et `id` (sera auto-généré).

</details>
