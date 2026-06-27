"use strict";
// aponta para o backend local em desenvolvimento ou para o publicado em produção
const backendAddress = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'
    ? 'http://127.0.0.1:8000/api'
    : 'https://giovanamalaia.pythonanywhere.com/api';
const backendBase = backendAddress.replace(/\/api$/, '');
// chave usada para marcar no localStorage que o usuário está logado
const AUTH_KEY = 'livro_auth';
let csrfToken = '';
// lista de siglas de estados brasileiros
const estados = [
    'AC',
    'AL',
    'AP',
    'AM',
    'BA',
    'CE',
    'DF',
    'ES',
    'GO',
    'MA',
    'MT',
    'MS',
    'MG',
    'PA',
    'PB',
    'PR',
    'PE',
    'PI',
    'RJ',
    'RN',
    'RS',
    'RO',
    'RR',
    'SC',
    'SP',
    'SE',
    'TO',
];
// pares de [valor de banco, rótulo legível] para os gêneros de livros
const generos = [
    ['ficcao_geral', 'Ficção Geral'],
    ['nao_ficcao_geral', 'Não Ficção Geral'],
    ['fantasia', 'Fantasia'],
    ['ficcao_cientifica', 'Ficção Científica'],
    ['romance', 'Romance'],
    ['misterio_suspense', 'Mistério & Suspense'],
    ['terror', 'Terror'],
    ['aventura', 'Aventura'],
    ['jovem_adulto', 'Jovem Adulto'],
    ['infantil', 'Infantil & Infanto-juvenil'],
    ['hq_manga', 'HQs, Mangás & Graphic Novels'],
    ['biografia', 'Biografia'],
    ['autoajuda', 'Autoajuda'],
    ['academico', 'Acadêmicos'],
    ['historia_politica', 'História & Política'],
    ['religiao', 'Religião & Espiritualidade'],
    ['classica', 'Literatura Clássica'],
    ['contemporanea', 'Literatura Contemporânea'],
    ['drama', 'Drama'],
    ['poesia', 'Poesia'],
    ['teatro', 'Teatro'],
    ['outros', 'Outros'],
];
// escapa caracteres especiais para exibir texto no html com segurança
function html(valor) {
    return String(valor !== null && valor !== void 0 ? valor : '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
// monta a url completa de uma imagem hospedada no backend
function mediaUrl(url) {
    if (!url)
        return '';
    if (url.startsWith('http://') || url.startsWith('https://'))
        return url;
    return `${backendBase}${url.startsWith('/') ? url : `/${url}`}`;
}
// lê um cookie pelo nome
function cookie(nome) {
    var _a;
    const partes = `; ${document.cookie}`.split(`; ${nome}=`);
    return partes.length === 2 ? decodeURIComponent(((_a = partes.pop()) === null || _a === void 0 ? void 0 : _a.split(';').shift()) || '') : '';
}
// converte os campos de um formulário em um objeto simples
function formObject(form) {
    const data = {};
    const elements = form.elements;
    for (let i = 0; i < elements.length; i++) {
        const element = elements.item(i);
        if (element.name)
            data[element.name] = element.value;
    }
    return data;
}
// transforma os erros de validação da api em texto legível
function errorsToText(errors) {
    if (!errors)
        return '';
    return Object.entries(errors)
        .map(([campo, mensagens]) => `${campo}: ${mensagens.join(', ')}`)
        .join(' ');
}
// exibe uma mensagem de feedback na div#mensagem da página
function mostrarMensagem(texto = '', tipo = 'info') {
    const caixa = document.getElementById('mensagem');
    if (!caixa)
        return;
    caixa.innerHTML = texto ? `<div class="toast-message ${tipo}">${html(texto)}</div>` : '';
}
// redireciona para a página inicial se o usuário não estiver logado
function exigirLogin() {
    if (localStorage.getItem(AUTH_KEY) !== '1')
        location.href = 'index.html';
}
// garante que o csrfToken está disponível antes de chamadas que modificam dados
async function ensureCsrf() {
    if (csrfToken)
        return;
    const resposta = await fetch(`${backendAddress}/csrf/`, { credentials: 'include' });
    const dados = await resposta.json();
    if (dados.csrfToken)
        csrfToken = dados.csrfToken;
}
// envia uma requisição ao backend e devolve o json da resposta
async function api(path, options = {}) {
    const method = options.method || 'GET';
    const headers = new Headers();
    let body;
    if (options.body instanceof FormData)
        body = options.body;
    else if (options.body) {
        headers.set('Content-Type', 'application/json');
        body = JSON.stringify(options.body);
    }
    if (method !== 'GET') {
        await ensureCsrf();
        if (csrfToken)
            headers.set('X-CSRFToken', csrfToken);
    }
    try {
        const resposta = await fetch(`${backendAddress}${path}`, { method, headers, body, credentials: 'include' });
        if (resposta.status === 401)
            localStorage.removeItem(AUTH_KEY);
        return (await resposta.json());
    }
    catch (_a) {
        return { status: 'error', message: 'Não consegui conectar ao backend.' };
    }
}
// retorna o html da capa de um livro, ou um placeholder se não tiver capa
function capaLivro(livro) {
    return livro.capa_url
        ? `<img src="${html(mediaUrl(livro.capa_url))}" alt="${html(livro.titulo)}">`
        : '<div class="placeholder-capa">Sem capa</div>';
}
// monta o html do card de um livro para uso nos sliders
function cardLivro(livro) {
    return `<a class="book-card" href="detalhe_livro.html?id=${livro.id}&next=${encodeURIComponent(location.pathname.split('/').pop() || 'home.html')}" style="text-decoration:none;color:inherit;display:block;"><span class="book-cover-wrapper">${capaLivro(livro)}</span><span class="book-title">${html(livro.titulo)}</span><span class="book-author">${html(livro.autor)}</span></a>`;
}
// monta uma seção de slider com título e lista de cards de livros
function slider(titulo, livros) {
    return `<div class="book-slider-section"><div class="slider-header"><h3>${html(titulo)}</h3></div><div class="slider-container">${livros.length ? livros.map(cardLivro).join('') : '<p class="empty-msg">Nenhum livro encontrado nesta seção.</p>'}</div></div>`;
}
// injeta o html da barra do topo com perfil, notificações e botão de sair
function montarTopBarRight() {
    const container = document.getElementById('topBarRight');
    if (!container)
        return;
    container.innerHTML = `<button class="user-info-mini" id="linkPerfil" type="button"><span id="topAvatar" class="avatar-placeholder-mini"><i class="fa-solid fa-user"></i></span><span id="topUsername">Perfil</span></button><div class="notif-wrapper"><button class="notif-btn" id="botaoNotificacoes" type="button"><i class="fa-regular fa-bell bell-icon"></i><span class="notif-badge" id="notifBadge" hidden>0</span></button><div class="notif-dropdown" id="notifDropdown" hidden><h4>Notificações</h4><div class="notif-items-container" id="notificacoesLista"></div></div></div><button class="top-bar-sair" id="botaoSair" type="button"><i class="fa-solid fa-right-from-bracket"></i> Sair</button>`;
}
// injeta o html da barra lateral com os links de navegação
function montarSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar)
        return;
    sidebar.innerHTML = `<div class="sidebar-inner"><div class="sidebar-brand"><i class="fa-solid fa-book"></i></div><div class="sidebar-sep"></div><nav class="sidebar-nav"><a class="sidebar-link" href="home.html" aria-label="Início"><i class="fa-solid fa-house sidebar-icon"></i></a><a class="sidebar-link" href="favoritos.html" aria-label="Interesses"><i class="fa-solid fa-handshake-angle sidebar-icon"></i></a><a class="sidebar-link" href="desejos_futuros.html" aria-label="Desejos futuros"><i class="fa-solid fa-bookmark sidebar-icon"></i></a><a class="sidebar-link" href="perfil.html" aria-label="Perfil"><i class="fa-solid fa-user sidebar-icon"></i></a><a class="sidebar-link" href="adicionar_livro.html" aria-label="Adicionar livro"><i class="fa-solid fa-plus sidebar-icon"></i></a><a class="sidebar-link" href="configuracoes.html" aria-label="Configurações"><i class="fa-solid fa-gear sidebar-icon"></i></a></nav></div>`;
}
// busca dados do perfil e notificações e atualiza o topo da página
async function atualizarTopo() {
    const perfil = await api('/configuracoes/');
    if (perfil.status === 'success' && perfil.data) {
        const nome = perfil.data.first_name || perfil.data.username;
        const nomeEl = document.getElementById('topUsername');
        if (nomeEl)
            nomeEl.textContent = nome;
        const avatar = document.getElementById('topAvatar');
        if (avatar && perfil.data.foto_perfil_url)
            avatar.outerHTML = `<img src="${html(mediaUrl(perfil.data.foto_perfil_url))}" alt="${html(nome)}" class="avatar-mini" id="topAvatar">`;
    }
    const notificacoes = await api(`/notificacoes/?_=${Date.now()}`);
    const lista = document.getElementById('notificacoesLista');
    const badge = document.getElementById('notifBadge');
    const dados = notificacoes.status === 'success' ? notificacoes.data || [] : [];
    if (badge) {
        badge.textContent = String(dados.length);
        badge.hidden = dados.length === 0;
    }
    if (lista) {
        lista.innerHTML = dados.length
            ? dados
                .map((n) => `<div class="notif-item"><div class="notif-avatar">${n.usuario_foto_perfil_url ? `<img src="${html(mediaUrl(n.usuario_foto_perfil_url))}" alt="${html(n.usuario_nome)}" class="notif-img">` : html(n.usuario_nome).slice(0, 2).toUpperCase()}</div><div class="notif-body"><div class="notif-text"><strong>${html(n.usuario_nome)}</strong> tem interesse no seu livro <strong>${html(n.livro_titulo)}</strong>.</div><div class="notif-actions"><button class="btn-notif-accept" data-accept="${n.id}" type="button">Aceitar</button><button class="btn-notif-decline" data-decline="${n.id}" type="button">Recusar</button></div></div></div>`)
                .join('')
            : '<div class="notif-empty">Nenhuma solicitação de troca no momento.</div>';
    }
}
// alterna a visibilidade do painel de notificações
function abrirOuFecharNotificacoes() {
    const painel = document.getElementById('notifDropdown');
    if (!painel)
        return;
    const vaiAbrir = painel.hidden || painel.style.display === 'none' || painel.style.display === '';
    painel.hidden = !vaiAbrir;
    painel.style.display = vaiAbrir ? 'block' : 'none';
    if (vaiAbrir)
        void atualizarTopo();
}
// inicializa o topo e a sidebar e registra os eventos de clique
function configurarTopo() {
    var _a, _b, _c;
    montarTopBarRight();
    montarSidebar();
    (_a = document.getElementById('linkPerfil')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => (location.href = 'perfil.html'));
    (_b = document.getElementById('botaoSair')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', async () => {
        await api('/logout/', { method: 'POST' });
        localStorage.removeItem(AUTH_KEY);
        location.href = 'index.html';
    });
    (_c = document.getElementById('botaoNotificacoes')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', (evento) => {
        evento.preventDefault();
        evento.stopPropagation();
        abrirOuFecharNotificacoes();
    });
    document.addEventListener('click', async (evento) => {
        const alvo = evento.target;
        const aceitar = alvo.dataset.accept;
        const recusar = alvo.dataset.decline;
        if (aceitar || recusar) {
            const path = aceitar ? `/interesse/${aceitar}/aceitar/` : `/interesse/${recusar}/recusar/`;
            await api(path, { method: 'POST' });
            await atualizarTopo();
            return;
        }
        if (!alvo.closest('.notif-wrapper')) {
            const painel = document.getElementById('notifDropdown');
            if (painel) {
                painel.hidden = true;
                painel.style.display = 'none';
            }
        }
    });
    void atualizarTopo();
    window.setInterval(() => {
        void atualizarTopo();
    }, 1000);
}
// preenche os selects de estado e cidade com os dados do ibge
async function carregarCidades(estadoSelect, cidadeSelect, estadoAtual = '', cidadeAtual = '') {
    const resposta = await fetch('ibge_cidades.json');
    const dados = (await resposta.json());
    estadoSelect.innerHTML =
        '<option value="">Selecione o estado</option>' +
            estados.map((uf) => `<option value="${uf}" ${uf === estadoAtual ? 'selected' : ''}>${uf}</option>`).join('');
    function preencherCidade() {
        var _a;
        const uf = estadoSelect.value;
        const cidades = ((_a = dados[uf]) === null || _a === void 0 ? void 0 : _a.cidades) || [];
        cidadeSelect.innerHTML =
            '<option value="">Selecione a cidade</option>' +
                cidades
                    .map((c) => `<option value="${html(c)}" ${c === cidadeAtual ? 'selected' : ''}>${html(c)}</option>`)
                    .join('');
    }
    estadoSelect.addEventListener('change', preencherCidade);
    preencherCidade();
}
