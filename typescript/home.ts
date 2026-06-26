exigirLogin();
configurarTopo();

// salva a posição de scroll atual de cada slider antes de recarregar
function scrollSlidersAtuais(conteudo: HTMLElement): Map<string, number> {
  const scrolls = new Map<string, number>();
  conteudo.querySelectorAll<HTMLElement>('.book-slider-section').forEach((section) => {
    const titulo = section.querySelector('h3')?.textContent || '';
    const container = section.querySelector<HTMLDivElement>('.slider-container');
    if (titulo && container) scrolls.set(titulo, container.scrollLeft);
  });
  return scrolls;
}

// restaura a posição de scroll dos sliders após recarregar o conteúdo
function restaurarScrollSliders(conteudo: HTMLElement, scrolls: Map<string, number>): void {
  conteudo.querySelectorAll<HTMLElement>('.book-slider-section').forEach((section) => {
    const titulo = section.querySelector('h3')?.textContent || '';
    const scrollLeft = scrolls.get(titulo);
    const container = section.querySelector<HTMLDivElement>('.slider-container');
    if (container && scrollLeft !== undefined) container.scrollLeft = scrollLeft;
  });
}

// busca os livros da home e renderiza os sliders
async function carregarHome(): Promise<void> {
  const q = (document.getElementById('q') as HTMLInputElement | null)?.value || '';
  const resposta = await api<HomeData>(`/home/${q ? `?q=${encodeURIComponent(q)}` : ''}`);
  const conteudo = document.getElementById('conteudoHome') as HTMLDivElement;
  const scrolls = scrollSlidersAtuais(conteudo);
  if (resposta.status !== 'success') {
    conteudo.innerHTML = '<p class="empty-msg">Não foi possível carregar os livros.</p>';
    return;
  }
  const dados = resposta.data;
  conteudo.innerHTML = `${dados?.livros_perto?.length ? slider('Perto de você', dados.livros_perto) : ''}${slider('Últimos', dados?.latest_books || [])}${(dados?.livros_por_genero || []).map((g) => slider(g.titulo_secao, g.livros)).join('')}`;
  restaurarScrollSliders(conteudo, scrolls);
}
document.getElementById('formBusca')?.addEventListener('submit', (evento) => {
  evento.preventDefault();
  void carregarHome();
});
let debounceTimer: ReturnType<typeof setTimeout>;
// aguarda o usuário parar de digitar antes de buscar
document.getElementById('q')?.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => void carregarHome(), 400);
});
void carregarHome();
