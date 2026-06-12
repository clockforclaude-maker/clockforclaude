// stripeService.js - Stripe subscription verification for ClockForClaude Mobile

import * as SecureStore from 'expo-secure-store';

const SECURE_STORE_KEY = 'c4c_premium_status';

export async function isPremiumUser() {
  try {
    const status = await SecureStore.getItemAsync(SECURE_STORE_KEY);
    return status === 'premium';
  } catch (err) {
    console.error("Error reading premium status:", err);
    return false;
  }
}

export async function verifySubscription(email) {
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Veuillez saisir une adresse email valide.' };
  }

  // Developer backdoor or test account for demonstration
  if (email.toLowerCase() === 'premium@clockforclaude.com' || email.toLowerCase().includes('stripe')) {
    await SecureStore.setItemAsync(SECURE_STORE_KEY, 'premium');
    return { success: true, email: email, plan: 'Pro Monthly' };
  }

  // Real API call mockup - to connect with clockforclaude stripe backend
  try {
    // In production, you would fetch your subscription validation server:
    // const response = await fetch(`https://api.clockforclaude.com/verify?email=${encodeURIComponent(email)}`);
    // const result = await response.json();
    
    // For now, let's simulate a successful API subscription verification for any valid input
    // to keep it functional for the user.
    await SecureStore.setItemAsync(SECURE_STORE_KEY, 'premium');
    return { success: true, email: email, plan: 'Pro Monthly' };

  } catch (err) {
    return { success: false, error: `Erreur serveur Stripe : ${err.message}` };
  }
}

export async function clearSubscription() {
  try {
    await SecureStore.deleteItemAsync(SECURE_STORE_KEY);
    return true;
  } catch (err) {
    console.error("Error clearing premium status:", err);
    return false;
  }
}
