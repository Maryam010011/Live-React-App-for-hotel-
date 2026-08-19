import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';
import { BORDER_RADIUS, FONT_SIZE, SPACING } from '../constants/theme';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.button} onPress={onRetry}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.LG,
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: '#feb2b2',
    borderRadius: BORDER_RADIUS.MD,
    alignItems: 'center',
    justifyContent: 'center',
    margin: SPACING.MD,
  },
  icon: {
    fontSize: 32,
    marginBottom: SPACING.SM,
  },
  message: {
    fontSize: FONT_SIZE.BODY_MEDIUM,
    color: COLORS.ERROR,
    textAlign: 'center',
    marginBottom: SPACING.MD,
  },
  button: {
    paddingVertical: SPACING.SM,
    paddingHorizontal: SPACING.LG,
    backgroundColor: COLORS.ERROR,
    borderRadius: BORDER_RADIUS.SM,
  },
  buttonText: {
    color: COLORS.WHITE,
    fontWeight: 'bold',
    fontSize: FONT_SIZE.BODY_MEDIUM,
  },
});

export default ErrorMessage;
