import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { COLORS } from '../constants/colors';
import { BORDER_RADIUS, FONT_SIZE, SPACING } from '../constants/theme';

interface InputFieldProps extends TextInputProps {
  label: string;
  error?: string | null;
  helperText?: string;
  leftIcon?: React.ReactNode;
}

export const InputField = React.memo<InputFieldProps>(({
  label,
  error,
  helperText,
  leftIcon,
  style,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = useCallback((e: any) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  }, [onFocus]);

  const handleBlur = useCallback((e: any) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  }, [onBlur]);

  const inputStyle = useMemo(() => [styles.input, style], [style]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputFocused,
          error ? styles.inputError : null,
        ]}
      >
        {leftIcon ? <View style={styles.iconContainer}>{leftIcon}</View> : null}
        <TextInput
          style={inputStyle}
          placeholderTextColor={COLORS.TEXT_MUTED}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
      </View>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.MD,
    width: '100%',
  },
  label: {
    fontSize: FONT_SIZE.BODY_SMALL,
    fontWeight: '600',
    color: COLORS.TEXT_DARK,
    marginBottom: SPACING.XS + 2,
    letterSpacing: 0.2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    borderRadius: BORDER_RADIUS.MD,
    backgroundColor: COLORS.BG_PAGE,
    paddingHorizontal: SPACING.MD,
  },
  inputFocused: {
    borderColor: COLORS.PRIMARY,
    backgroundColor: COLORS.WHITE,
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  inputError: {
    borderColor: COLORS.ERROR,
    backgroundColor: COLORS.BG_PRIMARY,
  },
  iconContainer: {
    marginRight: SPACING.SM,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.SM + 4,
    fontSize: FONT_SIZE.BODY_MEDIUM,
    color: COLORS.TEXT_PRIMARY,
  },
  errorText: {
    fontSize: FONT_SIZE.CAPTION,
    fontWeight: '500',
    color: COLORS.ERROR,
    marginTop: SPACING.XS,
  },
  helperText: {
    fontSize: FONT_SIZE.CAPTION,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.XS,
  },
});

export default InputField;
