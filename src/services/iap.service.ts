import type { EmitterSubscription } from 'react-native';
import {
  endConnection,
  finishTransaction,
  initConnection,
  type Purchase,
  purchaseErrorListener,
  purchaseUpdatedListener,
  requestPurchase,
} from 'react-native-iap';

// iOS-only StoreKit helper. Android uses Stripe, so this is never called there.

export const initIapConnection = async (): Promise<void> => {
  await initConnection();
};

export const endIapConnection = async (): Promise<void> => {
  try {
    await endConnection();
  } catch {
    // ignore
  }
};

// Promise-wraps a single consumable purchase. Resolves with the StoreKit
// purchase (whose `transactionReceipt` we send to the backend for validation),
// or rejects on error/cancellation.
export const purchaseProduct = (sku: string): Promise<Purchase> =>
  new Promise<Purchase>((resolve, reject) => {
    let purchaseSub: EmitterSubscription | undefined;
    let errorSub: EmitterSubscription | undefined;

    const cleanup = () => {
      purchaseSub?.remove();
      errorSub?.remove();
    };

    purchaseSub = purchaseUpdatedListener((purchase: Purchase) => {
      cleanup();
      resolve(purchase);
    });

    errorSub = purchaseErrorListener(error => {
      cleanup();
      reject(error);
    });

    requestPurchase({ sku }).catch(error => {
      cleanup();
      reject(error);
    });
  });

// Marks the transaction finished so StoreKit stops re-delivering it.
export const completePurchase = async (purchase: Purchase): Promise<void> => {
  await finishTransaction({ purchase, isConsumable: true });
};
