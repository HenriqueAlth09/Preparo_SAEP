const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'gerenciador_tarefas'
});

// Cadastrar Usuário
app.post('/usuarios', async (req, res) => {
    try {
        const { nome, email } = req.body;
        const [result] = await pool.execute(
            'INSERT INTO usuarios (nome, email) VALUES (?, ?)',
            [nome, email]
        );
        res.status(201).json({ id: result.insertId, nome, email });
    } catch (err) {
        res.status(400).json({ error: 'Erro ao cadastrar usuário ou e-mail já cadastrado.' });
    }
});

// Listar Usuários
app.get('/usuarios', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM usuarios');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar usuários.' });
    }
});

// Cadastrar Tarefa
app.post('/tarefas', async (req, res) => {
    try {
        const { id_usuario, descricao, nome_setor, prioridade, status } = req.body;
        const [result] = await pool.execute(
            'INSERT INTO tarefas (id_usuario, descricao, nome_setor, prioridade, data_cadastro, status) VALUES (?, ?, ?, ?, NOW(), ?)',
            [id_usuario, descricao, nome_setor, prioridade, status || 'a fazer']
        );
        res.status(201).json({ id_tarefa: result.insertId });
    } catch (err) {
        res.status(400).json({ error: 'Erro ao cadastrar tarefa.' });
    }
});

// Listar Tarefas com o nome do Usuário
app.get('/tarefas', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT t.*, u.nome AS usuario_nome 
            FROM tarefas t 
            JOIN usuarios u ON t.id_usuario = u.id
        `);
        const formatado = rows.map(r => ({
            ...r,
            usuario: { nome: r.usuario_nome }
        }));
        res.json(formatado);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar tarefas.' });
    }
});

// Atualizar Tarefa (Com suporte a atualização parcial de status/prioridade ou edição completa)
app.put('/tarefas/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { descricao, nome_setor, prioridade, status } = req.body;
        
        await pool.execute(
            `UPDATE tarefas 
             SET descricao = COALESCE(?, descricao), 
                 nome_setor = COALESCE(?, nome_setor), 
                 prioridade = COALESCE(?, prioridade), 
                 status = COALESCE(?, status) 
             WHERE id_tarefa = ?`,
            [descricao || null, nome_setor || null, prioridade || null, status || null, id]
        );
        
        res.json({ message: 'Tarefa atualizada com sucesso' });
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: 'Erro ao atualizar tarefa.' });
    }
});

// Excluir Tarefa
app.delete('/tarefas/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.execute('DELETE FROM tarefas WHERE id_tarefa = ?', [id]);
        res.json({ message: 'Tarefa excluída com sucesso' });
    } catch (err) {
        res.status(400).json({ error: 'Erro ao excluir tarefa.' });
    }
});

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000 conectado ao XAMPP!');
});