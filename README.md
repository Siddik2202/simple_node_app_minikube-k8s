## Let's Extent the project of main branch to k8s-v2-without-helm.

1) Create ConfigMap and Secret: Used for non-sensitive configuration data where Secret Used for sensitive data like database username, password, API keys.
```bash
sudo git clone https://github.com/Siddik2202/simple_node_app.gits
```

2) Then we add Liveness and Readiness:

* Used to check if the application is still running or stuck. If the probe fails, Kubernetes restarts the container automatically.
* Used to check if the application is ready to receive traffic. If it fails, Kubernetes removes the pod from the service load balancing until it becomes ready again.

We add a health check API in the application so Kubernetes can monitor the service on index.js
```bash
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});
```
3) Add Persistent Volume (PV) and Persistent Volume Claim (PVC):

Byfault, Kubernetes pod storage is temporary. If the MySQL pod is deleted or restarted, all database data will be lost ❌.
* Persistent Volume (PV) → Actual storage in the cluster.
* Persistent Volume Claim (PVC) → Request for storage by the pod.
```bash
kubectl apply -f pv.yaml
kubectl apply -f pvc.yaml
```
4) Use Ingress Instead of LoadBalancer:
LoadBalancer services require cloud provider integration and a public IP, which Minikube does not provide by default. For testing, we can use minikube tunnel, but it is not ideal for local development.
So we used Ingress, which allows us to route external traffic to services using a single entry point and custom domain.
* Ingress → Defines routing rules (host, path) to access services.
* Ingress Controller → The component that implements and manages those rules (e.g., Nginx Ingress Controller).
```bash
kubectl apply -f ingress.yaml
sudo nano /etc/hosts
```

5) Then we worked on autoscaling 

* Resource Limits: Used to protect cluster resources by limiting how much CPU and memory a container can use. This prevents one pod from consuming all system resources.
* Horizontal Pod Autoscaler (HPA): HPA automatically scales the number of pods up or down based on CPU or memory usage.
  * Note: HPA works properly when resource requests and limits are defined.
* Vertical Pod Autoscaler (VPA): Used when a pod needs more CPU or RAM instead of more pods. VPA automatically adjusts the resource requests of the pod.

Then create a separate hpa.yaml file to define autoscaling configuration which have hpa.yaml file.
```bash
kubectl apply -f hpa.yaml
kubectl get hpa
kubectl top pods # To understand cpu of pods
```

6) Generate Load for Testing: To test autoscaling, create a temporary load generator pod.
```bahs
kubectl run -i --tty load-generator --rm --image=busybox -- /bin/sh
while true; do wget -q -O- http://backend:3000; done 
```

7. Use Namespace: Namespaces help organize and isolate resources in Kubernetes (e.g., dev, test, prod environments).
```bash
kubectl create namespace dev
# To avoid writing -n dev in every command, set it as the default namespace. It also help when we use 'Argo CD'
kubectl config set-context --current --namespace=dev 
```
8. Use secretKeyRef and configMapKeyRef in development yaml files.
* secretKeyRef → Used when the value comes from a Kubernetes Secret (sensitive data like passwords).
* configMapKeyRef → Used when the value comes from a ConfigMap (non-sensitive configuration).







