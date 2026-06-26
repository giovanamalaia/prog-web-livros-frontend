"use strict";
var _a;
exigirLogin();
configurarTopo();
// busca os desejos futuros do usuário e exibe em um slider
async function carregarDesejosFuturos() {
    var _a;
    const q = ((_a = document.getElementById('q')) === null || _a === void 0 ? void 0 : _a.value) || '';
    const resposta = await api(`/desejos-futuros/${q ? `?q=${encodeURIComponent(q)}` : ''}`);
    const lista = document.getElementById('listaDesejosFuturos');
    const itens = resposta.status === 'success' ? resposta.data || [] : [];
    lista.innerHTML = slider('Desejos futuros', itens.map((i) => ({
        id: i.livro_id,
        titulo: i.livro_titulo,
        autor: i.livro_autor,
        capa_url: i.livro_capa_url,
    })));
}
// filtra os desejos futuros ao enviar a busca
(_a = document.getElementById('formBusca')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', (evento) => {
    evento.preventDefault();
    void carregarDesejosFuturos();
});
void carregarDesejosFuturos();
