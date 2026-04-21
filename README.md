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

5. Install NGINX Ingress Controller using helm: Used to expose services via domain-based routing.
```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
helm install ingress-nginx ingress-nginx/ingress-nginx --namespace ingress-nginx --create-namespace

#   kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml
#   kubectl get pods -n ingress-nginx    # To check
#   kubectl get pods -n ingress-nginx -w # To check live 
#   kubectl get svc -n ingress-nginx     # To check services
#   kubectl get pods -n kube-system -o wide | grep coredns    # To check dns-debug aur coredns alag
#   kubectl get pods -o wide | grep dns-debug

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
helm upgrade --install nodeapp .   # 👉 idempotent command (safe to run anytime)
helm uninstall nodeapp    # To delete
```

9. If you get any error regurding below points then only run. 
      * MTU (Maximum Transmission Unit): In AWS, standard MTU = 1500 bytes, Calico adds extra data, making packets bigger than AWS limit, so packets can fail to travel properly. Original data = 1500 bytes (already full tunnel size), Calico adds extra = +50 bytes. So total becomes 1550 bytes. 

```bash
kubectl patch installation.operator.tigera.io default --type merge -p '{"spec": {"calicoNetwork": {"mtu": 1440}}}'
kubectl delete pods -n calico-system --all    # To apply above new rules 
kubectl delete pod -l app=backend
kubectl delete pod -l app=frontend

# Stop networking-> change source/destination stop and save
# K8s Admission Webhook Error: failed calling webhook "validate.nginx.ingress.kubernetes.io": context deadline exceeded. Then run
# kubectl delete validatingwebhookconfiguration ingress-nginx-admission
```

10. Install Monitoring Stack
```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install monitoring prometheus-community/kube-prometheus-stack
helm repo add stable https://charts.helm.sh/stable
kubectl port-forward svc/monitoring-grafana 3000:80      # Grafana port forwarding, remember port can be different 
kubectl port-forward svc/monitoring-kube-prometheus-prometheus 9090     # Prometheus port forwarding
```
11. Security Scanning. Scan container images for vulnerabilities using Trivy.
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


12. GitOps Deployment using Argo CD: It continuously monitors a Git repository and automatically syncs the Kubernetes cluster with the desired configuration.

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



## Now Add CI/CD To Implemented a Full End-to-End CI/CD Pipeline on a Multi-Node Kubernetes Cluster

1. Launch an Instance For Jenkins where instance type should be t2.medium with 20GB Storage.

2. Now Install Jenkins setup on ec2 server and Launch with 8080 port. I assumed you know how to launch and setup Jenkins.

3. Install Required Plugins from Manage Jenkins → Plugins → Available Plugins -> Install: ✔️ Git ✔️ Pipeline ✔️ Docker Pipeline ✔️ Credentials Binding ✔️ SSH Agent ✔️ (Later) Kubernetes plugin

4. Now ssh this server and Install Docker (MANDATORY), Jenkins will fail without this.
```bash
sudo apt update
sudo apt install docker.io -y
sudo usermod -aG docker jenkins
sudo chmod 666 /var/run/docker.sock # Not required because in above line you Adds jenkins user to docker group 
sudo systemctl restart jenkins

# Also Install Required Tools
sudo apt install git -y
sudo apt install curl -y

# Install helm and kubectl
# kubectl get pods -o wide    # Get more detailed information about Pods
```

5. Add Credentials in Jenkins. Manage Jenkins → Credentials → Global → Add Credentials
      * DockerHub
           * a) Kind: Username & Password
           * b) ID: dockerhub-cred
           * c) Here you just set you dockerhub username and access token. You can create from Dockerhub
      * GitHub
           * a) Use Personal Access Token
           * b) ID: github-cred
           * c) Here also you need to set you github access token. You can create from github -> profile seeting -> Developer setting
      ** This is very mandotary, Go to your control panel or Master Node
           * a) ```bash cat ~/.kube/config ```
           * b) Now copy whole page and pest on a file.
           * c) Now Go To Manage Jenkins → Clouds → Add New Cloud → Kubernetes
           * d) Kubernetes Name: k8s-cluster
           * e) Kubernetes URL: https://<EC2-1(master)-PRIVATE-IP>:6443
           * f) Kubernetes Namespace: default
           * g) Credentials: Select file you create.
           * h) WebSocket: ✅ Check this box
           * i) Disable HTTPS certificate check: ✅
           * j) Then Test Connection: If Successful: It will show Connected to Kubernetes <version>.

           * k) Pod Template Name: jenkins-agent
           * l) Usage: Use this node as much as possible
           * m) Labels: jenkins-agent (This is the label you will use in your Jenkinsfile like agent { label 'jenkins-agent' }).
           * n) Jenkins Tunnel: <EC2-3-PRIVATE-IP>:50000 # If have
           * o) Container: jnlp | jenkins/inbound-agent (Image) | /home/jenkins/agent (Working Dir)

6. Create Your First Pipeline Job with Name.
      * Just select GitHub hook trigger for GITScm polling
      * Select: 👉 Pipeline script from SCM
      * SCM: Git
      * Repo URL: your GitHub repo
      * Branch: main # According to you
      * Script Path: Jenkinsfile   # It means Jenkinsfile should be exist in your remo with that name.

7. Now build your Job I hope It succesffuly Deploy with stages.

8. You can add webhook so it automatically build if any push or commit on your remository.
   ```bash
   # http://<jenkins-server-PUBLIC-IP>:8080/github-webhook/
   # Content type: application/json
   # Just the push event
   ```

9. Docker :latest Tag Caching (90% ).
      * So we need to use imagePullPolicy: Always & rollout-date/rollout-restartTime in deployment.
      * Apply new changes without downtime, Kubernetes creates new pods with updated config & Old pods are terminated gradually
      ```bash
      kubectl rollout restart deployment frontend
      kubectl rollout restart deployment backend
      ``` 
This project was a deep dive into the "Networking & Security" layers that make Kubernetes production-ready. 🚀
 

