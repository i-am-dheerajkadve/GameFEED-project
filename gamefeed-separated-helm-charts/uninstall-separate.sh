#!/usr/bin/env bash
set -euo pipefail

NAMESPACE="${1:-gamefeed}"

helm uninstall gamefeed-ingress -n "$NAMESPACE" || true
helm uninstall frontend -n "$NAMESPACE" || true
helm uninstall api-gateway -n "$NAMESPACE" || true
helm uninstall comment-service -n "$NAMESPACE" || true
helm uninstall review-service -n "$NAMESPACE" || true
helm uninstall game-service -n "$NAMESPACE" || true
helm uninstall user-service -n "$NAMESPACE" || true
helm uninstall gamefeed-config -n "$NAMESPACE" || true
helm uninstall gamefeed-db -n "$NAMESPACE" || true
