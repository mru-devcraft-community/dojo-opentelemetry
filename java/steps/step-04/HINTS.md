# Indices — Étape 04

<details>
<summary>💡 Comment utiliser setAttribute() ?</summary>

`setAttribute` accepte plusieurs types :

```java
span.setAttribute("key.string", "valeur");          // String
span.setAttribute("key.long", 42L);                  // long
span.setAttribute("key.double", 99.99);              // double
span.setAttribute("key.boolean", true);              // boolean
```

Pour les types numériques, attention aux conversions :
- `int` → castez en `long` : `(long) monInt`
- `float` → castez en `double` : `(double) monFloat`

</details>

<details>
<summary>💡 Comment utiliser addEvent() avec des attributs ?</summary>

Version simple :

```java
span.addEvent("MonEvent");
```

Avec des attributs :

```java
span.addEvent("MonEvent", Attributes.of(
    AttributeKey.stringKey("key1"), "valeur1",
    AttributeKey.longKey("key2"), 42L
));
```

`Attributes.of()` accepte jusqu'à 5 paires clé-valeur. Au-delà, utilisez `Attributes.builder()`.

</details>

<details>
<summary>💡 Quelle est la différence entre setStatus et recordException ?</summary>

- `setStatus(StatusCode.ERROR, message)` : marque le span comme en erreur. C'est un indicateur visuel (rouge dans Jaeger).
- `recordException(exception)` : ajoute un event spécial contenant le stacktrace de l'exception. C'est informatif.

Les deux sont **complémentaires** — utilisez les deux en cas d'erreur :

```java
span.setStatus(StatusCode.ERROR, e.getMessage());
span.recordException(e);
```

</details>

<details>
<summary>💡 Les attributs n'apparaissent pas dans Jaeger</summary>

Vérifiez que :
1. Vous appelez `setAttribute` sur le bon span (celui qui est actif)
2. Vous appelez `setAttribute` **avant** `span.end()`
3. Les noms de clés sont des chaînes non vides
4. Le span est bien envoyé (pas d'erreur de connexion OTLP)

</details>

<details>
<summary>💡 Le span d'erreur n'est pas rouge dans Jaeger</summary>

Assurez-vous d'utiliser `StatusCode.ERROR` (pas juste un attribut) :

```java
import io.opentelemetry.api.trace.StatusCode;

span.setStatus(StatusCode.ERROR, "Message d'erreur");
```

</details>
