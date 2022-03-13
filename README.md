# react-native-braintree-sdk

A small wrapper to access Braintree's most recent iOS/Android SDK on React Native

## Installation

```sh
npm install react-native-braintree-sdk
```

## Usage

```js
import * as Braintree from "react-native-braintree-sdk";

// ...
const App = () => {
  const [isApplePayAvailable, setIsApplePayAvailable] = React.useState(false);

  useEffect(() => {
    const setup = async () => {
      await Braintree.setup('clientToken');
      Braintree.isApplePayAvailable()
        .then(setIsApplePayAvailable)
        .catch(showError);
    }
  }, []);
  const onPressApplePay = React.useCallback(async () => {
    try {
      const result = await Braintree.authorizeApplePay({
        merchantId: 'test-merchant-id',
        lineItems: [
          {
            label: 'Total',
            amount: 10,
          },
        ],
        contactFields: ['postalAddress'],
        supportedNetworks: ['AmEx', 'Visa', 'MasterCard'],
      });

      Alert.alert('Apple Pay Result', `Nonce: ${result.nonce}`);
    } catch (error) {
      showError(error);
    }
  }, []);

  return (
    <View>
      {isApplePayAvailable && <Button title='Pay with Venmo' onPress={onPressApplePay} />}
    </View>
  );
}
```

## API
## setup ⇒ <code>void</code>
Sets up the native Braintree client


| Param | Type | Description |
| --- | --- | --- |
| clientAuthorization | <code>string</code> | See [Braintre's Docs](https://developer.paypal.com/braintree/docs/guides/authorization/overview) |

<a name="isVenmoAvailable"></a>

## isVenmoAvailable ⇒ <code>Promise&lt;boolean&gt;</code>
Checks if the device can launch Venmo on iOS, on Android always returns true

**Returns**: <code>Promise</code> - Promise resolving to the status  
<a name="authorizeVenmo"></a>

## authorizeVenmo ⇒ <code>Promise&lt;VenmoResponse&gt;</code>
Asks the user to start a Venmo request, if the user approves, returns a nonce to use for a transaction

**Returns**: <code>Promise.&lt;VenmoResponse&gt;</code> - Promise resolving to nonce and the user's venmo username  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>AuthorizeVenmoParams</code> | See [Braintre's Docs](https://developer.paypal.com/braintree/docs/guides/venmo/client-side#payment-method-usage) to find out more on the use / vaulting options |

<a name="isGooglePayAvailable"></a>

## isGooglePayAvailable ⇒ <code>Promise&lt;boolean&gt;</code>
Checks if the device can use Google Pay. Always returns false on iOS devices

**Returns**: <code>Promise</code> - Promise resolving to the status  
<a name="authorizeGooglePay"></a>

## authorizeGooglePay ⇒ <code>Promise&lt;NonceResponse&gt;</code>
Presents the Google Pay popup, if the user approves, returns a nonce to use for a transaction

**Returns**: <code>Promise.&lt;NonceResponse&gt;</code> - Promise resolving to nonce  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>AuthorizeGooglePayParams</code> | The price for the transaction that the nonce will be used with |

<a name="isApplePayAvailable"></a>

## isApplePayAvailable ⇒ <code>Promise&lt;boolean&gt;</code>
Checks if the device can use Apple Pay. Always returns false on Android devices

**Returns**: <code>Promise</code> - Promise resolving to the status  
<a name="authorizeApplePay"></a>

## authorizeApplePay ⇒ <code>Promise&lt;NonceResponse&gt;</code>
Presents the Apple Pay popup, if the user approves, returns a nonce to use for a transaction

**Returns**: <code>Promise.&lt;NonceResponse&gt;</code> - Promise resolving to nonce  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>AuthorizeGooglePayParams</code> | See [Braintre's Docs](https://developer.paypal.com/braintree/docs/guides/apple-pay/client-side/ios/v5#create-a-pkpaymentrequest) to learn more about the Apple Pay payment request options |

<a name="getCardNonce"></a>

## getCardNonce ⇒ <code>Promise&lt;CardResponse&gt;</code>
Creates a nonce for a card

**Returns**: <code>Promise.&lt;CardResponse&gt;</code> - Promise resolving to nonce and card informatiom  

| Param | Type | Description |
| --- | --- | --- |
| card | <code>CardDetails</code> | The card details you collect on the device |


## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
