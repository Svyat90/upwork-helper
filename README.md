# Upwork Helper Bot

## Overview

This repository contains the code for a bot designed to parse RSS feeds of Upwork accounts, check for new offers, and send notifications every 15 seconds. By running this bot, your chances of getting new offers from Upwork can significantly increase.

## Prerequisites

Before running the bot, make sure you have the following prerequisites installed on your system:

- [NVM](https://github.com/nvm-sh/nvm): Node Version Manager
- [Node.js](https://nodejs.org/): JavaScript runtime
- [MySQL](https://www.mysql.com/): Relational database management system
- Git: Version control system

## Installation

Follow these steps to install and set up the project:

### 1. Install NVM

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc # source
nvm list-remote # check available versions
nvm install v20.11.1 # install last LTS version
node -v $ # check current version
nvm list # check installed versions
```

### 2. Clone the Repository
```bash
git clone https://github.com/Svyat90/upwork-helper.git .
```

### 3. Install Node Packages
```bash
npm install
```

### 4. Set Environment Variables
Copy the .env-example file and set the environment variables:
```bash
cp .env-example .env
nano .env
```

### 5. Install and Set Up the Database
```bash
mysql
CREATE DATABASE upwork_bot;
CREATE USER 'upwork_bot'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON upwork_bot.* TO 'upwork_bot'@'localhost';
FLUSH PRIVILEGES;
EXIT;

mysql -u upwork_bot -p -h localhost upwork_bot < ./sql/1_create_users_table.sql
mysql -u upwork_bot -p -h localhost upwork_bot < ./sql/2_create_rss_table.sql
mysql -u upwork_bot -p -h localhost upwork_bot < ./sql/3_create_offers_table.sql
```

### 6. Run the Bot
```bash
node app.js
```

## Running as a Service

### 1. Create Service Config File
```bash
sudo nano /etc/systemd/system/bot.service
```

### 2. Add the Following Content to the Service Config File
```bash
[Unit]
Description=My Node.js Upwork Bot
After=network.target

[Service]
User=root
Group=root
WorkingDirectory=/var/www/bot
ExecStart=/bin/bash -c '/usr/bin/node /var/www/bot/app.js >> /var/www/bot/output.log 2>&1'
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

### 3. Reload Systemd to Read the New Service Configuration
```bash
sudo systemctl daemon-reload
```

### 4. Start Your Bot Service
```bash
sudo systemctl start bot
```

```rust
This template provides clear instructions for installing, setting up the environment, and running the bot both manually and as a service. Adjust paths and configurations as necessary for your environment.
```
