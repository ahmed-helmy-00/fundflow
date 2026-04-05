create table users (
	id int AUTO_INCREMENT,
    name varchar(100),
    email varchar(100),
    password_hash varchar(255),
    role ENUM('admin','creator','donor'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    primary key(id)
)
