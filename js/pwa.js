// Manejador de Progressive Web App (PWA) e Instalación en Celulares
let deferredPrompt = null;

function isAppInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches || 
         window.navigator.standalone === true;
}

function isIos() {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
}

// Registro del Service Worker y auto-actualización de la PWA instalada
if ('serviceWorker' in navigator) {
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' })
      .then((reg) => {
        console.log('[PWA] Service Worker registrado exitosamente con scope:', reg.scope);
        reg.update();
      })
      .catch((err) => console.warn('[PWA] Error al registrar Service Worker:', err));
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const installBanner = document.getElementById('pwa-install-banner');
  const installBtn = document.getElementById('pwa-install-btn');
  const dismissBtn = document.getElementById('pwa-dismiss-btn');
  const navInstallBtn = document.getElementById('nav-install-btn');
  const iosModal = document.getElementById('ios-install-modal');
  const closeIosModal = document.getElementById('close-ios-modal');

  // Si ya está instalada, no mostrar banner
  if (isAppInstalled()) {
    if (installBanner) installBanner.style.display = 'none';
    if (navInstallBtn) navInstallBtn.style.display = 'none';
    return;
  }

  // Capturar evento de instalación de Chromium / Android / Edge
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('[PWA] Evento beforeinstallprompt capturado');

    // Mostrar banner flotante si no fue cerrado antes
    if (installBanner && !sessionStorage.getItem('pwa_banner_dismissed')) {
      installBanner.classList.add('visible');
    }
    if (navInstallBtn) {
      navInstallBtn.style.display = 'inline-flex';
    }
  });

  // Manejar click en instalar
  function triggerInstall() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('[PWA] Usuario aceptó instalar la app');
          if (installBanner) installBanner.classList.remove('visible');
          if (navInstallBtn) navInstallBtn.style.display = 'none';
        }
        deferredPrompt = null;
      });
    } else if (isIos()) {
      // Mostrar instrucciones para iPhone / iPad
      if (iosModal) iosModal.classList.add('open');
    } else {
      alert('Para instalar esta app en tu pantalla de inicio:\n\nEn tu navegador presiona el menú de 3 puntos (⋮) y selecciona "Instalar aplicación" o "Agregar a la pantalla principal".');
    }
  }

  if (installBtn) installBtn.addEventListener('click', triggerInstall);
  if (navInstallBtn) navInstallBtn.addEventListener('click', triggerInstall);

  if (dismissBtn) {
    dismissBtn.addEventListener('click', () => {
      if (installBanner) installBanner.classList.remove('visible');
      sessionStorage.setItem('pwa_banner_dismissed', 'true');
    });
  }

  if (closeIosModal && iosModal) {
    closeIosModal.addEventListener('click', () => {
      iosModal.classList.remove('open');
    });
  }

  // Notificar cuando se instale exitosamente
  window.addEventListener('appinstalled', () => {
    console.log('[PWA] Aplicación instalada exitosamente');
    if (installBanner) installBanner.classList.remove('visible');
    if (navInstallBtn) navInstallBtn.style.display = 'none';
    alert('🎉 ¡Felicitaciones! Fuego Urbano se ha instalado en tu celular.');
  });
});
