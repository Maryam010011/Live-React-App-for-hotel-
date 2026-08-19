import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { FONT_SIZE, SPACING } from '../constants/theme';

interface EmptyStateProps {
  message?: string;
  suggestion?: string;
  icon?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message = 'No data found',
  suggestion,
  icon = '🏨',
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.message}>{message}</Text>
      {suggestion && <Text style={styles.suggestion}>{suggestion}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.XL,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.LG,
  },
  icon: {
    fontSize: 48,
    marginBottom: SPACING.MD,
  },
  message: {
    fontSize: FONT_SIZE.H3,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.XS,
    textAlign: 'center',
  },
  suggestion: {
    fontSize: FONT_SIZE.BODY_MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
});

export default EmptyState;
