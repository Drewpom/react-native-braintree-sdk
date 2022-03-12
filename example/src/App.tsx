import * as React from 'react';

import { Alert, Modal, Button, StyleSheet, View } from 'react-native';
import CardEntry from './CardEntry';
import {Input} from './Input';
import {showError} from './utils';
import * as Braintree from 'react-native-braintree-sdk';

export default function App() {
  const [clientToken, setClientToken] = React.useState<string>("");
  const [isSetup, setIsSetup] = React.useState(false);
  const [isApplePayAvailable, setIsApplePayAvailable] = React.useState(false);
  const [isVenmoAvailable, setIsVenmoAvailable] = React.useState(false);
  const [isGooglePayAvailable, setIsGooglePayAvailable] = React.useState(false);

  const [showCardEntry, setShowCardEntry] = React.useState(false);
  const onPressSetup = React.useCallback(async () => {
    await Braintree.setup(clientToken);
    setIsSetup(true);

    Braintree.isApplePayAvailable().then(setIsApplePayAvailable).catch(showError);
    Braintree.isVenmoAvailable().then(setIsVenmoAvailable).catch(showError);
    Braintree.isGooglePayAvailable().then(setIsGooglePayAvailable).catch(showError);
  }, [clientToken]);

  const onPressAuthorizeApplePay = React.useCallback(async () => {
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

      Alert.alert('Apple Pay Result', JSON.stringify(result, null, 2));
    } catch (error) {
      showError(error);
    }
  }, []);

  const onPressAuthorizeVenmo = React.useCallback(async () => {
    try {
      const result = await Braintree.authorizeVenmo({
        vault: true,
      });

      Alert.alert('Venmo Result', JSON.stringify(result, null, 2));
    } catch (error) {
      showError(error);
    }
  }, []);

  const onPressAuthorizeGooglePay = React.useCallback(async () => {
    try {
      const result = await Braintree.authorizeGooglePay({
        price: 10,
      });

      Alert.alert('Google Pay Result', JSON.stringify(result, null, 2));
    } catch (error) {
      showError(error);
    }
  }, []);

  const onSubmitCard = React.useCallback(async (cardInfo) => {
    try {
      const result = await Braintree.getCardNonce(cardInfo);
      Alert.alert('Card Result', JSON.stringify(result, null, 2), [
        {
          text: 'ok',
          onPress() {
            setShowCardEntry(false);
          },
        }
      ]);
    } catch (error) {
      showError(error);
    }
  }, [setShowCardEntry]);

  const onPressShowCardEntry = React.useCallback(() => {
    setShowCardEntry(true);
  }, [setShowCardEntry]);

  return (
    <View style={styles.container}>
      <View style={styles.setupView}>
        <Input onChange={setClientToken} value={clientToken} label='Client Token' />
        <Button title='Setup Braintree' onPress={onPressSetup}>Setup Braintree</Button>
      </View>
      {isSetup && <View style={styles.contentView}>
        <Button title='Show Card Entry' onPress={onPressShowCardEntry}>Enter Card</Button>
        <Button title={`Authorize Apple Pay (Available? ${isApplePayAvailable ? 'Yes' : 'No'})`} onPress={onPressAuthorizeApplePay}>Authorize Apple Pay</Button>
        <Button title={`Authorize Venmo (Available? ${isVenmoAvailable ? 'Yes' : 'No'})`} onPress={onPressAuthorizeVenmo}>Authorize Venmo</Button>
        <Button title={`Authorize Google Pay (Available? ${isGooglePayAvailable ? 'Yes' : 'No'})`} onPress={onPressAuthorizeGooglePay}>Authorize Google Pay</Button>
        
        <Modal visible={showCardEntry}>
          {showCardEntry && <CardEntry onSubmit={onSubmitCard} />}
        </Modal>
      </View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  setupView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 15,
  },
  contentView: {
    flex: 1,
    justifyContent: 'space-around',
    paddingHorizontal: 15,
  }
});
