# Indices — Étape 09

<details>
<summary>💡 Le sampling ne semble pas fonctionner — toutes les traces apparaissent</summary>

Vérifiez :
1. Que la configuration YAML est correcte avec l'indentation :
```yaml
otel:
  traces:
    sampler: traceidratio
    sampler-arg: "0.5"
```

2. Que vous avez **relancé** l'application après la modification
3. Que vous n'avez pas de variable d'environnement qui override (`OTEL_TRACES_SAMPLER`)

</details>

<details>
<summary>💡 Aucune trace n'apparaît (sampling trop agressif ?)</summary>

Vérifiez votre ratio :
- `0.5` = 50% des traces
- `0.05` = 5% des traces
- `0.0` = aucune trace

Si vous avez mis `0.01` et fait seulement 10 requêtes, il est possible qu'aucune ne soit échantillonnée. Augmentez le nombre de requêtes ou le ratio.

La valeur de `sampler-arg` doit être une **chaîne** entre guillemets : `"0.5"`.

</details>

<details>
<summary>💡 Comment fonctionne le sampling déterministe ?</summary>

Le TraceIdRatio sampler est **déterministe** : pour un Trace ID donné, la décision sera toujours la même.

Le calcul :
1. Prend les 8 derniers octets du Trace ID
2. Les interprète comme un nombre
3. Compare avec le seuil (ratio × valeur max)

Cela signifie que :
- Si le service A décide d'échantillonner une trace, le service B fera la même décision pour le même Trace ID
- Le résultat est reproductible

</details>

<details>
<summary>💡 Quelle stratégie utiliser en production ?</summary>

Recommandations :
- **Développement** : `always_on` → 100% des traces pour le debugging
- **Staging** : `traceidratio 0.5` → 50% pour du test réaliste
- **Production faible trafic** : `traceidratio 0.1` → 10%
- **Production fort trafic** : `traceidratio 0.01` → 1%

Toujours utiliser `parentbased_` devant pour garantir la cohérence des traces distribuées.

Pour garder 100% des erreurs, il faut du **tail-based sampling** au niveau du Collector.

</details>

<details>
<summary>💡 Les variables d'environnement ne sont pas prises en compte</summary>

Les variables d'environnement OTel doivent être définies **avant** le lancement de l'application :

```bash
# Correct
OTEL_TRACES_SAMPLER=traceidratio OTEL_TRACES_SAMPLER_ARG=0.5 mvn spring-boot:run

# Ou avec export
export OTEL_TRACES_SAMPLER=traceidratio
export OTEL_TRACES_SAMPLER_ARG=0.5
mvn spring-boot:run
```

Si `application.yml` définit aussi le sampler, la variable d'environnement peut être mappée via :
```yaml
otel:
  traces:
    sampler: ${OTEL_TRACES_SAMPLER:always_on}
    sampler-arg: ${OTEL_TRACES_SAMPLER_ARG:1.0}
```

</details>
