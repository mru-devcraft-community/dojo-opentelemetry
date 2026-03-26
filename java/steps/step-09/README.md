# Étape 09 — Sampling (Stratégies d'échantillonnage)

## Contexte

En production, tracer **100% des requêtes** peut être coûteux en stockage et en bande passante. Le **sampling** (échantillonnage) permet de ne conserver qu'un pourcentage des traces tout en gardant une vision représentative du système.

### Pourquoi échantillonner ?

- **Volume** : Une application à 10 000 req/s produit des millions de spans par heure
- **Coût** : Le stockage et le traitement des traces ont un coût
- **Performance** : L'export de chaque span consomme CPU et réseau
- **Pertinence** : En production stable, 99% des traces sont identiques

### Les stratégies de sampling

#### 1. AlwaysOn (toujours actif)
```
Toutes les requêtes → 100% des traces conservées
```
Idéal pour le développement et le debugging.

#### 2. AlwaysOff (toujours inactif)
```
Aucune trace conservée
```
Utile pour désactiver temporairement le tracing.

#### 3. TraceIdRatio (ratio basé sur le Trace ID)
```
TraceId hash % 100 < ratio → trace conservée
                           → trace ignorée
```
Exemple avec ratio 0.1 : ~10% des traces conservées. Le sampling est **déterministe** — le même Trace ID produira toujours la même décision.

#### 4. ParentBased (basé sur le parent)
```
Si le parent est échantillonné → enfant échantillonné
Si le parent n'est pas échantillonné → enfant non échantillonné
Si pas de parent → appliquer la stratégie root (TraceIdRatio par défaut)
```
C'est le sampler **par défaut** et le plus important en production. Il garantit la cohérence : soit toute la trace est conservée, soit rien.

### Head-based vs Tail-based sampling

- **Head-based** : La décision est prise au **début** de la trace (à la création). Simple et efficace, mais on ne peut pas décider en fonction du résultat.
- **Tail-based** : La décision est prise **après** la fin de la trace. Permet de garder 100% des traces en erreur, mais nécessite un composant intermédiaire (Collector en mode tail-sampling).

Le Spring Boot Starter utilise le **head-based sampling**.

## Objectifs

- Configurer le sampling à 50% via `application.yml`
- Observer l'effet du sampling sur le nombre de traces dans Jaeger
- Comprendre ParentBased et son importance
- Configurer le sampling via variables d'environnement
- Revenir à AlwaysOn pour la suite du DoJo
