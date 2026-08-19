import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { BORDER_RADIUS, FONT_SIZE, SHADOWS, SPACING } from '../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'gold' | 'dark' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
      case 'gold':
        return styles.goldButton;
      case 'dark':
        return styles.darkButton;
      case 'danger':
        return styles.dangerButton;
      case 'outline':
        return styles.outlineButton;
      default:
        return styles.primaryButton;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'outline':
        return styles.outlineText;
      default:
        return styles.btnText;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return styles.sizeSm;
      case 'lg':
        return styles.sizeLg;
      default:
        return styles.sizeMd;
    }
  };

  const getLoaderColor = () => {
    return variant === 'outline' ? COLORS.PRIMARY : COLORS.WHITE;
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        getSizeStyle(),
        disabled || loading ? styles.disabled : null,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.88}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getLoaderColor()} />
      ) : (
        <>
          {icon ? <>{icon}</> : null}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: BORDER_RADIUS.MD,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: SPACING.SM,
  },
  sizeSm: {
    paddingVertical: SPACING.XS + 4,
    paddingHorizontal: SPACING.MD,
  },
  sizeMd: {
    paddingVertical: SPACING.SM + 4,
    paddingHorizontal: SPACING.LG,
  },
  sizeLg: {
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.XL,
  },
  primaryButton: {
    backgroundColor: COLORS.PRIMARY,
    ...SHADOWS.PRIMARY_GLOW,
  },
  goldButton: {
    backgroundColor: COLORS.SECONDARY,
    ...SHADOWS.GOLD_GLOW,
  },
  darkButton: {
    backgroundColor: COLORS.NAVY_DARK,
    ...SHADOWS.MD,
  },
  dangerButton: {
    backgroundColor: COLORS.ERROR,
  },
  outlineButton: {
    backgroundColor: COLORS.TRANSPARENT,
    borderWidth: 1.5,
    borderColor: COLORS.PRIMARY,
  },
  disabled: {
    opacity: 0.6,
  },
  btnText: {
    fontSize: FONT_SIZE.BODY_MEDIUM,
    fontWeight: '700',
    color: COLORS.WHITE,
    letterSpacing: 0.2,
  },
  outlineText: {
    fontSize: FONT_SIZE.BODY_MEDIUM,
    fontWeight: '700',
    color: COLORS.PRIMARY,
    letterSpacing: 0.2,
  },
});

export default Button;
