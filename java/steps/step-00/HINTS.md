# Indices — Étape 00

## Problèmes courants

<details>
<summary>💡 Java n'est pas en version 21</summary>

Vérifiez votre variable `JAVA_HOME` :

```bash
echo $JAVA_HOME
```

Si vous avez plusieurs versions de Java installées, utilisez un gestionnaire comme **SDKMAN** :

```bash
sdk install java 21.0.2-tem
sdk use java 21.0.2-tem
```

</details>

<details>
<summary>💡 Maven ne trouve pas Java 21</summary>

Assurez-vous que `JAVA_HOME` pointe vers le JDK 21 :

```bash
export JAVA_HOME=/path/to/jdk-21
export PATH=$JAVA_HOME/bin:$PATH
```

Sous Windows (PowerShell) :

```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
```

</details>

<details>
<summary>💡 Docker Compose ne démarre pas</summary>

- Vérifiez que Docker Desktop est lancé
- Si un port est déjà utilisé : `docker compose down` puis `docker compose up -d`
- En cas de conflit sur le port 5432 (PostgreSQL local) : arrêtez votre instance locale

</details>

<details>
<summary>💡 L'application ne se connecte pas à PostgreSQL</summary>

Vérifiez que le conteneur PostgreSQL est bien en état `healthy` :

```bash
docker compose ps
```

Si la base n'est pas prête, attendez quelques secondes et réessayez.

</details>

<details>
<summary>💡 curl ne fonctionne pas sous Windows</summary>

Utilisez PowerShell avec `Invoke-RestMethod` :

```powershell
Invoke-RestMethod http://localhost:8080/api/products
```

Ou installez curl via `winget install curl`.

</details>
