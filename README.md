## Extending the Project from k8s-v2-without-helm to k8s-v3-with-helm

This stage improves deployment management by introducing Helm, the package manager for Kubernetes.

1) In the previous setup, the project contained many Kubernetes YAML files, which made management difficult. Solution → Helm
* Too many YAML files
* Hard to reuse configurations
* Difficult to manage updates
* Manual configuration changes for each environment

Helm packages all Kubernetes resources into a reusable package called a Chart.
* Reusability → Write once, deploy in dev / staging / production
* Dynamic Values → Avoid hardcoding values
```bash
# Create a new Helm chart structure for the application
helm create nodeapp-chart

# Move existing Kubernetes YAML manifests into the Helm chart templates directory
# so Helm can manage them as part of the chart
mv k8s/*.yaml nodeapp-chart/templates/

# Install the Helm chart and deploy the application in Kubernetes
# "nodeapp" is the release name and "./nodeapp-chart" is the chart path
helm install nodeapp ./nodeapp-chart

# Extra Command which used day to day life basis.
# Install a Helm chart into the Kubernetes cluster
# Creates a new release with the name "my-app"
helm install my-app ./chart

# Upgrade an existing Helm release when chart configuration changes
# Used when we modify templates or values.yaml
helm upgrade my-app ./chart

# List all Helm releases deployed in the cluster
helm list

# Remove or delete a Helm release and its Kubernetes resources
helm uninstall my-app

# Roll back a Helm release to a previous version if a deployment fails
helm rollback my-app 1
```

2. Logging & Monitoring: (1860/ 15757/ 1860)
* To maintain production-grade systems, we implement observability.
* Monitoring: Tracks system health and metrics such as: CPU usage, Memory usage, Pod performance by Prometheus
* So we Install Prometheus using Helm repository.
