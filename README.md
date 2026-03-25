## This is simple node js app,  ok

There Have a form and backend connection with mysql. 

when You submit the form then the data will store in mysql db.

### Here are the step to run on docker with EC2 instance server step by step withour docker compose

1) Host a instance then clone you repository from your github using 

```bash
sudo git clone https://github.com/Siddik2202/simple_node_app.git
```

2) Create Dockerfile for your project. You get this from root folder. And run 
```bash
docker build -t simple-node-app .
```

3) After we need to run this image but make sure you connect with db there have many method to do that
   
   3.1) Create a network 1st to connect with db
```bash
docker network create simple-app-network
```
   
   3.2) Using init.sql (Your Current Method) If you have 
```bash
   docker run -d --name db --network simple-app-network -e MYSQL_ROOT_PASSWORD=root -v $(pwd)/init.sql:/docker-entrypoint-initdb.d/init.sql -p 3306:3306 mysql:8
```
   3.3) Create Database Manually Inside Container. First start MySQL container:
```bash
docker run -d --name db -e MYSQL_ROOT_PASSWORD=root -p 3306:3306 mysql:8
```
   Then enter under container ```  docker exec -it db mysql -u root -p  ```
   And then you need to manually run SQL
```bash
CREATE DATABASE sampledb;

USE sampledb;

CREATE TABLE nodeuser (
id INT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(100),
mobile VARCHAR(15),
email VARCHAR(100)
);
```

   3.4) Execute SQL File After Container Starts: Instead of mounting init.sql, you can run it later.
```bash
docker exec -i db mysql -u root -p sampledb < init.sql
```

   3.5 Application Creates Tables (Auto Migration) Your Node.js backend can create tables automatically.
   When Node app starts -> Check if table exists -> Create if not
   
   3.6 Using Docker Compose (Most Used in DevOps. We also do this one the next step.

Now I use method 1, After that your MySQL container start Attach to simple-app-network and automatically Run init.sql also Create database + table

4. Then run your node container with network:
   you cannot create another container with the same name, even if the existing container is Exited. If then remove ```bash
   docker rm container-name
```
```bash
docker run -d --name simple-node --network simple-app-network -p 3000:3000 simple-node-app
```
    
5. So here we have three images where
      node -> we don't run this image directly. It is only used to build your app image. (runtime environment)
      simple-node-app -> Our Backend Application
      mysql:8 -> This image runs the MySQL database server. Your Node backend connects to it using: db (database server)
      Make sure you enable your port 22, 443, 80 and 3000

6. To check data:
```bash
docker exec -it db mysql -u root -p
# eneter passoword root and then 
SHOW DATABASES;
USE sampledb;
SHOW TABLES;
SELECT * FROM nodeuser;
DESCRIBE nodeuser;
```

7. Now we will add volumn for data persistance. Create volumen then remove db and attach or run with volumn and you also need to restart your application container
```bash
docker volume create mysql-data
docker rm -f db
docker run -d --name db --network simple-app-network -e MYSQL_ROOT_PASSWORD=root -v mysql-data:/var/lib/mysql -v $(pwd)/init.sql:/docker-entrypoint-initdb.d/init.sql mysql:8

# 2nd way to connect then 
# cd ~/simple_node_app
# mkdir mysql-data
# -v ~/simple_node_app/mysql-data:/var/lib/mysql \

# Now you get error because when you connect with new database you application attach with old
docker restart simple-node
# Now works fine
```
8. Now you can check
```bash
docker volume inspect mysql-data
# here you will see a Mountpoint
sudo -i
cd /var/lib/docker/volumes/mysql-data/_data
# here you can see ibdata1, etc... 
```
Thank you


### Here we will deploy our EC2 instance with docker compose

i) It's better to use docker-compose other you need to run seperately db and app after you create docker images. 

ii) So 1st Install dependency's and update configuration 

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose   # for installing both 
sudo systemctl enable --now docker
sudo systemctl start docker
sudo usermod -aG docker $USER && newgrp docker 
docker --version
```
iii) Set up your project using git and redirect
```bash
git clone https://github.com/Siddik2202/simple_node_app.git
cd <project> 
```
   
iv) Run this command it will build and run container. All the method and steps (network, volume, db & app) are written here.
```bash
docker-compose up -d --build 
```
v) you should enable your project port and mysql port. For that you should enable 3000 (from app) and 8080 (alternative port of http 80 for docker container) port .

vi) Here we use healthcheck for avoing error Econnrefused Error, means app run befor db or mysql ready.

vii) If You can see your data d
```bash
docker exec -it 1a2096dc32ec <mysql container id> mysql -u siddik -p then enter password
SHOW DATABASES; USE sampledb; SHOW TABLES; SELECT * FROM your_table;  #You can see your data.
```

THANK YOU
 
 
### Full Stack Node app deploy with CICD Approach with help of docker compose

#### 1. 1st of all set up agent node from master beacuse jenkins work as a master-slave architechture.

#### 2. Create a pipeline project select option of 'github project' and enter url. Also select 'GitHub hook trigger for GITScm polling'

#### 3. Go to you repository -> setting -> add webhooks.

#### 4. Make sure you enable port(3000) according to your peoject, install docker, docker compose and enable ubuntu as a username because you you agent username is ubuntu
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose
sudo usermod -aG docker ubuntu

# If required to restart
java -jar remoting.jar
pkill -f remoting.jar
java -jar remoting.jar -workDir /home/ubuntu
# To verify use docker ps
```

#### 5. For better view you can install avilable plugins like pipeline:stageview, GitHub Plugin from jenkins and restart.

#### 6. Now add pipeline groovy syntax and then save and contitune again select label name according to your agent label name.
```bash
pipeline {
    agent { label 'agent' } // Jenkins agent/slave label
    
    environment {
        IMAGE_NAME = "simple_node_app"
        IMAGE_TAG = "latest"
    }
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/Siddik2202/simple_node_app.git'
            }
        }
        stage('Build App Image') {
            steps {
                script {
                    // Build the Docker image from local Dockerfile
                    sh "docker build -t $IMAGE_NAME:$IMAGE_TAG ."
                }
            }
        }

        stage('Deploy with Docker Compose') {
            steps {
                script {
                    // Stop old containers if running
                    sh 'docker-compose down || true'
                    // Start containers in detached mode
                    sh 'docker-compose up -d --build'
                }
            }
        }
    }
    post {
        success {
            echo '✅ Deployment successful!'
        }
        failure {
            echo '❌ Deployment failed!'
        }
    }
}
```

#### 7. Now If you want to see you backend data on ec2 then 
```bash
docker exec -it mysql_container_name<pipelineproject_db_1> mysql -u root -p # you can check through docker ps
# Then enter password and use mysql command to view
# Docker Compose automatically creates container names like: <folder_name>_<service_name>_<number>
```

THANK YOU SO MUCH !
