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
