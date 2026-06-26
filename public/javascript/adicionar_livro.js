"use strict";
var _a;
exigirLogin();
configurarTopo();
const paramsLivroForm = new URLSearchParams(location.search);
const livroId = paramsLivroForm.get('id');
function preencherGeneros() { const select = document.getElementById('genero'); select.innerHTML = generos.map(([v, l]) => `<option value="${v}">${l}</option>`).join(''); }
async function carregarLivro() {
    preencherGeneros();
    if (!livroId)
        return;
    document.getElementById('tituloFormularioLivro').textContent = 'Editar livro';
    document.getElementById('campoStatus').hidden = false;
    const resposta = await api(`/livro/${livroId}/`);
    const livro = resposta.data;
    if (!livro)
        return;
    document.getElementById('livroId').value = String(livro.id);
    document.getElementById('titulo').value = livro.titulo;
    document.getElementById('autor').value = livro.autor;
    document.getElementById('genero').value = livro.genero || '';
    document.getElementById('estadoLivro').value = livro.estado || 'N';
    document.getElementById('status').value = livro.status || 'disponivel';
}
(_a = document.getElementById('formLivro')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const form = evento.target;
    const dados = new FormData(form);
    const id = dados.get('id');
    dados.delete('id');
    const file = dados.get('capa');
    if (file instanceof File && !file.name)
        dados.delete('capa');
    const resposta = await api(id ? `/editar-livro/${id}/` : '/adicionar-livro/', { method: id ? 'PUT' : 'POST', body: dados });
    if (resposta.status === 'success')
        location.href = 'perfil.html';
    else
        mostrarMensagem(resposta.message || errorsToText(resposta.errors), 'error');
});
void carregarLivro();
