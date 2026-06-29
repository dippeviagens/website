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
 * Controla a abertura/fechamento do menu mobile (ícone de hambúrguer).
 */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-menu-button');
  const mobileNav = document.getElementById('mobile-nav');
  const icon = document.getElementById('mobile-menu-icon');

  if (!toggleBtn || !mobileNav || !icon) return;

  toggleBtn.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('is-open');
    icon.classList.toggle('is-open', isOpen);
    icon.textContent = isOpen ? 'close' : 'menu';
    toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
}

/** Fecha o menu mobile (usado depois de clicar em um link de navegação). */
function closeMobileMenu() {
  const mobileNav = document.getElementById('mobile-nav');
  const icon = document.getElementById('mobile-menu-icon');
  const toggleBtn = document.getElementById('mobile-menu-button');
  if (!mobileNav || !icon || !toggleBtn) return;

  mobileNav.classList.remove('is-open');
  icon.classList.remove('is-open');
  icon.textContent = 'menu';
  toggleBtn.setAttribute('aria-expanded', 'false');
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
      text: 'Excelência em viagens personalizadas para quem valoriza o tempo e a experiência.',
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
        btn.innerHTML = '<span>Solicitar Consultoria</span>';
      }
    } catch (error) {
      alert('Erro de conexão. Verifique sua internet e tente novamente.');
      btn.disabled = false;
      btn.innerHTML = '<span>Solicitar Consultoria</span>';
    }
  });
}

// ---- Inicialização: dispara todas as funções quando o DOM estiver pronto ----
document.addEventListener('DOMContentLoaded', () => {
  initSmoothScroll();
  initHeaderScrollShadow();
  initMobileMenu();
  initShareButton();
  initConsultoriaForm();
});
