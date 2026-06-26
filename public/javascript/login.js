"use strict";
var _a;
(_a = document.getElementById('formLogin')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const form = evento.target;
    const resposta = await api('/login/', { method: 'POST', body: formObject(form) });
    if (resposta.status === 'success') {
        localStorage.setItem(AUTH_KEY, '1');
        location.href = 'home.html';
    }
    else
        mostrarMensagem(resposta.message || errorsToText(resposta.errors) || 'Login inválido.', 'error');
});
