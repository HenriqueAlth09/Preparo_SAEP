CREATE DATABASE IF NOT EXISTS gerenciador_tarefas;
USE gerenciador_tarefas;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE tarefas (
    id_tarefa INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    descricao VARCHAR(250) NOT NULL,
    nome_setor VARCHAR(25) NOT NULL,
    prioridade VARCHAR(20) NOT NULL,
    data_cadastro DATETIME NOT NULL,
    status VARCHAR(15) NOT NULL,
    CONSTRAINT fk_tarefa_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
);