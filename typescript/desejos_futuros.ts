exigirLogin();
configurarTopo();

// busca os desejos futuros do usuário e exibe em um slider
async function carregarDesejosFuturos(): Promise<void> {
  const q = (document.getElementById('q') as HTMLInputElement | null)?.value || '';
  const resposta = await api<FutureWish[]>(`/desejos-futuros/${q ? `?q=${encodeURIComponent(q)}` : ''}`);
  const lista = document.getElementById('listaDesejosFuturos') as HTMLDivElement;
  const itens = resposta.status === 'success' ? resposta.data || [] : [];
  lista.innerHTML = slider(
    'Desejos futuros',
    itens.map((i) => ({
      id: i.livro_id,
      titulo: i.livro_titulo,
      autor: i.livro_autor,
      capa_url: i.livro_capa_url,
    })),
  );
}

// filtra os desejos futuros ao enviar a busca
document.getElementById('formBusca')?.addEventListener('submit', (evento) => {
  evento.preventDefault();
  void carregarDesejosFuturos();
});

void carregarDesejosFuturos();
