// PWA утилиты для регистрации Service Worker и управления установкой

export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully:', registration);
        
        // Проверяем обновления
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Новый Service Worker установлен, показываем уведомление
                showUpdateNotification();
              }
            });
          }
        });
        
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    });
  }
}

export function showUpdateNotification() {
  if (confirm('Доступна новая версия приложения. Обновить?')) {
    window.location.reload();
  }
}

export function checkForUpdates() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistration().then((registration) => {
      if (registration) {
        registration.update();
      }
    });
  }
}

export function unregisterServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister();
      });
    });
  }
}

// Управление установкой PWA
export function setupPWAInstall() {
  if (typeof window === 'undefined') return;

  let deferredPrompt: any = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    // Предотвращаем автоматическое показ баннера установки
    e.preventDefault();
    // Сохраняем событие для показа позже
    deferredPrompt = e;
    
    // Показываем кнопку установки
    showInstallButton();
  });

  window.addEventListener('appinstalled', () => {
    console.log('PWA установлено');
    hideInstallButton();
    deferredPrompt = null;
  });

  function showInstallButton() {
    const installButton = document.getElementById('install-button');
    if (installButton) {
      installButton.style.display = 'block';
      installButton.addEventListener('click', installPWA);
    }
  }

  function hideInstallButton() {
    const installButton = document.getElementById('install-button');
    if (installButton) {
      installButton.style.display = 'none';
    }
  }

  function installPWA() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('Пользователь принял установку PWA');
        } else {
          console.log('Пользователь отклонил установку PWA');
        }
        deferredPrompt = null;
      });
    }
  }
}

// Проверка поддержки PWA функций
export function checkPWASupport() {
  const isSupported = {
    serviceWorker: 'serviceWorker' in navigator,
    pushManager: 'PushManager' in window,
    notification: 'Notification' in window,
    installPrompt: 'onbeforeinstallprompt' in window,
  };

  console.log('PWA Support:', isSupported);
  return isSupported;
}

// Управление уведомлениями
export async function requestNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export function showNotification(title: string, options?: NotificationOptions) {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return;
  }

  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      ...options,
    });
  }
}

// Офлайн/онлайн статус
export function setupOnlineStatus() {
  if (typeof window === 'undefined') return;

  function updateOnlineStatus() {
    const status = navigator.onLine ? 'online' : 'offline';
    document.body.classList.toggle('offline', !navigator.onLine);
    
    if (!navigator.onLine) {
      showNotification('Приложение работает в офлайн режиме', {
        body: 'Некоторые функции могут быть ограничены',
        tag: 'offline-status',
      });
    }
  }

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  
  // Инициализация
  updateOnlineStatus();
}

// Инициализация всех PWA функций
export function initializePWA() {
  registerServiceWorker();
  setupPWAInstall();
  setupOnlineStatus();
  checkPWASupport();
}
