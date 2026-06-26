"use strict";
var _a, _b;
exigirLogin();
configurarTopo();
// salva a posição de scroll atual de cada slider antes de recarregar
function scrollSlidersAtuais(conteudo) {
    const scrolls = new Map();
    conteudo.querySelectorAll('.book-slider-section').forEach((section) => {
        var _a;
        const titulo = ((_a = section.querySelector('h3')) === null || _a === void 0 ? void 0 : _a.textContent) || '';
        const container = section.querySelector('.slider-container');
        if (titulo && container)
            scrolls.set(titulo, container.scrollLeft);
    });
    return scrolls;
}
// restaura a posição de scroll dos sliders após recarregar o conteúdo
function restaurarScrollSliders(conteudo, scrolls) {
    conteudo.querySelectorAll('.book-slider-section').forEach((section) => {
        var _a;
        const titulo = ((_a = section.querySelector('h3')) === null || _a === void 0 ? void 0 : _a.textContent) || '';
        const scrollLeft = scrolls.get(titulo);
        const container = section.querySelector('.slider-container');
        if (container && scrollLeft !== undefined)
            container.scrollLeft = scrollLeft;
    });
}
// busca os livros da home e renderiza os sliders
async function carregarHome() {
    var _a, _b;
    const q = ((_a = document.getElementById('q')) === null || _a === void 0 ? void 0 : _a.value) || '';
    const resposta = await api(`/home/${q ? `?q=${encodeURIComponent(q)}` : ''}`);
    const conteudo = document.getElementById('conteudoHome');
    const scrolls = scrollSlidersAtuais(conteudo);
    if (resposta.status !== 'success') {
        conteudo.innerHTML = '<p class="empty-msg">Não foi possível carregar os livros.</p>';
        return;
    }
    const dados = resposta.data;
    conteudo.innerHTML = `${((_b = dados === null || dados === void 0 ? void 0 : dados.livros_perto) === null || _b === void 0 ? void 0 : _b.length) ? slider('Perto de você', dados.livros_perto) : ''}${slider('Últimos', (dados === null || dados === void 0 ? void 0 : dados.latest_books) || [])}${((dados === null || dados === void 0 ? void 0 : dados.livros_por_genero) || []).map((g) => slider(g.titulo_secao, g.livros)).join('')}`;
    restaurarScrollSliders(conteudo, scrolls);
}
(_a = document.getElementById('formBusca')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', (evento) => {
    evento.preventDefault();
    void carregarHome();
});
let debounceTimer;
// aguarda o usuário parar de digitar antes de buscar
(_b = document.getElementById('q')) === null || _b === void 0 ? void 0 : _b.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => void carregarHome(), 400);
});
void carregarHome();
