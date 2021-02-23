FROM centos
RUN yum update -y
RUN yum install shadow-utils python3-pip zip unzip -y
RUN groupadd -g 10566 jenkins
RUN adduser -u 10566 -g 10566 -s /bin/bash -d /var/lib/jenkins -c 'Jenkins Continuous Integration Server' jenkins
#RUN pip3 install --upgrade awscli aws-sam-cli
#RUN aws --version
#RUN sam --version

#install aws cli version 2
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
RUN unzip awscliv2.zip
RUN ./aws/install

#install sam cli
RUN pip3 install aws-sam-cli

#run version check
RUN python3 --version
RUN pip3 --version
RUN aws --version
RUN sam --version

#Debug pacakage
RUN pip3 install pipdeptree

RUN curl -sL https://rpm.nodesource.com/setup_12.x | bash
RUN yum install -y nodejs
RUN npm install typescript -g
RUN tsc --version
RUN mkdir /.npm
RUN chown -R 10566:10566 "/.npm"
WORKDIR /usr/src
RUN curl --insecure -o ./sonarscanner.zip -L https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-4.3.0.2102-linux.zip && \
	unzip sonarscanner.zip && \
	rm sonarscanner.zip && \
	mv sonar-scanner-4.3.0.2102-linux /usr/lib/sonar-scanner && \
	ln -s /usr/lib/sonar-scanner/bin/sonar-scanner /usr/local/bin/sonar-scanner
ENV SONAR_RUNNER_HOME=/usr/lib/sonar-scanner
ENV PATH $PATH:$SONAR_RUNNER_HOME/bin
RUN yum install java-11-openjdk -y
ENV JAVA_HOME=/usr/lib/jvm/java-11-openjdk-11.0.9.11-3.el8_3.x86_64/bin/java