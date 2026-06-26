/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import React from 'react';

import { StripeProvider } from '@stripe/stripe-react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { STRIPE_PUBLISHABLE_KEY } from './src/constants/config';
import { useChallengeUpdates, useFCM, useNotificationHandler } from './src/hooks';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ToastProvider } from './src/provider';
import { preloadSounds } from './src/services/sound.service';

if (__DEV__) {
  require('./ReactotronConfig');
}

// Component that uses hooks that require ToastProvider
function AppContent(): React.JSX.Element {
  useFCM();
  useNotificationHandler();
  useChallengeUpdates();

  React.useEffect(() => {
    preloadSounds();
  }, []);

  return <AppNavigator />;
}

function App(): React.JSX.Element {
  // No merchantIdentifier: iOS uses In-App Purchase, not Apple Pay, so PassKit
  // is not needed (resolves App Store Guideline 2.1 PassKit finding).
  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <SafeAreaProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </SafeAreaProvider>
    </StripeProvider>
  );
}

export default App;
