#!/usr/bin/env bash
set -euo pipefail

NAMESPACE="${1:-gamefeed}"

helm upgrade --install gamefeed-db ./gamefeed-database -n "$NAMESPACE" --create-namespace
helm upgrade --install gamefeed-config ./gamefeed-config -n "$NAMESPACE"

helm upgrade --install user-service ./gamefeed-user-service -n "$NAMESPACE"
helm upgrade --install game-service ./gamefeed-game-service -n "$NAMESPACE"
helm upgrade --install review-service ./gamefeed-review-service -n "$NAMESPACE"
helm upgrade --install comment-service ./gamefeed-comment-service -n "$NAMESPACE"

helm upgrade --install api-gateway ./gamefeed-api-gateway -n "$NAMESPACE"
helm upgrade --install frontend ./gamefeed-frontend -n "$NAMESPACE"
helm upgrade --install gamefeed-ingress ./gamefeed-ingress -n "$NAMESPACE"

kubectl get all -n "$NAMESPACE"
