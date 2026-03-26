# Indices — Étape 07

<details>
<summary>💡 Les exemplars n'apparaissent pas sur le graphique Prometheus dans Grafana</summary>

Vérifiez que :
1. L'option `enable_open_metrics: true` est présente dans la config du Collector (exporteur Prometheus)
2. Prometheus scrape bien le Collector avec les exemplars
3. Dans Grafana, quand vous faites une requête Prometheus, activez l'option **Exemplars** (bouton toggle dans les options de requête)
4. Utilisez une métrique de type histogramme (`orders_total_amount_bucket`) — les exemplars sont plus visibles sur les histogrammes

</details>

<details>
<summary>💡 Le lien exemplar → Jaeger ne fonctionne pas</summary>

Dans Grafana, la data source Prometheus doit être configurée avec un lien interne :

1. **Configuration** > **Data Sources** > **Prometheus**
2. Scrollez jusqu'à la section **Exemplars**
3. Activez **Internal link**
4. Sélectionnez **Jaeger** comme data source cible
5. Dans **Label name**, mettez `trace_id`
6. Dans **URL**, le pattern est : `${__value.raw}` (Grafana remplace par le TraceId)

Sauvegardez et ré-essayez.

</details>

<details>
<summary>💡 Les logs dans Loki ne sont pas cliquables vers Jaeger</summary>

Pour que Loki crée des liens vers Jaeger :

1. **Configuration** > **Data Sources** > **Loki**
2. Section **Derived fields**
3. Ajoutez un champ dérivé :
   - **Name** : `TraceId`
   - **Regex** : `"trace_id":"([a-f0-9]+)"`
   - **Internal link** : activé
   - **Data source** : Jaeger
   - **URL** : `${__value.raw}`

Alternativement, si les logs sont au format JSON, Grafana détecte automatiquement le champ `traceID`.

</details>

<details>
<summary>💡 Quelle est la différence entre corrélation et causalité ?</summary>

En observabilité :
- **Corrélation** = même TraceId → les événements font partie de la même requête
- **Causalité** = relation parent-enfant entre spans → l'un a causé l'autre

Les exemplars fournissent une **corrélation** : "cette valeur de métrique a été produite pendant cette trace".
Les spans parent-enfant montrent la **causalité** : "ce span a déclenché cet appel HTTP".

</details>

<details>
<summary>💡 Comment voir les exemplars dans Prometheus directement ?</summary>

Prometheus expose les exemplars via son API :

```bash
curl 'http://localhost:9090/api/v1/query_exemplars?query=orders_total_amount_bucket&start=2024-01-01T00:00:00Z&end=2025-01-01T00:00:00Z'
```

La réponse contiendra les exemplars avec leurs `traceID` et `spanID`.

</details>
