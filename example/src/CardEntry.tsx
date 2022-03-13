import * as React from 'react';
import { StyleSheet, View, Button } from 'react-native';
import { Input } from './Input';

type Props = {
  onSubmit(info: {
    cardNumber: string;
    expirationMonth: string;
    expirationYear: string;
    cvv: string;
  }): void;
};

export default function CardEntry({ onSubmit }: Props) {
  const [cardNumber, setCardNumber] =
    React.useState<string>('4111111111111111');
  const [expirationMonth, setExpirationMonth] = React.useState<string>('10');
  const [expirationYear, setExpirationYear] = React.useState<string>('24');
  const [cvv, setCvv] = React.useState<string>('101');

  const onPressSubmit = React.useCallback(() => {
    onSubmit({
      cardNumber,
      expirationMonth,
      expirationYear,
      cvv,
    });
  }, [cardNumber, expirationMonth, expirationYear, cvv, onSubmit]);

  return (
    <View style={styles.container}>
      <Input onChange={setCardNumber} value={cardNumber} label="Card Number" />
      <Input
        onChange={setExpirationMonth}
        value={expirationMonth}
        label="Expiration Month"
      />
      <Input
        onChange={setExpirationYear}
        value={expirationYear}
        label="Expiration Year"
      />
      <Input onChange={setCvv} value={cvv} label="CVV" />
      <Button onPress={onPressSubmit} title="Enter Card" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
