#!/bin/bash

docker build --network host --tag alpotapov/ethmunich_service:latest --platform linux/amd64 .

docker tag alpotapov/ethmunich_service registry.heroku.com/ethmunich-service/web
