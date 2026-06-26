exigirLogin();
configurarTopo();
const paramsDetalheLivro = new URLSearchParams(location.search);
const id = paramsDetalheLivro.get('id');
const next = paramsDetalheLivro.get('next') || 'home.html';
let livroAtual: Book | null = null;
let acaoInteresseEmAndamento = false;

function textoGenero(valor?: string): string {
  return generos.find(([codigo]) => codigo === valor)?.[1] || valor || '';
}

function textoEstadoLivro(valor?: string): string {
  const estadosLivro: Record<string, string> = {
    SN: 'Semi-novo',
    N: 'Novo',
    U: 'Usado',
  };
  return valor ? estadosLivro[valor] || valor : '';
}

function atualizarAcoesDetalhe(livro: Book): void {
  const acoes = document.getElementById('detalheAcoes') as HTMLElement;
  if (livro.is_owner) {
    acoes.innerHTML = `<button class="btn-blue-action" id="editar" type="button">Editar livro</button><button class="btn-danger-action" id="excluir" type="button">Excluir livro</button>`;
    return;
  }
  const botoes: string[] = [];
  if (livro.meu_interesse) {
    botoes.push(`<button class="btn-danger-action" id="removerInteresse" type="button">Não tenho mais interesse</button>`);
  } else if (livro.status === 'disponivel' && livro.disponivel !== false) {
    botoes.push(`<button class="btn-blue-action" id="tenhoInteresse" type="button">Tenho interesse</button>`);
  }
  botoes.push(
    livro.meu_desejo_futuro
      ? `<button class="btn-secondary-action" id="removerDesejoFuturo" type="button">Remover desejo futuro</button>`
      : `<button class="btn-secondary-action" id="desejoFuturo" type="button">Desejo futuro</button>`,
  );
  acoes.innerHTML = botoes.join('');
}

async function carregarDetalhe(): Promise<void> {
  const resposta = await api<Book>(`/livro/${id}/`);
  if (resposta.status !== 'success' || !resposta.data) return;
  const livro = resposta.data;
  livroAtual = livro;
  (document.getElementById('detalheTitulo') as HTMLElement).textContent = livro.titulo;
  const donoArea = document.querySelector('.book-owner-area') as HTMLElement;
  const donoAvatar = livro.dono_foto_perfil_url
    ? `<img src="${html(mediaUrl(livro.dono_foto_perfil_url))}" alt="${html(livro.dono_username || 'Dono')}">`
    : '<div class="avatar-placeholder-mini"><i class="fa-solid fa-user"></i></div>';
  donoArea.innerHTML = `${donoAvatar}<button id="detalheDono" class="btn-as-link" type="button">Dono</button>`;
  const donoBtn = document.getElementById('detalheDono') as HTMLButtonElement;
  donoBtn.textContent = livro.dono_username || 'Dono';
  if (livro.dono_id) donoBtn.dataset.donoId = String(livro.dono_id);
  (document.getElementById('detalheCapa') as HTMLElement).innerHTML = livro.capa_url
    ? `<img src="${html(mediaUrl(livro.capa_url))}" alt="${html(livro.titulo)}">`
    : '<div class="placeholder-capa-large">Sem capa</div>';
  (document.getElementById('detalheAtributos') as HTMLElement).innerHTML =
    `<div class="attr-col"><span class="attr-label">Autor</span><span class="attr-value">${html(livro.autor)}</span></div><div class="attr-col"><span class="attr-label">Gênero</span><span class="attr-value">${html(textoGenero(livro.genero))}</span></div><div class="attr-col"><span class="attr-label">Estado</span><span class="attr-value">${html(textoEstadoLivro(livro.estado))}</span></div><div class="attr-col"><span class="attr-label">Status</span><span class="attr-value">${html(livro.status || '')}</span></div>`;
  atualizarAcoesDetalhe(livro);
}
document.getElementById('botaoVoltar')?.addEventListener('click', () => (location.href = next));
document.addEventListener('click', async (evento) => {
  const alvo = evento.target as HTMLElement;
  if (!livroAtual) return;
  if (alvo.id === 'detalheDono' && livroAtual.dono_id) {
    location.href = `perfil_publico.html?id=${livroAtual.dono_id}&next=${encodeURIComponent('detalhe_livro.html?id=' + livroAtual.id)}`;
    return;
  }
  if (alvo.id === 'editar') location.href = `adicionar_livro.html?id=${livroAtual.id}`;
  if (alvo.id === 'excluir' && confirm('Excluir este livro?')) {
    await api(`/excluir-livro/${livroAtual.id}/`, { method: 'DELETE' });
    location.href = 'perfil.html';
  }
  if (alvo.id === 'tenhoInteresse') {
    if (acaoInteresseEmAndamento) return;
    acaoInteresseEmAndamento = true;
    const botao = alvo as HTMLButtonElement;
    botao.disabled = true;
    botao.textContent = 'Registrando...';
    const resposta = await api(`/livro/${livroAtual.id}/interesse/`, { method: 'POST' });
    if (resposta.status === 'success' || resposta.status === 'info') {
      livroAtual = { ...livroAtual, meu_interesse: 'pendente' };
      atualizarAcoesDetalhe(livroAtual);
      void atualizarTopo();
    } else {
      botao.disabled = false;
      botao.textContent = 'Tenho interesse';
      mostrarMensagem(resposta.message || 'Não foi possível registrar o interesse.', 'error');
    }
    acaoInteresseEmAndamento = false;
  }
  if (alvo.id === 'removerInteresse') {
    if (acaoInteresseEmAndamento) return;
    acaoInteresseEmAndamento = true;
    const botao = alvo as HTMLButtonElement;
    botao.disabled = true;
    botao.textContent = 'Removendo...';
    const resposta = await api(`/livro/${livroAtual.id}/interesse/excluir/`, { method: 'DELETE' });
    if (resposta.status === 'success') {
      livroAtual = { ...livroAtual, meu_interesse: null };
      atualizarAcoesDetalhe(livroAtual);
      void atualizarTopo();
    } else {
      botao.disabled = false;
      botao.textContent = 'Não tenho mais interesse';
      mostrarMensagem(resposta.message || 'Não foi possível remover o interesse.', 'error');
    }
    acaoInteresseEmAndamento = false;
  }
  if (alvo.id === 'desejoFuturo') {
    const botao = alvo as HTMLButtonElement;
    botao.disabled = true;
    botao.textContent = 'Salvando...';
    const resposta = await api(`/livro/${livroAtual.id}/desejo-futuro/`, { method: 'POST' });
    if (resposta.status === 'success' || resposta.status === 'info') {
      livroAtual = { ...livroAtual, meu_desejo_futuro: true };
      atualizarAcoesDetalhe(livroAtual);
    } else {
      botao.disabled = false;
      botao.textContent = 'Desejo futuro';
      mostrarMensagem(resposta.message || 'Não foi possível salvar o desejo futuro.', 'error');
    }
  }
  if (alvo.id === 'removerDesejoFuturo') {
    const botao = alvo as HTMLButtonElement;
    botao.disabled = true;
    botao.textContent = 'Removendo...';
    const resposta = await api(`/livro/${livroAtual.id}/desejo-futuro/excluir/`, { method: 'DELETE' });
    if (resposta.status === 'success') {
      livroAtual = { ...livroAtual, meu_desejo_futuro: false };
      atualizarAcoesDetalhe(livroAtual);
    } else {
      botao.disabled = false;
      botao.textContent = 'Remover desejo futuro';
      mostrarMensagem(resposta.message || 'Não foi possível remover o desejo futuro.', 'error');
    }
  }
});
void carregarDetalhe();
