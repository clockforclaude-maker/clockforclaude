// popup.js - Localized interactive UI logic for ClockForClaude Settings

// ── Backend (license verification) ──────────────────────────────
// Replace YOUR_PROJECT_REF with your Supabase project ref after deploying
// the functions in /backend (see backend/README.md).
const LICENSE_API = "https://bzbiuvcgfexbbmxetxyh.supabase.co/functions/v1/verify-license";

function normalizeLicenseKey(raw) {
  const cleaned = (raw || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!cleaned.startsWith("CFC")) return cleaned;
  const groups = cleaned.slice(3).match(/.{1,4}/g) || [];
  return `CFC-${groups.join("-")}`;
}

// Calls the backend to check a key. Returns { valid, plan, status, reason }.
async function verifyLicenseKey(key) {
  const res = await fetch(LICENSE_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ license_key: key }),
  });
  return res.json();
}

// Centralized Stripe Checkout Links Configuration
const STRIPE_LINKS = {
  EUR: "https://buy.stripe.com/4gM7sE7Dq4Ie0Qu5zYao802", // FR, ES, IT, DE, PT
  GBP: "https://buy.stripe.com/4gM7sE7Dq4Ie0Qu5zYao802", // UK
  JPY: "https://buy.stripe.com/4gM7sE7Dq4Ie0Qu5zYao802", // JP
  CNY: "https://buy.stripe.com/4gM7sE7Dq4Ie0Qu5zYao802", // CN
  USD: "https://buy.stripe.com/4gM7sE7Dq4Ie0Qu5zYao802"  // US & Global
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
  const premiumKeyInput = document.getElementById('premium-key-input');
  const premiumActivationMsg = document.getElementById('premium-activation-msg');
  const btnActivatePremium = document.getElementById('btn-activate-premium');
  const btnDeactivatePremium = document.getElementById('btn-deactivate-premium');

  // Load Settings
  const settings = await chrome.storage.local.get();

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
  if (settings.premium_key) {
    premiumKeyInput.value = settings.premium_key;
  }

  // Re-validate a stored key against the backend on every open. If the
  // subscription was canceled / expired, this revokes Pro automatically.
  if (settings.premium_status === 'premium' && settings.premium_key) {
    verifyLicenseKey(settings.premium_key)
      .then(async (result) => {
        if (!result.valid) {
          await chrome.storage.local.remove(['premium_status']);
          updatePremiumUI(false);
          if (premiumActivationMsg) {
            premiumActivationMsg.style.color = '#dc2626';
            premiumActivationMsg.textContent = result.reason === 'canceled'
              ? (uiLang.startsWith('fr') ? "Abonnement annulé — Pro désactivé." : "Subscription canceled — Pro disabled.")
              : (uiLang.startsWith('fr') ? "Clé invalide — Pro désactivé." : "Invalid key — Pro disabled.");
          }
        }
      })
      .catch(() => { /* offline: keep last known state, do not lock out */ });
  }

  // Update Live Preview
  updatePreview();

  // --- Change Listeners ---

  const setMsg = (text, ok) => {
    if (!premiumActivationMsg) return;
    premiumActivationMsg.style.color = ok ? 'var(--success-color)' : '#dc2626';
    premiumActivationMsg.textContent = text;
  };

  btnActivatePremium.addEventListener('click', async () => {
    const key = normalizeLicenseKey(premiumKeyInput.value);
    premiumKeyInput.value = key;
    if (!/^CFC-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(key)) {
      setMsg(uiLang.startsWith('fr') ? "Format de clé invalide (CFC-XXXX-XXXX-XXXX)." : "Invalid key format (CFC-XXXX-XXXX-XXXX).", false);
      return;
    }

    btnActivatePremium.disabled = true;
    const original = btnActivatePremium.textContent;
    btnActivatePremium.textContent = uiLang.startsWith('fr') ? "Vérification…" : "Verifying…";
    setMsg("", true);

    try {
      const result = await verifyLicenseKey(key);
      if (result.valid) {
        await chrome.storage.local.set({ premium_status: 'premium', premium_key: key });
        updatePremiumUI(true);
        setMsg(uiLang.startsWith('fr') ? "Clé valide — Pro activé !" : "Valid key — Pro activated!", true);
      } else {
        const reasons = {
          not_found: uiLang.startsWith('fr') ? "Clé introuvable." : "Key not found.",
          canceled: uiLang.startsWith('fr') ? "Abonnement annulé." : "Subscription canceled.",
          past_due: uiLang.startsWith('fr') ? "Paiement en retard." : "Payment past due.",
          invalid_format: uiLang.startsWith('fr') ? "Format invalide." : "Invalid format.",
        };
        setMsg(reasons[result.reason] || (uiLang.startsWith('fr') ? "Clé non valide." : "Invalid key."), false);
      }
    } catch (err) {
      setMsg(uiLang.startsWith('fr') ? "Erreur réseau — réessayez." : "Network error — try again.", false);
    } finally {
      btnActivatePremium.disabled = false;
      btnActivatePremium.textContent = original;
    }
  });

  btnDeactivatePremium.addEventListener('click', async () => {
    await chrome.storage.local.remove(['premium_status', 'premium_key']);
    updatePremiumUI(false);
    setMsg("", true);
  });

  // --- iCal calendar (Pro) ---
  const icalInput = document.getElementById('ical-url-input');
  const btnSaveIcal = document.getElementById('btn-save-ical');
  const icalMsg = document.getElementById('ical-msg');
  if (icalInput && settings.icalUrl) icalInput.value = settings.icalUrl;

  const setIcalMsg = (text, ok) => {
    if (!icalMsg) return;
    icalMsg.style.color = ok ? 'var(--success-color)' : '#dc2626';
    icalMsg.textContent = text;
  };

  if (btnSaveIcal) {
    btnSaveIcal.addEventListener('click', async () => {
      const raw = (icalInput.value || '').trim();
      if (!raw) {
        await chrome.storage.local.remove(['icalUrl', 'ical_cache']);
        setIcalMsg(uiLang.startsWith('fr') ? "Calendrier retiré." : "Calendar removed.", true);
        return;
      }
      let origin;
      try {
        const u = new URL(raw);
        if (u.protocol !== 'https:') throw new Error('not https');
        origin = `${u.origin}/*`;
      } catch (e) {
        setIcalMsg(uiLang.startsWith('fr') ? "URL invalide (https requis)." : "Invalid URL (https required).", false);
        return;
      }
      // Ask for permission to fetch this calendar's domain
      let granted = false;
      try {
        granted = await chrome.permissions.request({ origins: [origin] });
      } catch (e) { granted = false; }
      if (!granted) {
        setIcalMsg(uiLang.startsWith('fr') ? "Permission refusée pour ce domaine." : "Permission denied for this domain.", false);
        return;
      }
      await chrome.storage.local.set({ icalUrl: raw });
      await chrome.storage.local.remove('ical_cache');
      setIcalMsg(uiLang.startsWith('fr') ? "✓ Calendrier enregistré." : "✓ Calendar saved.", true);
      updatePreview();
    });
  }



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
    let latStr = String(manualLat.value).trim().replace(',', '.');
    let lonStr = String(manualLon.value).trim().replace(',', '.');
    let city = manualCity.value.trim();

    if (!city) {
      alert(uiLang.startsWith('fr') ? "Veuillez entrer une ville ou un code postal." : "Please enter a city or postal code.");
      return;
    }

    let lat = parseFloat(latStr);
    let lon = parseFloat(lonStr);

    // If coordinates are missing, fetch them automatically using Open-Meteo Geocoding API
    if (isNaN(lat) || isNaN(lon)) {
      btnSaveManual.disabled = true;
      const originalText = btnSaveManual.textContent;
      btnSaveManual.textContent = uiLang.startsWith('fr') ? "Recherche des coordonnées..." : "Searching coordinates...";
      
      try {
        const lang = uiLang.split('-')[0];
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=${lang}&format=json`;
        const res = await fetch(geoUrl);
        const data = await res.json();
        
        if (data && data.results && data.results.length > 0) {
          const result = data.results[0];
          lat = parseFloat(result.latitude);
          lon = parseFloat(result.longitude);
          
          // Format resolved city name with country
          const resolvedCity = result.name;
          const resolvedCountry = result.country ? `, ${result.country}` : '';
          city = resolvedCity + resolvedCountry;
          
          // Fill fields in the UI
          manualLat.value = lat.toFixed(4);
          manualLon.value = lon.toFixed(4);
          manualCity.value = city;
        } else {
          alert(uiLang.startsWith('fr') ? "Ville ou code postal introuvable. Veuillez vérifier ou entrer les coordonnées manuellement." : "City or postal code not found. Please check or enter coordinates manually.");
          btnSaveManual.disabled = false;
          btnSaveManual.textContent = originalText;
          return;
        }
      } catch (err) {
        console.error("Geocoding failed:", err);
        alert(uiLang.startsWith('fr') ? "Erreur lors de la recherche de la ville. Veuillez entrer les coordonnées manuellement." : "Error searching city. Please enter coordinates manually.");
        btnSaveManual.disabled = false;
        btnSaveManual.textContent = originalText;
        return;
      }
      
      btnSaveManual.disabled = false;
      btnSaveManual.textContent = originalText;
    }

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
      cityInput.placeholder = chrome.i18n.getMessage('cityPlaceholder') || "E.g. Paris or 31000";
    }
    const latInput = document.getElementById('manual-lat');
    if (latInput) {
      latInput.placeholder = chrome.i18n.getMessage('latPlaceholder') || "Optional (e.g. 48.8566)";
    }
    const lonInput = document.getElementById('manual-lon');
    if (lonInput) {
      lonInput.placeholder = chrome.i18n.getMessage('lonPlaceholder') || "Optional (e.g. 2.3522)";
    }
    const keyInput = document.getElementById('premium-key-input');
    if (keyInput) {
      keyInput.placeholder = chrome.i18n.getMessage('licenseKeyPlaceholder') || "CFC-XXXX-XXXX-XXXX";
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
  }

  async function refreshWeather() {
    try {
      await chrome.runtime.sendMessage({ action: "refresh_weather" });
    } catch (err) {
      console.error("Failed to trigger weather refresh:", err);
    }
  }
});
