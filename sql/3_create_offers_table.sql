CREATE TABLE IF NOT EXISTS offers (
	id INT AUTO_INCREMENT PRIMARY KEY,
	user_id INT NOT NULL,
	chat_id INT NOT NULL,
	title VARCHAR(2048) NOT NULL,
	description TEXT,
	link VARCHAR(2048) NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	payload JSON
);

ALTER TABLE offers ADD INDEX offers_user_id (user_id);
ALTER TABLE offers ADD FOREIGN KEY (user_id) REFERENCES users(user_id);
ALTER TABLE offers ADD COLUMN truncatedMessage VARCHAR(4096);