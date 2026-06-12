# Chrome Web Store Listing — ClockForClaude

> Last Updated: 2026-06-12

## Store Listing

**Extension Name** [REQUIRED]
ClockForClaude

**Short Description** [REQUIRED]
Injecter du contexte local (heure, date, météo) directement dans Claude.ai.
*Local context injector (time, date, weather) directly into Claude.ai.*

**Detailed Description** [REQUIRED]
ClockForClaude est l'extension ultime pour Google Chrome permettant d'intégrer des informations en temps réel directement dans la zone de saisie de Claude.ai. 

Afin de préserver vos limites d'utilisation de Claude.ai et de lui donner un contexte temporel et environnemental précis, ClockForClaude vous permet d'insérer en un clic (ou automatiquement en version Pro) la date, l'heure exacte et la météo locale directement dans vos messages.

Fonctionnalités clés :
• Injection temporelle en temps réel : Insère la date, l'heure exacte et la météo locale avant vos invites (prompts).
• Thème sombre harmonieux : Activez un thème sombre raffiné inspiré du style d'Anthropic.
• Respect absolu de la vie privée : Aucune donnée n'est envoyée à des serveurs tiers, tout est géré localement sur votre navigateur.

---

*ClockForClaude is the ultimate Google Chrome extension to inject real-time context directly into the Claude.ai conversation prompt box.*

*By providing Claude with precise local time, date, and environmental context, you help it respond more accurately to time-sensitive queries.*

*Key Features:*
* *Real-Time Context Injection: Prepend exact time, date, and local weather before your prompts.*
* *Claude Dark Mode: Easily enable dark mode styling on the Claude.ai web interface.*
* *Privacy-First: All calculations, prompt configurations, and settings are handled entirely locally on your device.*

**Category** [REQUIRED]
Productivity

**Single Purpose** [REQUIRED]
Injects real-time local context (date, time, weather) into the Claude.ai conversation text box.

**Primary Language** [REQUIRED]
French (French) / English (United States)

## Graphics & Assets

| Asset | Dimensions | Status | Filename |
|-------|-----------|--------|----------|
| Store Icon [REQUIRED] | 128×128 PNG | ✅ Ready | `clockforclaude-extension/icons/icon-128.png` |
| Screenshot 1 [REQUIRED] | 1280×800 or 640×400 | ⬜ Not created | |
| Screenshot 2 [RECOMMENDED] | 1280×800 or 640×400 | ⬜ Not created | |
| Screenshot 3 [RECOMMENDED] | 1280×800 or 640×400 | ⬜ Not created | |

### Screenshot Notes
• Screenshot 1: Extension Popup UI displaying the main toggles, local time, weather status, and subscription option.
• Screenshot 2: Injected "🕒 Clock" button appearing natively alongside the text editor on Claude.ai.
• Screenshot 3: Active dark mode theme on Claude.ai enabled by the extension's option switcher.

## Permissions Justification

Every permission in `manifest.json` is strictly required to deliver the extension's core features locally:

| Permission | Type | Justification |
|------------|------|---------------|
| `storage` | permissions | Required to save and persist extension settings and dark mode theme preferences locally on the user's device. |
| `alarms` | permissions | Required to schedule periodic background updates (every 15 minutes) for fetching local weather without blocking browser performance. |
| `geolocation` | permissions | Required to detect the user's latitude and longitude coordinates locally in order to fetch accurate local weather forecasts. |
| `https://api.open-meteo.com/*` | host_permissions | Required to fetch real-time temperature and weather conditions based on the user's detected coordinates. |
| `https://geocoding-api.open-meteo.com/*` | host_permissions | Required to convert detected latitude/longitude coordinates into a city name for user-friendly context display. |
| `https://claude.ai/*` | content_scripts | Required to inject the clock control button into the official Claude.ai page interface, allowing direct context insertion. |

## Privacy & Data Use

### Data Collection

**Does the extension collect user data?** No

All data (including location coordinates) remains strictly local on your device within Chrome's local sandboxed storage. Nothing is transmitted to external servers.

### Data Use Certification
- [x] Data is NOT sold to third parties
- [x] Data is NOT used for purposes unrelated to the extension's core functionality
- [x] Data is NOT used for creditworthiness or lending purposes

## Privacy Policy

**Privacy Policy URL** [REQUIRED]
https://github.com/clockforclaude-maker/clockforclaude/blob/main/legal/PRIVACY_POLICY.md

## Distribution

**Visibility**: Public
**Regions**: All regions
**Pricing**: Free (with in-app Stripe checkout for Pro tier features)

## Developer Info

**Publisher Name** [REQUIRED]
MAXIME CANDEL EI

**Contact Email** [REQUIRED]
saisine@mediateur-consommation-smp.fr (or your general support email)

**Support URL / Email** [RECOMMENDED]
https://github.com/clockforclaude-maker/clockforclaude/issues

**Homepage URL** [RECOMMENDED]
https://github.com/clockforclaude-maker/clockforclaude

## Version History

| Version | Date | Changes | Status |
|---------|------|---------|--------|
| 1.0.0 | 2026-06-12 | Initial release supporting 16 languages, real-time context injection, and dark mode support. | Draft |
