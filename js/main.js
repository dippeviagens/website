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
 * Envio do formulário "Já viajou com a gente?" (depoimentos enviados pelos
 * próprios clientes), via FormSubmit. Funciona igual ao formulário de
 * consultoria: mostra mensagem de sucesso/erro no próprio card.
 */
function initDepoimentoForm() {
  const depoimentoForm = document.getElementById('depoimento-form');
  if (!depoimentoForm) return;

  depoimentoForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const btn = document.getElementById('depoimento-submit-btn');
    const container = document.getElementById('depoimento-form-container');

    btn.disabled = true;
    btn.innerHTML = '<span>Enviando...</span>';

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
      console.log('[Depoimento] HTTP status:', response.status, response.ok);
      console.log('[Depoimento] Resposta do FormSubmit:', data);

      if (response.ok && data && (data.success === true || data.success === 'true')) {
        container.innerHTML = `
          <div class="text-center py-md flex flex-col items-center gap-sm">
            <span class="material-symbols-outlined text-[56px] text-secondary-container">check_circle</span>
            <h3 class="font-headline-md text-headline-md text-primary mt-sm">Obrigado pelo depoimento!</h3>
            <p class="font-body-md text-body-md text-on-surface-variant max-w-xs mx-auto">
              Recebemos sua mensagem. Seu depoimento já está publicado aqui na página — obrigado por compartilhar sua experiência!
            </p>
          </div>
        `;
      } else {
        console.error('Resposta do FormSubmit:', data);
        alert(
          'Ops! Ocorreu um erro ao enviar. Se for a primeira vez usando este formulário, verifique a caixa de entrada (e spam) do e-mail dippeviagens@gmail.com para confirmar a ativação do FormSubmit.'
        );
        btn.disabled = false;
        btn.innerHTML = '<span>Enviar Depoimento</span>';
      }
    } catch (error) {
      alert('Erro de conexão. Verifique sua internet e tente novamente.');
      btn.disabled = false;
      btn.innerHTML = '<span>Enviar Depoimento</span>';
    }
  });
}

/**
 * Calcula as iniciais de um nome completo (ex: "Mariana Silva" -> "MS").
 * Usa a primeira letra do primeiro nome e a primeira letra do último nome.
 * Se só houver um nome, usa as duas primeiras letras dele.
 */
function getIniciais(nomeCompleto) {
  const partes = nomeCompleto.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '--';
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  const primeira = partes[0][0];
  const ultima = partes[partes.length - 1][0];
  return (primeira + ultima).toUpperCase();
}

/**
 * Atualiza o avatar de pré-visualização (bolinha com as iniciais) conforme
 * o cliente digita o nome no formulário de depoimento. Também guarda o
 * valor calculado num campo escondido, para que as iniciais cheguem
 * prontas no e-mail recebido via FormSubmit.
 */
function initDepoimentoAvatarPreview() {
  const nomeInput = document.getElementById('depoimento-nome');
  const avatarPreview = document.getElementById('depoimento-avatar-preview');
  const iniciaisHidden = document.getElementById('depoimento-iniciais-hidden');

  if (!nomeInput || !avatarPreview || !iniciaisHidden) return;

  nomeInput.addEventListener('input', () => {
    const iniciais = getIniciais(nomeInput.value);
    avatarPreview.textContent = iniciais;
    iniciaisHidden.value = iniciais;
  });
}

/**
 * Carrossel de depoimentos: exibe 1 card por vez e passa automaticamente
 * para o próximo a cada 5 s (autoplay). Pausa ao passar o mouse/foco.
 * Bolinhas indicadoras clicáveis geradas dinamicamente.
 * Para adicionar mais depoimentos: basta duplicar um [data-depoimentos-pagina]
 * no HTML — o carrossel detecta e inclui automaticamente.
 */
function initDepoimentosCarrossel() {
  const carrossel = document.getElementById('depoimentos-carrossel');
  const track = document.getElementById('depoimentos-track');
  const viewport = document.getElementById('depoimentos-viewport');
  const dotsContainer = document.getElementById('depoimentos-dots');

  if (!carrossel || !track || !viewport || !dotsContainer) return;

  const slides = Array.from(track.querySelectorAll('[data-depoimentos-pagina]'));
  const total = slides.length;
  if (total === 0) return;

  const INTERVALO = 5000; // 5 s entre slides
  let atual = 0;
  let timer = null;

  // Bolinhas indicadoras
  dotsContainer.innerHTML = '';
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.setAttribute('aria-label', `Depoimento ${i + 1}`);
    dot.className = 'w-2.5 h-2.5 rounded-full transition-all duration-300';
    dot.addEventListener('click', () => { irPara(i); reiniciar(); });
    dotsContainer.appendChild(dot);
  });
  const dots = Array.from(dotsContainer.children);

  function atualizarUI() {
    track.style.transform = `translateX(-${atual * 100}%)`;
    dots.forEach((d, i) => {
      d.classList.toggle('bg-primary', i === atual);
      d.classList.toggle('w-6',        i === atual);
      d.classList.toggle('bg-outline-variant', i !== atual);
      d.classList.toggle('w-2.5',      i !== atual);
    });
  }

  function irPara(i) {
    atual = (i + total) % total;
    atualizarUI();
  }

  function proximo() { irPara(atual + 1); }

  function iniciar()  { parar(); timer = setInterval(proximo, INTERVALO); }
  function parar()    { if (timer) { clearInterval(timer); timer = null; } }
  function reiniciar(){ iniciar(); }

  carrossel.addEventListener('mouseenter', parar);
  carrossel.addEventListener('mouseleave', iniciar);
  carrossel.addEventListener('focusin',    parar);
  carrossel.addEventListener('focusout',   iniciar);

  atualizarUI();
  iniciar();
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
  initDepoimentoForm();
  initDepoimentoAvatarPreview();
  initDepoimentosCarrossel();
  initGallery();
  initVerTodosDepoimentos();
  initGuiaDoViajante();
});
