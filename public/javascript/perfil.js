"use strict";
var _a;
exigirLogin();
configurarTopo();
async function carregarPerfil() {
    const resposta = await api('/perfil/');
    if (resposta.status !== 'success' || !resposta.data)
        return;
    const dados = resposta.data;
    const nome = [dados.first_name, dados.last_name].filter(Boolean).join(' ') || dados.username;
    document.getElementById('nomePerfil').textContent = nome;
    document.getElementById('cidadePerfil').textContent = dados.cidade || 'Meus livros para troca';
    if (dados.foto_perfil_url)
        document.getElementById('fotoPerfil').outerHTML = `<img src="${html(dados.foto_perfil_url)}" class="profile-large-avatar" id="fotoPerfil" alt="${html(nome)}">`;
    document.getElementById('meusLivros').innerHTML = slider('Meus livros', dados.meus_livros);
}
(_a = document.getElementById('botaoAdicionarLivro')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => location.href = 'adicionar_livro.html');
void carregarPerfil();
