exigirLogin();
configurarTopo();
async function carregarConfiguracoes(): Promise<void> {
  const resposta = await api<SettingsData>('/configuracoes/'); if (resposta.status !== 'success' || !resposta.data) return; const d = resposta.data;
  (document.getElementById('username') as HTMLInputElement).value = d.username || ''; (document.getElementById('first_name') as HTMLInputElement).value = d.first_name || ''; (document.getElementById('last_name') as HTMLInputElement).value = d.last_name || ''; (document.getElementById('email') as HTMLInputElement).value = d.email || ''; (document.getElementById('usuarioConfiguracoes') as HTMLElement).textContent = d.username || 'Perfil';
  if (d.foto_perfil_url) (document.getElementById('fotoConfiguracoes') as HTMLElement).outerHTML = `<img src="${html(d.foto_perfil_url)}" class="profile-large-avatar" id="fotoConfiguracoes" alt="${html(d.username)}">`;
  await carregarCidades(document.getElementById('estado') as HTMLSelectElement, document.getElementById('cidade') as HTMLSelectElement, d.estado || '', d.cidade || '');
}
document.getElementById('formConfiguracoes')?.addEventListener('submit', async evento => { evento.preventDefault(); const form = evento.target as HTMLFormElement; const dados = new FormData(form); const file = dados.get('foto_perfil'); if (file instanceof File && !file.name) dados.delete('foto_perfil'); const resposta = await api('/configuracoes/', { method: 'POST', body: dados }); mostrarMensagem(resposta.message || errorsToText(resposta.errors), resposta.status === 'success' ? 'success' : 'error'); if (resposta.status === 'success') await carregarConfiguracoes(); });
void carregarConfiguracoes();
