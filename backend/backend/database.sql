CREATE DATABASE IF NOT EXISTS uthub_db;
USE uthub_db;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  matricula VARCHAR(10) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  carrera VARCHAR(100),
  rol ENUM('estudiante','emprendedor') DEFAULT 'estudiante',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tiendas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) DEFAULT NULL,
  descripcion TEXT DEFAULT NULL,
  imagen TEXT DEFAULT NULL,
  categoria VARCHAR(50) DEFAULT NULL,
  horario TEXT DEFAULT NULL,
  abierta TINYINT(1) NOT NULL DEFAULT 1,
  usuario_id INT DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tienda_id INT DEFAULT NULL,
  nombre VARCHAR(100) DEFAULT NULL,
  precio DECIMAL(10,2) DEFAULT NULL,
  descripcion TEXT DEFAULT NULL,
  imagen TEXT DEFAULT NULL,
  categoria VARCHAR(50) DEFAULT NULL,
  badge VARCHAR(50) DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS pedidos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT DEFAULT NULL,
  tienda_id INT DEFAULT NULL,
  tienda_nombre VARCHAR(120) DEFAULT NULL,
  ubicacion VARCHAR(100) DEFAULT NULL,
  instrucciones TEXT DEFAULT NULL,
  total DECIMAL(10,2) DEFAULT NULL,
  estado ENUM('nuevo','preparando','listo','entregado','cancelado') NOT NULL DEFAULT 'nuevo',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS detalle_pedido (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT DEFAULT NULL,
  producto_id INT DEFAULT NULL,
  producto_nombre VARCHAR(150) DEFAULT NULL,
  producto_precio DECIMAL(10,2) DEFAULT NULL,
  cantidad INT DEFAULT NULL
);
