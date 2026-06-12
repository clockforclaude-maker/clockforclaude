# Chrome Web Store Listing — ClockForClaude

> Last Updated: 2026-06-11

## Store Listing

**Extension Name**
ClockForClaude

**Short Description**
Donnez à Claude une fenêtre sur le monde : heure locale, date, météo et heures creuses directement dans claude.ai.

**Detailed Description**
ClockForClaude est une extension légère conçue pour injecter automatiquement un contexte temporel et environnemental dans vos conversations avec Claude.

Par défaut, les modèles IA n'ont pas conscience de l'heure exacte à laquelle vous leur parlez, de votre météo locale ou de votre fuseau horaire. Cela peut mener à des réponses décalées temporellemenent (souhaiter "bonne nuit" en plein après-midi ou ignorer que vous avez une météo spécifique).

Fonctionnalités clés :
- Horodatage précis : Injecte l'heure locale, le jour de la semaine et la saison exacte.
- Météo locale intégrée : Ajoute la température, le vent et l'heure du coucher de soleil.
- Indicateur d'heures creuses : Affiche si vous êtes dans le créneau horaire où les limites d'utilisation de Claude sont doublées.
- Mode Automatique : Injecte automatiquement le contexte lors du premier message d'une nouvelle discussion.
- Bouton Manuel : Un bouton flottant discret ajouté directement à l'interface de Claude pour insérer le contexte en un clic.

Comment l'utiliser :
1. Installez l'extension.
2. Ouvrez le popup de l'extension pour activer la géolocalisation automatique ou définir des coordonnées manuelles.
3. Allez sur claude.ai et commencez à discuter. L'extension s'occupe du reste !

Note sur la vie privée :
Toutes vos données (préférences, position GPS) sont stockées localement dans votre navigateur. Aucune donnée n'est revendue ou partagée avec des tiers. La position GPS n'est envoyée qu'à l'API de météo gratuite Open-Meteo sans aucune information d'identité personnelle.

**Category**
Productivity

**Single Purpose**
Injecte automatiquement la date, l'heure locale, la météo et le fuseau horaire dans les invites du site claude.ai.

**Primary Language**
French

## Graphics & Assets

| Asset | Dimensions | Status | Filename |
|-------|-----------|--------|----------|
| Store Icon | 128×128 PNG | ⬜ Not created | Omitted in manifest (uses Chrome default) |
| Screenshot 1 | 1280×800 or 640×400 | ⬜ Not created | |
| Screenshot 2 | 1280×800 or 640×400 | ⬜ Not created | |
| Small Promo Tile | 440×280 | ⬜ Not created | |

### Screenshot Notes
- Capture 1 : L'interface du popup de configuration montrant les réglages, le mode d'injection et l'aperçu du bloc temporel.
- Capture 2 : Le site claude.ai avec le bouton ClockForClaude flottant et le bloc d'horodatage inséré en début de prompt.

## Permissions Justification

| Permission | Type | Justification |
|------------|------|---------------|
| `storage` | permissions | Permet de sauvegarder localement les réglages de l'utilisateur (mode d'injection, préférences d'affichage) ainsi que le cache de la météo pour éviter des appels API superflus. |
| `alarms` | permissions | Utilisé pour programmer des nettoyages périodiques du cache de météo afin d'éviter la saturation de l'espace de stockage. |
| `https://api.open-meteo.com/*` | host_permissions | Nécessaire pour communiquer avec l'API Open-Meteo afin de récupérer la météo locale (température, vent, coucher de soleil) correspondant à la position géographique configurée. |

## Privacy & Data Use

### Data Collection

**Does the extension collect user data?** Yes

| Data Type | Collected? | Transmitted Off-Device? | Purpose | Shared with Third Parties? |
|-----------|-----------|------------------------|---------|---------------------------|
| Location | Yes | Yes | Utilisé uniquement pour envoyer les coordonnées de latitude/longitude à l'API publique Open-Meteo afin de récupérer la météo locale. | No |

### Data Use Certification
- [x] Data is NOT sold to third parties
- [x] Data is NOT used for purposes unrelated to the extension's core functionality
- [x] Data is NOT used for creditworthiness or lending purposes

## Privacy Policy

**Privacy Policy URL**
https://clockforclaude.com/privacy-policy-extension

## Distribution

**Visibility**: Public
**Regions**: All regions
**Pricing**: Free (with optional link to Pro premium subscription on external site)

## Developer Info

**Publisher Name**
ClockForClaude Dev

**Contact Email**
contact@clockforclaude.com

**Support URL / Email**
support@clockforclaude.com

**Homepage URL**
https://clockforclaude.com

## Version History

| Version | Date | Changes | Status |
|---------|------|---------|--------|
| 1.0.0 | 2026-06-11 | Initial release with datetime, weather and off-peak injection. | Draft |

## Review Notes

### Known Issues / Limitations
- L'utilisation de la géolocalisation automatique requiert l'autorisation de l'utilisateur dans le popup de l'extension. Si elle est refusée, l'utilisateur doit configurer manuelle les coordonnées.
