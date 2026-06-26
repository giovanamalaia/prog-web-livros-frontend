document.getElementById('formLogin')?.addEventListener('submit', async evento => {
  evento.preventDefault();
  const form = evento.target as HTMLFormElement;
  const resposta = await api('/login/', { method: 'POST', body: formObject(form) });
  if (resposta.status === 'success') { localStorage.setItem(AUTH_KEY, '1'); location.href = 'home.html'; }
  else mostrarMensagem(resposta.message || errorsToText(resposta.errors) || 'Login inválido.', 'error');
});
