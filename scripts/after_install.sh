#!/bin/bash
echo 'run after_install.sh: ' >> /home/ec2-user/buyasia/buy-asia-api/deploy.log

echo 'cd /home/ec2-user/buyasia/buy-asia-api/' >> /home/ec2-user/buyasia/buy-asia-api/deploy.log
cd /home/ec2-user/buyasia/buy-asia-api >> /home/ec2-user/buyasia/buy-asia-api/deploy.log

echo 'npm install' >> /home/ec2-user/buyasia/buy-asia-api/deploy.log 
npm i --legacy-peer-deps >> /home/ec2-user/buyasia/buy-asia-api/deploy.log
