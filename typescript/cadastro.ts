window.onload = async () => {
  const estado = document.getElementById('estado') as HTMLSelectElement;
  const cidade = document.getElementById('cidade') as HTMLSelectElement;
  await carregarCidades(estado, cidade);
};
document.getElementById('formCadastro')?.addEventListener('submit', async evento => {
  evento.preventDefault();
  const form = evento.target as HTMLFormElement;
  const resposta = await api('/cadastro/', { method: 'POST', body: formObject(form) });
  if (resposta.status === 'success') { localStorage.setItem(AUTH_KEY, '1'); location.href = 'home.html'; }
  else mostrarMensagem(resposta.message || errorsToText(resposta.errors) || 'Cadastro inválido.', 'error');
});
