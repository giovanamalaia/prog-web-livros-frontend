"use strict";
var _a;
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
        document.getElementById('fotoConfiguracoes').outerHTML = `<img src="${html(mediaUrl(d.foto_perfil_url))}" class="profile-large-avatar" id="fotoConfiguracoes" alt="${html(d.username)}">`;
    await carregarCidades(document.getElementById('estado'), document.getElementById('cidade'), d.estado || '', d.cidade || '');
}
(_a = document.getElementById('formConfiguracoes')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', async (evento) => { evento.preventDefault(); const form = evento.target; const dados = new FormData(form); const file = dados.get('foto_perfil'); if (file instanceof File && !file.name)
    dados.delete('foto_perfil'); const resposta = await api('/configuracoes/', { method: 'POST', body: dados }); mostrarMensagem(resposta.message || errorsToText(resposta.errors), resposta.status === 'success' ? 'success' : 'error'); if (resposta.status === 'success')
    await carregarConfiguracoes(); });
void carregarConfiguracoes();
