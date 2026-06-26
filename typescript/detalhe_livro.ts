exigirLogin();
configurarTopo();
const paramsDetalheLivro = new URLSearchParams(location.search);
const id = paramsDetalheLivro.get('id');
const next = paramsDetalheLivro.get('next') || 'home.html';
let livroAtual: Book | null = null;
async function carregarDetalhe(): Promise<void> {
  const resposta = await api<Book>(`/livro/${id}/`);
  if (resposta.status !== 'success' || !resposta.data) return;
  const livro = resposta.data; livroAtual = livro;
  (document.getElementById('detalheTitulo') as HTMLElement).textContent = livro.titulo;
  (document.getElementById('detalheDono') as HTMLElement).textContent = livro.dono_username || 'Dono';
  (document.getElementById('detalheCapa') as HTMLElement).innerHTML = livro.capa_url ? `<img src="${html(livro.capa_url)}" alt="${html(livro.titulo)}">` : '<div class="placeholder-capa-large">Sem capa</div>';
  (document.getElementById('detalheAtributos') as HTMLElement).innerHTML = `<div class="attr-col"><span class="attr-label">Autor</span><span class="attr-value">${html(livro.autor)}</span></div><div class="attr-col"><span class="attr-label">Gênero</span><span class="attr-value">${html(livro.genero || '')}</span></div><div class="attr-col"><span class="attr-label">Estado</span><span class="attr-value">${html(livro.estado || '')}</span></div><div class="attr-col"><span class="attr-label">Status</span><span class="attr-value">${html(livro.status || '')}</span></div>`;
  const acoes = document.getElementById('detalheAcoes') as HTMLElement;
  if (livro.is_owner) acoes.innerHTML = `<button class="btn-blue-action" id="editar" type="button">Editar livro</button><button class="btn-danger-action" id="excluir" type="button">Excluir livro</button>`;
  else if (livro.meu_interesse) acoes.innerHTML = `<button class="btn-danger-action" id="removerInteresse" type="button">Não tenho mais interesse</button>`;
  else if (livro.status === 'disponivel' && livro.disponivel !== false) acoes.innerHTML = `<button class="btn-blue-action" id="tenhoInteresse" type="button">Tenho interesse</button>`;
}
document.getElementById('botaoVoltar')?.addEventListener('click', () => location.href = next);
document.addEventListener('click', async evento => { const alvo = evento.target as HTMLElement; if (!livroAtual) return; if (alvo.id === 'editar') location.href = `adicionar_livro.html?id=${livroAtual.id}`; if (alvo.id === 'excluir' && confirm('Excluir este livro?')) { await api(`/excluir-livro/${livroAtual.id}/`, { method: 'DELETE' }); location.href = 'perfil.html'; } if (alvo.id === 'tenhoInteresse') { await api(`/livro/${livroAtual.id}/interesse/`, { method: 'POST' }); await carregarDetalhe(); } if (alvo.id === 'removerInteresse') { await api(`/livro/${livroAtual.id}/interesse/excluir/`, { method: 'DELETE' }); await carregarDetalhe(); } });
void carregarDetalhe();
