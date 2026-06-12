// popup.js - Localized interactive UI logic for ClockForClaude Settings

// Centralized Stripe Checkout Links Configuration
const STRIPE_LINKS = {
  EUR: "https://buy.stripe.com/14A5kw5videKeHk0fEao800", // FR, ES, IT, DE, PT
  GBP: "https://buy.stripe.com/14A5kw5videKeHk0fEao800", // UK
  JPY: "https://buy.stripe.com/14A5kw5videKeHk0fEao800", // JP
  CNY: "https://buy.stripe.com/14A5kw5videKeHk0fEao800", // CN
  USD: "https://buy.stripe.com/14A5kw5videKeHk0fEao800"  // US & Global
};

document.addEventListener('DOMContentLoaded', async () => {
  // Translate UI elements on load
  localizeHtmlPage();

  // Dynamic Pricing & Link update based on user's language/locale
  const uiLang = chrome.i18n.getUILanguage().toLowerCase();
  let currency = 'USD';
  let priceText = '$2.49 / month';
  let buttonText = 'Upgrade to ClockForClaude Pro — ';

  if (uiLang.startsWith('fr')) {
    currency = 'EUR';
    priceText = '2,49 € / mois';
    buttonText = 'Passer à ClockForClaude Pro — ';
  } else if (uiLang.startsWith('es')) {
    currency = 'EUR';
    priceText = '2,49 € / mes';
    buttonText = 'Actualizar a ClockForClaude Pro — ';
  } else if (uiLang.startsWith('it')) {
    currency = 'EUR';
    priceText = '2,49 € / mese';
    buttonText = 'Passa a ClockForClaude Pro — ';
  } else if (uiLang.startsWith('de')) {
    currency = 'EUR';
    priceText = '2,49 € / Monat';
    buttonText = 'Upgrade auf ClockForClaude Pro — ';
  } else if (uiLang.startsWith('pt')) {
    currency = 'EUR';
    priceText = '2,49 € / mês';
    buttonText = 'Atualizar para ClockForClaude Pro — ';
  } else if (uiLang === 'en-gb' || uiLang.startsWith('en-gb')) {
    currency = 'GBP';
    priceText = '£2.49 / month';
    buttonText = 'Upgrade to ClockForClaude Pro — ';
  } else if (uiLang.startsWith('ja')) {
    currency = 'JPY';
    priceText = '¥350 / 月';
    buttonText = 'ClockForClaude Proにアップグレード — ';
  } else if (uiLang.startsWith('zh')) {
    currency = 'CNY';
    priceText = '¥18 / 月';
    buttonText = '升级到 ClockForClaude Pro — ';
  }

  const premiumLinkEl = document.getElementById('btn-premium-link');
  if (premiumLinkEl) {
    premiumLinkEl.textContent = buttonText + priceText;
    premiumLinkEl.href = STRIPE_LINKS[currency] || STRIPE_LINKS.USD;
  }

  // UI Elements
  const extEnabled = document.getElementById('extension-enabled');
  const injectModes = document.getElementsByName('inject-mode');
  const includeWeather = document.getElementById('include-weather');
  const locModes = document.getElementsByName('loc-mode');
  
  const autoLocPanel = document.getElementById('auto-location-controls');
  const manualLocPanel = document.getElementById('manual-location-controls');
  
  const locSpinner = document.getElementById('loc-spinner');
  const locStatusText = document.getElementById('loc-status-text');
  const locCoords = document.getElementById('loc-coords');
  const btnDetectLoc = document.getElementById('btn-detect-loc');
  
  const manualCity = document.getElementById('manual-city');
  const manualLat = document.getElementById('manual-lat');
  const manualLon = document.getElementById('manual-lon');
  const btnSaveManual = document.getElementById('btn-save-manual');
  
  const btnRefreshPreview = document.getElementById('btn-refresh-preview');
  const previewText = document.getElementById('preview-text');

  // Premium Elements
  const premiumCard = document.getElementById('premium-card');
  const premiumActivationZone = document.getElementById('premium-activation-zone');
  const premiumActiveZone = document.getElementById('premium-active-zone');
  const premiumEmailInput = document.getElementById('premium-email-input');
  const btnActivatePremium = document.getElementById('btn-activate-premium');
  const btnDeactivatePremium = document.getElementById('btn-deactivate-premium');

  // Quick Prompts Elements
  const quickPromptsList = document.getElementById('quick-prompts-list');
  const newPromptInput = document.getElementById('new-prompt-input');
  const btnAddPrompt = document.getElementById('btn-add-prompt');

  // Load Settings
  const settings = await chrome.storage.local.get();

  // Quick Prompts Init
  let quickPrompts = settings.quick_prompts;
  if (!quickPrompts) {
    const isFr = uiLang.startsWith('fr');
    quickPrompts = isFr ? [
      "Résume ce texte",
      "Explique simplement",
      "Améliore le style"
    ] : [
      "Summarize this",
      "Explain simply",
      "Improve style"
    ];
    await chrome.storage.local.set({ quick_prompts: quickPrompts });
  }

  function renderQuickPrompts(isPremium) {
    quickPromptsList.innerHTML = '';
    
    if (quickPrompts.length === 0) {
      const emptyMsg = document.createElement('div');
      emptyMsg.style.fontSize = '11px';
      emptyMsg.style.color = 'var(--text-muted)';
      emptyMsg.style.textAlign = 'center';
      emptyMsg.style.padding = '8px';
      emptyMsg.textContent = uiLang.startsWith('fr') ? "Aucun prompt configuré." : "No prompts configured.";
      quickPromptsList.appendChild(emptyMsg);
      return;
    }

    quickPrompts.forEach((prompt, index) => {
      const item = document.createElement('div');
      item.className = 'quick-prompt-item';
      
      const span = document.createElement('span');
      span.textContent = prompt;
      span.title = prompt;
      item.appendChild(span);
      
      if (isPremium) {
        const delBtn = document.createElement('button');
        delBtn.className = 'btn-delete-prompt';
        delBtn.textContent = '×';
        delBtn.title = uiLang.startsWith('fr') ? "Supprimer" : "Delete";
        delBtn.addEventListener('click', async () => {
          quickPrompts.splice(index, 1);
          await chrome.storage.local.set({ quick_prompts: quickPrompts });
          renderQuickPrompts(true);
        });
        item.appendChild(delBtn);
      }
      
      quickPromptsList.appendChild(item);
    });
  }

  // Load and Apply Theme
  const themeToggleCheckbox = document.getElementById('theme-toggle-checkbox');
  const currentTheme = settings.theme || 'light';
  if (currentTheme === 'dark') {
    document.body.classList.add('dark-theme');
    if (themeToggleCheckbox) themeToggleCheckbox.checked = true;
  } else {
    document.body.classList.remove('dark-theme');
    if (themeToggleCheckbox) themeToggleCheckbox.checked = false;
  }

  // Populate UI from Settings
  extEnabled.checked = settings.enabled !== false;
  
  const isPremium = settings.premium_status === 'premium';
  const activeMode = isPremium ? (settings.autoInjectMode || 'first') : 'manual';
  document.querySelector(`input[name="inject-mode"][value="${activeMode}"]`).checked = true;
  
  includeWeather.checked = settings.includeWeather !== false;
  
  const activeLocMode = settings.locationMode || 'auto';
  document.querySelector(`input[name="loc-mode"][value="${activeLocMode}"]`).checked = true;
  
  toggleLocationPanels(activeLocMode);
  updateAutoLocUI(settings.autoLocation);
  
  if (settings.manualLocation) {
    manualCity.value = settings.manualLocation.city || '';
    manualLat.value = settings.manualLocation.latitude || '';
    manualLon.value = settings.manualLocation.longitude || '';
  }

  // Populate Premium status
  updatePremiumUI(settings.premium_status === 'premium');
  if (settings.premium_email) {
    premiumEmailInput.value = settings.premium_email;
  }

  // Update Live Preview
  updatePreview();

  // --- Change Listeners ---

  btnActivatePremium.addEventListener('click', async () => {
    const email = premiumEmailInput.value.trim();
    if (!email || !email.includes('@')) {
      alert(chrome.i18n.getMessage('invalidEmailAlert') || "Please enter a valid email address.");
      return;
    }
    await chrome.storage.local.set({ premium_status: 'premium', premium_email: email });
    updatePremiumUI(true);
  });

  btnDeactivatePremium.addEventListener('click', async () => {
    await chrome.storage.local.remove(['premium_status', 'premium_email']);
    updatePremiumUI(false);
  });

  btnAddPrompt.addEventListener('click', async () => {
    const currentSettings = await chrome.storage.local.get();
    if (currentSettings.premium_status !== 'premium') {
      alert(chrome.i18n.getMessage('proRequiredTooltip') || "Requires ClockForClaude Pro");
      return;
    }
    
    if (quickPrompts.length >= 5) {
      alert(uiLang.startsWith('fr') ? "Maximum 5 prompts autorisés." : "Maximum 5 prompts allowed.");
      return;
    }

    const text = newPromptInput.value.trim();
    if (!text) return;
    
    quickPrompts.push(text);
    await chrome.storage.local.set({ quick_prompts: quickPrompts });
    newPromptInput.value = '';
    renderQuickPrompts(true);
  });

  newPromptInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      btnAddPrompt.click();
    }
  });

  if (themeToggleCheckbox) {
    themeToggleCheckbox.addEventListener('change', async () => {
      const isDark = themeToggleCheckbox.checked;
      if (isDark) {
        document.body.classList.add('dark-theme');
        await chrome.storage.local.set({ theme: 'dark' });
      } else {
        document.body.classList.remove('dark-theme');
        await chrome.storage.local.set({ theme: 'light' });
      }
    });
  }

  extEnabled.addEventListener('change', async () => {
    await chrome.storage.local.set({ enabled: extEnabled.checked });
    updatePreview();
  });

  injectModes.forEach(radio => {
    radio.addEventListener('change', async () => {
      const selectedMode = document.querySelector('input[name="inject-mode"]:checked').value;
      await chrome.storage.local.set({ autoInjectMode: selectedMode });
      updatePreview();
    });
  });

  includeWeather.addEventListener('change', async () => {
    await chrome.storage.local.set({ includeWeather: includeWeather.checked });
    updatePreview();
  });

  locModes.forEach(radio => {
    radio.addEventListener('change', async () => {
      const selectedLocMode = document.querySelector('input[name="loc-mode"]:checked').value;
      await chrome.storage.local.set({ locationMode: selectedLocMode });
      toggleLocationPanels(selectedLocMode);
      updatePreview();
    });
  });

  // --- Actions ---

  // Auto Geolocation Detection
  btnDetectLoc.addEventListener('click', () => {
    locSpinner.classList.add('spinning');
    locStatusText.textContent = chrome.i18n.getMessage('locStatusDetecting') || "Detecting...";
    locCoords.textContent = "";

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = parseFloat(position.coords.latitude.toFixed(4));
        const lon = parseFloat(position.coords.longitude.toFixed(4));
        
        locStatusText.textContent = chrome.i18n.getMessage('locStatusSuccess') || "Success!";
        locCoords.textContent = `Lat: ${lat}, Lon: ${lon}`;
        
        const lang = getExtensionLanguage();
        let city = lang === 'fr' ? 'Position détectée' : 'Detected location';
        
        // Reverse Geocoding with BigDataCloud (free & keyless client-side API)
        try {
          locStatusText.textContent = chrome.i18n.getMessage('locStatusSearching') || "Searching city...";
          const geoUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=${lang}`;
          const res = await fetch(geoUrl);
          const data = await res.json();
          const resolvedCity = data.city || data.locality || data.principalSubdivision;
          if (resolvedCity) {
            city = resolvedCity;
            locStatusText.textContent = city;
          } else {
            locStatusText.textContent = chrome.i18n.getMessage('locStatusSuccess') || "Success!";
          }
        } catch (err) {
          console.error("Reverse geocoding failed:", err);
          locStatusText.textContent = "Location saved";
        }
        
        const autoLocData = { latitude: lat, longitude: lon, city: city };
        await chrome.storage.local.set({ autoLocation: autoLocData });
        
        // Force refresh weather cache
        await refreshWeather();
        
        locSpinner.classList.remove('spinning');
        updatePreview();
      },
      (error) => {
        console.error("Geolocation error:", error);
        locSpinner.classList.remove('spinning');
        locStatusText.textContent = chrome.i18n.getMessage('locStatusFailed') || "Failed";
        locCoords.textContent = getGeoErrorMessage(error);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 }
    );
  });

  // Manual Location Save
  btnSaveManual.addEventListener('click', async () => {
    const latStr = String(manualLat.value).replace(',', '.');
    const lonStr = String(manualLon.value).replace(',', '.');
    const lat = parseFloat(latStr);
    const lon = parseFloat(lonStr);
    const city = manualCity.value.trim();

    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      alert(chrome.i18n.getMessage('invalidCoordsAlert') || "Invalid coordinates. Latitude: -90 to 90, Longitude: -180 to 180.");
      return;
    }

    const manualLocData = {
      latitude: lat,
      longitude: lon,
      city: city || "Manual location"
    };

    await chrome.storage.local.set({ manualLocation: manualLocData });
    
    // Force refresh weather cache
    await refreshWeather();
    
    // Update preview & alert user
    await updatePreview();
    alert(chrome.i18n.getMessage('locationSavedAlert') || "Location successfully saved!");
  });

  // Refresh Preview Button
  btnRefreshPreview.addEventListener('click', async () => {
    btnRefreshPreview.querySelector('svg').style.transform = 'rotate(360deg)';
    btnRefreshPreview.querySelector('svg').style.transition = 'transform 0.5s ease';
    
    await refreshWeather();
    await updatePreview();
    
    setTimeout(() => {
      btnRefreshPreview.querySelector('svg').style.transform = 'none';
      btnRefreshPreview.querySelector('svg').style.transition = 'none';
    }, 500);
  });

  // Toggle Help Accordion
  const toggleHelpBtn = document.getElementById('toggle-help-btn');
  const helpContentPanel = document.getElementById('help-content-panel');
  const helpArrow = document.getElementById('help-arrow');
  if (toggleHelpBtn && helpContentPanel) {
    toggleHelpBtn.addEventListener('click', () => {
      const isHidden = helpContentPanel.classList.contains('hidden');
      if (isHidden) {
        helpContentPanel.classList.remove('hidden');
        helpArrow.classList.add('open');
      } else {
        helpContentPanel.classList.add('hidden');
        helpArrow.classList.remove('open');
      }
    });
  }

  // --- Helper Functions ---

  function localizeHtmlPage() {
    const elements = document.querySelectorAll('[data-i18n]');
    for (const element of elements) {
      const key = element.getAttribute('data-i18n');
      const translation = chrome.i18n.getMessage(key);
      if (translation) {
        if (element.tagName === 'INPUT' && (element.type === 'button' || element.type === 'submit')) {
          element.value = translation;
        } else {
          if (translation.includes('<')) {
            element.innerHTML = translation;
          } else {
            element.textContent = translation;
          }
        }
      }
    }
    
    // Translate placeholders
    const cityInput = document.getElementById('manual-city');
    if (cityInput) {
      cityInput.placeholder = chrome.i18n.getMessage('cityPlaceholder') || "E.g. Paris";
    }
    const emailInput = document.getElementById('premium-email-input');
    if (emailInput) {
      emailInput.placeholder = chrome.i18n.getMessage('stripeEmailPlaceholder') || "Stripe email to activate";
    }
    
    // Setup i18n tooltips if tooltip elements exist
    const tooltipInject = document.getElementById('tooltip-inject-mode');
    if (tooltipInject) {
      tooltipInject.title = chrome.i18n.getMessage('tooltipInject') || "Inject current context";
    }
  }

  function toggleLocationPanels(mode) {
    if (mode === 'auto') {
      autoLocPanel.classList.remove('hidden');
      manualLocPanel.classList.add('hidden');
    } else {
      autoLocPanel.classList.add('hidden');
      manualLocPanel.classList.remove('hidden');
    }
  }

  function updateAutoLocUI(autoLoc) {
    if (autoLoc && autoLoc.latitude && autoLoc.longitude) {
      locStatusText.textContent = autoLoc.city || "Location detected";
      locCoords.textContent = `Lat: ${autoLoc.latitude}, Lon: ${autoLoc.longitude}`;
    } else {
      locStatusText.textContent = chrome.i18n.getMessage('locStatusInactive') || "Geolocation inactive";
      locCoords.textContent = "";
    }
  }

  function getGeoErrorMessage(error) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return "Permission denied by browser.";
      case error.POSITION_UNAVAILABLE:
        return "GPS position unavailable.";
      case error.TIMEOUT:
        return "GPS timeout.";
      default:
        return "Unknown location error.";
    }
  }

  async function updatePreview() {
    previewText.textContent = chrome.i18n.getMessage('previewLoading') || "Generating preview...";
    try {
      const response = await chrome.runtime.sendMessage({ action: "get_full_context" });
      if (response && response.context) {
        previewText.textContent = response.context;
      } else if (response && response.error) {
        previewText.textContent = `Error: ${response.error}`;
      } else {
        previewText.textContent = "Extension is disabled.";
      }
    } catch (err) {
      previewText.textContent = `Error: ${err.message}`;
    }
  }

  function updatePremiumUI(isPremium) {
    document.getElementById('mode-first').disabled = !isPremium;
    document.getElementById('mode-all').disabled = !isPremium;
    
    const firstLabel = document.querySelector('label[for="mode-first"]');
    const allLabel = document.querySelector('label[for="mode-all"]');
    
    if (isPremium) {
      premiumActivationZone.classList.add('hidden');
      premiumActiveZone.classList.remove('hidden');
      premiumCard.style.borderColor = 'var(--success-color)';
      premiumCard.style.backgroundColor = 'rgba(22, 163, 74, 0.05)';
      
      if (firstLabel) {
        firstLabel.style.opacity = '1';
        firstLabel.title = "";
      }
      if (allLabel) {
        allLabel.style.opacity = '1';
        allLabel.title = "";
      }
    } else {
      premiumActivationZone.classList.remove('hidden');
      premiumActiveZone.classList.add('hidden');
      premiumCard.style.borderColor = 'rgba(226, 106, 54, 0.25)';
      premiumCard.style.backgroundColor = '#fdf5f0';
      
      const proTooltip = chrome.i18n.getMessage('proRequiredTooltip') || "Requires ClockForClaude Pro";
      if (firstLabel) {
        firstLabel.style.opacity = '0.5';
        firstLabel.title = proTooltip;
      }
      if (allLabel) {
        allLabel.style.opacity = '0.5';
        allLabel.title = proTooltip;
      }
      
      // Force check manual mode
      document.getElementById('mode-manual').checked = true;
      chrome.storage.local.set({ autoInjectMode: 'manual' });
    }

    // Update Quick Prompts panel controls based on Premium status
    if (isPremium) {
      newPromptInput.disabled = false;
      btnAddPrompt.disabled = false;
      newPromptInput.placeholder = uiLang.startsWith('fr') ? "Nouveau prompt..." : "Add a prompt...";
    } else {
      newPromptInput.disabled = true;
      btnAddPrompt.disabled = true;
      newPromptInput.placeholder = uiLang.startsWith('fr') ? "Activez Pro pour personnaliser" : "Activate Pro to customize";
    }
    renderQuickPrompts(isPremium);
  }

  async function refreshWeather() {
    try {
      await chrome.runtime.sendMessage({ action: "refresh_weather" });
    } catch (err) {
      console.error("Failed to trigger weather refresh:", err);
    }
  }
});
