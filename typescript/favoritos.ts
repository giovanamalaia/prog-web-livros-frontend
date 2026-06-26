exigirLogin();
configurarTopo();
// busca os interesses de troca do usuário e exibe em um slider
async function carregarFavoritos(): Promise<void> {
  const q = (document.getElementById('q') as HTMLInputElement | null)?.value || '';
  const resposta = await api<Favorite[]>(`/favoritos/${q ? `?q=${encodeURIComponent(q)}` : ''}`);
  const lista = document.getElementById('listaFavoritos') as HTMLDivElement;
  const itens = resposta.status === 'success' ? resposta.data || [] : [];
  lista.innerHTML = slider(
    'Seus interesses',
    itens.map((i) => ({
      id: i.livro_id,
      titulo: i.livro_titulo,
      autor: i.livro_autor,
      capa_url: i.livro_capa_url,
      status: i.status_interesse,
    })),
  );
}
// filtra os interesses ao enviar a busca
document.getElementById('formBusca')?.addEventListener('submit', (evento) => {
  evento.preventDefault();
  void carregarFavoritos();
});
void carregarFavoritos();
