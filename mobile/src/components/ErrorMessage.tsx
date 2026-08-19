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
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.LG,
    backgroundColor: COLORS.ERROR_BG,
    borderWidth: 1,
    borderColor: COLORS.ERROR_BORDER,
    borderRadius: BORDER_RADIUS.LG,
    alignItems: 'center',
    justifyContent: 'center',
    margin: SPACING.MD,
  },
  icon: {
    fontSize: 28,
    marginBottom: SPACING.SM,
  },
  message: {
    fontSize: FONT_SIZE.BODY_SMALL,
    color: COLORS.ERROR,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: SPACING.MD,
    lineHeight: 18,
  },
  button: {
    paddingVertical: SPACING.SM,
    paddingHorizontal: SPACING.LG,
    backgroundColor: COLORS.ERROR,
    borderRadius: BORDER_RADIUS.MD,
  },
  buttonText: {
    color: COLORS.WHITE,
    fontWeight: '700',
    fontSize: FONT_SIZE.BODY_SMALL,
  },
});

export default ErrorMessage;
