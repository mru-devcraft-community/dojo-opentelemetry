# Observability Infrastructure

Shared Docker Compose stack providing the observability backend for the OpenTelemetry DoJo.

## Services

| Service            | URL                          | Description                        |
|--------------------|------------------------------|------------------------------------|
| PostgreSQL         | `localhost:5432`             | Application database               |
| OTel Collector     | `localhost:4317` (gRPC)      | OpenTelemetry Collector (OTLP)     |
| OTel Collector     | `localhost:4318` (HTTP)      | OpenTelemetry Collector (OTLP)     |
| Jaeger UI          | http://localhost:16686       | Distributed tracing UI             |
| Prometheus         | http://localhost:9090        | Metrics storage & querying         |
| Grafana            | http://localhost:3000        | Dashboards & visualization         |
| Loki               | `localhost:3100`             | Log aggregation                    |

## Usage

```bash
# Start the stack
cd infra
docker compose up -d

# Stop the stack (preserves data)
docker compose down

# Stop and reset all data
docker compose down -v
```
