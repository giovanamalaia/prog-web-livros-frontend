document.getElementById('formConfirmarSenha')?.addEventListener('submit', async evento => {
  evento.preventDefault();
  const params = new URLSearchParams(location.search);
  const form = evento.target as HTMLFormElement;
  const dados = formObject(form);
  const resposta = await api('/senha/confirmar/', { method: 'POST', body: { uid: params.get('uid'), token: params.get('token'), new_password1: dados.new_password1, new_password2: dados.new_password2 } });
  if (resposta.status === 'success') { mostrarMensagem('Senha alterada com sucesso.', 'success'); window.setTimeout(() => location.href = 'index.html', 1000); }
  else mostrarMensagem(resposta.message || errorsToText(resposta.errors), 'error');
});
