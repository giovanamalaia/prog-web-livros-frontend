exigirLogin();
configurarTopo();
async function carregarPerfil(): Promise<void> {
  const resposta = await api<ProfileData>('/perfil/');
  if (resposta.status !== 'success' || !resposta.data) return;
  const dados = resposta.data;
  const nome = [dados.first_name, dados.last_name].filter(Boolean).join(' ') || dados.username;
  (document.getElementById('nomePerfil') as HTMLElement).textContent = nome;
  (document.getElementById('cidadePerfil') as HTMLElement).textContent = dados.cidade || 'Meus livros para troca';
  if (dados.foto_perfil_url)
    (document.getElementById('fotoPerfil') as HTMLElement).outerHTML =
      `<img src="${html(mediaUrl(dados.foto_perfil_url))}" class="profile-large-avatar" id="fotoPerfil" alt="${html(nome)}">`;
  (document.getElementById('meusLivros') as HTMLDivElement).innerHTML = slider('Meus livros', dados.meus_livros);
}
document
  .getElementById('botaoAdicionarLivro')
  ?.addEventListener('click', () => (location.href = 'adicionar_livro.html'));
void carregarPerfil();
