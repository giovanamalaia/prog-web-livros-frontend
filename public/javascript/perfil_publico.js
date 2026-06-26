"use strict";
var _a;
exigirLogin();
configurarTopo();
const paramsPerfilPublico = new URLSearchParams(location.search);
const donoId = paramsPerfilPublico.get('id');
const nextPerfilPublico = paramsPerfilPublico.get('next') || 'home.html';
async function carregarPerfilPublico() {
    var _a, _b;
    if (!donoId) {
        location.href = 'home.html';
        return;
    }
    const resposta = await api(`/perfil/${donoId}/`);
    if (resposta.status !== 'success' || !resposta.data)
        return;
    const dados = resposta.data;
    const nome = dados.first_name || dados.username;
    document.getElementById('nomePerfilPublico').textContent = nome;
    if (dados.foto_perfil_url)
        document.getElementById('fotoPerfilPublico').outerHTML =
            `<img src="${html(mediaUrl(dados.foto_perfil_url))}" class="profile-large-avatar" id="fotoPerfilPublico" alt="${html(nome)}">>`;
    const livros = (_b = (_a = dados.meus_livros) !== null && _a !== void 0 ? _a : dados.livros) !== null && _b !== void 0 ? _b : [];
    document.getElementById('livrosPerfilPublico').innerHTML = slider(`Livros de ${html(nome)}`, livros);
}
(_a = document.getElementById('botaoVoltarPublico')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => (location.href = nextPerfilPublico));
void carregarPerfilPublico();
