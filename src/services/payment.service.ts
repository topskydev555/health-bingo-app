import { apiFetch } from '../utils/api-fetch';

export interface PaymentConfirmationRequest {
  challenge_id: string;
  payment_intent_id: string;
}

export interface PaymentConfirmationResponse {
  message: string;
  data: {
    challenge_id: string;
    status: string;
    payment_intent_id: string;
  };
}

export const confirmPayment = async (
  challengeId: string,
  paymentIntentId: string
): Promise<{
  success: boolean;
  data?: PaymentConfirmationResponse;
  error?: string;
}> => {
  try {
    const response = await apiFetch('/api/payment/confirm', 'POST', {
      challenge_id: challengeId,
      payment_intent_id: paymentIntentId,
    });

    return {
      success: true,
      data: response,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to confirm payment',
    };
  }
};

export const getClientSecret = async (
  paymentIntentId: string
): Promise<string | undefined> => {
  try {
    const response = await apiFetch(
      `/api/payment/client-secret?payment_intent_id=${encodeURIComponent(
        paymentIntentId
      )}`,
      'GET',
      {}
    );
    return response.client_secret;
  } catch (error: any) {
    console.log('error', error);
    return undefined;
  }
};

export const verifyApplePayment = async (
  challengeId: string,
  receipt: string
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const response = await apiFetch('/api/payment/apple/verify', 'POST', {
      challenge_id: challengeId,
      receipt,
    });
    return { success: true, data: response };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to verify Apple payment',
    };
  }
};

export const getPaymentPlans = async (): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> => {
  try {
    const response = await apiFetch('/api/payment/plans', 'GET', {});
    return {
      success: true,
      data: response,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to get payment plans',
    };
  }
};
