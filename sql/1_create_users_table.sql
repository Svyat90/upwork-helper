CREATE TABLE IF NOT EXISTS users (
    user_id INT NOT NULL,
	chat_id INT NOT NULL,
    username VARCHAR(255),
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	payload JSON
);

ALTER TABLE users ADD INDEX users_user_id (user_id);
ALTER TABLE users ADD UNIQUE INDEX users_user_id_uniq (user_id);