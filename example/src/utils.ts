import { Alert } from 'react-native';

export const showError = (error: Error | unknown) => {
  const message = error instanceof Error ? error.message : `${error}`;

  Alert.alert(
    'An error occurred',
    message,
  );
}
