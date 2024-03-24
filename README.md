# Upwork Helper Bot

### install node packages
```bash
npm install
```

### copy and set .env variables
```bash
cp .env-example .env
nano .env
```

### run sql migrations
```bash
mysql -u upwork_bot -p -h localhost upwork_bot < ./sql/1_create_users_table.sql
mysql -u upwork_bot -p -h localhost upwork_bot < ./sql/2_create_rss_table.sql
mysql -u upwork_bot -p -h localhost upwork_bot < ./sql/3_create_offers_table.sql
```

### run bot
```bash
node app.js
