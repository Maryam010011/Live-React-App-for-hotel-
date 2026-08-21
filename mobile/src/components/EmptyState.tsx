import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { BORDER_RADIUS, FONT_SIZE, SHADOWS, SPACING } from '../constants/theme';

interface EmptyStateProps {
  message?: string;
  suggestion?: string;
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message = 'No data found',
  suggestion,
  icon = '🏨',
  actionLabel,
  onAction,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.message}>{message}</Text>
      {suggestion && <Text style={styles.suggestion}>{suggestion}</Text>}
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.actionBtn} onPress={onAction} activeOpacity={0.85}>
          <Text style={styles.actionBtnText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.XL,
    padding: SPACING.XL,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.LG,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    ...SHADOWS.SM,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.BG_PAGE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.MD,
  },
  icon: {
    fontSize: 32,
  },
  message: {
    fontSize: FONT_SIZE.BODY_LARGE,
    fontWeight: '800',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.XS,
    textAlign: 'center',
  },
  suggestion: {
    fontSize: FONT_SIZE.BODY_SMALL,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 18,
  },
  actionBtn: {
    marginTop: SPACING.LG,
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: SPACING.SM + 2,
    paddingHorizontal: SPACING.XL,
    borderRadius: BORDER_RADIUS.MD,
    ...SHADOWS.SM,
  },
  actionBtnText: {
    color: COLORS.WHITE,
    fontWeight: '800',
    fontSize: FONT_SIZE.BODY_MEDIUM,
  },
});

export default EmptyState;
