// se vier uid e token na url, é um link de redefinição de senha
(function () {
  const params = new URLSearchParams(location.search);
  if (params.get('uid') && params.get('token')) {
    location.replace('confirmar_senha.html?' + params.toString());
  }
})();

// envia as credenciais e redireciona para a home em caso de sucesso
document.getElementById('formLogin')?.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const form = evento.target as HTMLFormElement;
  const resposta = await api('/login/', { method: 'POST', body: formObject(form) });
  if (resposta.status === 'success') {
    localStorage.setItem(AUTH_KEY, '1');
    location.href = 'home.html';
  } else mostrarMensagem(resposta.message || errorsToText(resposta.errors) || 'Login inválido.', 'error');
});
