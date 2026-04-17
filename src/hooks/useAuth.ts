import { useMemo } from 'react';
import {
  sendVerificationCodeService,
  signInService,
  signInWithGoogleService,
  signUpService,
  verifyCodeService,
} from '../services';
import {
  useAuthStore,
  useCardsStore,
  useCategoriesStore,
  useChallengesStore,
  useCreateStore,
  useHostTutorialStore,
  useLastChallengeStore,
  useLastSeenStore,
  usePlansStore,
} from '../store';

export const useAuth = () => {
  const {
    token,
    user,
    isAuthenticated,
    loading,
    error,
    setToken,
    setUser,
    setError,
    setLoading,
    setAuthenticated,
    setRefreshToken,
    reset: resetAuth,
  } = useAuthStore();

  const logout = () => {
    resetAuth();
    useCardsStore.getState().reset();
    useCategoriesStore.getState().reset();
    useChallengesStore.getState().reset();
    useCreateStore.getState().reset();
    useHostTutorialStore.getState().reset();
    useLastChallengeStore.getState().reset();
    useLastSeenStore.getState().reset();
    usePlansStore.getState().reset();
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data } = await signInService(email, password);

      if (
        !data.user.activated ||
        data.token === null ||
        data.refreshToken === null
      ) {
        return false;
      }

      setToken(data.token);
      setRefreshToken(data.refreshToken);
      setUser({
        email: data.user.email,
        firstName: data.user.first_name,
        lastName: data.user.last_name,
        image: data.user.image,
        id: data.user.id,
        displayName: data.user.display_name,
        timezone: data.user.timezone,
        country: data.user.country,
      });
      setAuthenticated(true);

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async (idToken: string) => {
    try {
      setLoading(true);
      const { data } = await signInWithGoogleService(idToken);

      setToken(data.token);
      setRefreshToken(data.refreshToken);
      setUser({
        email: data.user.email,
        firstName: data.user.first_name,
        lastName: data.user.last_name,
        image: data.user.image,
        id: data.user.id,
        displayName: data.user.display_name,
        timezone: data.user.timezone,
        country: data.user.country,
      });
      setAuthenticated(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to sign in with Google'
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ) => {
    try {
      setLoading(true);
      const { data } = await signUpService(
        firstName,
        lastName,
        email,
        password
      );
      return { data };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const sendVerificationCode = async (email: string, type: string) => {
    try {
      setLoading(true);
      await sendVerificationCodeService(email, type);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to send verification code'
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (
    email: string,
    code: string,
    type: string,
    password?: string
  ) => {
    try {
      setLoading(true);
      const { data } = await verifyCodeService(email, code, type, password);
      setUser({
        email: data.user.email,
        firstName: data.user.first_name,
        lastName: data.user.last_name,
        image: data.user.image,
        id: data.user.id,
        displayName: data.user.display_name,
        timezone: data.user.timezone,
        country: data.user.country,
      });
      setToken(data.token);
      setRefreshToken(data.refreshToken);
      setAuthenticated(true);
      return { data };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify code');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return useMemo(
    () => ({
      signIn,
      signUp,
      signInWithGoogle,
      verifyCode,
      sendVerificationCode,
      logout,
      token,
      isAuthenticated,
      user,
      loading,
      error,
    }),
    [
      signIn,
      signUp,
      signInWithGoogle,
      verifyCode,
      sendVerificationCode,
      logout,
      token,
      isAuthenticated,
      user,
      loading,
      error,
    ]
  );
};
