"use strict";
var _a;
exigirLogin();
configurarTopo();
const paramsDetalheLivro = new URLSearchParams(location.search);
const id = paramsDetalheLivro.get('id');
const next = paramsDetalheLivro.get('next') || 'home.html';
let livroAtual = null;
async function carregarDetalhe() {
    const resposta = await api(`/livro/${id}/`);
    if (resposta.status !== 'success' || !resposta.data)
        return;
    const livro = resposta.data;
    livroAtual = livro;
    document.getElementById('detalheTitulo').textContent = livro.titulo;
    const donoBtn = document.getElementById('detalheDono');
    donoBtn.textContent = livro.dono_username || 'Dono';
    if (livro.dono_id)
        donoBtn.dataset.donoId = String(livro.dono_id);
    document.getElementById('detalheCapa').innerHTML = livro.capa_url
        ? `<img src="${html(mediaUrl(livro.capa_url))}" alt="${html(livro.titulo)}">`
        : '<div class="placeholder-capa-large">Sem capa</div>';
    document.getElementById('detalheAtributos').innerHTML =
        `<div class="attr-col"><span class="attr-label">Autor</span><span class="attr-value">${html(livro.autor)}</span></div><div class="attr-col"><span class="attr-label">Gênero</span><span class="attr-value">${html(livro.genero || '')}</span></div><div class="attr-col"><span class="attr-label">Estado</span><span class="attr-value">${html(livro.estado || '')}</span></div><div class="attr-col"><span class="attr-label">Status</span><span class="attr-value">${html(livro.status || '')}</span></div>`;
    const acoes = document.getElementById('detalheAcoes');
    if (livro.is_owner)
        acoes.innerHTML = `<button class="btn-blue-action" id="editar" type="button">Editar livro</button><button class="btn-danger-action" id="excluir" type="button">Excluir livro</button>`;
    else if (livro.meu_interesse)
        acoes.innerHTML = `<button class="btn-danger-action" id="removerInteresse" type="button">Não tenho mais interesse</button>`;
    else if (livro.status === 'disponivel' && livro.disponivel !== false)
        acoes.innerHTML = `<button class="btn-blue-action" id="tenhoInteresse" type="button">Tenho interesse</button>`;
}
(_a = document.getElementById('botaoVoltar')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => (location.href = next));
document.addEventListener('click', async (evento) => {
    const alvo = evento.target;
    if (!livroAtual)
        return;
    if (alvo.id === 'detalheDono' && livroAtual.dono_id) {
        location.href = `perfil_publico.html?id=${livroAtual.dono_id}&next=${encodeURIComponent('detalhe_livro.html?id=' + livroAtual.id)}`;
        return;
    }
    if (alvo.id === 'editar')
        location.href = `adicionar_livro.html?id=${livroAtual.id}`;
    if (alvo.id === 'excluir' && confirm('Excluir este livro?')) {
        await api(`/excluir-livro/${livroAtual.id}/`, { method: 'DELETE' });
        location.href = 'perfil.html';
    }
    if (alvo.id === 'tenhoInteresse') {
        await api(`/livro/${livroAtual.id}/interesse/`, { method: 'POST' });
        await carregarDetalhe();
    }
    if (alvo.id === 'removerInteresse') {
        await api(`/livro/${livroAtual.id}/interesse/excluir/`, { method: 'DELETE' });
        await carregarDetalhe();
    }
});
void carregarDetalhe();
