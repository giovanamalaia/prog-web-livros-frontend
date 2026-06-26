"use strict";
var _a;
exigirLogin();
configurarTopo();
async function carregarHome() {
    var _a, _b;
    const q = ((_a = document.getElementById('q')) === null || _a === void 0 ? void 0 : _a.value) || '';
    const resposta = await api(`/home/${q ? `?q=${encodeURIComponent(q)}` : ''}`);
    const conteudo = document.getElementById('conteudoHome');
    if (resposta.status !== 'success') {
        conteudo.innerHTML = '<p class="empty-msg">Não foi possível carregar os livros.</p>';
        return;
    }
    const dados = resposta.data;
    conteudo.innerHTML = `${((_b = dados === null || dados === void 0 ? void 0 : dados.livros_perto) === null || _b === void 0 ? void 0 : _b.length) ? slider('Perto de você', dados.livros_perto) : ''}${slider('Últimos', (dados === null || dados === void 0 ? void 0 : dados.latest_books) || [])}${((dados === null || dados === void 0 ? void 0 : dados.livros_por_genero) || []).map(g => slider(g.titulo_secao, g.livros)).join('')}`;
}
(_a = document.getElementById('formBusca')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', evento => { evento.preventDefault(); void carregarHome(); });
let debounceTimer;
document.getElementById('q')?.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => void carregarHome(), 400);
});
void carregarHome();
window.setInterval(() => { var _a; if (((_a = document.activeElement) === null || _a === void 0 ? void 0 : _a.id) !== 'q')
    void carregarHome(); }, 1000);