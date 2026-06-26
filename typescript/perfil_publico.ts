exigirLogin();
configurarTopo();
const paramsPerfilPublico = new URLSearchParams(location.search);
const donoId = paramsPerfilPublico.get('id');
const nextPerfilPublico = paramsPerfilPublico.get('next') || 'home.html';
type PublicProfileData = { username: string; first_name: string; foto_perfil_url?: string | null; meus_livros?: Book[]; livros?: Book[] };
async function carregarPerfilPublico(): Promise<void> {
  if (!donoId) { location.href = 'home.html'; return; }
  const resposta = await api<PublicProfileData>(`/perfil/${donoId}/`);
  if (resposta.status !== 'success' || !resposta.data) return;
  const dados = resposta.data;
  const nome = dados.first_name || dados.username;
  (document.getElementById('nomePerfilPublico') as HTMLElement).textContent = nome;
  if (dados.foto_perfil_url) (document.getElementById('fotoPerfilPublico') as HTMLElement).outerHTML = `<img src="${html(mediaUrl(dados.foto_perfil_url))}" class="profile-large-avatar" id="fotoPerfilPublico" alt="${html(nome)}">>`;
  const livros = dados.meus_livros ?? dados.livros ?? [];
  (document.getElementById('livrosPerfilPublico') as HTMLDivElement).innerHTML = slider(`Livros de ${html(nome)}`, livros);
}
document.getElementById('botaoVoltarPublico')?.addEventListener('click', () => location.href = nextPerfilPublico);
void carregarPerfilPublico();