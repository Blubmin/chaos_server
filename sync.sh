rsync -avz --exclude '.git' --exclude 'data' --rsh="ssh -i /Users/matthewaustin/Documents/MattsKey.pem" "/Users/matthewaustin/Documents/chaos-node/" bitnami@54.213.174.229:chaos
ssh -i /Users/matthewaustin/Documents/MattsKey.pem  bitnami@54.213.174.229 'sudo forever restartall'
