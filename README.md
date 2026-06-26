# Livro - Frontend

Frontend do projeto **Livro**, uma plataforma de troca de livros entre usuarios. Esta interface foi desenvolvida com **HTML**, **CSS** e **JavaScript gerado a partir de TypeScript**, consumindo a API REST do backend em Django.

## Integrantes

- Giovana Malaia Pinheiro - 2312080
- Luana Pinho Bueno Pena - 2312082

## Links

- Repositorio do frontend: https://github.com/giovanamalaia/prog-web-livros-frontend.git
- Repositorio do backend: https://github.com/giovanamalaia/prog-web-livros-backend
- Site do frontend: adicionar link publicado
- Site do backend/API: adicionar link publicado
- Swagger do backend: adicionar link publicado para `/swagger/`

## Escopo do projeto

O frontend permite que o usuario navegue pelo catalogo de livros, cadastre livros para troca, edite seu perfil, demonstre interesse em livros de outras pessoas, acompanhe notificacoes e mantenha uma lista de desejos futuros.

Funcionalidades principais:

- Login, cadastro e logout.
- Recuperacao de senha por e-mail.
- Redefinicao de senha para usuario logado.
- Home com livros recentes, proximos e agrupados por genero.
- Busca por titulo e autor.
- Cadastro, edicao e exclusao de livros.
- Detalhe do livro com capa, atributos e foto do dono.
- Botao **Tenho interesse**, que envia uma solicitacao de troca ao dono.
- Botao **Desejo futuro**, que salva o livro sem notificar o dono.
- Pagina **Seus interesses**, com interesses reais de troca.
- Pagina **Desejos futuros**, com livros salvos para acompanhar depois.
- Notificacoes com foto de perfil do interessado.
- Perfil proprio e perfil publico.
- Configuracoes com foto, estado, cidade e dados da conta.

## Tecnologias

- HTML
- CSS
- TypeScript
- JavaScript compilado
- Font Awesome
- API REST do backend Django

## Como rodar localmente

### 1. Instalar dependencias

```bash
npm install
```

### 2. Compilar TypeScript

```bash
npm run build
```

### 3. Rodar o frontend

```bash
npm run dev
```

Abra em:

```text
http://127.0.0.1:5500
```

O backend precisa estar rodando em:

```text
http://127.0.0.1:8000/api
```

## Estrutura principal

- `public/`: arquivos HTML, CSS, imagens e JavaScript usado pelo navegador.
- `typescript/`: codigo TypeScript fonte.
- `public/javascript/`: JavaScript compilado.
- `public/css/`: estilos da aplicacao.

## Manual do usuario

1. Acesse a tela inicial e faca login ou cadastro.
2. Na Home, pesquise livros por titulo ou autor.
3. Clique em um livro para abrir a pagina de detalhes.
4. Clique em **Tenho interesse** para enviar uma solicitacao de troca ao dono.
5. Clique em **Desejo futuro** para guardar o livro sem avisar o dono.
6. Acesse **Seus interesses** pela barra lateral para ver solicitacoes feitas.
7. Acesse **Desejos futuros** pela barra lateral para ver livros guardados para depois.
8. Clique no sino para ver notificacoes de interesses recebidos.
9. Em Perfil, veja seus livros e adicione novos.
10. Em Configuracoes, altere dados, foto, localizacao e solicite redefinicao de senha.

## Relacao com a lista implementada

- Lista de desejos futuros: implementada na pagina **Desejos futuros**.
- Interesses reais de troca: implementados na pagina **Seus interesses**.
- Recuperacao de senha: implementada com envio de e-mail pelo backend.
- TypeScript: todo JavaScript da aplicacao tem fonte em `typescript/`.
- API REST: consumida pelos arquivos TypeScript.
- Swagger: disponivel no backend.

## O que foi testado e funcionou

- Build TypeScript com `npm run build`.
- Login/cadastro consumindo API.
- Home com listagem e busca.
- Detalhe do livro com dados amigaveis de genero e estado.
- Botao **Tenho interesse** com feedback visual.
- Botao **Desejo futuro** somente para usuarios que nao sao donos do livro.
- Pagina **Seus interesses**.
- Pagina **Desejos futuros**.
- Notificacoes com foto de perfil quando disponivel.
- Perfil publico sem caractere extra ao lado da foto.
- Ajuste visual das capas de livros.

## O que nao funcionou ou exige atencao

- O frontend depende do backend ativo e acessivel em `http://127.0.0.1:8000/api` no ambiente local.
- O e-mail de recuperacao de senha depende da configuracao SMTP do backend.
