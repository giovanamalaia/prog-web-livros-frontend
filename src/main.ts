type View = 'login' | 'cadastro' | 'senha' | 'nova-senha' | 'home' | 'favoritos' | 'perfil' | 'configuracoes' | 'adicionar_livro' | 'detalhe_livro'
type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'
type NoticeKind = 'success' | 'error' | 'info'

type ApiResponse<T = unknown> = {
  status: 'success' | 'error' | 'info'
  message?: string
  data?: T
  errors?: Record<string, string[]>
  livro_id?: number
}

type Book = {
  id: number
  titulo: string
  autor: string
  genero?: string
  estado?: string
  status?: string
  disponivel?: boolean
  capa_url?: string | null
  dono_id?: number
  dono_username?: string
  is_owner?: boolean
  meu_interesse?: string | null
}

type HomeData = {
  latest_books: Book[]
  livros_perto: Book[]
  livros_por_genero: Array<{ titulo_secao: string; livros: Book[] }>
}

type ProfileData = { username: string; first_name: string; last_name: string; cidade: string | null; foto_perfil_url?: string | null; meus_livros: Book[] }
type Favorite = { id: number; status_interesse: string; livro_id: number; livro_titulo: string; livro_autor: string; livro_capa_url?: string | null }
type SettingsData = { username: string; first_name: string; last_name: string; email: string; estado: string | null; cidade: string | null; foto_perfil_url?: string | null }
type NotificationItem = { id: number; usuario_nome: string; livro_titulo: string }
type CityData = Record<string, { nome: string; cidades: string[] }>

const appElement = document.querySelector<HTMLDivElement>('#app')
if (!appElement) throw new Error('Elemento #app nao encontrado.')
const app = appElement

const AUTH_KEY = 'livro_auth'
const backendAddress = 'http://127.0.0.1:8000/api'

const estados = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO']
const generos = [
  ['ficcao_geral', 'Ficção Geral'],
  ['nao_ficcao_geral', 'Não Ficção Geral'],
  ['fantasia', 'Fantasia'],
  ['ficcao_cientifica', 'Ficção Científica'],
  ['romance', 'Romance'],
  ['misterio_suspense', 'Mistério & Suspense'],
  ['terror', 'Terror'],
  ['aventura', 'Aventura'],
  ['jovem_adulto', 'Jovem Adulto'],
  ['infantil', 'Infantil & Infanto-juvenil'],
  ['hq_manga', 'HQs, Mangás & Graphic Novels'],
  ['biografia', 'Biografia'],
  ['autoajuda', 'Autoajuda'],
  ['academico', 'Acadêmicos'],
  ['historia_politica', 'História & Política'],
  ['religiao', 'Religião & Espiritualidade'],
  ['classica', 'Literatura Clássica'],
  ['contemporanea', 'Literatura Contemporânea'],
  ['drama', 'Drama'],
  ['poesia', 'Poesia'],
  ['teatro', 'Teatro'],
  ['outros', 'Outros'],
]

let view: View = localStorage.getItem(AUTH_KEY) === '1' ? 'home' : 'login'
let notice = ''
let noticeKind: NoticeKind = 'info'
let selectedBookId = 0
let editingBook: Book | null = null
let searchQuery = ''
let cities: CityData | null = null
let notifications: NotificationItem[] = []
let currentUser: SettingsData | null = null
let csrfReady = false
let resetUid = new URLSearchParams(location.search).get('uid') || ''
let resetToken = new URLSearchParams(location.search).get('token') || ''

if (resetUid && resetToken) view = 'nova-senha'

function html(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function setNotice(message = '', kind: NoticeKind = 'info'): void {
  notice = message
  noticeKind = kind
}

function errorsToText(errors?: Record<string, string[]>): string {
  if (!errors) return ''
  return Object.entries(errors).map(([field, messages]) => `${field}: ${messages.join(', ')}`).join(' ')
}

function cookie(name: string): string {
  const parts = `; ${document.cookie}`.split(`; ${name}=`)
  return parts.length === 2 ? decodeURIComponent(parts.pop()?.split(';').shift() || '') : ''
}

async function loadCities(): Promise<void> {
  if (cities) return
  try {
    const response = await fetch('public/ibge_cidades.json')
    cities = await response.json() as CityData
  } catch {
    cities = {}
  }
}

function cityOptions(uf: string, selected = ''): string {
  if (!uf) return '<option value="">Selecione o estado primeiro</option>'
  const list = cities?.[uf]?.cidades || []
  return `<option value="">Selecione a cidade</option>${list.map((city) => `<option value="${html(city)}" ${city === selected ? 'selected' : ''}>${html(city)}</option>`).join('')}`
}

async function ensureCsrf(): Promise<void> {
  if (csrfReady) return
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 5000)
  await fetch(`${backendAddress}/csrf/`, { credentials: 'include', signal: controller.signal })
  window.clearTimeout(timeout)
  csrfReady = true
}

async function api<T>(path: string, options: { method?: Method; body?: BodyInit | Record<string, unknown> } = {}): Promise<ApiResponse<T>> {
  const method = options.method || 'GET'
  const headers = new Headers()
  let body: BodyInit | undefined

  if (options.body instanceof FormData) {
    body = options.body
  } else if (options.body) {
    headers.set('Content-Type', 'application/json')
    body = JSON.stringify(options.body)
  }

  try {
    if (method !== 'GET') await ensureCsrf()
    const token = cookie('csrftoken')
    if (token && method !== 'GET') headers.set('X-CSRFToken', token)

    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 7000)
    const response = await fetch(`${backendAddress}${path}`, { method, headers, body, credentials: 'include', signal: controller.signal })
    window.clearTimeout(timeout)
    if (response.status === 401) localStorage.removeItem(AUTH_KEY)
    return await response.json() as ApiResponse<T>
  } catch {
    return { status: 'error', message: 'Não consegui conectar ao backend. Confirme se o Django está rodando em http://127.0.0.1:8000/.' }
  }
}

async function loadNotifications(): Promise<void> {
  if (localStorage.getItem(AUTH_KEY) !== '1') {
    notifications = []
    return
  }
  const response = await api<NotificationItem[]>('/notificacoes/')
  notifications = response.status === 'success' ? response.data || [] : []
}

async function loadCurrentUser(): Promise<void> {
  if (localStorage.getItem(AUTH_KEY) !== '1') {
    currentUser = null
    return
  }
  const response = await api<SettingsData>('/configuracoes/')
  currentUser = response.status === 'success' ? response.data || null : null
}

function active(name: View): string {
  return view === name ? 'is-active' : ''
}

function sidebar(): string {
  return `
    <aside class="sidebar">
      <div class="sidebar-inner">
        <div class="sidebar-brand" aria-label="Ícone do site"><i class="fa-solid fa-book"></i></div>
        <div class="sidebar-sep" aria-hidden="true"></div>
        <nav class="sidebar-nav" aria-label="Navegação lateral">
          <button class="sidebar-link ${active('home')}" data-view="home" aria-label="Início"><i class="fa-solid fa-house sidebar-icon"></i></button>
          <button class="sidebar-link ${active('favoritos')}" data-view="favoritos" aria-label="Favoritos"><i class="fa-solid fa-heart sidebar-icon"></i></button>
          <button class="sidebar-link ${active('perfil')}" data-view="perfil" aria-label="Perfil"><i class="fa-solid fa-user sidebar-icon"></i></button>
          <button class="sidebar-link ${active('adicionar_livro')}" data-action="new-book" aria-label="Adicionar livro"><i class="fa-solid fa-plus sidebar-icon"></i></button>
          <button class="sidebar-link ${active('configuracoes')}" data-view="configuracoes" aria-label="Configurações"><i class="fa-solid fa-gear sidebar-icon"></i></button>
        </nav>
      </div>
    </aside>
  `
}

function topBar(showSearch = false): string {
  const profileName = currentUser?.first_name || currentUser?.username || 'Perfil'
  const profileAvatar = currentUser?.foto_perfil_url
    ? `<img src="${html(currentUser.foto_perfil_url)}" alt="${html(profileName)}" class="avatar-mini">`
    : '<div class="avatar-placeholder-mini"><i class="fa-solid fa-user"></i></div>'

  return `
    <header class="top-bar">
      ${showSearch ? `
        <form class="search-box" data-form="search">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input type="text" name="q" value="${html(searchQuery)}" placeholder="Pesquisar livro, nome, autor...">
        </form>
      ` : '<div class="top-bar-left"></div>'}
      <div class="top-bar-right">
        <button class="user-info-mini" data-view="perfil" type="button">
          ${profileAvatar}
          <span>${html(profileName)}</span>
        </button>
        <div class="notif-wrapper">
          <button class="notif-btn" data-action="toggle-notifications" type="button">
            <i class="fa-regular fa-bell bell-icon"></i>
            ${notifications.length ? `<span class="notif-badge">${notifications.length}</span>` : ''}
          </button>
          <div class="notif-dropdown" data-notification-panel hidden>
            <h4>Notificações</h4>
            ${notifications.length ? notifications.map((item) => `
              <div class="notif-item">
                <div class="notif-avatar">${html(item.usuario_nome).slice(0, 2).toUpperCase()}</div>
                <div class="notif-body">
                  <div class="notif-text"><strong>${html(item.usuario_nome)}</strong> tem interesse no seu livro <strong>${html(item.livro_titulo)}</strong>.</div>
                  <div class="notif-actions">
                    <button class="btn-notif-accept" data-action="accept-interest" data-interest="${item.id}" type="button">Aceitar</button>
                    <button class="btn-notif-decline" data-action="decline-interest" data-interest="${item.id}" type="button">Recusar</button>
                  </div>
                </div>
              </div>
            `).join('') : '<div class="notif-empty">Nenhuma solicitação de troca no momento.</div>'}
          </div>
        </div>
        <button class="btn-as-link" data-action="logout" type="button">Sair</button>
      </div>
    </header>
  `
}

function layout(content: string, options: { auth?: boolean; search?: boolean } = {}): string {
  const toast = notice ? `<div class="toast-container"><div class="toast-message ${noticeKind}">${html(notice)}</div></div>` : ''
  if (options.auth) {
    return `<div class="app-layout auth-only-layout">${toast}<main class="app-content">${content}</main></div>`
  }
  return `<div class="app-layout">${sidebar()}${toast}<main class="app-content">${topBar(Boolean(options.search))}${content}</main></div>`
}

function authView(kind: 'login' | 'cadastro'): string {
  const isLogin = kind === 'login'
  return layout(`
    <div class="auth-shell">
      <div class="auth-copy">
        <p class="auth-kicker">Livros, trocas e gente perto de você</p>
        <h1>${isLogin ? 'Entre no Livrô' : 'Crie sua conta'}</h1>
        <p>Acesse o catálogo, cadastre livros e gerencie seus interesses de troca.</p>
      </div>
      <form class="auth-card" data-form="${kind}">
        <label>Usuário<input name="username" required autocomplete="username"></label>
        ${isLogin ? '' : `
          <div class="form-row">
            <label>Nome<input name="first_name" autocomplete="given-name"></label>
            <label>Sobrenome<input name="last_name" autocomplete="family-name"></label>
          </div>
          <label>Email<input name="email" type="email" autocomplete="email"></label>
          <div class="form-row">
            <label>Estado
              <select name="estado" required data-state-select>
                <option value="">Selecione o estado</option>
                ${estados.map((uf) => `<option value="${uf}">${uf}</option>`).join('')}
              </select>
            </label>
            <label>Cidade
              <select name="cidade" required data-city-select>${cityOptions('')}</select>
            </label>
          </div>
        `}
        <label>Senha<input name="${isLogin ? 'password' : 'password1'}" type="password" required autocomplete="${isLogin ? 'current-password' : 'new-password'}"></label>
        ${isLogin ? '' : '<label>Confirmar senha<input name="password2" type="password" required autocomplete="new-password"></label>'}
        <button class="btn-primary-full" type="submit">${isLogin ? 'Entrar' : 'Cadastrar'}</button>
        <div class="auth-links">
          ${isLogin ? '<button class="btn-as-link" data-view="cadastro" type="button">Criar conta</button><button class="btn-as-link" data-view="senha" type="button">Esqueci minha senha</button>' : '<button class="btn-as-link" data-view="login" type="button">Já tenho conta</button>'}
        </div>
      </form>
    </div>
  `, { auth: true })
}

function passwordView(): string {
  return layout(`
    <div class="auth-shell">
      <div class="auth-copy">
        <p class="auth-kicker">Gerência de senha</p>
        <h1>Recuperar senha</h1>
        <p>Informe o e-mail cadastrado para receber um link de redefinição.</p>
      </div>
      <form class="auth-card" data-form="password">
        <label>Email<input name="email" type="email" required></label>
        <button class="btn-primary-full" type="submit">Solicitar recuperação</button>
        <div class="auth-links"><button class="btn-as-link" data-view="login" type="button">Voltar ao login</button></div>
      </form>
    </div>
  `, { auth: true })
}

function resetPasswordView(): string {
  return layout(`
    <div class="auth-shell">
      <div class="auth-copy">
        <p class="auth-kicker">Nova senha</p>
        <h1>Redefinir senha</h1>
        <p>Digite uma nova senha para concluir a recuperação.</p>
      </div>
      <form class="auth-card" data-form="reset-password">
        <label>Nova senha<input name="new_password1" type="password" required></label>
        <label>Confirmar nova senha<input name="new_password2" type="password" required></label>
        <button class="btn-primary-full" type="submit">Salvar nova senha</button>
      </form>
    </div>
  `, { auth: true })
}

function cover(book: Book, large = false): string {
  if (book.capa_url) return `<img src="${html(book.capa_url)}" alt="${html(book.titulo)}">`
  return `<div class="${large ? 'placeholder-capa-large' : 'placeholder-capa'}">Sem capa</div>`
}

function bookCard(book: Book): string {
  return `
    <button class="book-card-action" data-action="details" data-book="${book.id}" type="button">
      <span class="book-card" style="text-decoration:none;color:inherit;display:block;">
        <span class="book-cover-wrapper">${cover(book)}</span>
        <span class="book-title">${html(book.titulo)}</span>
        <span class="book-author">${html(book.autor)}</span>
      </span>
    </button>
  `
}

function slider(title: string, books: Book[]): string {
  return `
    <div class="book-slider-section">
      <div class="slider-header"><h3>${html(title)}</h3></div>
      <div class="slider-container">${books.length ? books.map(bookCard).join('') : '<p class="empty-msg">Nenhum livro encontrado nesta seção.</p>'}</div>
    </div>
  `
}

function homeView(data?: HomeData): string {
  return layout(`
    <div class="page-content-wrapper">
      ${data?.livros_perto?.length ? slider('Perto de você', data.livros_perto) : ''}
      ${slider('Últimos', data?.latest_books || [])}
      ${(data?.livros_por_genero || []).map((group) => slider(group.titulo_secao, group.livros)).join('')}
    </div>
  `, { search: true })
}

function favoritosView(items: Favorite[] = []): string {
  return layout(`
    <div class="page-content-wrapper">
      ${slider('Lista de desejos', items.map((item) => ({
        id: item.livro_id,
        titulo: item.livro_titulo,
        autor: item.livro_autor,
        capa_url: item.livro_capa_url,
        status: item.status_interesse,
      })))}
    </div>
  `, { search: true })
}

function perfilView(data?: ProfileData): string {
  const nome = [data?.first_name, data?.last_name].filter(Boolean).join(' ') || data?.username || 'Meu perfil'
  const avatar = data?.foto_perfil_url
    ? `<img src="${html(data.foto_perfil_url)}" alt="${html(nome)}" class="profile-large-avatar">`
    : '<div class="avatar-placeholder-large"><i class="fa-solid fa-user"></i></div>'

  return layout(`
    <div class="page-content-wrapper">
      <div class="user-profile-header">
        ${avatar}
        <div class="user-profile-info"><h2>${html(nome)}</h2><p>${html(data?.cidade || 'Meus livros para troca')}</p></div>
      </div>
      <div class="user-books-section">
        ${slider('Meus livros', data?.meus_livros || [])}
        <button class="btn-adicionar-livro" data-action="new-book" type="button">
          <div class="logo-container"><i class="fa-solid fa-book"></i></div>
          Adicionar livro
        </button>
      </div>
    </div>
  `)
}

function bookFormView(book?: Book): string {
  const editing = Boolean(book)
  return layout(`
    <div class="page-content-wrapper">
      <h2 class="section-title">${editing ? 'Editar livro' : 'Adicionar livro'}</h2>
      <div class="add-book-wrapper">
        <form class="form-card add-book-form-side" data-form="book">
          <input type="hidden" name="id" value="${html(book?.id || '')}">
          <label>Título<input name="titulo" required value="${html(book?.titulo || '')}"></label>
          <label>Autor<input name="autor" required value="${html(book?.autor || '')}"></label>
          <div class="form-row">
            <label>Gênero<select name="genero">${generos.map(([value, label]) => `<option value="${value}" ${book?.genero === value ? 'selected' : ''}>${label}</option>`).join('')}</select></label>
            <label>Estado do livro<select name="estado">
              <option value="N" ${book?.estado === 'N' ? 'selected' : ''}>Novo</option>
              <option value="SN" ${book?.estado === 'SN' ? 'selected' : ''}>Semi-novo</option>
              <option value="U" ${book?.estado === 'U' ? 'selected' : ''}>Usado</option>
            </select></label>
          </div>
          ${editing ? `<label>Status<select name="status">
            <option value="disponivel" ${book?.status === 'disponivel' ? 'selected' : ''}>Disponível</option>
            <option value="reservado" ${book?.status === 'reservado' ? 'selected' : ''}>Reservado</option>
            <option value="trocado" ${book?.status === 'trocado' ? 'selected' : ''}>Trocado</option>
          </select></label>` : ''}
          <label>Capa<input name="capa" type="file" accept="image/*"></label>
          <button class="btn-primary-full" type="submit">${editing ? 'Salvar alterações' : 'Cadastrar livro'}</button>
        </form>
      </div>
    </div>
  `)
}

function detalheView(book: Book): string {
  const canShowInterest = !book.is_owner && book.status === 'disponivel' && book.disponivel !== false
  const interestButton = book.meu_interesse
    ? `<button class="btn-danger-action" data-action="remove-interest" data-book="${book.id}" type="button"><i class="fa-solid fa-trash"></i> Não tenho mais interesse</button>`
    : canShowInterest ? `<button class="btn-blue-action" data-action="interest" data-book="${book.id}" type="button"><i class="fa-solid fa-book-open"></i> Tenho interesse</button>` : ''
  const ownerButtons = `
    <button class="btn-blue-action" data-action="edit-book" data-book="${book.id}" type="button"><i class="fa-solid fa-pen"></i> Editar livro</button>
    <button class="btn-danger-action" data-action="delete-book" data-book="${book.id}" type="button"><i class="fa-solid fa-trash"></i> Excluir livro</button>
  `
  return layout(`
    <div class="page-content-wrapper">
      <button class="btn-back btn-as-link" data-view="home" type="button"><i class="fa-solid fa-angle-left"></i> Voltar</button>
      <div class="book-detail-container">
        <div class="book-detail-cover-side">${cover(book, true)}</div>
        <div class="book-detail-info-side">
          <div class="book-detail-header">
            <div class="book-title-area"><h2>${html(book.titulo)}</h2></div>
            <div class="book-owner-area"><div class="avatar-placeholder-mini"><i class="fa-solid fa-user"></i></div><span>${html(book.dono_username || 'Dono')}</span></div>
          </div>
          <div class="book-attributes">
            <div class="attr-col"><span class="attr-label">Autor</span><span class="attr-value">${html(book.autor)}</span></div>
            <div class="attr-col"><span class="attr-label">Gênero</span><span class="attr-value">${html(book.genero || '')}</span></div>
            <div class="attr-col"><span class="attr-label">Estado</span><span class="attr-value">${html(book.estado || '')}</span></div>
            <div class="attr-col"><span class="attr-label">Disponível</span><span class="attr-value">${book.disponivel ? 'Sim' : 'Não'}</span></div>
            <div class="attr-col"><span class="attr-label">Status</span><span class="attr-value">${html(book.status || '')}</span></div>
            ${book.is_owner ? '' : `<div class="attr-col"><span class="attr-label">Seu interesse</span><span class="attr-value">${html(book.meu_interesse || 'Nenhum')}</span></div>`}
          </div>
          <hr class="book-divider">
          <div class="book-actions-stack">${book.is_owner ? ownerButtons : interestButton}</div>
        </div>
      </div>
    </div>
  `)
}

function settingsView(data?: SettingsData): string {
  const avatar = data?.foto_perfil_url
    ? `<img src="${html(data.foto_perfil_url)}" alt="${html(data.username || 'Foto de perfil')}" class="profile-large-avatar">`
    : '<div class="avatar-placeholder-large"><i class="fa-solid fa-user"></i></div>'

  return layout(`
    <div class="page-content-wrapper">
      <h2 class="section-title">Configurações</h2>
      <form class="form-card" data-form="settings">
        <div class="user-profile-header">
          ${avatar}
          <div class="user-profile-info"><h2>${html(data?.username || 'Perfil')}</h2><p>Foto e dados da conta</p></div>
        </div>
        <label>Usuário<input name="username" required value="${html(data?.username || '')}"></label>
        <div class="form-row">
          <label>Nome<input name="first_name" value="${html(data?.first_name || '')}"></label>
          <label>Sobrenome<input name="last_name" value="${html(data?.last_name || '')}"></label>
        </div>
        <label>Email<input name="email" type="email" value="${html(data?.email || '')}"></label>
        <div class="form-row">
          <label>Estado<select name="estado" data-state-select><option value="">Sem estado</option>${estados.map((uf) => `<option value="${uf}" ${data?.estado === uf ? 'selected' : ''}>${uf}</option>`).join('')}</select></label>
          <label>Cidade<select name="cidade" data-city-select>${cityOptions(data?.estado || '', data?.cidade || '')}</select></label>
        </div>
        <label>Foto de perfil<input name="foto_perfil" type="file" accept="image/*"></label>
        <button class="btn-primary-full" type="submit">Salvar configurações</button>
      </form>
    </div>
  `)
}

async function render(nextView: View): Promise<void> {
  view = nextView
  await loadCities()

  if (view === 'login') {
    app.innerHTML = authView('login')
    return
  }
  if (view === 'cadastro') {
    app.innerHTML = authView('cadastro')
    return
  }
  if (view === 'senha') {
    app.innerHTML = passwordView()
    return
  }
  if (view === 'nova-senha') {
    app.innerHTML = resetPasswordView()
    return
  }

  app.innerHTML = layout('<div class="page-content-wrapper"><p class="empty-msg">Carregando...</p></div>')
  await Promise.all([loadNotifications(), loadCurrentUser()])

  try {
    if (view === 'home') {
      const response = await api<HomeData>(`/home/${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`)
      if (response.status !== 'success') throw new Error(response.message || errorsToText(response.errors))
      app.innerHTML = homeView(response.data)
    } else if (view === 'favoritos') {
      const response = await api<Favorite[]>(`/favoritos/${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`)
      if (response.status !== 'success') throw new Error(response.message || errorsToText(response.errors))
      app.innerHTML = favoritosView(response.data || [])
    } else if (view === 'perfil') {
      const response = await api<ProfileData>('/perfil/')
      if (response.status !== 'success') throw new Error(response.message || errorsToText(response.errors))
      app.innerHTML = perfilView(response.data)
    } else if (view === 'configuracoes') {
      const response = await api<SettingsData>('/configuracoes/')
      if (response.status !== 'success') throw new Error(response.message || errorsToText(response.errors))
      app.innerHTML = settingsView(response.data)
    } else if (view === 'adicionar_livro') {
      app.innerHTML = bookFormView(editingBook || undefined)
    } else if (view === 'detalhe_livro') {
      const response = await api<Book>(`/livro/${selectedBookId}/`)
      if (response.status !== 'success' || !response.data) throw new Error(response.message || errorsToText(response.errors))
      app.innerHTML = detalheView(response.data)
    }
  } catch (error) {
    setNotice(error instanceof Error ? error.message : 'Erro inesperado.', 'error')
    app.innerHTML = layout('<div class="page-content-wrapper"><p class="empty-msg">Não foi possível carregar esta tela.</p></div>', { search: view === 'home' || view === 'favoritos' })
  }
}

function formObject(form: HTMLFormElement): Record<string, string> {
  return Object.fromEntries(new FormData(form).entries()) as Record<string, string>
}

app.addEventListener('click', async (event) => {
  const target = event.target as HTMLElement
  const viewButton = target.closest<HTMLElement>('[data-view]')
  const actionButton = target.closest<HTMLElement>('[data-action]')

  if (viewButton) {
    setNotice('')
    await render(viewButton.dataset.view as View)
    return
  }
  if (!actionButton) return

  const action = actionButton.dataset.action
  const bookId = Number(actionButton.dataset.book)

  if (action === 'new-book') {
    editingBook = null
    await render('adicionar_livro')
  } else if (action === 'details') {
    selectedBookId = bookId
    await render('detalhe_livro')
  } else if (action === 'edit-book') {
    const response = await api<Book>(`/livro/${bookId}/`)
    editingBook = response.data || null
    await render('adicionar_livro')
  } else if (action === 'delete-book' && confirm('Excluir este livro?')) {
    const response = await api(`/excluir-livro/${bookId}/`, { method: 'DELETE' })
    setNotice(response.message || 'Livro excluído.', response.status === 'success' ? 'success' : 'error')
    await render('perfil')
  } else if (action === 'interest') {
    const response = await api(`/livro/${bookId}/interesse/`, { method: 'POST' })
    setNotice(response.message || 'Interesse registrado.', response.status === 'error' ? 'error' : 'success')
    selectedBookId = bookId
    await render('detalhe_livro')
  } else if (action === 'remove-interest') {
    const response = await api(`/livro/${bookId}/interesse/excluir/`, { method: 'DELETE' })
    setNotice(response.message || 'Interesse removido.', response.status === 'success' ? 'success' : 'error')
    await render(view)
  } else if (action === 'toggle-notifications') {
    const panel = app.querySelector<HTMLElement>('[data-notification-panel]')
    if (panel) panel.hidden = !panel.hidden
  } else if (action === 'accept-interest' || action === 'decline-interest') {
    const interestId = Number(actionButton.dataset.interest)
    const path = action === 'accept-interest' ? `/interesse/${interestId}/aceitar/` : `/interesse/${interestId}/recusar/`
    const response = await api(path, { method: 'POST' })
    setNotice(response.message || 'Solicitação atualizada.', response.status === 'success' ? 'success' : 'error')
    await render(view)
  } else if (action === 'logout') {
    await api('/logout/', { method: 'POST' })
    localStorage.removeItem(AUTH_KEY)
    csrfReady = false
    setNotice('Você saiu da sua conta.', 'info')
    await render('login')
  }
})

app.addEventListener('change', (event) => {
  const field = event.target as HTMLSelectElement
  if (!field.matches('[data-state-select]')) return
  const cityField = field.closest('form')?.querySelector<HTMLSelectElement>('[data-city-select]')
  if (cityField) cityField.innerHTML = cityOptions(field.value)
})

app.addEventListener('submit', async (event) => {
  event.preventDefault()
  const form = event.target as HTMLFormElement
  const formName = form.dataset.form
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')
  const oldText = button?.textContent || ''
  if (button) {
    button.disabled = true
    button.textContent = 'Aguarde...'
  }

  try {
    if (formName === 'search') {
      searchQuery = formObject(form).q || ''
      await render(view)
    } else if (formName === 'login') {
      const response = await api('/login/', { method: 'POST', body: formObject(form) })
      if (response.status !== 'success') throw new Error(response.message || errorsToText(response.errors) || 'Login inválido.')
      localStorage.setItem(AUTH_KEY, '1')
      setNotice(response.message || 'Login realizado com sucesso!', 'success')
      await render('home')
    } else if (formName === 'cadastro') {
      const response = await api('/cadastro/', { method: 'POST', body: formObject(form) })
      if (response.status !== 'success') throw new Error(response.message || errorsToText(response.errors) || 'Cadastro inválido.')
      localStorage.setItem(AUTH_KEY, '1')
      setNotice(response.message || 'Conta criada com sucesso!', 'success')
      await render('home')
    } else if (formName === 'book') {
      const data = new FormData(form)
      const id = data.get('id')
      data.delete('id')
      const file = data.get('capa')
      if (file instanceof File && !file.name) data.delete('capa')
      const response = await api(id ? `/editar-livro/${id}/` : '/adicionar-livro/', { method: id ? 'PUT' : 'POST', body: data })
      if (response.status !== 'success') throw new Error(response.message || errorsToText(response.errors) || 'Não foi possível salvar o livro.')
      setNotice(response.message || 'Livro salvo com sucesso!', 'success')
      await render('perfil')
    } else if (formName === 'settings') {
      const data = new FormData(form)
      const file = data.get('foto_perfil')
      if (file instanceof File && !file.name) data.delete('foto_perfil')
      const response = await api('/configuracoes/', { method: 'POST', body: data })
      if (response.status !== 'success') throw new Error(response.message || errorsToText(response.errors))
      setNotice(response.message || 'Configurações salvas.', 'success')
      await render('configuracoes')
    } else if (formName === 'password') {
      const data = formObject(form)
      const response = await api('/senha/recuperar/', { method: 'POST', body: { email: data.email, frontend_url: location.origin } })
      if (response.status !== 'success') throw new Error(response.message || errorsToText(response.errors))
      setNotice(response.message || 'Se o e-mail estiver cadastrado, o link aparece no terminal local ou chega por SMTP configurado.', 'success')
      await render('senha')
    } else if (formName === 'reset-password') {
      const data = formObject(form)
      const response = await api('/senha/confirmar/', { method: 'POST', body: { uid: resetUid, token: resetToken, new_password1: data.new_password1, new_password2: data.new_password2 } })
      if (response.status !== 'success') throw new Error(response.message || errorsToText(response.errors))
      resetUid = ''
      resetToken = ''
      history.replaceState({}, '', location.pathname)
      setNotice(response.message || 'Senha alterada.', 'success')
      await render('login')
    }
  } catch (error) {
    setNotice(error instanceof Error ? error.message : 'Erro inesperado.', 'error')
    await render(view)
  } finally {
    if (button) {
      button.disabled = false
      button.textContent = oldText
    }
  }
})

void render(view)
