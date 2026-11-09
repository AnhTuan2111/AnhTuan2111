```yaml
apiVersion: people/v1
kind: Mercenary
metadata:
  name: random-guy
spec:
  deploysTo: [vps, kubernetes, openshift, on-prem]
  arsenal:
    containers:    [docker, compose, harbor, portainer, kaniko]
    clusters:      [kubernetes, rancher, openshift, longhorn]
    delivery:      [gitlab-ci, github-actions, argocd]
    observability: [prometheus, grafana, loki, alloy]
    data:          [postgresql, patroni, etcd, pgbouncer, minio, redis]
    edge:          [nginx, haproxy, keepalived, keycloak, openvpn]
status:
  phase: Running
```

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/AnhTuan2111/AnhTuan2111/output/github-snake-dark.svg">
  <img src="https://raw.githubusercontent.com/AnhTuan2111/AnhTuan2111/output/github-snake.svg" width="100%" alt="A snake eating my contribution graph">
</picture>
