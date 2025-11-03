create table variantes_productos(
	id INT AUTO_INCREMENT PRIMARY KEY,
    producto_id INT NOT NULL,
    size VARCHAR(10) NOT NULL, 
    color VARCHAR(50) NOT NULL,    
    stock INT DEFAULT 0,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);

CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    imagen text not null,
    category_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categoria(id)
);

CREATE TABLE categoria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);