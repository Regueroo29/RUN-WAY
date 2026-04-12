CREATE DATABASE RUNW_DB;

USE RUNW_DB;

CREATE TABLE Users (
	user_id INT IDENTITY(1,1) PRIMARY KEY,
	username VARCHAR(100) NOT NULL,
	password VARCHAR(255) NOT NULL,
	role VARCHAR(20) CHECK (role IN ('Visitor','Designer','Admin')) NOT NULL,
	created_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE Design (
	design_id INT IDENTITY(1,1) PRIMARY KEY,
	designer_id INT NOT NULL,
	title VARCHAR(200) NOT NULL,
	description TEXT,
	image_url VARCHAR(500),
	upload_at DATETIME DEFAULT GETDATE(),


	FOREIGN KEY (designer_id) REFERENCES Users(user_id)
);

CREATE TABLE Rating (
	rating_id INT IDENTITY(1,1) PRIMARY KEY,
	design_id INT NOT NULL,
	visitor_id INT NOT NULL,
	rating_type VARCHAR(10) CHECK (rating_type IN ('Heart','Decline')) NOT NULL,
	rated_at DATETIME DEFAULT GETDATE(),

	FOREIGN KEY (design_id) REFERENCES Design(design_id),
	FOREIGN KEY (visitor_id) REFERENCES Users(user_id),

	CONSTRAINT unique_rating UNIQUE (design_id, visitor_id)
);

INSERT INTO Users (username, password, role) VALUES
('Rheyang', '12', 'Designer'),
('Machu', '13', 'Visitor');

INSERT INTO Design (designer_id, title, description, image_url) VALUES
(1, 'Street Outfit', 'Cool Urban Wear', 'street.jpg');

INSERT INTO Rating (design_id, visitor_id, rating_type) VALUES
(1, 2, 'Heart');

SELECT * FROM Users;
SELECT * FROM Design;
SELECT * FROM Rating;