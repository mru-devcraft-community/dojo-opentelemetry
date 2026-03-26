# Indices — Étape 02

<details>
<summary>💡 Où placer le BOM dans le pom.xml ?</summary>

Le `<dependencyManagement>` se place au même niveau que `<dependencies>`, généralement juste avant :

```xml
<project>
  ...
  <properties>...</properties>

  <dependencyManagement>
    <dependencies>
      <!-- BOM ici -->
    </dependencies>
  </dependencyManagement>

  <dependencies>
    <!-- Dépendances ici -->
  </dependencies>
  ...
</project>
```

</details>

<details>
<summary>💡 Erreur de compilation après ajout des dépendances</summary>

Vérifiez que la version du BOM est correcte : `2.11.0`.

Lancez `mvn dependency:tree` pour vérifier la résolution des dépendances.

</details>

<details>
<summary>💡 Pas de traces après le changement</summary>

1. Vérifiez que vous n'utilisez plus le `-javaagent`
2. Vérifiez la configuration `otel` dans `application.yml` (attention à l'indentation YAML)
3. Consultez les logs de l'application — en cas de problème de connexion OTLP, vous verrez des warnings

</details>

<details>
<summary>💡 Configuration YAML — attention à l'indentation</summary>

Le YAML est sensible à l'indentation. Voici le format correct :

```yaml
otel:
  exporter:
    otlp:
      endpoint: http://localhost:4317
  resource:
    attributes:
      service.name: shoptrack-api
```

Chaque niveau d'indentation est de **2 espaces**. Pas de tabulations !

</details>

<details>
<summary>💡 Peut-on combiner Java Agent et Spring Boot Starter ?</summary>

**Non**, c'est déconseillé. L'utilisation simultanée des deux peut créer des conflits et une double instrumentation. Choisissez l'une ou l'autre approche.

</details>
