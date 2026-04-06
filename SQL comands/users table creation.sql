create table users (
	id int AUTO_INCREMENT,
    name varchar(100),
    email varchar(100) unique,
    password_hash varchar(255),
    role ENUM('admin','creator','donor'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    primary key(id)
)

ALTER TABLE `users` 
CHANGE COLUMN `name` `name` VARCHAR(100) NOT NULL ,
CHANGE COLUMN `email` `email` VARCHAR(100) NOT NULL ,
CHANGE COLUMN `password_hash` `password_hash` VARCHAR(255) NOT NULL ,
CHANGE COLUMN `role` `role` ENUM('admin', 'creator', 'donor') NOT NULL ,
CHANGE COLUMN `created_at` `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ,
ADD UNIQUE INDEX `email_UNIQUE` (`email` ASC) VISIBLE;
;

