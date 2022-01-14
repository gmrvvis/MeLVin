#!/bin/bash
mongod --dbpath /var/lib/mongodb --smallfiles --nojournal --repair
service apache2 start
circusd app.ini