/* ==========================================================================
   Dippe Viagens — Script principal do site
   Organizado em pequenas funções, cada uma com uma única responsabilidade.
   Ordem de execução: tudo roda dentro de DOMContentLoaded, no final do arquivo.
   ========================================================================== */

/**
 * Faz o scroll suave ao clicar em qualquer link "#âncora" da página
 * (menu desktop, menu mobile, botões "Ver Depoimentos", etc).
 * Também fecha o menu mobile automaticamente após o clique.
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (!targetElement) return;

      e.preventDefault();
      targetElement.scrollIntoView({ behavior: 'smooth' });

      closeMobileMenu();
    });
  });
}

/**
 * Adiciona uma sombra mais forte no cabeçalho quando o usuário rola a página.
 */
function initHeaderScrollShadow() {
  const header = document.querySelector('header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('shadow-md');
      header.classList.remove('shadow-sm');
    } else {
      header.classList.remove('shadow-md');
      header.classList.add('shadow-sm');
    }
  });
}

/**
 * Controla o drawer lateral (slide-in da direita).
 * Abre via: botão hambúrguer mobile, botão "Mais" no desktop.
 * Fecha via: botão X dentro do drawer, clique no overlay, tecla Escape,
 *            ou clique em qualquer link de âncora dentro do drawer.
 */
function initMobileMenu() {
  const drawer      = document.getElementById('side-drawer');
  const overlay     = document.getElementById('drawer-overlay');
  const openBtnMob  = document.getElementById('mobile-menu-button');
  const openBtnDesk = document.getElementById('desktop-menu-button');
  const closeBtn    = document.getElementById('drawer-close-btn');

  if (!drawer || !overlay) return;

  function openDrawer() {
    drawer.classList.remove('translate-x-full');
    overlay.classList.remove('opacity-0', 'pointer-events-none');
    overlay.classList.add('opacity-100');
    document.body.style.overflow = 'hidden';
    openBtnMob?.setAttribute('aria-expanded', 'true');
    openBtnDesk?.setAttribute('aria-expanded', 'true');
  }

  function closeDrawer() {
    drawer.classList.add('translate-x-full');
    overlay.classList.add('opacity-0', 'pointer-events-none');
    overlay.classList.remove('opacity-100');
    document.body.style.overflow = '';
    openBtnMob?.setAttribute('aria-expanded', 'false');
    openBtnDesk?.setAttribute('aria-expanded', 'false');
  }

  openBtnMob?.addEventListener('click', openDrawer);
  openBtnDesk?.addEventListener('click', openDrawer);
  closeBtn?.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);

  // Fechar ao pressionar Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDrawer();
  });

  // Fechar automaticamente ao clicar em qualquer link dentro do drawer
  drawer.querySelectorAll('a[href]').forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  // Expõe closeDrawer globalmente para o initSmoothScroll poder usá-la
  window._closeDrawer = closeDrawer;
}

/** Fecha o drawer (chamada por outras funções como initSmoothScroll). */
function closeMobileMenu() {
  if (typeof window._closeDrawer === 'function') window._closeDrawer();
}


/**
 * Botão de compartilhar o site (usa a Web Share API no celular,
 * ou copia o link para a área de transferência no desktop).
 */
function initShareButton() {
  const shareBtn = document.getElementById('share-button');
  if (!shareBtn) return;

  shareBtn.addEventListener('click', async () => {
    const shareData = {
      title: 'Dippe Viagens',
      text: 'Planejamento completo e acompanhamento humano para quem quer viajar com tranquilidade.',
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Compartilhamento cancelado ou falhou:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link do site copiado para a área de transferência!');
      } catch (err) {
        console.error('Erro ao copiar link:', err);
      }
    }
  });
}

/**
 * Envio do formulário de consultoria gratuita via FormSubmit (AJAX),
 * com mensagem de sucesso/erro exibida diretamente no card do formulário.
 */
function initConsultoriaForm() {
  const consultoriaForm = document.getElementById('consultoria-form');
  if (!consultoriaForm) return;

  consultoriaForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const btn = document.getElementById('submit-btn');
    const container = document.getElementById('form-container');

    btn.disabled = true;
    btn.innerHTML = '<span>Enviando...</span>';

    // Enviamos como FormData diretamente para o FormSubmit mapear
    // corretamente os campos especiais que começam com "_".
    const formData = new FormData(this);

    try {
      const response = await fetch(this.action, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
      });

      const data = await response.json().catch(() => null);

      // DEBUG: abra o DevTools (F12 -> Console) ao testar o formulário.
      // Essas linhas mostram exatamente o que o FormSubmit respondeu,
      // o que ajuda a identificar por que um e-mail pode não ter chegado.
      console.log('[Consultoria] HTTP status:', response.status, response.ok);
      console.log('[Consultoria] Resposta do FormSubmit:', data);

      // O FormSubmit pode responder com HTTP 200 mesmo quando o envio falhou
      // (ex: e-mail de destino ainda não foi confirmado/ativado).
      // Por isso verificamos também o campo "success" do JSON retornado.
      if (response.ok && data && (data.success === true || data.success === 'true')) {
        container.innerHTML = `
          <div class="text-center py-xl flex flex-col items-center gap-sm">
            <span class="material-symbols-outlined text-[64px] text-secondary-container">check_circle</span>
            <h3 class="font-headline-lg text-headline-lg text-primary mt-sm">Mensagem Enviada!</h3>
            <p class="font-body-md text-body-md text-on-surface-variant max-w-xs mx-auto">
              Obrigado pelo contato. Nossa equipe entrará em contato com você o mais rápido possível por e-mail ou WhatsApp.
            </p>
          </div>
        `;
      } else {
        console.error('Resposta do FormSubmit:', data);
        alert(
          'Ops! Ocorreu um erro ao enviar. Se for a primeira vez usando este formulário, verifique a caixa de entrada (e spam) do e-mail dippeviagens@gmail.com para confirmar a ativação do FormSubmit.'
        );
        btn.disabled = false;
        btn.innerHTML = '<span>Solicitar Planejamento</span>';
      }
    } catch (error) {
      alert('Erro de conexão. Verifique sua internet e tente novamente.');
      btn.disabled = false;
      btn.innerHTML = '<span>Solicitar Planejamento</span>';
    }
  });
}

/**
 * ==========================================================================
 * DEPOIMENTOS AUTOMÁTICOS — publicação sem trabalho manual
 * ==========================================================================
 * Como o site é estático (não tem banco de dados próprio), usamos uma
 * planilha do Google como "banco de dados" gratuito, acessada através de
 * um Google Apps Script publicado como Web App. O fluxo é:
 *
 *   1) Ao carregar a página, buscamos (GET) todos os depoimentos já salvos
 *      na planilha e inserimos no carrossel — assim QUALQUER visitante,
 *      em qualquer dispositivo, vê os depoimentos publicados.
 *   2) Quando um cliente envia o formulário, enviamos (POST) os dados para
 *      a mesma planilha (fica salvo pra sempre, pra todo mundo ver) e,
 *      opcionalmente, também para o FormSubmit (pra vocês continuarem
 *      recebendo o e-mail de aviso, se quiserem manter isso).
 *   3) O novo depoimento aparece imediatamente no carrossel de quem enviou,
 *      sem precisar recarregar a página.
 *
 * IMPORTANTE — configuração única (feita uma vez só):
 *   Troque a constante DEPOIMENTOS_API_URL abaixo pela URL do seu Web App
 *   do Google Apps Script. Veja o guia de configuração enviado junto com
 *   estes arquivos (GUIA-CONFIGURACAO-DEPOIMENTOS.md) para o passo a passo.
 *   Enquanto essa URL não for configurada, o site continua funcionando
 *   normalmente, só que sem publicar novos depoimentos pra todo mundo.
 * ==========================================================================
 */
const DEPOIMENTOS_API_URL = 'https://script.google.com/macros/s/AKfycbwbvV6lu0R8iS8KTzMQ7y5kkwa7oZTM9pjq1BnZCbV3x8FSAgfSPdeJrxJQDzSIBXDS/exec';

/**
 * Calcula as iniciais de um nome completo (ex: "Mariana Silva" -> "MS").
 * Usa a primeira letra do primeiro nome e a primeira letra do último nome.
 * Se só houver um nome, usa as duas primeiras letras dele.
 */
function getIniciais(nomeCompleto) {
  const partes = (nomeCompleto || '').trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '--';
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  const primeira = partes[0][0];
  const ultima = partes[partes.length - 1][0];
  return (primeira + ultima).toUpperCase();
}

/** Escapa texto do usuário antes de inserir no HTML (evita XSS). */
function escapeHtml(texto) {
  const div = document.createElement('div');
  div.textContent = texto == null ? '' : String(texto);
  return div.innerHTML;
}

/**
 * Monta o elemento DOM de um slide de depoimento (mesmo layout dos cards
 * originais), usando um círculo com as INICIAIS do nome no lugar da foto —
 * já que clientes não enviam foto, só o depoimento em texto.
 */
function criarSlideDepoimentoEl({ nome, iniciais, viagem, depoimento }) {
  const wrapper = document.createElement('div');
  wrapper.className = 'w-full flex-shrink-0 flex justify-center px-sm';
  wrapper.setAttribute('data-depoimentos-pagina', '');

  const inic = iniciais || getIniciais(nome);

  wrapper.innerHTML = `
    <div class="bg-surface-container-lowest p-xl rounded-2xl premium-shadow border border-outline-variant/20 flex flex-col justify-between w-full max-w-2xl">
      <p class="font-body-md text-body-md md:text-lg text-on-surface-variant italic mb-lg leading-relaxed">"${escapeHtml(depoimento)}"</p>
      <div class="flex items-center gap-md">
        <div class="w-14 h-14 flex-shrink-0 rounded-full bg-primary-fixed border-2 border-primary-fixed flex items-center justify-center font-label-md text-label-md text-primary select-none" aria-hidden="true">${escapeHtml(inic)}</div>
        <div>
          <h4 class="font-bold text-base text-primary">${escapeHtml(nome)}</h4>
          <p class="font-label-md text-xs text-secondary">${escapeHtml(viagem) || 'Cliente Dippe Viagens'}</p>
        </div>
      </div>
    </div>
  `;
  return wrapper;
}

/**
 * Carrossel de depoimentos: exibe 1 card por vez e passa automaticamente
 * para o próximo a cada 5 s (autoplay). Pausa ao passar o mouse/foco.
 * Bolinhas indicadoras clicáveis geradas dinamicamente.
 *
 * Retorna uma API pequena ({ adicionarSlide, adicionarSlideNoInicio }) para
 * que outras partes do código (carregamento automático e envio do
 * formulário) consigam inserir novos depoimentos dinamicamente, sem
 * precisar editar o HTML na mão.
 */
function initDepoimentosCarrossel() {
  const carrossel = document.getElementById('depoimentos-carrossel');
  const track = document.getElementById('depoimentos-track');
  const viewport = document.getElementById('depoimentos-viewport');
  const dotsContainer = document.getElementById('depoimentos-dots');

  if (!carrossel || !track || !viewport || !dotsContainer) return null;

  const INTERVALO = 5000; // 5 s entre slides
  let slides = [];
  let dots = [];
  let atual = 0;
  let timer = null;

  function construirDots() {
    dotsContainer.innerHTML = '';
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.setAttribute('aria-label', `Depoimento ${i + 1}`);
      dot.className = 'w-2.5 h-2.5 rounded-full transition-all duration-300';
      dot.addEventListener('click', () => { irPara(i); reiniciar(); });
      dotsContainer.appendChild(dot);
    });
    dots = Array.from(dotsContainer.children);
  }

  function atualizarUI() {
    if (atual >= slides.length) atual = 0;
    track.style.transform = `translateX(-${atual * 100}%)`;
    dots.forEach((d, i) => {
      d.classList.toggle('bg-primary', i === atual);
      d.classList.toggle('w-6',        i === atual);
      d.classList.toggle('bg-outline-variant', i !== atual);
      d.classList.toggle('w-2.5',      i !== atual);
    });
  }

  function irPara(i) {
    if (!slides.length) return;
    atual = (i + slides.length) % slides.length;
    atualizarUI();
  }

  function proximo() { irPara(atual + 1); }

  function iniciar()  { parar(); if (slides.length > 1) timer = setInterval(proximo, INTERVALO); }
  function parar()    { if (timer) { clearInterval(timer); timer = null; } }
  function reiniciar(){ iniciar(); }

  function recarregarSlides() {
    slides = Array.from(track.querySelectorAll('[data-depoimentos-pagina]'));
    construirDots();
    atualizarUI();
  }

  carrossel.addEventListener('mouseenter', parar);
  carrossel.addEventListener('mouseleave', iniciar);
  carrossel.addEventListener('focusin',    parar);
  carrossel.addEventListener('focusout',   iniciar);

  recarregarSlides();
  iniciar();

  return {
    // Adiciona um novo slide no final (ex: depoimento recém-enviado).
    adicionarSlide(el, irParaEle) {
      track.appendChild(el);
      recarregarSlides();
      if (irParaEle) { irPara(slides.length - 1); reiniciar(); }
    },
    // Adiciona um novo slide no início (usado ao carregar depoimentos
    // salvos, do mais recente para o mais antigo).
    adicionarSlideNoInicio(el) {
      track.insertBefore(el, track.firstChild);
      recarregarSlides();
    },
  };
}

/**
 * Busca (GET) os depoimentos já salvos na planilha do Google e insere no
 * carrossel, do mais recente para o mais antigo, logo antes dos depoimentos
 * fixos de exemplo. Assim, qualquer visitante do site vê todos os
 * depoimentos publicados — não só quem enviou.
 */
async function carregarDepoimentosSalvos(carrosselAPI) {
  if (!carrosselAPI) return;
  if (!DEPOIMENTOS_API_URL || DEPOIMENTOS_API_URL.includes('COLOQUE_AQUI')) {
    console.warn('[Depoimentos] DEPOIMENTOS_API_URL não configurada — pulando carregamento automático.');
    return;
  }

  try {
    const resp = await fetch(DEPOIMENTOS_API_URL, { method: 'GET' });
    const data = await resp.json();

    if (data && data.success && Array.isArray(data.depoimentos)) {
      // A API já devolve do mais novo para o mais antigo; inserindo cada um
      // no início, na ordem recebida, mantém essa ordem no carrossel.
      data.depoimentos.forEach((dep) => {
        const el = criarSlideDepoimentoEl(dep);
        carrosselAPI.adicionarSlideNoInicio(el);
      });
    }
  } catch (err) {
    console.error('[Depoimentos] Erro ao carregar depoimentos salvos:', err);
  }
}

/**
 * Envio do formulário "Já viajou com a gente?" (depoimentos enviados pelos
 * próprios clientes). Publica automaticamente na planilha (visível pra
 * todo mundo) e adiciona o card na hora no carrossel de quem enviou.
 */
function initDepoimentoForm(carrosselAPI) {
  const depoimentoForm = document.getElementById('depoimento-form');
  if (!depoimentoForm) return;

  depoimentoForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const btn = document.getElementById('depoimento-submit-btn');
    const container = document.getElementById('depoimento-form-container');
    const iniciaisHidden = document.getElementById('depoimento-iniciais-hidden');

    const nome = (this.querySelector('[name="nome"]').value || '').trim();
    const viagem = (this.querySelector('[name="viagem"]').value || '').trim();
    const depoimentoTexto = (this.querySelector('[name="depoimento"]').value || '').trim();
    const honeypot = (this.querySelector('[name="_honey"]').value || '').trim();
    const iniciais = getIniciais(nome);

    if (iniciaisHidden) iniciaisHidden.value = iniciais;

    // Spam óbvio (bot preenchendo o campo escondido): ignora silenciosamente.
    if (honeypot) return;

    btn.disabled = true;
    btn.innerHTML = '<span>Enviando...</span>';

    const publicarNaPlanilha = DEPOIMENTOS_API_URL && !DEPOIMENTOS_API_URL.includes('COLOQUE_AQUI');

    try {
      // 1) Salva na planilha (fica visível pra todo mundo, pra sempre).
      if (publicarNaPlanilha) {
        await fetch(DEPOIMENTOS_API_URL, {
          method: 'POST',
          // Sem cabeçalho Content-Type customizado de propósito: assim o
          // navegador não faz "preflight" (OPTIONS), que o Apps Script não
          // responde por padrão. O Apps Script lê o corpo cru mesmo assim.
          body: JSON.stringify({ nome, iniciais, viagem, depoimento: depoimentoTexto }),
        });
      }

      // 2) Também manda por e-mail via FormSubmit, para vocês terem o
      //    registro na caixa de entrada (opcional — pode remover se não
      //    quiserem mais receber o e-mail, já que a publicação é automática).
      const formData = new FormData(this);
      const response = await fetch(this.action, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
      });
      const data = await response.json().catch(() => null);
      console.log('[Depoimento] HTTP status:', response.status, response.ok);
      console.log('[Depoimento] Resposta do FormSubmit:', data);

      // 3) Mostra o card na hora, pra quem enviou, sem esperar recarregar.
      if (carrosselAPI) {
        const novoSlide = criarSlideDepoimentoEl({ nome, iniciais, viagem, depoimento: depoimentoTexto });
        carrosselAPI.adicionarSlide(novoSlide, true);
      }

      container.innerHTML = `
        <div class="text-center py-md flex flex-col items-center gap-sm">
          <span class="material-symbols-outlined text-[56px] text-secondary-container">check_circle</span>
          <h3 class="font-headline-md text-headline-md text-primary mt-sm">Obrigado pelo depoimento!</h3>
          <p class="font-body-md text-body-md text-on-surface-variant max-w-xs mx-auto">
            Recebemos sua mensagem. Seu depoimento já está publicado aqui na página — obrigado por compartilhar sua experiência!
          </p>
        </div>
      `;
    } catch (error) {
      console.error('[Depoimento] Erro ao publicar:', error);
      alert('Erro de conexão. Verifique sua internet e tente novamente.');
      btn.disabled = false;
      btn.innerHTML = '<span>Enviar Depoimento</span>';
    }
  });
}

// ---- Inicialização: dispara todas as funções quando o DOM estiver pronto ----
function initGallery() {
  const items = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('gallery-lightbox');
  const lightboxImg = document.getElementById('gallery-lightbox-img');
  const lightboxCaption = document.getElementById('gallery-lightbox-caption');
  const closeBtn = document.getElementById('gallery-lightbox-close');

  if (!items.length || !lightbox || !lightboxImg || !closeBtn) return;

  function openLightbox(src, alt, caption) {
    lightboxImg.src = src;
    lightboxImg.alt = alt;
    if (lightboxCaption) lightboxCaption.textContent = caption || '';
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightboxImg.src = '';
    if (lightboxCaption) lightboxCaption.textContent = '';
    document.body.style.overflow = '';
  }

  items.forEach((item) => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      openLightbox(item.dataset.full || img.src, img.alt, item.dataset.caption || img.alt);
    });
  });

  closeBtn.addEventListener('click', closeLightbox);

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('is-open')) closeLightbox();
  });
}

/**
 * Botão "Ver todos os depoimentos": por enquanto, ainda não existe uma
 * página dedicada, então o clique apenas avisa o usuário. Quando a página
 * de depoimentos existir, basta trocar o href do link no HTML (de "#" para
 * o caminho real) e remover este aviso — o link passa a navegar normalmente.
 */
function initVerTodosDepoimentos() {
  const link = document.getElementById('ver-todos-depoimentos');
  if (!link) return;

  link.addEventListener('click', (e) => {
    if (link.getAttribute('href') === '#') {
      e.preventDefault();
      alert('Em breve: uma página com todos os nossos depoimentos! Por enquanto, veja os destaques aqui mesmo na página.');
    }
  });
}

/**
 * Cards do "Guia do Viajante": ao clicar, abre o painel como popover
 * sobreposto (absolute), sem alterar a altura dos outros cards na grade.
 * Apenas um painel fica aberto por vez.
 */
function initGuiaDoViajante() {
  const cards = document.querySelectorAll('.guia-card');
  if (!cards.length) return;

  cards.forEach((card) => {
    card.addEventListener('click', () => {
      const targetId = card.getAttribute('data-target');
      const panel    = document.getElementById(targetId);
      const arrow    = card.querySelector('.guia-arrow');
      const isOpen   = card.getAttribute('aria-expanded') === 'true';

      // Fecha todos os outros painéis abertos
      document.querySelectorAll('.guia-card').forEach((c) => {
        if (c !== card) {
          c.setAttribute('aria-expanded', 'false');
          c.querySelector('.guia-arrow')?.classList.remove('rotate-180');
          const otherId    = c.getAttribute('data-target');
          const otherPanel = document.getElementById(otherId);
          otherPanel?.classList.add('hidden');
        }
      });

      // Alterna o painel clicado
      if (isOpen) {
        card.setAttribute('aria-expanded', 'false');
        arrow?.classList.remove('rotate-180');
        panel?.classList.add('hidden');
      } else {
        card.setAttribute('aria-expanded', 'true');
        arrow?.classList.add('rotate-180');
        panel?.classList.remove('hidden');
      }
    });
  });

  // Fecha ao clicar fora dos cards/painéis
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.guia-card') && !e.target.closest('.guia-panel')) {
      document.querySelectorAll('.guia-card').forEach((c) => {
        c.setAttribute('aria-expanded', 'false');
        c.querySelector('.guia-arrow')?.classList.remove('rotate-180');
        const panel = document.getElementById(c.getAttribute('data-target'));
        panel?.classList.add('hidden');
      });
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initSmoothScroll();
  initHeaderScrollShadow();
  initMobileMenu();
  initShareButton();
  initConsultoriaForm();

  // Carrossel primeiro (com os 3 depoimentos fixos de exemplo), depois
  // buscamos os depoimentos salvos na planilha e os inserimos automaticamente.
  const depoimentosCarrosselAPI = initDepoimentosCarrossel();
  carregarDepoimentosSalvos(depoimentosCarrosselAPI);
  initDepoimentoForm(depoimentosCarrosselAPI);

  initGallery();
  initVerTodosDepoimentos();
  initGuiaDoViajante();
});