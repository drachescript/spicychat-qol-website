(() => {
  const header = document.querySelector('[data-header]');
  const menuButton = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-nav]');

  if (header) {
    const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 12);
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
  }

  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    });

    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.setAttribute('aria-label', 'Open navigation');
      });
    });
  }

  document.querySelectorAll('[data-current-year]').forEach(node => {
    node.textContent = new Date().getFullYear();
  });

  const tabs = document.querySelector('[data-tabs]');
  if (tabs) {
    const buttons = [...tabs.querySelectorAll('[data-tab]')];
    const panels = [...tabs.querySelectorAll('[data-panel]')];

    buttons.forEach(button => {
      button.addEventListener('click', () => {
        const target = button.dataset.tab;

        buttons.forEach(item => {
          const active = item === button;
          item.classList.toggle('active', active);
          item.setAttribute('aria-selected', String(active));
        });

        panels.forEach(panel => {
          const active = panel.dataset.panel === target;
          panel.classList.toggle('active', active);
          panel.hidden = !active;
        });
      });
    });
  }

  const formatStatus = value => {
    if (!value) return 'Unknown';
    return String(value)
      .replaceAll('-', ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  };

  const setText = (selector, value) => {
    document.querySelectorAll(selector).forEach(node => {
      node.textContent = value;
    });
  };

  const setHref = (selector, value) => {
    if (!value) return;
    document.querySelectorAll(selector).forEach(node => {
      node.href = value;
    });
  };

  const loadReleaseData = async () => {
    try {
      const response = await fetch(`updates/latest.json?v=${Date.now()}`, {
        cache: 'no-store'
      });

      if (!response.ok) throw new Error(`Update file returned ${response.status}`);

      const data = await response.json();
      const extension = data.extension || {};
      const android = data.android || {};

      setText('[data-extension-version]', extension.version || 'Check Web Store');
      setText('[data-extension-status]', formatStatus(extension.status || 'stable'));
      setHref('[data-extension-store]', extension.webStoreUrl);
      setHref('[data-extension-repo]', extension.repositoryUrl);
      setHref('[data-android-repo]', android.repositoryUrl);

      setText('[data-update-available]', android.available ? 'Yes' : 'No');
      setText(
        '[data-android-version-small]',
        android.available ? (android.versionName || `Build ${android.versionCode || ''}`) : 'Not released'
      );

      if (android.available && android.apkUrl) {
        setText('[data-android-version]', android.versionName || `Build ${android.versionCode || ''}`);
        setText('[data-android-status]', formatStatus(android.status || 'stable'));

        document.querySelectorAll('[data-android-download]').forEach(node => {
          node.href = android.apkUrl;
          node.textContent = `Download Android ${android.versionName || ''}`.trim();
          node.classList.remove('button-disabled');
          node.classList.add('button-primary');
          node.removeAttribute('aria-disabled');
        });

        if (android.releaseUrl) {
          document.querySelectorAll('[data-android-release]').forEach(node => {
            node.href = android.releaseUrl;
            node.classList.remove('is-hidden');
          });
        }
      } else {
        setText('[data-android-version]', android.versionName || 'Coming soon');
        setText('[data-android-status]', formatStatus(android.status || 'in development'));
      }
    } catch (error) {
      console.warn('Could not load update file:', error);
      setText('[data-extension-version]', 'Check Web Store');
      setText('[data-android-version]', 'Coming soon');
    }
  };

  loadReleaseData();
})();
