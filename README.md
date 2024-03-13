# Upwork Helper

### install node packages
```bash
npm install
```

### install driver
```bash
npm install mysql2
```

### copy and set .env variables
```bash
cp .env-example .env
nano .env
```

### check DB connection
```bash
node check-db-connect.js
```

### run sql migrations
```bash
mysql -u db_user -p -h db_host db_name < 1_create_users_table.sql
mysql -u db_user -p -h db_host db_name < 2_create_rss_table.sql
mysql -u db_user -p -h db_host db_name < 3_create_offers_table.sql
```

### run bot
```bash
node bot.js