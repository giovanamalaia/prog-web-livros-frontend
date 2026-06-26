"use strict";
var _a, _b;
exigirLogin();
configurarTopo();
async function carregarConfiguracoes() {
    const resposta = await api('/configuracoes/');
    if (resposta.status !== 'success' || !resposta.data)
        return;
    const d = resposta.data;
    document.getElementById('username').value = d.username || '';
    document.getElementById('first_name').value = d.first_name || '';
    document.getElementById('last_name').value = d.last_name || '';
    document.getElementById('email').value = d.email || '';
    document.getElementById('usuarioConfiguracoes').textContent = d.username || 'Perfil';
    if (d.foto_perfil_url)
        document.getElementById('fotoConfiguracoes').outerHTML =
            `<img src="${html(mediaUrl(d.foto_perfil_url))}" class="profile-large-avatar" id="fotoConfiguracoes" alt="${html(d.username)}">`;
    await carregarCidades(document.getElementById('estado'), document.getElementById('cidade'), d.estado || '', d.cidade || '');
}
(_a = document.getElementById('formConfiguracoes')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const form = evento.target;
    const dados = new FormData(form);
    const file = dados.get('foto_perfil');
    if (file instanceof File && !file.name)
        dados.delete('foto_perfil');
    const resposta = await api('/configuracoes/', { method: 'POST', body: dados });
    mostrarMensagem(resposta.message || errorsToText(resposta.errors), resposta.status === 'success' ? 'success' : 'error');
    if (resposta.status === 'success')
        await carregarConfiguracoes();
});
const fotoPerfilInput = document.getElementById('fotoPerfil');
fotoPerfilInput === null || fotoPerfilInput === void 0 ? void 0 : fotoPerfilInput.addEventListener('change', () => {
    const file = fotoPerfilInput.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    document.getElementById('fotoConfiguracoes').outerHTML =
        `<img src="${url}" class="profile-large-avatar" id="fotoConfiguracoes" alt="Prévia" />`;
});
(_b = document.getElementById('botaoRedefinirSenha')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', async () => {
    const botao = document.getElementById('botaoRedefinirSenha');
    botao.disabled = true;
    botao.textContent = 'Enviando...';
    const resposta = await api('/senha/redefinir-logado/', {
        method: 'POST',
        body: { frontend_url: location.origin },
    });
    mostrarMensagem(resposta.message || 'Não foi possível enviar o e-mail.', resposta.status === 'success' ? 'success' : 'error');
    botao.disabled = false;
    botao.textContent = 'Redefinir senha por e-mail';
});
void carregarConfiguracoes();
