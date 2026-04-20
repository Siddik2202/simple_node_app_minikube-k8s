pipeline {
    agent any // Yeh aapke EC2-3 (Jenkins Node) par chalega

    environment {
        // Docker Hub Details
        DOCKER_USER = "siddik811" // Aapke screenshot ke hisaab se
        BACKEND_IMAGE = "${DOCKER_USER}/node-backend"
        FRONTEND_IMAGE = "${DOCKER_USER}/node-frontend"
        
        // IDs matching your screenshot exactly
        DOCKER_HUB_CREDS = credentials('dockerhub-cred')
        KUBE_CONFIG = credentials('k8s-config') 
    }

    stages {
        stage('Checkout Code') {
            steps {
                // branch name: production-deploy
                git branch: 'production-deploy', url: 'https://github.com/Siddik2202/simple_node_app_minikube-k8s.git'
            }
        }

        stage('Build Docker Images') {
            steps {
                sh "docker build -t ${BACKEND_IMAGE}:latest -f Dockerfile.backend ."
                sh "docker build -t ${FRONTEND_IMAGE}:latest -f Dockerfile.frontend ."
            }
        }

        stage('Push to Docker Hub') {
            steps {
                sh "echo ${DOCKER_HUB_CREDS_PSW} | docker login -u ${DOCKER_HUB_CREDS_USR} --password-stdin"
                sh "docker push ${BACKEND_IMAGE}:latest"
                sh "docker push ${FRONTEND_IMAGE}:latest"
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                withCredentials([file(credentialsId: 'k8s-config', variable: 'KUBECONFIG_FILE')]) {
                    // Use single quotes (') for the shell command to handle the secret safely
                    sh 'helm upgrade --install nodeapp ./nodeapp-chart --kubeconfig $KUBECONFIG_FILE'
                }
            }
        }
        
    }

    post {
        success {
            echo "Deployment Finished Successfully!"
        }
        failure {
            echo "Deployment Failed. Check Jenkins Console Output."
        }
    }
}
