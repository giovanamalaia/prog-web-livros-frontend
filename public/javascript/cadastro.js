"use strict";
var _a;
window.onload = async () => {
    const estado = document.getElementById('estado');
    const cidade = document.getElementById('cidade');
    await carregarCidades(estado, cidade);
};
(_a = document.getElementById('formCadastro')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const form = evento.target;
    const resposta = await api('/cadastro/', { method: 'POST', body: formObject(form) });
    if (resposta.status === 'success') {
        localStorage.setItem(AUTH_KEY, '1');
        location.href = 'home.html';
    }
    else
        mostrarMensagem(resposta.message || errorsToText(resposta.errors) || 'Cadastro inválido.', 'error');
});
