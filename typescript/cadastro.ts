// carrega os selects de estado e cidade ao abrir a página
window.onload = async () => {
  const estado = document.getElementById('estado') as HTMLSelectElement;
  const cidade = document.getElementById('cidade') as HTMLSelectElement;
  await carregarCidades(estado, cidade);
};
// envia o formulário de cadastro e redireciona para a home em caso de sucesso
document.getElementById('formCadastro')?.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const form = evento.target as HTMLFormElement;
  const resposta = await api('/cadastro/', { method: 'POST', body: formObject(form) });
  if (resposta.status === 'success') {
    localStorage.setItem(AUTH_KEY, '1');
    location.href = 'home.html';
  } else mostrarMensagem(resposta.message || errorsToText(resposta.errors) || 'Cadastro inválido.', 'error');
});
