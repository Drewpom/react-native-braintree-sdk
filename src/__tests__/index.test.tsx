jest.mock('../nativeModule', () => {
  return {
    RNBraintree: {},
  };
});

import { Platform } from 'react-native';
import * as Braintree from '../index';
import { RNBraintree } from '../nativeModule';

beforeEach(() => {
  Platform.OS = 'ios';
});

describe('#setup', () => {
  it('should call setup with the client token', () => {
    RNBraintree.setup = jest.fn();

    Braintree.setup('12345');

    expect(RNBraintree.setup).toHaveBeenCalledWith('12345');
  });
});

describe('#isVenmoAvailable', () => {
  it('should return true for isVenmoAvailable on Android', async () => {
    Platform.OS = 'android';

    const result = await Braintree.isVenmoAvailable();

    expect(result).toBeTruthy();
  });

  it('should return result of the native method on iOS', async () => {
    RNBraintree.isVenmoAvailable = jest
      .fn()
      .mockImplementation(() => Promise.resolve(false));

    const result = await Braintree.isVenmoAvailable();

    expect(result).toBeFalsy();
  });
});

describe('#authorizeVenmo', () => {
  it('should call authorizeVenmo with the correct params', () => {
    RNBraintree.authorizeVenmo = jest.fn();

    Braintree.authorizeVenmo({ vault: true });

    expect(RNBraintree.authorizeVenmo).toHaveBeenCalledWith(true, null);
  });
});

describe('#isGooglePayAvailable', () => {
  it('should return false for isGooglePayAvailable on iOS', async () => {
    const result = await Braintree.isGooglePayAvailable();

    expect(result).toBeFalsy();
  });

  it('should return result of the native method on Android', async () => {
    Platform.OS = 'android';

    RNBraintree.isGooglePayAvailable = jest
      .fn()
      .mockImplementation(() => Promise.resolve(true));

    const result = await Braintree.isGooglePayAvailable();

    expect(result).toBeTruthy();
  });
});

describe('#authorizeGooglePay', () => {
  it('should reject if the platform is iOS', async () => {
    expect.assertions(1);

    try {
      await Braintree.authorizeGooglePay({ price: 5 });
    } catch (err) {
      if (err instanceof Error) {
        expect(err.message).toEqual('Google Pay is only available on Android');
      }
    }
  });

  it('should call the native module correctly on android', async () => {
    Platform.OS = 'android';

    RNBraintree.authorizeGooglePay = jest
      .fn()
      .mockImplementation(() => Promise.resolve({ nonce: 'gpNonce' }));

    const result = await Braintree.authorizeGooglePay({ price: 5 });

    expect(result).toEqual({ nonce: 'gpNonce' });

    expect(RNBraintree.authorizeGooglePay).toHaveBeenCalledWith('5.00', true);
  });
});

describe('#isApplePayAvailable', () => {
  it('should return false for isApplePayAvailable on Android', async () => {
    Platform.OS = 'android';

    const result = await Braintree.isApplePayAvailable();

    expect(result).toBeFalsy();
  });

  it('should return result of the native method on iOS', async () => {
    RNBraintree.isApplePayAvailable = jest
      .fn()
      .mockImplementation(() => Promise.resolve(true));

    const result = await Braintree.isApplePayAvailable(['visa']);

    expect(result).toBeTruthy();

    expect(RNBraintree.isApplePayAvailable).toHaveBeenCalledWith(['visa']);
  });
});

describe('#authorizeApplePay', () => {
  it('should reject on Android', async () => {
    expect.assertions(1);
    Platform.OS = 'android';

    try {
      await Braintree.authorizeApplePay({
        merchantId: 'merchant_id',
        lineItems: [
          {
            label: 'Total',
            amount: 5,
          },
        ],
      });
    } catch (err) {
      if (err instanceof Error) {
        expect(err.message).toEqual('Apple Pay is only available on iOS');
      }
    }
  });

  it('should return result of the native method on iOS', async () => {
    RNBraintree.authorizeApplePay = jest
      .fn()
      .mockImplementation(() => Promise.resolve({ nonce: 'apNonce' }));

    const result = await Braintree.authorizeApplePay({
      merchantId: 'merchant_id',
      lineItems: [
        {
          label: 'Total',
          amount: 5,
        },
      ],
      contactFields: ['postalCode'],
    });

    expect(result).toEqual({ nonce: 'apNonce' });

    expect(RNBraintree.authorizeApplePay).toHaveBeenCalledWith(
      'merchant_id',
      [
        {
          label: 'Total',
          amount: '5.00',
        },
      ],
      ['postalCode'],
      ['AmEx', 'Visa', 'MasterCard']
    );
  });
});

describe('#getCardNonce', () => {
  it('should return result of the native method ', async () => {
    RNBraintree.getCardNonce = jest.fn().mockImplementation(() =>
      Promise.resolve({
        cardNetwork: 'Visa',
        expirationMonth: '05',
        expirationYear: '25',
        cardholderName: null,
        lastTwo: '11',
        lastFour: '9911',
        bin: '411111',
        nonce: 'nonce',
      })
    );

    const result = await Braintree.getCardNonce({
      cardNumber: '4111111111111111',
      expirationMonth: '10',
      expirationYear: '25',
      cvv: null,
    });

    expect(result).toEqual({
      cardNetwork: 'Visa',
      expirationMonth: '05',
      expirationYear: '25',
      cardholderName: null,
      lastTwo: '11',
      lastFour: '9911',
      bin: '411111',
      nonce: 'nonce',
    });

    expect(RNBraintree.getCardNonce).toHaveBeenCalledWith(
      '4111111111111111',
      '10',
      '25',
      null
    );
  });
});
