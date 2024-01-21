pipeline {
    agent any
    tools {
		jdk 'jdk17'
        nodejs '21.1.0'
    }
    environment {
		DOCKERHUB_USERNAME = 'matheusjustino'
		APP_NAME = 'devops-project-study'
        GIT_COMMIT = sh(returnStdout: true, script: 'git rev-parse HEAD').trim()
		DOCKER_IMAGE_NAME = "$DOCKERHUB_USERNAME/$APP_NAME"
		SCANNER_HOME = tool 'sonarq-scanner'
    }
    stages {
		stage('clean workspace') {
            steps {
                cleanWs()
            }
        }
		stage("Code clone for analysis"){
			steps {
				git branch: 'main', credentialsId: 'github', url: "https://github.com/matheusjustino/devops-project-study.git"
			}
		}
		stage('Prepare') {
            steps {
                sh 'npm i -g yarn'
            }
        }
        stage('Install') {
            steps {
                sh 'yarn install --frozen-lockfile'
            }
        }
        stage('Format') {
            steps {
                sh 'yarn format'
            }
        }
        stage('Lint') {
            steps {
                sh 'yarn lint'
            }
        }
		stage('Test Coverage') {
            steps {
                sh 'yarn test:cov'
            }
        }
        stage('Build') {
            steps {
                sh 'yarn build'
            }
        }
		stage("Sonarqube Analysis "){
            steps {
                withSonarQubeEnv('sonar-server') {
                    sh "$SCANNER_HOME/bin/sonar-scanner"
					// sh ''' $SCANNER_HOME/bin/sonar-scanner -Dsonar.projectName=devops-project \
                    // -Dsonar.projectKey=devops-project'''
                }
            }
        }
		stage("Quality gate"){
           steps {
                script {
                    waitForQualityGate abortPipeline: false, credentialsId: 'sonarq-token'
                }
            }
        }
		stage('OWASP FS SCAN') {
            steps {
                dependencyCheck additionalArguments: '--scan ./ --disableYarnAudit --disableNodeAudit', odcInstallation: 'DP-check'
                dependencyCheckPublisher pattern: '**/dependency-check-report.xml'
            }
        }
		stage('Docker Scout FS') {
            steps {
                script{
                   withDockerRegistry(credentialsId: 'dockerhub', toolName: 'docker'){
                       sh 'docker-scout quickview fs://.'
                       sh 'docker-scout cves fs://.'
                   }
                }
            }
        }
        stage('Docker Build') {
            steps {
                sh "docker build -t $DOCKER_IMAGE_NAME:latest ."
                sh "docker build -t $DOCKER_IMAGE_NAME:$GIT_COMMIT ."
            }
        }
        stage('Docker Push') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
                    sh 'echo $PASSWORD | docker login --username $USERNAME --password-stdin'
                    sh "docker push $DOCKER_IMAGE_NAME:latest"
                    sh "docker push $DOCKER_IMAGE_NAME:$GIT_COMMIT"
                }
            }
        }
		stage('Docker Scout Image') {
            steps {
                script{
                   withDockerRegistry(credentialsId: 'dockerhub', toolName: 'docker'){
                       sh "docker-scout quickview $DOCKER_IMAGE_NAME:latest"
                       sh "docker-scout cves $DOCKER_IMAGE_NAME:latest"
                       sh "docker-scout recommendations $DOCKER_IMAGE_NAME:latest"
                   }
                }
            }
        }
		// Step para deletar imagens docker antigas
		// stage('Delete Docker Images') {
		// 	steps {
		// 		script {
		// 			sh "docker rmi -f $DOCKER_IMAGE_NAME:$GIT_COMMIT"
		// 			sh "docker rmi -f $DOCKER_IMAGE_NAME:latest"
		// 		}
		// 	}
		// }
    }
}
