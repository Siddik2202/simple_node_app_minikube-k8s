## Extending the Project from k8s-v2-with-helm to production-deploy

1. Launch EC2 Instances: Create 3 instances: 1 Control Plane and 2 Worker Nodes.
   
2. Install Container Runtime and setup kubeadm which I already tell you with command in Kubernetes_setup repo.
   
3. Then join and Connect with Calico network and cehck they ready or not.
```bash
kubectl get pods -n kube-system

```

4. Install Helm: Helm simplifies Kubernetes application deployment.
```bash
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
helm version
```

5. Install NGINX Ingress Controller: Used to expose services via domain-based routing.
```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml
#   kubectl get pods -n ingress-nginx    # To check
#   kubectl get pods -n ingress-nginx -w

#   kubectl delete -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml
#   kubectl delete namespace ingress-nginx
#   kubectl get ns
```

6. Then we all have project means we set up and create helm repo, docker files.
```bash
# 6.1 Build docker image from docker files path
docker build -t node-frontend -f Dockerfile.frontend .
docker build -t node-backend -f Dockerfile.backend .

# 6.2 LogIn with credentials
docker login

# 6.3 Tag images: To register on docker hub
docker tag node-frontend <dockerhub-username>/node-frontend
docker tag node-backend <dockerhub-username>/node-backend

# 6.4 Then push image to docker hub
docker push <dockerhub-username>/node-frontend
docker push <dockerhub-username>/node-backend


```
7. Create ConfigMap for Database Initialization:
```bash
kubectl create configmap mysql-init-script --from-file=init.sql
# This initializes the MySQL database schema.
```

8. Deploy Application Using Helm:
```bash
cd nodeapp-chart
helm install nodeapp .
helm list      # To check release list
helm upgrade nodeapp .   # Upgrade when needed:
helm uninstall nodeapp    # To delete
```

9. Install Monitoring Stack
```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install monitoring prometheus-community/kube-prometheus-stack
helm repo add stable https://charts.helm.sh/stable
kubectl port-forward svc/monitoring-grafana 3000:80      # Grafana port forwarding, remember port can be different 
kubectl port-forward svc/monitoring-kube-prometheus-prometheus 9090     # Prometheus port forwarding
```
10. Security Scanning. Scan container images for vulnerabilities using Trivy.
```bash
sudo apt update
sudo apt install wget apt-transport-https gnupg lsb-release -y

wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
echo deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main | sudo tee /etc/apt/sources.list.d/trivy.list

sudo apt update
sudo apt install trivy -y
trivy --version
trivy config helm-version-app(folder name) 
```


11. GitOps Deployment using Argo CD: It continuously monitors a Git repository and automatically syncs the Kubernetes cluster with the desired configuration.

```bash
1. Create a namespace for Argo CD:
kubectl create namespace argocd

2. Apply the Argo CD manifest:
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

3. Check services in Argo CD namespace:
kubectl get svc -n argocd | kubectl get pods -n argocd 

4. Expose Argo CD server using NodePort:
kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "NodePort"}}'

5. Forward ports to access Argo CD server:
kubectl port-forward -n argocd service/argocd-server 8443:443 --address=0.0.0.0 &

```

Thank you So Much. Developed by Abu Bakkar Siddik













