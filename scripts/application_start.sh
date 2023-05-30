#!/bin/bash

echo 'run application_start.sh: ' >> /home/ec2-user/buyasia/buy-asia-api/deploy.log

echo 'pm2 restart buy-asia-api' >> /home/ec2-user/buyasia/buy-asia-api/deploy.log
sudo pm2 restart buy-asia-api >> /home/ec2-user/buyasia/buy-asia-api/deploy.log
sudo pm2 save >> /home/ec2-user/buyasia/buy-asia-api/deploy.log
