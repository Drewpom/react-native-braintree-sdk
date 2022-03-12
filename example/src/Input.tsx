import * as React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

type InputProps = {
  value: string;
  onChange(value: string): void;
  label: string;
}

export const Input: React.FC<InputProps> = ({ value, label, onChange }) => {
  return (
    <View style={styles.self}>
      <Text>{label}</Text>
      <TextInput style={styles.input} value={value} onChangeText={onChange} />
    </View>
  )
}

const styles = StyleSheet.create({
  self: {
    marginVertical: 5,
    width: '95%',
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#00000033',
    paddingHorizontal: '5%',
  },
  input: {
    borderWidth: 1,
    borderColor: 'red',
    width: '100%',
    marginVertical: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    paddingHorizontal: 10,
  }
});
