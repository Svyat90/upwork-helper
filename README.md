# Upwork Helper Bot

### install node packages
```bash
npm install
```

### install database driver
```bash
npm install mysql2
```

### copy and set .env variables
```bash
cp .env-example .env
nano .env
```

### run sql migrations
```bash
mysql -u db_user -p -h db_host db_name < ./sql/1_create_users_table.sql
mysql -u db_user -p -h db_host db_name < ./sql/2_create_rss_table.sql
mysql -u db_user -p -h db_host db_name < ./sql/3_create_offers_table.sql
```

### run bot
```bash
node app.js