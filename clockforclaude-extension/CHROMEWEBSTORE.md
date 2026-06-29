# Chrome Web Store Listing — ClockForClaude

> Last updated: 2026-06-29 · Package: `clockforclaude-extension.zip` · Version 1.0.0

## Store Listing — Français

**Nom**
ClockForClaude

**Description courte** (max 132 caractères)
Donnez à Claude une fenêtre sur le monde : heure locale, date, météo et fuseau horaire injectés automatiquement dans claude.ai.

**Description détaillée**
ClockForClaude est une extension légère qui injecte automatiquement un contexte temporel et environnemental dans vos conversations avec Claude.

Par défaut, les modèles d'IA ne connaissent ni l'heure exacte, ni votre fuseau horaire, ni votre météo locale. Résultat : des réponses parfois décalées (« bonne nuit » en plein après-midi). ClockForClaude corrige cela.

Fonctionnalités :
- Horodatage précis : heure locale, jour de la semaine, saison, moment de la journée.
- Météo locale : température, conditions, vent et coucher de soleil (API gratuite Open-Meteo).
- Jour ouvré & heures de bureau.
- Bouton manuel « 🕒 Clock » discret directement dans l'interface de Claude.
- Mode automatique (Pro) : le contexte s'injecte et se rafraîchit tout seul, puis se fige dès que vous écrivez.
- GPS précis & calendrier (Pro) : ajoutez votre prochain rendez-vous via une URL iCal.

Confidentialité : toutes vos données (réglages, position) sont stockées localement dans votre navigateur. Rien n'est revendu. Seules vos coordonnées sont envoyées à Open-Meteo, sans aucune information personnelle.

**Catégorie** : Productivité
**Objectif unique** : Injecter automatiquement la date, l'heure locale, la météo et le fuseau horaire dans les invites du site claude.ai.

## Store Listing — English

**Name**
ClockForClaude

**Short description** (max 132 chars)
Give Claude a window to the world: local time, date, weather and timezone injected automatically into claude.ai.

**Detailed description**
ClockForClaude is a lightweight extension that automatically injects time and environmental context into your conversations with Claude.

By default, AI models don't know the exact time, your timezone, or your local weather — which leads to time-blind replies (saying "good night" in the afternoon). ClockForClaude fixes that.

Features:
- Accurate timestamp: local time, day of week, season, time of day.
- Local weather: temperature, conditions, wind and sunset (free Open-Meteo API).
- Working day & office hours.
- Discreet manual "🕒 Clock" button right inside Claude's composer.
- Auto mode (Pro): context is injected and refreshes on its own, then freezes as soon as you type.
- Precise GPS & calendar (Pro): add your next meeting via an iCal URL.

Privacy: all your data (settings, location) is stored locally in your browser. Nothing is sold. Only your coordinates are sent to Open-Meteo, with no personal information.

**Category**: Productivity
**Single purpose**: Automatically inject the date, local time, weather and timezone into prompts on the claude.ai website.

**Primary language**: English (the extension UI auto-localizes to FR/EN/ES/IT/DE/PT/ZH).

## Permissions Justification

| Permission | Type | Justification |
|------------|------|---------------|
| `storage` | permission | Save the user's settings and the weather cache locally, to avoid redundant API calls. |
| `geolocation` | permission | Optional. Only when the user clicks "Use my location", to get precise GPS coordinates for local weather (Pro). |
| `https://api.open-meteo.com/*` | host | Fetch local weather (temperature, conditions, wind, sunset) for the configured location. |
| `https://geocoding-api.open-meteo.com/*` | host | Convert a city name typed by the user into coordinates for weather. |
| `https://api.bigdatacloud.net/*`, `https://api-bdc.io/*` | host | Approximate IP-based location (city) so weather works without GPS. |
| `https://raw.githubusercontent.com/*` | host | Fetch an updatable `selectors.json` so the extension keeps working if claude.ai changes its page structure — without forcing a new extension release. |
| `https://*.supabase.co/*` | host | Verify the user's Pro license key against our licensing backend. |
| `https://*/*` | **optional** host | NOT requested at install. Requested at runtime only when a Pro user adds a personal calendar, to fetch that single user-provided iCal (.ics) feed — which can live on any domain. |

## Privacy & Data Use

**Does the extension collect user data?** Yes — minimal.

| Data | Collected | Sent off-device | Purpose | Sold/shared |
|------|-----------|-----------------|---------|-------------|
| Approx. or GPS location | Yes (local) | Yes | Coordinates sent to Open-Meteo to fetch local weather. | No |
| Settings / license key | Yes (local only) | License key → our Supabase backend for verification only | Store preferences; unlock Pro. | No |

Certifications: data is NOT sold; NOT used outside core functionality; NOT used for creditworthiness.

**Privacy Policy URL** (use the English one for the store):
- English: https://clockforclaude.com/en/privacy-policy-extension.html
- French: https://clockforclaude.com/privacy-policy-extension.html

## Graphics & Assets (TO PRODUCE — required)

| Asset | Dimensions | Status |
|-------|-----------|--------|
| Store icon | 128×128 PNG | ✅ `icons/icon-128.png` |
| Screenshot 1 | 1280×800 (or 640×400) | ⬜ TODO — extension popup (settings + preview) |
| Screenshot 2 | 1280×800 (or 640×400) | ⬜ TODO — claude.ai with the 🕒 Clock button + injected block |
| Small promo tile | 440×280 | ⬜ Optional |

At least **one** screenshot is mandatory to publish.

## Distribution & Developer Info

- Visibility: Public · Regions: All · Pricing: Free (optional Pro subscription on external site)
- Publisher: ClockForClaude · Contact & support: clockforclaude@gmail.com · Homepage: https://clockforclaude.com

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-06 | Initial release: datetime + weather + working-day injection, manual & auto modes, GPS, iCal calendar (Pro), multilingual UI (7 languages). |

## Review Notes
- Automatic geolocation requires user consent in the popup; if denied, the user can set coordinates manually.
- The broad optional host permission (`https://*/*`) is never granted at install — it is requested per-domain at runtime only when a Pro user voluntarily adds an iCal calendar URL.
