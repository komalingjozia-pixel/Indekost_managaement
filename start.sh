#!/bin/bash

# Jika Node.js app
if [ -f "be/package.json" ]; then
  cd be
  npm install
  npm start
elif [ -f "fe/package.json" ]; then
  cd fe
  npm install
  npm start
else
  echo "No package.json found"
  exit 1
fis