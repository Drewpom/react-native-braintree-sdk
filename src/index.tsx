import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'react-native-braintree-sdk' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

const BraintreeSdk = NativeModules.BraintreeSdk
  ? NativeModules.BraintreeSdk
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export const setup = (clientToken: string) => {
  return BraintreeSdk.setup(clientToken);
};
    
export type AuthorizeVenmoParams = {
  vault: boolean;
  paymentMethodUsage?: 'multiUse' | 'singleUse';
}

export type VenmoResponse = {
  venmoUsername: string;
  nonce: string;
};

export const authorizeVenmo = (params: AuthorizeVenmoParams): Promise<VenmoResponse> => {
  return BraintreeSdk.authorizeVenmo(
    params.vault,
    params.paymentMethodUsage ?? null,
  );
};

export const isGooglePayAvailable = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return false;
  }

  return BraintreeSdk.isGooglePayAvailable();
}

export type AuthorizeGooglePayParams = {
  price: number;
  billingAddressRequired?: boolean;
};

export const authorizeGooglePay = (params: AuthorizeGooglePayParams): Promise<NonceResponse> => {
  return BraintreeSdk.authorizeGooglePay(params.price.toFixed(2), params.billingAddressRequired ?? true);
};

const DEFAULT_NETWORKS = ['AmEx', 'Visa', 'MasterCard'];

export const isVenmoAvailable = async (): Promise<boolean> => {
  if (Platform.OS === 'ios') {
    return BraintreeSdk.isVenmoAvailable(); 
  }

  return true;
}

export const isApplePayAvailable = async (supportedNetworks?: string[]): Promise<boolean> => {
  if (Platform.OS !== 'ios') {
    return false;
  }

  return BraintreeSdk.isApplePayAvailable(supportedNetworks ?? DEFAULT_NETWORKS); 
}

export type ApplePayLineItem = {
  label: string;
  amount: number;
}

export type AuthorizeApplePayParams = {
  merchantId: string;
  lineItems: ApplePayLineItem[];
  contactFields?: string[];
  supportedNetworks?: string[];
}

export type NonceResponse = {
  nonce: string;
};

export const authorizeApplePay = (params: AuthorizeApplePayParams): Promise<NonceResponse> => {
  if (Platform.OS !== 'ios') {
    throw new Error('Apple Pay is only available on iOS');
  }

  return BraintreeSdk.authorizeApplePay(
    params.merchantId,
    params.lineItems.map(item => {
      return {
        label: item.label,
        amount: item.amount.toFixed(2),
      };
    }),
    params.contactFields ?? null,
    params.supportedNetworks ?? DEFAULT_NETWORKS,
  );
};

export type CardDetails = {
  cardNumber: string;
  expirationMonth: string;
  expirationYear: string;
  cvv: string | null;
};

export type CardResponse = {
  cardNetwork: string | null
  expirationMonth: string | null
  expirationYear: string | null
  cardholderName: string | null
  lastTwo: string | null
  lastFour: string | null
  bin: string | null
  nonce: string | null
}

export const getCardNonce = (card: CardDetails): CardResponse => {
  return BraintreeSdk.getCardNonce(
    card.cardNumber,
    card.expirationMonth,
    card.expirationYear,
    card.cvv,
  );
};
