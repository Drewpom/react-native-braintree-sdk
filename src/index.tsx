import { Platform } from 'react-native';
import { RNBraintree } from './nativeModule';

export const setup = (clientToken: string) => {
  return RNBraintree.setup(clientToken);
};

export const isVenmoAvailable = async (): Promise<boolean> => {
  if (Platform.OS === 'ios') {
    return RNBraintree.isVenmoAvailable();
  }

  return true;
};

export type AuthorizeVenmoParams = {
  vault: boolean;
  paymentMethodUsage?: 'multiUse' | 'singleUse';
};

export type VenmoResponse = {
  venmoUsername: string;
  nonce: string;
};

export const authorizeVenmo = (
  params: AuthorizeVenmoParams
): Promise<VenmoResponse> => {
  return RNBraintree.authorizeVenmo(
    params.vault,
    params.paymentMethodUsage ?? null
  );
};

export const isGooglePayAvailable = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return false;
  }

  return RNBraintree.isGooglePayAvailable();
};

export type AuthorizeGooglePayParams = {
  price: number;
  billingAddressRequired?: boolean;
};

export const authorizeGooglePay = (
  params: AuthorizeGooglePayParams
): Promise<NonceResponse> => {
  if (Platform.OS !== 'android') {
    throw new Error('Google Pay is only available on Android');
  }

  return RNBraintree.authorizeGooglePay(
    params.price.toFixed(2),
    params.billingAddressRequired ?? true
  );
};

const DEFAULT_NETWORKS = ['AmEx', 'Visa', 'MasterCard'];

export const isApplePayAvailable = async (
  supportedNetworks?: string[]
): Promise<boolean> => {
  if (Platform.OS !== 'ios') {
    return false;
  }

  return RNBraintree.isApplePayAvailable(supportedNetworks ?? DEFAULT_NETWORKS);
};

export type ApplePayLineItem = {
  label: string;
  amount: number;
};

export type AuthorizeApplePayParams = {
  merchantId: string;
  lineItems: ApplePayLineItem[];
  contactFields?: string[];
  supportedNetworks?: string[];
};

export type NonceResponse = {
  nonce: string;
};

export const authorizeApplePay = (
  params: AuthorizeApplePayParams
): Promise<NonceResponse> => {
  if (Platform.OS !== 'ios') {
    throw new Error('Apple Pay is only available on iOS');
  }

  return RNBraintree.authorizeApplePay(
    params.merchantId,
    params.lineItems.map((item) => {
      return {
        label: item.label,
        amount: item.amount.toFixed(2),
      };
    }),
    params.contactFields ?? null,
    params.supportedNetworks ?? DEFAULT_NETWORKS
  );
};

export type CardDetails = {
  cardNumber: string;
  expirationMonth: string;
  expirationYear: string;
  cvv: string | null;
};

export type CardResponse = {
  cardNetwork: string | null;
  expirationMonth: string | null;
  expirationYear: string | null;
  cardholderName: string | null;
  lastTwo: string | null;
  lastFour: string | null;
  bin: string | null;
  nonce: string | null;
};

export const getCardNonce = (card: CardDetails): CardResponse => {
  return RNBraintree.getCardNonce(
    card.cardNumber,
    card.expirationMonth,
    card.expirationYear,
    card.cvv
  );
};
