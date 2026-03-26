# Étape 02 — Configuration de l'exporter OTLP via Spring Boot Starter

## Contexte

Dans l'étape précédente, nous avons utilisé le **Java Agent** pour instrumenter l'application sans modifier le code. C'est puissant mais limité : impossible d'ajouter des spans personnalisés ou des attributs métier.

Dans cette étape, nous passons à l'approche **SDK** en utilisant le **OpenTelemetry Spring Boot Starter**. Cette librairie intègre OpenTelemetry directement dans votre application Spring Boot via les mécanismes standard de Spring (auto-configuration, `application.yml`).

### Comparaison des approches

| Critère | Java Agent | Spring Boot Starter |
|---------|-----------|-------------------|
| Modification du code | Aucune | Dépendance Maven + config |
| Instrumentation auto | ✅ HTTP, JDBC, RestTemplate... | ✅ HTTP, JDBC, RestTemplate... |
| Spans personnalisés | ❌ Non | ✅ Oui (API OpenTelemetry) |
| Configuration | Props système / env vars | `application.yml` |
| Déploiement | JAR agent séparé | Intégré au build |
| Contrôle | Limité | Total |

### Le Spring Boot Starter

Le starter `opentelemetry-spring-boot-starter` fournit :

- Auto-configuration de l'exporter OTLP
- Instrumentation automatique de Spring MVC, RestTemplate, JDBC
- Intégration avec Micrometer pour les métriques
- Configuration via `application.yml` ou `application.properties`
- Accès au SDK OpenTelemetry pour l'instrumentation manuelle (étapes suivantes)

### Le BOM (Bill of Materials)

Le BOM `opentelemetry-instrumentation-bom` garantit la cohérence des versions entre toutes les dépendances OpenTelemetry. Sans le BOM, vous devriez gérer manuellement la version de chaque artefact.

## Objectifs

- Ajouter les dépendances OpenTelemetry au projet Maven
- Configurer l'exporter OTLP dans `application.yml`
- Supprimer le Java Agent du lancement
- Vérifier que les traces sont toujours émises
