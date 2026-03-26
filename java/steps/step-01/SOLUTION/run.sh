#!/bin/bash
# Étape 01 — Lancement de l'application avec le Java Agent OpenTelemetry

# Prérequis : être dans le dossier java/src/ et avoir buildé le projet
# mvn clean package -DskipTests

# Télécharger le Java Agent (si pas encore fait)
if [ ! -f opentelemetry-javaagent.jar ]; then
  echo "Téléchargement du Java Agent OpenTelemetry..."
  curl -Lo opentelemetry-javaagent.jar \
    https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar
fi

# Lancer l'application avec l'agent
java -javaagent:opentelemetry-javaagent.jar \
  -Dotel.service.name=shoptrack-api \
  -Dotel.exporter.otlp.endpoint=http://localhost:4317 \
  -jar target/shoptrack-api-1.0.0-SNAPSHOT.jar
