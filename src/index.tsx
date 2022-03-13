import { Platform } from 'react-native';
import { RNBraintree } from './nativeModule';

/**
 * Sets up the native Braintree client 
 * @param {string} clientAuthorization See {@link https://developer.paypal.com/braintree/docs/guides/authorization/overview|Braintre's Docs}
 * @returns {void}
 */
export const setup = (clientAuthorization: string) => {
  return RNBraintree.setup(clientAuthorization);
};

/**
 * Checks if the device can launch Venmo on iOS, on Android always returns true 
 * @returns {Promise} Promise resolving to the status
 */
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

/**
 * Asks the user to start a Venmo request, if the user approves, returns a nonce to use for a transaction
 * @param {AuthorizeVenmoParams} params See {@link https://developer.paypal.com/braintree/docs/guides/venmo/client-side#payment-method-usage|Braintre's Docs} to find out more on the use / vaulting options
 * @returns {Promise<VenmoResponse>} Promise resolving to nonce and the user's venmo username
 */
export const authorizeVenmo = (
  params: AuthorizeVenmoParams
): Promise<VenmoResponse> => {
  return RNBraintree.authorizeVenmo(
    params.vault,
    params.paymentMethodUsage ?? null
  );
};

/**
 * Checks if the device can use Google Pay. Always returns false on iOS devices 
 * @returns {Promise} Promise resolving to the status
 */
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

/**
 * Presents the Google Pay popup, if the user approves, returns a nonce to use for a transaction
 * @param {AuthorizeGooglePayParams} params The price for the transaction that the nonce will be used with
 * @returns {Promise<NonceResponse>} Promise resolving to nonce
 */
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

/**
 * Checks if the device can use Apple Pay. Always returns false on Android devices 
 * @returns {Promise} Promise resolving to the status
 */
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

/**
 * Presents the Apple Pay popup, if the user approves, returns a nonce to use for a transaction
 * @param {AuthorizeGooglePayParams} params See {@link https://developer.paypal.com/braintree/docs/guides/apple-pay/client-side/ios/v5#create-a-pkpaymentrequest|Braintre's Docs} to learn more about the Apple Pay payment request options
 * @returns {Promise<NonceResponse>} Promise resolving to nonce
 */
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


/**
 * Creates a nonce for a card
 * @param {CardDetails} card The card details you collect on the device
 * @returns {Promise<CardResponse>} Promise resolving to nonce and card informatiom
 */
export const getCardNonce = (card: CardDetails): CardResponse => {
  return RNBraintree.getCardNonce(
    card.cardNumber,
    card.expirationMonth,
    card.expirationYear,
    card.cvv
  );
};
