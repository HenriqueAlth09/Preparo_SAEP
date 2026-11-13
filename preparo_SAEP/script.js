const API_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Cadastro de Usuários
    const formUsuario = document.getElementById('form-usuario');
    if (formUsuario) {
        formUsuario.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nome = document.getElementById('nome').value.trim();
            const email = document.getElementById('email').value.trim();
            const mensagemEl = document.getElementById('mensagem');

            mensagemEl.textContent = '';
            mensagemEl.className = 'mensagem';

            if (!nome || !email) {
                mensagemEl.textContent = 'Todos os campos são obrigatórios.';
                mensagemEl.classList.add('erro');
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                mensagemEl.textContent = 'Insira um e-mail válido.';
                mensagemEl.classList.add('erro');
                return;
            }

            try {
                const res = await fetch(`${API_URL}/usuarios`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nome, email })
                });

                if (!res.ok) throw new Error('Erro ao cadastrar usuário ou e-mail já existente.');

                alert('cadastro concluído com sucesso');
                mensagemEl.textContent = 'cadastro concluído com sucesso';
                mensagemEl.classList.add('sucesso');
                formUsuario.reset();
            } catch (err) {
                mensagemEl.textContent = err.message;
                mensagemEl.classList.add('erro');
            }
        });
    }

    // 2. Cadastro de Tarefas
    const formTarefa = document.getElementById('form-tarefa');
    if (formTarefa) {
        carregarUsuariosSelect();

        formTarefa.addEventListener('submit', async (e) => {
            e.preventDefault();
            const descricao = document.getElementById('descricao').value.trim();
            const nome_setor = document.getElementById('nome_setor').value.trim();
            const id_usuario = document.getElementById('id_usuario').value;
            const prioridade = document.getElementById('prioridade').value;
            const mensagemEl = document.getElementById('mensagem');

            mensagemEl.textContent = '';
            mensagemEl.className = 'mensagem';

            if (!descricao || !nome_setor || !id_usuario || !prioridade) {
                mensagemEl.textContent = 'Todos os campos são obrigatórios.';
                mensagemEl.classList.add('erro');
                return;
            }

            try {
                const res = await fetch(`${API_URL}/tarefas`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id_usuario: Number(id_usuario),
                        descricao,
                        nome_setor,
                        prioridade,
                        status: 'a fazer'
                    })
                });

                if (!res.ok) throw new Error('Erro ao cadastrar tarefa.');

                alert('cadastro concluído com sucesso');
                mensagemEl.textContent = 'cadastro concluído com sucesso';
                mensagemEl.classList.add('sucesso');
                formTarefa.reset();
            } catch (err) {
                mensagemEl.textContent = err.message;
                mensagemEl.classList.add('erro');
            }
        });
    }

    // 3. Gerenciar Tarefas (Kanban)
    if (document.getElementById('list-a-fazer')) {
        carregarTarefasKanban();
    }
});

async function carregarUsuariosSelect() {
    const select = document.getElementById('id_usuario');
    if (!select) return;
    try {
        const res = await fetch(`${API_URL}/usuarios`);
        const usuarios = await res.json();
        usuarios.forEach(u => {
            const opt = document.createElement('option');
            opt.value = u.id;
            opt.textContent = u.nome;
            select.appendChild(opt);
        });
    } catch (err) {
        console.error('Erro ao carregar usuários:', err);
    }
}

async function carregarTarefasKanban() {
    try {
        const res = await fetch(`${API_URL}/tarefas`);
        const tarefas = await res.json();

        const colAhaFazer = document.getElementById('list-a-fazer');
        const colFazendo = document.getElementById('list-fazendo');
        const colPronto = document.getElementById('list-pronto');

        if (!colAhaFazer || !colFazendo || !colPronto) return;

        colAhaFazer.innerHTML = '';
        colFazendo.innerHTML = '';
        colPronto.innerHTML = '';

        tarefas.forEach(t => {
            const card = document.createElement('div');
            card.className = 'task-card';

            let botoesStatusHtml = '';
            if (t.status === 'a fazer') {
                botoesStatusHtml = `
                    <button class="btn-status" onclick="mudarStatus(${t.id_tarefa}, 'fazendo', '${t.prioridade}')">Fazendo</button>
                    <button class="btn-status" onclick="mudarStatus(${t.id_tarefa}, 'pronto', '${t.prioridade}')">Pronto</button>
                `;
            } else if (t.status === 'fazendo') {
                botoesStatusHtml = `
                    <button class="btn-status" onclick="mudarStatus(${t.id_tarefa}, 'a fazer', '${t.prioridade}')">A fazer</button>
                    <button class="btn-status" onclick="mudarStatus(${t.id_tarefa}, 'pronto', '${t.prioridade}')">Pronto</button>
                `;
            } else if (t.status === 'pronto') {
                botoesStatusHtml = `
                    <button class="btn-status" onclick="mudarStatus(${t.id_tarefa}, 'a fazer', '${t.prioridade}')">A fazer</button>
                    <button class="btn-status" onclick="mudarStatus(${t.id_tarefa}, 'fazendo', '${t.prioridade}')">Fazendo</button>
                `;
            }

            const nomeUsuario = t.usuario ? t.usuario.nome : ('Usuário ' + t.id_usuario);
            const prioridadeFormatada = t.prioridade ? (t.prioridade.charAt(0).toUpperCase() + t.prioridade.slice(1)) : '';

            card.innerHTML = `
                <p><strong>Descrição:</strong> ${t.descricao}</p>
                <p><strong>Setor:</strong> ${t.nome_setor}</p>
                <p><strong>Prioridade:</strong> ${prioridadeFormatada}</p>
                <p><strong>Vinculado a:</strong> ${nomeUsuario}</p>
                
                <div class="card-actions">
                    <button class="btn-editar" onclick="editarTarefa(${t.id_tarefa}, '${t.descricao}', '${t.nome_setor}', '${t.prioridade}', '${t.status}')">Editar</button>
                    <button class="btn-excluir" onclick="deletarTarefa(${t.id_tarefa})">Excluir</button>
                </div>

                <div class="status-change">
                    <span>Alterar status:</span>
                    <div class="status-buttons">
                        ${botoesStatusHtml}
                    </div>
                </div>
            `;

            if (t.status === 'a fazer') colAhaFazer.appendChild(card);
            else if (t.status === 'fazendo') colFazendo.appendChild(card);
            else if (t.status === 'pronto') colPronto.appendChild(card);
        });
    } catch (err) {
        console.error('Erro ao carregar tarefas:', err);
    }
}

async function mudarStatus(id_tarefa, novoStatus, prioridadeAtual) {
    try {
        const res = await fetch(`${API_URL}/tarefas/${id_tarefa}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                status: novoStatus, 
                prioridade: prioridadeAtual 
            })
        });

        if (!res.ok) throw new Error('Erro ao alterar status.');
        carregarTarefasKanban();
    } catch (err) {
        alert('Não foi possível alterar o status da tarefa.');
        console.error(err);
    }
}

async function editarTarefa(id_tarefa, descricaoAtual, setorAtual, prioridadeAtual, statusAtual) {
    const novaDescricao = prompt("Editar Descrição:", descricaoAtual);
    if (novaDescricao === null) return;

    const novoSetor = prompt("Editar Setor:", setorAtual);
    if (novoSetor === null) return;

    const novaPrioridade = prompt("Editar Prioridade (baixa, média, alta):", prioridadeAtual);
    if (novaPrioridade === null) return;

    try {
        const res = await fetch(`${API_URL}/tarefas/${id_tarefa}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                descricao: novaDescricao.trim(),
                nome_setor: novoSetor.trim(),
                prioridade: novaPrioridade.trim().toLowerCase(),
                status: statusAtual
            })
        });

        if (!res.ok) throw new Error('Erro ao editar tarefa.');

        alert('Tarefa atualizada com sucesso!');
        carregarTarefasKanban();
    } catch (err) {
        alert(err.message);
    }
}

async function deletarTarefa(id_tarefa) {
    if (confirm('Deseja realmente excluir esta tarefa?')) {
        try {
            await fetch(`${API_URL}/tarefas/${id_tarefa}`, { method: 'DELETE' });
            carregarTarefasKanban();
        } catch (err) {
            alert('Erro ao excluir tarefa.');
        }
    }
}