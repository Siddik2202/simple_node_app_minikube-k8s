## Simple Node.Js App Deploy with k8s manifest files using minikube

1. Clone the project here we have all the files. Befor that you setup minikube 
```bash
git clone https://github.com/Siddik2202/simple_node_app_minikube-k8s.git
```
2. Then start minikube on your system
```bash
minikube status # to check status
minikube start # to start
```
3. I used a ConfigMap to store the init.sql file because it allows for Declarative Initialization. By mounting the ConfigMap to the /docker-entrypoint-initdb.d/ directory in the MySQL container, I ensure that the database schema is automatically created the moment the container starts.
```bash
kubectl create configmap mysql-init-script --from-file=init.sql
```
4. Kubernetes will look for the images inside the Minikube node, not on Docker Hub.
```bash
eval $(minikube docker-env)
```
5. Build your images (docker build...), we have seperate dockerfile
```bash
docker build -t node-backend -f Dockerfile.backend .
docker build -t node-frontend -f Dockerfile.frontend .
```
6. Redirect to you k8s manifest files and run Apply your YAML files (kubectl apply -f k8s/)
```bash
kubectl apply -f .
kubectl delete -f .  # to delete all k8s pods, svc, deployment
```
7. MySQL server is running inside the Kubernetes cluster. They are in two different "worlds."
```bash
kubectl exec -it <mysql-pod-name> -- bash
mysql -u root -p -S /var/lib/mysql/mysql.sock
# Then Enter your password
```
8. Some useful commands
```bash
echo $DOCKER_HOST #it's empty ❌ You are using host Docker || 👉 If shows something like: tcp://127.0.0.1:xxxxx ✅ You are using Minikube Docker
minikube service backend
docker run -it node-backend sh, 
minikube ip # To check ip of minikube
kubectl get pods -w # to check live creating of pods
kubectl logs <mysql-pods_name>  # To check logs
kubectl get nodes
kubectl get all
kubectl describe pod <pods_name>
```


9. Why CrashLoopBackOff happens: Container starts → crashes → Kubernetes restarts → crashes again → loop
	App error (code crash), DB connection failed, Wrong environment variables, Port already in use

11. ImagePullBackOff error-
“It means Kubernetes cannot pull the image. I check if the image exists locally, verify image name, and ensure imagePullPolicy is set correctly. In Minikube, I build images inside its Docker environment.”

THANK YOU






