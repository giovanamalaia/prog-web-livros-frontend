"use strict";
var _a;
exigirLogin();
configurarTopo();
// busca os interesses de troca do usuário e exibe em um slider
async function carregarFavoritos() {
    var _a;
    const q = ((_a = document.getElementById('q')) === null || _a === void 0 ? void 0 : _a.value) || '';
    const resposta = await api(`/favoritos/${q ? `?q=${encodeURIComponent(q)}` : ''}`);
    const lista = document.getElementById('listaFavoritos');
    const itens = resposta.status === 'success' ? resposta.data || [] : [];
    lista.innerHTML = slider('Seus interesses', itens.map((i) => ({
        id: i.livro_id,
        titulo: i.livro_titulo,
        autor: i.livro_autor,
        capa_url: i.livro_capa_url,
        status: i.status_interesse,
    })));
}
// filtra os interesses ao enviar a busca
(_a = document.getElementById('formBusca')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', (evento) => {
    evento.preventDefault();
    void carregarFavoritos();
});
void carregarFavoritos();
