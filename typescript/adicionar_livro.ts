exigirLogin();
configurarTopo();
const paramsLivroForm = new URLSearchParams(location.search);
const livroId = paramsLivroForm.get('id');
// popula o select de gênero com as opções disponíveis
function preencherGeneros(): void {
  const select = document.getElementById('genero') as HTMLSelectElement;
  select.innerHTML = generos.map(([v, l]) => `<option value="${v}">${l}</option>`).join('');
}
// exibe a prévia da imagem de capa selecionada
function mostrarPreviewCapa(src: string): void {
  const preview = document.getElementById('previewCapa');
  if (preview) preview.innerHTML = `<img src="${src}" alt="Capa do livro" />`;
}
// se vier um id na url, carrega os dados do livro para edição
async function carregarLivro(): Promise<void> {
  preencherGeneros();
  if (!livroId) return;
  (document.getElementById('tituloFormularioLivro') as HTMLElement).textContent = 'Editar livro';
  (document.getElementById('campoStatus') as HTMLElement).hidden = false;
  const resposta = await api<Book>(`/livro/${livroId}/`);
  const livro = resposta.data;
  if (!livro) return;
  (document.getElementById('livroId') as HTMLInputElement).value = String(livro.id);
  (document.getElementById('titulo') as HTMLInputElement).value = livro.titulo;
  (document.getElementById('autor') as HTMLInputElement).value = livro.autor;
  (document.getElementById('genero') as HTMLSelectElement).value = livro.genero || '';
  (document.getElementById('estadoLivro') as HTMLSelectElement).value = livro.estado || 'N';
  (document.getElementById('status') as HTMLSelectElement).value = livro.status || 'disponivel';
  if (livro.capa_url) mostrarPreviewCapa(`${backendBase}${livro.capa_url}`);
}
// envia o formulário para criar ou editar o livro conforme o id
document.getElementById('formLivro')?.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const form = evento.target as HTMLFormElement;
  const dados = new FormData(form);
  const id = dados.get('id');
  dados.delete('id');
  const file = dados.get('capa');
  if (file instanceof File && !file.name) dados.delete('capa');
  const resposta = await api(id ? `/editar-livro/${id}/` : '/adicionar-livro/', {
    method: id ? 'PUT' : 'POST',
    body: dados,
  });
  if (resposta.status === 'success') location.href = 'perfil.html';
  else mostrarMensagem(resposta.message || errorsToText(resposta.errors), 'error');
});
const capaInput = document.getElementById('capa') as HTMLInputElement | null;
// atualiza a prévia quando o usuário seleciona uma nova imagem
capaInput?.addEventListener('change', () => {
  const file = capaInput.files?.[0];
  if (file) mostrarPreviewCapa(URL.createObjectURL(file));
});
void carregarLivro();
