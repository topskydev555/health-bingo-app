import {
  appleAuth,
  appleAuthAndroid,
} from '@invertase/react-native-apple-authentication';
import { Platform } from 'react-native';
import { APPLE_REDIRECT_URI, APPLE_SERVICE_ID } from '../constants';

export interface AppleCredential {
  identityToken: string;
  fullName?: { givenName?: string | null; familyName?: string | null } | null;
  email?: string | null;
}

const randomString = (length = 32): string => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i += 1) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Cross-platform Sign in with Apple. iOS uses the native flow; Android (and any
// non-iOS) uses Apple's web OAuth via a WebView. Both return a normalized
// credential whose `identityToken` the backend verifies the same way.
export const requestAppleCredential =
  async (): Promise<AppleCredential | null> => {
    if (Platform.OS === 'ios') {
      const response = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
      });

      if (!response.identityToken) {
        return null;
      }

      return {
        identityToken: response.identityToken,
        fullName: response.fullName,
        email: response.email,
      };
    }

    appleAuthAndroid.configure({
      clientId: APPLE_SERVICE_ID,
      redirectUri: APPLE_REDIRECT_URI,
      responseType: appleAuthAndroid.ResponseType.ALL,
      scope: appleAuthAndroid.Scope.ALL,
      nonce: randomString(),
      state: randomString(),
    });

    const response = await appleAuthAndroid.signIn();

    if (!response.id_token) {
      return null;
    }

    return {
      identityToken: response.id_token,
      fullName: response.user?.name
        ? {
            givenName: response.user.name.firstName,
            familyName: response.user.name.lastName,
          }
        : null,
      email: response.user?.email ?? null,
    };
  };

// True when the user dismissed the Apple sheet/WebView rather than a real error.
export const isAppleCancel = (err: unknown): boolean => {
  const e = err as { code?: string; message?: string };
  return (
    e?.code === appleAuth.Error.CANCELED ||
    e?.message === appleAuthAndroid.Error.SIGNIN_CANCELLED
  );
};
