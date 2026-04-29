# Kubernetes Deployment Guide (dev/test/prod)

## 1) Prérequis

- Kubernetes cluster accessible (`kubectl` configuré)
- Kustomize support (`kubectl apply -k`)
- Images backend/frontend construites et poussées au registre

## 2) Namespaces

```bash
kubectl apply -f namespaces.yaml
```

Namespaces utilisés:
- `trackorder-dev`
- `trackorder-test`
- `trackorder-prod`

## 3) Déployer par environnement

```bash
# Dev
kubectl apply -k overlays/dev

# Test
kubectl apply -k overlays/test

# Prod
kubectl apply -k overlays/prod
```

## 4) Vérifications

```bash
kubectl get pods -n trackorder-dev
kubectl get svc -n trackorder-dev

kubectl get pods -n trackorder-test
kubectl get svc -n trackorder-test

kubectl get pods -n trackorder-prod
kubectl get svc -n trackorder-prod
```

## 5) Stratégies de déploiement

- Dev/Test: `Recreate`
- Prod: `RollingUpdate`

## 6) Pod multi-conteneurs

Le backend utilise:
- Conteneur principal API Spring Boot
- Sidecar `fluent/fluent-bit` pour collecte/forwarding des logs

## 7) Volumes

- `postgres-pvc`: stockage persistant PostgreSQL
- `shared-results-pvc`: volume partagé pour résultats/artifacts applicatifs

## 8) Notes sécurité

- Les secrets dans `base/secret.yaml` sont des placeholders.
- Remplacer avec des valeurs réelles via secret manager/CI avant prod.
- Ne jamais committer de secrets réels dans le dépôt.
