# Indices — Étape 03

<details>
<summary>💡 Comment injecter OpenTelemetry dans le contrôleur ?</summary>

Le Spring Boot Starter enregistre automatiquement un bean `OpenTelemetry`. Il suffit de l'ajouter au constructeur :

```java
private final Tracer tracer;

public OrderController(OrderRepository orderRepository,
                       ProductRepository productRepository,
                       NotificationService notificationService,
                       OpenTelemetry openTelemetry) {
    this.orderRepository = orderRepository;
    this.productRepository = productRepository;
    this.notificationService = notificationService;
    this.tracer = openTelemetry.getTracer("shoptrack-api");
}
```

</details>

<details>
<summary>💡 Comment créer un span avec try-finally ?</summary>

Le pattern de base pour un span manuel :

```java
Span span = tracer.spanBuilder("MonSpan").startSpan();
try (Scope scope = span.makeCurrent()) {
    // Code métier ici...
    // Le scope rend ce span "courant" pour la propagation de contexte
} finally {
    span.end(); // Toujours fermer le span, même en cas d'erreur
}
```

</details>

<details>
<summary>💡 Pourquoi makeCurrent() est important ?</summary>

`span.makeCurrent()` place le span dans le **contexte courant du thread**. Cela permet :
1. Aux spans créés ensuite d'être automatiquement des enfants
2. Aux spans auto-instrumentés (JDBC, HTTP) de s'attacher au bon parent
3. À `Span.current()` de retourner ce span

Sans `makeCurrent()`, vos spans seraient des racines isolées.

</details>

<details>
<summary>💡 @WithSpan ne semble pas fonctionner</summary>

Vérifiez que :
1. La dépendance `opentelemetry-instrumentation-annotations` est bien dans le pom.xml
2. L'annotation est sur une méthode **publique** d'un **bean Spring** (pas une méthode privée)
3. L'appel passe par le proxy Spring (appel depuis un autre bean, pas `this.method()`)

</details>

<details>
<summary>💡 Comment imbriquer les spans ?</summary>

Les spans s'imbriquent automatiquement grâce au contexte. Créez le span parent d'abord avec `makeCurrent()`, puis le span enfant à l'intérieur :

```java
Span parent = tracer.spanBuilder("Parent").startSpan();
try (Scope parentScope = parent.makeCurrent()) {

    Span child = tracer.spanBuilder("Child").startSpan();
    try (Scope childScope = child.makeCurrent()) {
        // child est automatiquement enfant de parent
    } finally {
        child.end();
    }

} finally {
    parent.end();
}
```

</details>
