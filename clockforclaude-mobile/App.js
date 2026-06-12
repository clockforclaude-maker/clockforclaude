// App.js - Main entry point for ClockForClaude React Native Mobile App

import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  TouchableOpacity, 
  Modal, 
  Switch, 
  ScrollView, 
  TextInput, 
  Alert,
  ActivityIndicator,
  StatusBar,
  Linking,
  NativeModules,
  Platform
} from 'react-native';
import ClaudeWebView from './src/components/ClaudeWebView';
import { isPremiumUser, verifySubscription, clearSubscription } from './src/services/stripeService';
import { requestLocationPermissions, getDeviceCoordinates } from './src/services/contextService';
import { requestCalendarPermissions } from './src/services/calendarService';
import { requestNotificationPermissions, sendLocalNotification } from './src/services/notificationService';

// Centralized Stripe Checkout Links Configuration
const STRIPE_LINKS = {
  EUR: "https://buy.stripe.com/14A5kw5videKeHk0fEao800",
  GBP: "https://buy.stripe.com/14A5kw5videKeHk0fEao800",
  JPY: "https://buy.stripe.com/14A5kw5videKeHk0fEao800",
  CNY: "https://buy.stripe.com/14A5kw5videKeHk0fEao800",
  USD: "https://buy.stripe.com/14A5kw5videKeHk0fEao800"
};

const translations = {
  fr: {
    title: "Configuration ClockForClaude",
    enableApp: "Activer ClockForClaude",
    enableDesc: "Injecter le contexte dans claude.ai",
    injectMode: "Mode d'injection",
    firstMsg: "1er Message",
    everyMsg: "Chaque",
    manualMsg: "Manuel",
    contextData: "Données du contexte",
    includeWeather: "Inclure la météo",
    location: "Localisation",
    autoLoc: "Automatique",
    manualLoc: "Manuelle",
    notDetected: "Position non détectée",
    detectButton: "Détecter",
    cityPlaceholder: "Ville (Ex: Paris)",
    latPlaceholder: "Latitude",
    lonPlaceholder: "Longitude",
    proTitle: "Intégration Agenda & Notifications",
    proDescActive: "Votre accès Pro est activé. Claude aura accès à vos réunions à venir et vous recevrez des alertes intelligentes.",
    proDescInactive: "Débloquez l'accès à vos calendriers (Google, Apple) et activez les alertes intelligentes combinées météo/agenda.",
    stripeStep1: "1. S'abonner sur Stripe (2,49 € / mois)",
    stripeStep2: "2. Une fois abonné, entrez votre email pour activer :",
    stripeEmailPlaceholder: "Email de votre compte Stripe",
    activatePro: "Activer l'accès Pro",
    deactivatePro: "Désactiver la version Pro",
    permissionDenied: "Permission refusée",
    locationPermissionAlert: "Veuillez accorder la permission de géolocalisation dans les réglages de votre téléphone.",
    locSuccess: "Géolocalisation réussie",
    locSuccessDesc: "Ville détectée : ",
    locError: "Erreur",
    locErrorDesc: "Impossible de récupérer les coordonnées GPS.",
    proSuccess: "Succès Premium ! ⚡",
    proSuccessDesc: "Votre abonnement Stripe ({plan}) a été vérifié. Les fonctionnalités de Calendrier et de Notifications sont débloquées.",
    proFail: "Échec de vérification",
    disconnectTitle: "Déconnexion",
    disconnectDesc: "Abonnement Pro désactivé sur cet appareil.",
    helpTitle: "Aide & Mode d'emploi",
    helpHow: "Comment utiliser l'application ?",
    helpHowDesc: "• L'application charge le site de Claude. Connectez-vous normalement.\n• En mode Gratuit, cliquez sur le bouton orange 🕒 Clock à côté de la zone de saisie pour injecter manuellement la date, l'heure et la météo locale dans votre message.\n• En mode Pro, l'injection se fait automatiquement sans aucun clic (sur le 1er message ou sur chaque message selon vos réglages).\n• Si une mise à jour de Claude bloque l'injection, la correction est appliquée automatiquement à distance sous quelques heures sans action de votre part.",
    proFeatureTitle: "Fonctionnalité Pro ⚡",
    proFirstMsgAlert: "L'injection automatique (1er message) nécessite un abonnement ClockForClaude Pro.",
    proEveryMsgAlert: "L'injection automatique (chaque message) nécessite un abonnement ClockForClaude Pro.",
    welcomeProTitle: "Bienvenue sur ClockForClaude Pro ! ⚡",
    welcomeProDesc: "L'intégration d'agenda et la météo intelligente sont maintenant activées.",
    darkMode: "Mode Sombre",
    darkModeDesc: "Activer le thème sombre Anthropic"
  },
  en: {
    title: "ClockForClaude Settings",
    enableApp: "Enable ClockForClaude",
    enableDesc: "Inject context into claude.ai",
    injectMode: "Injection Mode",
    firstMsg: "1st Message",
    everyMsg: "Every Message",
    manualMsg: "Manual",
    contextData: "Context Data",
    includeWeather: "Include Weather",
    location: "Location",
    autoLoc: "Automatic",
    manualLoc: "Manual",
    notDetected: "Location not detected",
    detectButton: "Detect",
    cityPlaceholder: "City (E.g. Paris)",
    latPlaceholder: "Latitude",
    lonPlaceholder: "Longitude",
    proTitle: "Calendar Sync & Smart Alerts",
    proDescActive: "Your Pro access is active. Claude will have access to your upcoming meetings and you'll receive smart notifications.",
    proDescInactive: "Unlock access to your calendars (Google, Apple) and enable smart notification alerts merging weather & schedule.",
    stripeStep1: "1. Subscribe on Stripe ($2.49 / month)",
    stripeStep2: "2. Once subscribed, enter your email to activate:",
    stripeEmailPlaceholder: "Your Stripe account email",
    activatePro: "Activate Pro Access",
    deactivatePro: "Disable Pro Version",
    permissionDenied: "Permission Denied",
    locationPermissionAlert: "Please grant location permissions in your phone's settings.",
    locSuccess: "Location Successful",
    locSuccessDesc: "Detected City: ",
    locError: "Error",
    locErrorDesc: "Could not retrieve GPS coordinates.",
    proSuccess: "Premium Success! ⚡",
    proSuccessDesc: "Your Stripe subscription ({plan}) has been verified. Calendar and Notification features are unlocked.",
    proFail: "Verification Failed",
    disconnectTitle: "Logged Out",
    disconnectDesc: "Pro subscription deactivated on this device.",
    helpTitle: "Help & Guide",
    helpHow: "How to use the app?",
    helpHowDesc: "• The app loads the official claude.ai site. Log in normally to get started.\n• Under the Free plan, tap the orange 🕒 Clock button next to the input box to manually insert or refresh your local time and weather.\n• Under the Pro plan, context injection is completely automatic (prepending to the first message or every message based on your selection).\n• If a Claude update breaks the injection, the fix is applied automatically in the background within a few hours. No action is required on your part.",
    proFeatureTitle: "Pro Feature ⚡",
    proFirstMsgAlert: "Automatic injection (1st message) requires a ClockForClaude Pro subscription.",
    proEveryMsgAlert: "Automatic injection (every message) requires a ClockForClaude Pro subscription.",
    welcomeProTitle: "Welcome to ClockForClaude Pro! ⚡",
    welcomeProDesc: "Calendar integration and smart weather alerts are now active.",
    darkMode: "Dark Mode",
    darkModeDesc: "Enable Anthropic dark theme"
  }
};

const getDeviceLanguage = () => {
  let locale = 'en';
  try {
    if (Platform.OS === 'ios') {
      const settings = NativeModules.SettingsManager?.settings;
      locale = settings?.AppleLocale || settings?.AppleLanguages?.[0] || 'en';
    } else if (Platform.OS === 'android') {
      locale = NativeModules.I18nManager?.localeIdentifier || 'en';
    }
  } catch (e) {
    console.log("Could not detect device language:", e);
  }
  const lang = locale.split('_')[0].split('-')[0].toLowerCase();
  return lang === 'fr' ? 'fr' : 'en';
};

const getDeviceLocale = () => {
  let locale = 'en';
  try {
    if (Platform.OS === 'ios') {
      const settings = NativeModules.SettingsManager?.settings;
      locale = settings?.AppleLocale || settings?.AppleLanguages?.[0] || 'en';
    } else if (Platform.OS === 'android') {
      locale = NativeModules.I18nManager?.localeIdentifier || 'en';
    }
  } catch (e) {
    console.log("Could not detect device locale:", e);
  }
  return locale;
};

const userLang = getDeviceLanguage();
const t = translations[userLang];

export default function App() {
  const webViewRef = useRef(null);
  const [newPromptText, setNewPromptText] = useState('');
  const [settings, setSettings] = useState({
    enabled: true,
    autoInjectMode: 'first', // 'first', 'all', 'manual'
    includeWeather: true,
    includeOffPeak: true,
    locationMode: 'auto', // 'auto', 'manual'
    manualLocation: { latitude: 48.8566, longitude: 2.3522, city: 'Paris' },
    autoLocation: { latitude: null, longitude: null, city: '' },
    theme: 'light', // 'light' or 'dark'
    quick_prompts: userLang === 'fr' 
      ? ["Résume ce texte", "Explique simplement", "Améliore le style"] 
      : ["Summarize this", "Explain simply", "Improve style"]
  });

  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [stripeEmail, setStripeEmail] = useState('');
  const [isVerifyingStripe, setIsVerifyingStripe] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const getPricingInfo = () => {
    const locale = getDeviceLocale().toLowerCase();
    let currency = 'USD';
    let priceText = '$2.49 / month';
    
    if (locale.startsWith('fr') || locale.startsWith('es') || locale.startsWith('it') || locale.startsWith('de') || locale.startsWith('pt')) {
      currency = 'EUR';
      priceText = '2,49 € / ' + (userLang === 'fr' ? 'mois' : 'month');
    } else if (locale.includes('gb') || locale.endsWith('gb')) {
      currency = 'GBP';
      priceText = '£2.49 / month';
    } else if (locale.startsWith('ja')) {
      currency = 'JPY';
      priceText = '¥350 / ' + (userLang === 'fr' ? 'mois' : 'month');
    } else if (locale.startsWith('zh')) {
      currency = 'CNY';
      priceText = '¥18 / ' + (userLang === 'fr' ? 'mois' : 'month');
    }
    
    return {
      priceText,
      link: STRIPE_LINKS[currency] || STRIPE_LINKS.USD
    };
  };

  const getStyle = (styleKey) => {
    const isDark = settings.theme === 'dark';
    switch (styleKey) {
      case 'container':
        return [styles.container, isDark && { backgroundColor: '#191919' }];
      case 'floatingButton':
        return [styles.floatingButton, isDark && { backgroundColor: '#222222', borderColor: '#3d3d3d' }];
      case 'floatingButtonText':
        return [styles.floatingButtonText, isDark && { color: '#ffffff' }];
      case 'modalOverlay':
        return styles.modalOverlay;
      case 'modalContent':
        return [styles.modalContent, isDark && { backgroundColor: '#222222', borderColor: '#3d3d3d' }];
      case 'modalTitle':
        return [styles.modalTitle, isDark && { color: '#ffffff' }];
      case 'closeButtonText':
        return [styles.closeButtonText, isDark && { color: '#b3b0aa' }];
      case 'settingsLabel':
        return [styles.settingsLabel, isDark && { color: '#ffffff' }];
      case 'settingsSubLabel':
        return [styles.settingsSubLabel, isDark && { color: '#ffffff' }];
      case 'settingsDescription':
        return [styles.settingsDescription, isDark && { color: '#b3b0aa' }];
      case 'sectionHeader':
        return [styles.sectionHeader, isDark && { color: '#b3b0aa' }];
      case 'segmentedControl':
        return [styles.segmentedControl, isDark && { backgroundColor: '#2e2e2e', borderColor: '#3d3d3d' }];
      case 'segmentButtonActive':
        return [styles.segmentButtonActive, isDark && { backgroundColor: '#3d3d3d' }];
      case 'segmentText':
        return [styles.segmentText, isDark && { color: '#b3b0aa' }];
      case 'segmentTextActive':
        return [styles.segmentTextActive, isDark && { color: '#ffffff' }];
      case 'locationCard':
        return [styles.locationCard, isDark && { backgroundColor: '#2e2e2e', borderColor: '#3d3d3d' }];
      case 'locationCardTitle':
        return [styles.locationCardTitle, isDark && { color: '#ffffff' }];
      case 'locationCardCoords':
        return [styles.locationCardCoords, isDark && { color: '#b3b0aa' }];
      case 'detectButton':
        return [styles.detectButton, isDark && { backgroundColor: '#3d3d3d', borderColor: '#4d4d4d' }];
      case 'detectButtonText':
        return [styles.detectButtonText, isDark && { color: '#ffffff' }];
      case 'input':
        return [styles.input, isDark && { backgroundColor: '#2e2e2e', borderColor: '#3d3d3d', color: '#ffffff' }];
      case 'helpCard':
        return [styles.helpCard, isDark && { backgroundColor: '#2e2e2e', borderColor: '#3d3d3d' }];
      case 'helpQuestion':
        return [styles.helpQuestion, isDark && { color: '#ffffff' }];
      case 'helpAnswer':
        return [styles.helpAnswer, isDark && { color: '#b3b0aa' }];
      default:
        return styles[styleKey];
    }
  };

  // Load premium status and remote selectors on mount
  useEffect(() => {
    checkPremium();
    fetchRemoteSelectors();
  }, []);

  const fetchRemoteSelectors = async () => {
    try {
      const configUrl = "https://raw.githubusercontent.com/clockforclaude-maker/clockforclaude-config/main/selectors.json";
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(configUrl, { signal: id.signal });
      clearTimeout(id);
      const data = await res.json();
      if (data && data.editor) {
        setSettings(prev => ({ ...prev, remoteSelector: data.editor }));
        console.log("Mobile: Dynamic selectors loaded:", data.editor);
      }
    } catch (e) {
      console.log("Mobile: Failed to fetch remote selectors, using local fallbacks:", e.message);
    }
  };

  const checkPremium = async () => {
    const status = await isPremiumUser();
    setIsPremium(status);
    if (!status) {
      setSettings(prev => ({ ...prev, autoInjectMode: 'manual' }));
    }
  };

  const toggleSetting = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const updateLocationMode = (mode) => {
    setSettings(prev => ({
      ...prev,
      locationMode: mode
    }));
  };

  const handleManualLocationChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      manualLocation: {
        ...prev.manualLocation,
        [key]: value
      }
    }));
  };

  // Detect GPS Location
  const handleDetectLocation = async () => {
    setIsDetectingLocation(true);
    try {
      const permitted = await requestLocationPermissions();
      if (!permitted) {
        Alert.alert(t.permissionDenied, t.locationPermissionAlert);
        setIsDetectingLocation(false);
        return;
      }

      const coords = await getDeviceCoordinates();
      if (coords) {
        setSettings(prev => ({
          ...prev,
          autoLocation: coords
        }));
        Alert.alert(t.locSuccess, `${t.locSuccessDesc}${coords.city}`);
      } else {
        Alert.alert(t.locError, t.locErrorDesc);
      }
    } catch (err) {
      Alert.alert(t.locError, err.message);
    } finally {
      setIsDetectingLocation(false);
    }
  };

  // Stripe Verification
  const handleVerifyStripe = async () => {
    if (!stripeEmail.trim()) {
      Alert.alert(t.locError, t.stripeEmailPlaceholder);
      return;
    }
    
    setIsVerifyingStripe(true);
    const result = await verifySubscription(stripeEmail);
    setIsVerifyingStripe(false);

    if (result.success) {
      setIsPremium(true);
      Alert.alert(t.proSuccess, t.proSuccessDesc.replace('{plan}', result.plan));
      
      // Request permissions immediately
      await requestCalendarPermissions();
      await requestNotificationPermissions();
      
      // Send a welcome push alert
      await sendLocalNotification(t.welcomeProTitle, t.welcomeProDesc);
    } else {
      Alert.alert(t.proFail, result.error);
    }
  };

  // Clear Stripe Auth
  const handleClearStripe = async () => {
    await clearSubscription();
    setIsPremium(false);
    setStripeEmail('');
    setSettings(prev => ({ ...prev, autoInjectMode: 'manual' }));
    Alert.alert(t.disconnectTitle, t.disconnectDesc);
  };

  // Inject Callback
  const handleInjectSuccess = (source) => {
    console.log(`Context successfully injected via ${source}`);
  };

  const pricingInfo = getPricingInfo();

  return (
    <SafeAreaView style={getStyle('container')}>
      <StatusBar 
        barStyle={settings.theme === 'dark' ? "light-content" : "dark-content"} 
        backgroundColor={settings.theme === 'dark' ? "#191919" : "#fbfaf7"} 
      />

      {/* Render Quick Prompts Pills above the WebView if user is Premium */}
      {isPremium && settings.enabled && (
        <View style={[styles.pillsContainer, settings.theme === 'dark' && { backgroundColor: '#191919', borderBottomColor: '#3d3d3d' }]}>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsScrollContent}>
            {(settings.quick_prompts || []).map((prompt, index) => (
              <TouchableOpacity 
                key={index}
                style={[styles.pillButton, settings.theme === 'dark' && { backgroundColor: '#222222', borderColor: '#3d3d3d' }]}
                onPress={() => webViewRef.current?.injectText(prompt)}
              >
                <Text style={[styles.pillButtonText, settings.theme === 'dark' && { color: '#ffffff' }]}>{prompt}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Main WebView Rendering Claude */}
      <ClaudeWebView 
        ref={webViewRef}
        settings={settings} 
        onInjectSuccess={handleInjectSuccess} 
      />

      {/* Floating Settings Trigger Button */}
      <TouchableOpacity 
        style={getStyle('floatingButton')} 
        onPress={() => setIsSettingsVisible(true)}
      >
        <Text style={getStyle('floatingButtonText')}>⚙️</Text>
      </TouchableOpacity>

      {/* Settings Modal (Overlay Panel) */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isSettingsVisible}
        onRequestClose={() => setIsSettingsVisible(false)}
      >
        <View style={getStyle('modalOverlay')}>
          <View style={getStyle('modalContent')}>
            
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={getStyle('modalTitle')}>{t.title}</Text>
              <TouchableOpacity onPress={() => setIsSettingsVisible(false)} style={styles.closeButton}>
                <Text style={getStyle('closeButtonText')}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              
              {/* Global Activation switch */}
              <View style={styles.settingsRow}>
                <View>
                  <Text style={getStyle('settingsLabel')}>{t.enableApp}</Text>
                  <Text style={getStyle('settingsDescription')}>{t.enableDesc}</Text>
                </View>
                <Switch 
                  value={settings.enabled} 
                  onValueChange={() => toggleSetting('enabled')}
                  trackColor={{ false: '#eae5dc', true: '#e26a36' }}
                  thumbColor="#ffffff"
                />
              </View>

              {/* Dark Mode switcher */}
              <View style={styles.settingsRow}>
                <View>
                  <Text style={getStyle('settingsLabel')}>{t.darkMode}</Text>
                  <Text style={getStyle('settingsDescription')}>{t.darkModeDesc}</Text>
                </View>
                <Switch 
                  value={settings.theme === 'dark'} 
                  onValueChange={(val) => {
                    setSettings(prev => ({ ...prev, theme: val ? 'dark' : 'light' }));
                  }}
                  trackColor={{ false: '#eae5dc', true: '#e26a36' }}
                  thumbColor="#ffffff"
                />
              </View>

              {/* Injection Modes */}
              <View style={styles.sectionContainer}>
                <Text style={getStyle('sectionHeader')}>{t.injectMode}</Text>
                <View style={getStyle('segmentedControl')}>
                  <TouchableOpacity 
                    style={[
                      styles.segmentButton, 
                      settings.autoInjectMode === 'first' && getStyle('segmentButtonActive'),
                      !isPremium && { opacity: 0.4 }
                    ]}
                    onPress={() => {
                      if (!isPremium) {
                        Alert.alert(t.proFeatureTitle, t.proFirstMsgAlert);
                        return;
                      }
                      setSettings(prev => ({ ...prev, autoInjectMode: 'first' }));
                    }}
                  >
                    <Text style={[getStyle('segmentText'), settings.autoInjectMode === 'first' && getStyle('segmentTextActive')]}>{t.firstMsg}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[
                      styles.segmentButton, 
                      settings.autoInjectMode === 'all' && getStyle('segmentButtonActive'),
                      !isPremium && { opacity: 0.4 }
                    ]}
                    onPress={() => {
                      if (!isPremium) {
                        Alert.alert(t.proFeatureTitle, t.proEveryMsgAlert);
                        return;
                      }
                      setSettings(prev => ({ ...prev, autoInjectMode: 'all' }));
                    }}
                  >
                    <Text style={[getStyle('segmentText'), settings.autoInjectMode === 'all' && getStyle('segmentTextActive')]}>{t.everyMsg}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.segmentButton, settings.autoInjectMode === 'manual' && getStyle('segmentButtonActive')]}
                    onPress={() => setSettings(prev => ({ ...prev, autoInjectMode: 'manual' }))}
                  >
                    <Text style={[getStyle('segmentText'), settings.autoInjectMode === 'manual' && getStyle('segmentTextActive')]}>{t.manualMsg}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Toggles */}
              <View style={styles.sectionContainer}>
                <Text style={getStyle('sectionHeader')}>{t.contextData}</Text>
                
                <View style={styles.settingsRow}>
                  <Text style={getStyle('settingsSubLabel')}>{t.includeWeather}</Text>
                  <Switch 
                    value={settings.includeWeather} 
                    onValueChange={() => toggleSetting('includeWeather')}
                    trackColor={{ false: '#eae5dc', true: '#e26a36' }}
                    thumbColor="#ffffff"
                  />
                </View>
              </View>

              {/* Geolocation Section */}
              {settings.includeWeather && (
                <View style={styles.sectionContainer}>
                  <Text style={getStyle('sectionHeader')}>{t.location}</Text>
                  
                  <View style={getStyle('segmentedControl')}>
                    <TouchableOpacity 
                      style={[styles.segmentButton, settings.locationMode === 'auto' && getStyle('segmentButtonActive')]}
                      onPress={() => updateLocationMode('auto')}
                    >
                      <Text style={[getStyle('segmentText'), settings.locationMode === 'auto' && getStyle('segmentTextActive')]}>{t.autoLoc}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.segmentButton, settings.locationMode === 'manual' && getStyle('segmentButtonActive')]}
                      onPress={() => updateLocationMode('manual')}
                    >
                      <Text style={[getStyle('segmentText'), settings.locationMode === 'manual' && getStyle('segmentTextActive')]}>{t.manualLoc}</Text>
                    </TouchableOpacity>
                  </View>

                  {settings.locationMode === 'auto' ? (
                    <View style={getStyle('locationCard')}>
                      <View style={{ flex: 1 }}>
                        <Text style={getStyle('locationCardTitle')}>
                          {settings.autoLocation.city || t.notDetected}
                        </Text>
                        <Text style={getStyle('locationCardCoords')}>
                          {settings.autoLocation.latitude ? `Lat: ${settings.autoLocation.latitude}, Lon: ${settings.autoLocation.longitude}` : t.detectButton}
                        </Text>
                      </View>
                      <TouchableOpacity 
                        style={getStyle('detectButton')}
                        onPress={handleDetectLocation}
                        disabled={isDetectingLocation}
                      >
                        {isDetectingLocation ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Text style={getStyle('detectButtonText')}>{t.detectButton}</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.manualForm}>
                      <TextInput 
                        style={getStyle('input')}
                        placeholder={t.cityPlaceholder}
                        placeholderTextColor="#475569"
                        value={settings.manualLocation.city}
                        onChangeText={(txt) => handleManualLocationChange('city', txt)}
                      />
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <TextInput 
                          style={[getStyle('input'), { flex: 1 }]}
                          placeholder={t.latPlaceholder}
                          placeholderTextColor="#475569"
                          keyboardType="numeric"
                          value={String(settings.manualLocation.latitude || '')}
                          onChangeText={(txt) => handleManualLocationChange('latitude', parseFloat(txt) || 0)}
                        />
                        <TextInput 
                          style={[getStyle('input'), { flex: 1 }]}
                          placeholder={t.lonPlaceholder}
                          placeholderTextColor="#475569"
                          keyboardType="numeric"
                          value={String(settings.manualLocation.longitude || '')}
                          onChangeText={(txt) => handleManualLocationChange('longitude', parseFloat(txt) || 0)}
                        />
                      </View>
                    </View>
                  )}
                </View>
              )}

              {/* Quick Prompts Panel */}
              <View style={styles.sectionContainer}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={getStyle('sectionHeader')}>{userLang === 'fr' ? "PROMPTS RAPIDES" : "QUICK PROMPTS"}</Text>
                  <View style={styles.premiumBadgeMini}>
                    <Text style={styles.premiumBadgeText}>PRO</Text>
                  </View>
                </View>

                {/* List of current prompts */}
                <View style={{ gap: 6, marginVertical: 6 }}>
                  {(settings.quick_prompts || []).map((prompt, index) => (
                    <View 
                      key={index} 
                      style={[
                        styles.promptItem, 
                        settings.theme === 'dark' && { backgroundColor: '#222222', borderColor: '#3d3d3d' }
                      ]}
                    >
                      <Text 
                        numberOfLines={1} 
                        style={[
                          styles.promptItemText, 
                          settings.theme === 'dark' && { color: '#ffffff' }
                        ]}
                      >
                        {prompt}
                      </Text>
                      {isPremium && (
                        <TouchableOpacity 
                          onPress={() => {
                            const updated = [...(settings.quick_prompts || [])];
                            updated.splice(index, 1);
                            setSettings(prev => ({ ...prev, quick_prompts: updated }));
                          }}
                          style={styles.deletePromptButton}
                        >
                          <Text style={styles.deletePromptButtonText}>×</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                  {(!settings.quick_prompts || settings.quick_prompts.length === 0) && (
                    <Text style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', marginVertical: 4 }}>
                      {userLang === 'fr' ? "Aucun prompt configuré." : "No prompts configured."}
                    </Text>
                  )}
                </View>

                {/* Add prompt form */}
                <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                  <TextInput 
                    style={[getStyle('input'), { flex: 1 }]}
                    placeholder={isPremium ? (userLang === 'fr' ? "Ajouter un prompt..." : "Add a prompt...") : (userLang === 'fr' ? "Activez Pro pour personnaliser" : "Activate Pro to customize")}
                    placeholderTextColor="#475569"
                    editable={isPremium}
                    value={newPromptText}
                    onChangeText={setNewPromptText}
                    maxLength={120}
                  />
                  <TouchableOpacity 
                    style={[
                      styles.addPromptButton,
                      (!isPremium || !newPromptText.trim()) && { opacity: 0.5 }
                    ]}
                    disabled={!isPremium || !newPromptText.trim()}
                    onPress={() => {
                      if ((settings.quick_prompts || []).length >= 5) {
                        Alert.alert(
                          userLang === 'fr' ? "Limite atteinte" : "Limit Reached",
                          userLang === 'fr' ? "Maximum 5 prompts autorisés." : "Maximum 5 prompts allowed."
                        );
                        return;
                      }
                      const updated = [...(settings.quick_prompts || []), newPromptText.trim()];
                      setSettings(prev => ({ ...prev, quick_prompts: updated }));
                      setNewPromptText('');
                    }}
                  >
                    <Text style={styles.addPromptButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
                <Text style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>
                  {userLang === 'fr' ? "Max 5 prompts. Raccourcis affichés au-dessus de Claude." : "Max 5 prompts. Shortcuts shown above Claude."}
                </Text>
              </View>

              {/* Stripe Premium features & Paywall */}
              <View style={[
                styles.premiumCard, 
                isPremium && styles.premiumCardActive,
                settings.theme === 'dark' && { backgroundColor: isPremium ? 'rgba(22, 163, 74, 0.05)' : '#222222', borderColor: isPremium ? '#15803d' : '#3d3d3d' }
              ]}>
                <View style={styles.premiumBadge}>
                  <Text style={styles.premiumBadgeText}>⚡ PRO</Text>
                </View>
                <Text style={[styles.premiumTitle, settings.theme === 'dark' && { color: '#ffffff' }]}>{t.proTitle}</Text>
                <Text style={[styles.premiumDescription, settings.theme === 'dark' && { color: '#b3b0aa' }]}>
                  {isPremium ? t.proDescActive : t.proDescInactive}
                </Text>

                {!isPremium ? (
                  <View style={styles.stripeForm}>
                    <TouchableOpacity 
                      style={{
                        backgroundColor: 'rgba(226, 106, 54, 0.08)',
                        borderWidth: 1,
                        borderColor: '#e26a36',
                        borderRadius: 6,
                        paddingVertical: 10,
                        alignItems: 'center',
                        marginBottom: 10
                      }}
                      onPress={() => Linking.openURL(pricingInfo.link)}
                    >
                      <Text style={{ color: '#e26a36', fontSize: 12, fontWeight: '700' }}>
                        {userLang === 'fr' 
                          ? `1. S'abonner sur Stripe (${pricingInfo.priceText})` 
                          : `1. Subscribe on Stripe (${pricingInfo.priceText})`}
                      </Text>
                    </TouchableOpacity>
                    
                    <Text style={{ color: '#94a3b8', fontSize: 11, marginBottom: 4 }}>
                      {t.stripeStep2}
                    </Text>
                    
                    <TextInput 
                      style={getStyle('input')}
                      placeholder={t.stripeEmailPlaceholder}
                      placeholderTextColor="#475569"
                      value={stripeEmail}
                      onChangeText={setStripeEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                    <TouchableOpacity 
                      style={styles.premiumButton}
                      onPress={handleVerifyStripe}
                      disabled={isVerifyingStripe}
                    >
                      {isVerifyingStripe ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.premiumButtonText}>{t.activatePro}</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={styles.logoutButton}
                    onPress={handleClearStripe}
                  >
                    <Text style={styles.logoutButtonText}>{t.deactivatePro}</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Aide & Utilisation Section */}
              <View style={getStyle('helpCard')}>
                <Text style={getStyle('sectionHeader')}>{t.helpTitle}</Text>
                
                <View style={styles.helpItem}>
                  <Text style={getStyle('helpQuestion')}>{t.helpHow}</Text>
                  <Text style={getStyle('helpAnswer')}>{t.helpHowDesc}</Text>
                </View>
              </View>

            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbfaf7',
  },
  pillsContainer: {
    backgroundColor: '#fbfaf7',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e0d8',
  },
  pillsScrollContent: {
    gap: 8,
    alignItems: 'center',
    flexDirection: 'row',
  },
  pillButton: {
    backgroundColor: '#fcfaf7',
    borderWidth: 1,
    borderColor: '#e5e0d8',
    borderRadius: 15,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  pillButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#66635c',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f5f2eb',
    borderWidth: 1,
    borderColor: '#e5e0d8',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  floatingButtonText: {
    fontSize: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#f4f0ea',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: '#e5e0d8',
    maxHeight: '85%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e0d8',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#191919',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#66635c',
  },
  modalBody: {
    marginTop: 15,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#191919',
  },
  settingsDescription: {
    fontSize: 11,
    color: '#66635c',
    marginTop: 2,
  },
  settingsSubLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#191919',
  },
  sectionContainer: {
    marginVertical: 14,
    gap: 8,
  },
  sectionHeader: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.05,
    color: '#66635c',
    fontWeight: '600',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#eae5dc',
    padding: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e0d8',
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 6,
  },
  segmentButtonActive: {
    backgroundColor: '#ffffff',
  },
  segmentText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#66635c',
  },
  segmentTextActive: {
    color: '#191919',
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e0d8',
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
  },
  locationCardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#191919',
  },
  locationCardCoords: {
    fontSize: 10,
    color: '#66635c',
    marginTop: 2,
  },
  detectButton: {
    backgroundColor: '#f4f0ea',
    borderWidth: 1,
    borderColor: '#e5e0d8',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  detectButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#191919',
  },
  manualForm: {
    gap: 8,
    marginTop: 4,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e0d8',
    borderRadius: 6,
    color: '#191919',
    fontSize: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  premiumBadgeMini: {
    backgroundColor: '#e26a36',
    paddingVertical: 1,
    paddingHorizontal: 4,
    borderRadius: 3,
  },
  promptItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e0d8',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  promptItemText: {
    fontSize: 12,
    color: '#191919',
    flex: 1,
  },
  deletePromptButton: {
    paddingHorizontal: 6,
  },
  deletePromptButtonText: {
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: 'bold',
  },
  addPromptButton: {
    backgroundColor: '#cc521d',
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPromptButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  premiumCard: {
    backgroundColor: '#fdf5f0',
    borderWidth: 1,
    borderColor: 'rgba(226, 106, 54, 0.25)',
    borderRadius: 12,
    padding: 15,
    marginVertical: 16,
    gap: 8,
  },
  premiumCardActive: {
    borderColor: '#15803d',
    backgroundColor: '#f0fdf4',
  },
  premiumBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e26a36',
    paddingVertical: 1,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  premiumBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.05,
  },
  premiumTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#191919',
  },
  premiumDescription: {
    fontSize: 11,
    color: '#66635c',
    lineHeight: 15,
  },
  stripeForm: {
    gap: 8,
    marginTop: 6,
  },
  premiumButton: {
    backgroundColor: '#cc521d',
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
    shadowColor: '#e26a36',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  premiumButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  logoutButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e0d8',
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 6,
  },
  logoutButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#dc2626',
  },
  helpCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e0d8',
    borderRadius: 12,
    padding: 15,
    marginVertical: 10,
    marginBottom: 30,
    gap: 12,
  },
  helpItem: {
    borderTopWidth: 1,
    borderTopColor: '#f4f0ea',
    paddingTop: 10,
    gap: 4,
  },
  helpQuestion: {
    fontSize: 12,
    fontWeight: '700',
    color: '#191919',
  },
  helpAnswer: {
    fontSize: 11,
    color: '#66635c',
    lineHeight: 16,
  },
});
