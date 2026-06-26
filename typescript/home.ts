exigirLogin();
configurarTopo();
async function carregarHome(): Promise<void> {
  const q = (document.getElementById('q') as HTMLInputElement | null)?.value || '';
  const resposta = await api<HomeData>(`/home/${q ? `?q=${encodeURIComponent(q)}` : ''}`);
  const conteudo = document.getElementById('conteudoHome') as HTMLDivElement;
  if (resposta.status !== 'success') { conteudo.innerHTML = '<p class="empty-msg">Não foi possível carregar os livros.</p>'; return; }
  const dados = resposta.data;
  conteudo.innerHTML = `${dados?.livros_perto?.length ? slider('Perto de você', dados.livros_perto) : ''}${slider('Últimos', dados?.latest_books || [])}${(dados?.livros_por_genero || []).map(g => slider(g.titulo_secao, g.livros)).join('')}`;
}
document.getElementById('formBusca')?.addEventListener('submit', evento => { evento.preventDefault(); void carregarHome(); });
void carregarHome();
window.setInterval(() => { if (document.activeElement?.id !== 'q') void carregarHome(); }, 1000);
