# GameFEED Separate Helm Charts

This package converts your `GameFEED-project/k8s-manifests` into separate reusable Helm charts.

## Charts included

| Chart | Purpose |
|---|---|
| `gamefeed-database` | PostgreSQL StatefulSet, PostgreSQL Service, Secret, and DB init ConfigMap |
| `gamefeed-config` | Shared `gamefeed-config` ConfigMap used by API Gateway |
| `gamefeed-user-service` | User Spring Boot service |
| `gamefeed-game-service` | Game Spring Boot service |
| `gamefeed-review-service` | Review Spring Boot service |
| `gamefeed-comment-service` | Comment Spring Boot service |
| `gamefeed-api-gateway` | API Gateway service |
| `gamefeed-frontend` | React frontend Service, Deployment, and Nginx ConfigMap |
| `gamefeed-ingress` | Kong Ingress for `/api` and `/` routes |
| `gamefeed-stack` | Umbrella chart to deploy everything together |

## Option 1: Deploy everything with one command

```bash
cd gamefeed-separated-helm-charts

helm upgrade --install gamefeed ./gamefeed-stack \
  --namespace gamefeed \
  --create-namespace
```

Check:

```bash
kubectl get all -n gamefeed
kubectl get pvc -n gamefeed
kubectl get ingress -n gamefeed
```

## Option 2: Deploy charts separately

Use this order:

```bash
cd gamefeed-separated-helm-charts

helm upgrade --install gamefeed-db ./gamefeed-database -n gamefeed --create-namespace
helm upgrade --install gamefeed-config ./gamefeed-config -n gamefeed

helm upgrade --install user-service ./gamefeed-user-service -n gamefeed
helm upgrade --install game-service ./gamefeed-game-service -n gamefeed
helm upgrade --install review-service ./gamefeed-review-service -n gamefeed
helm upgrade --install comment-service ./gamefeed-comment-service -n gamefeed

helm upgrade --install api-gateway ./gamefeed-api-gateway -n gamefeed
helm upgrade --install frontend ./gamefeed-frontend -n gamefeed
helm upgrade --install gamefeed-ingress ./gamefeed-ingress -n gamefeed
```

## Change image tag

Example:

```bash
helm upgrade --install user-service ./gamefeed-user-service -n gamefeed \
  --set image.tag=v2
```

For full stack:

```bash
helm upgrade --install gamefeed ./gamefeed-stack -n gamefeed --create-namespace \
  --set gamefeed-user-service.image.tag=v2 \
  --set gamefeed-frontend.image.tag=5
```

## Change ingress host

```bash
helm upgrade --install gamefeed-ingress ./gamefeed-ingress -n gamefeed \
  --set ingress.host=gamefeed.example.com \
  --set ingress.className=nginx
```

Default ingress matches your manifest:

```yaml
ingressClassName: kong
host: gamefeed.local
paths:
  - /api -> api-gateway:8080
  - / -> frontend:80
```

## Important notes

1. Backend services use the same secret name: `gamefeed-secret`.
2. PostgreSQL service DNS name is kept as `postgres-db`.
3. Service names are kept same as your manifests: `user-service`, `game-service`, `review-service`, `comment-service`, `api-gateway`, and `frontend`.
4. The frontend chart creates `frontend-nginx-conf` by default.
5. The database chart creates four DBs on first PostgreSQL initialization: `user_db`, `game_db`, `review_db`, and `comment_db`.
6. If the PVC already exists, PostgreSQL init SQL will not run again automatically. Delete the PVC only if you want a fresh database.
