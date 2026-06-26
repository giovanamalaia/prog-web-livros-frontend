"use strict";
var _a;
exigirLogin();
configurarTopo();
const paramsLivroForm = new URLSearchParams(location.search);
const livroId = paramsLivroForm.get('id');
// popula o select de gênero com as opções disponíveis
function preencherGeneros() {
    const select = document.getElementById('genero');
    select.innerHTML = generos.map(([v, l]) => `<option value="${v}">${l}</option>`).join('');
}
// exibe a prévia da imagem de capa selecionada
function mostrarPreviewCapa(src) {
    const preview = document.getElementById('previewCapa');
    if (preview)
        preview.innerHTML = `<img src="${src}" alt="Capa do livro" />`;
}
// se vier um id na url, carrega os dados do livro para edição
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
    if (livro.capa_url)
        mostrarPreviewCapa(`${backendBase}${livro.capa_url}`);
}
// envia o formulário para criar ou editar o livro conforme o id
(_a = document.getElementById('formLivro')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const form = evento.target;
    const dados = new FormData(form);
    const id = dados.get('id');
    dados.delete('id');
    const file = dados.get('capa');
    if (file instanceof File && !file.name)
        dados.delete('capa');
    const resposta = await api(id ? `/editar-livro/${id}/` : '/adicionar-livro/', {
        method: id ? 'PUT' : 'POST',
        body: dados,
    });
    if (resposta.status === 'success')
        location.href = 'perfil.html';
    else
        mostrarMensagem(resposta.message || errorsToText(resposta.errors), 'error');
});
const capaInput = document.getElementById('capa');
// atualiza a prévia quando o usuário seleciona uma nova imagem
capaInput === null || capaInput === void 0 ? void 0 : capaInput.addEventListener('change', () => {
    var _a;
    const file = (_a = capaInput.files) === null || _a === void 0 ? void 0 : _a[0];
    if (file)
        mostrarPreviewCapa(URL.createObjectURL(file));
});
void carregarLivro();
