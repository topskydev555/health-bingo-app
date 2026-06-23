import { API_BASE_URL } from '../constants/config';
import { parseJsonSafe } from '../utils';

export const signInService = async (email: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/signin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Failed to sign in');
  }

  const data = await parseJsonSafe(response);
  return data;
};

export const signInWithGoogleService = async (idToken: string) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ idToken }),
  });

  if (!response.ok) {
    throw new Error('Failed to sign in with Google');
  }

  const data = await parseJsonSafe(response);
  return data;
};

export const signInWithAppleService = async (
  identityToken: string,
  fullName?: { givenName?: string | null; familyName?: string | null } | null,
  email?: string | null
) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/apple`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      identityToken,
      ...(fullName && {
        fullName: {
          givenName: fullName.givenName ?? '',
          familyName: fullName.familyName ?? '',
        },
      }),
      ...(email && { email }),
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to sign in with Apple');
  }

  const data = await parseJsonSafe(response);
  return data;
};

export const signUpService = async (
  firstName: string,
  lastName: string,
  email: string,
  password: string
) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      first_name: firstName,
      last_name: lastName,
      email,
      password,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to sign up');
  }

  const data = await parseJsonSafe(response);
  return data;
};

export const sendVerificationCodeService = async (
  email: string,
  type: string
) => {
  const response = await fetch(
    `${API_BASE_URL}/api/auth/send-verification-code`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ email, type }),
    }
  );
  if (!response.ok) {
    throw new Error('Failed to send verification code');
  }

  const data = await parseJsonSafe(response);
  return data;
};

export const verifyCodeService = async (
  email: string,
  code: string,
  type: string,
  password?: string
) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/verify-code`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ email, code, type, password }),
  });

  if (!response.ok) {
    throw new Error('Failed to verify code');
  }

  const data = await parseJsonSafe(response);
  return data;
};
