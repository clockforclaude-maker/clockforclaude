# Privacy Policy / Politique de Confidentialité — ClockForClaude

**Last Updated / Dernière mise à jour** : June 12, 2026

---

## 🇫🇷 Français : Politique de Confidentialité

Votre vie privée est notre priorité absolue. Cette politique de confidentialité explique comment l'extension Google Chrome et l'application mobile **ClockForClaude** traitent vos données.

### 1. Collecte et Utilisation des Données
ClockForClaude est conçu pour fonctionner de manière **entièrement locale**. Nous ne collectons, ne stockons, ni ne transmettons aucune donnée personnelle ou sensible à nos propres serveurs.

*   **Données de géolocalisation (GPS)** : Si vous activez la détection automatique, l'application accède temporairement aux coordonnées de votre appareil (latitude et longitude) uniquement pour récupérer la météo locale en temps réel via l'API publique Open-Meteo. Ces coordonnées sont stockées localement et de manière sécurisée dans la mémoire de votre appareil (`chrome.storage.local` sur ordinateur ou `SecureStore` sur mobile).
*   **Données de calendrier (Premium)** : L'application mobile demande l'accès en lecture à votre calendrier local afin d'injecter vos événements à venir dans le contexte de Claude. Ces événements sont traités en temps réel sur l'appareil et ne sont jamais stockés en dehors de votre mémoire locale.
*   **Contenu des messages** : Tout le contexte (heure, météo, calendrier) est injecté directement dans la zone d'édition du site officiel `claude.ai`. Ces données sont soumises exclusivement aux conditions d'utilisation et à la politique de confidentialité d'Anthropic (Claude).

### 2. Services Tiers
*   **Stripe** : La gestion des abonnements Pro s'effectue via la plateforme Stripe. Les données financières et d'abonnement sont collectées et stockées de manière sécurisée par Stripe conformément à ses propres politiques de sécurité.
*   **Open-Meteo** : Les requêtes météo sont envoyées de manière anonyme à l'API publique d'Open-Meteo sans aucune association avec votre identité.

### 3. Vos Droits
Puisque nous ne stockons aucune donnée utilisateur sur des serveurs externes, nous ne possédons aucun moyen d'accéder à vos données de contexte ou de les supprimer. Vous pouvez révoquer les permissions d'accès au calendrier ou au GPS à tout moment via les réglages de votre navigateur ou de votre téléphone.

---

## 🇺🇸 English: Privacy Policy

Your privacy is our highest priority. This Privacy Policy explains how the **ClockForClaude** Google Chrome Extension and Mobile Application handle your data.

### 1. Data Collection and Usage
ClockForClaude is designed to run **entirely locally**. We do not collect, store, or transmit any personal or sensitive user data to any external server.

*   **Location Data (GPS)**: If you enable automatic detection, the application temporarily accesses your device coordinates (latitude and longitude) solely to retrieve real-time local weather data via the public Open-Meteo API. These coordinates are stored locally and securely in your device's sandbox memory (`chrome.storage.local` on desktop or `SecureStore` on mobile).
*   **Calendar Data (Premium)**: The mobile application requests read access to your local calendar in order to inject your upcoming events into Claude's prompt context. These events are processed in real-time on-device and are never stored anywhere else.
*   **Prompt Content**: All assembled context (time, weather, calendar) is injected directly into the message text editor on the official `claude.ai` website. This data is subject exclusively to Anthropic's (Claude) Terms of Service and Privacy Policy.

### 2. Third-Party Services
*   **Stripe**: Pro subscriptions are managed securely via the Stripe platform. Payment details and subscription statuses are handled directly by Stripe in compliance with their security policies.
*   **Open-Meteo**: Weather coordinates are requested anonymously from the Open-Meteo public API, with no user identification attached.

### 3. Your Rights
Since we do not store any user data on external servers, we have no means of accessing or deleting your context data. You can revoke calendar or GPS location permissions at any time through your browser settings or mobile system settings.
