"use strict";
var _a;
// envia o email para o backend solicitar o link de recuperação de senha
(_a = document.getElementById('formRecuperarSenha')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const form = evento.target;
    const dados = formObject(form);
    const resposta = await api('/senha/recuperar/', {
        method: 'POST',
        body: { email: dados.email, frontend_url: location.origin },
    });
    mostrarMensagem(resposta.message || 'Se o e-mail estiver cadastrado, enviaremos um link.', resposta.status === 'success' ? 'success' : 'error');
});
