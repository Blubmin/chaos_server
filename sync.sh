rsync -avz --exclude 'data' '.git' --rsh="ssh -i /Users/matthewaustin/Desktop/MattsKey.pem" "/Users/matthewaustin/Documents/chaos-node/" bitnami@54.213.174.229:chaos
ssh -i /Users/matthewaustin/Desktop/MattsKey.pem  bitnami@54.213.174.229 'sudo forever restartall'
