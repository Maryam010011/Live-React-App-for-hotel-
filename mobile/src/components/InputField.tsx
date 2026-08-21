import React, { useState, useCallback, useMemo, useRef, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  Pressable,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { BORDER_RADIUS, FONT_SIZE, SPACING } from '../constants/theme';

export interface InputFieldProps extends TextInputProps {
  label?: string;
  error?: string | null;
  helperText?: string;
  leftIcon?: React.ReactNode;
}

export const InputField = React.memo(
  forwardRef<TextInput, InputFieldProps>(
    (
      {
        label,
        error,
        helperText,
        leftIcon,
        style,
        onFocus,
        onBlur,
        secureTextEntry,
        multiline,
        value,
        ...props
      },
      ref
    ) => {
      const [isFocused, setIsFocused] = useState(false);
      const [isPasswordVisible, setIsPasswordVisible] = useState(false);
      const innerInputRef = useRef<TextInput>(null);

      // Expose inner input methods via ref
      useImperativeHandle(ref, () => innerInputRef.current as TextInput);

      const handleFocus = useCallback(
        (e: any) => {
          setIsFocused(true);
          if (onFocus) onFocus(e);
        },
        [onFocus]
      );

      const handleBlur = useCallback(
        (e: any) => {
          setIsFocused(false);
          if (onBlur) onBlur(e);
        },
        [onBlur]
      );

      const handleWrapperPress = useCallback(() => {
        innerInputRef.current?.focus();
      }, []);

      const togglePasswordVisibility = useCallback(() => {
        setIsPasswordVisible((prev) => !prev);
      }, []);

      // Safe value handling: if value is passed, convert null/undefined to empty string
      const safeValue = useMemo(() => {
        if (value === undefined || value === null) return undefined;
        return String(value);
      }, [value]);

      const inputStyle = useMemo(
        () => [
          styles.input,
          multiline && styles.multilineInput,
          style,
        ],
        [multiline, style]
      );

      const isActuallySecure = secureTextEntry && !isPasswordVisible;

      return (
        <View style={styles.container}>
          {Boolean(label && label.trim().length > 0) && (
            <Text style={styles.label}>{label}</Text>
          )}

          <Pressable
            onPress={handleWrapperPress}
            style={[
              styles.inputWrapper,
              multiline && styles.multilineWrapper,
              isFocused && styles.inputFocused,
              error ? styles.inputError : null,
            ]}
          >
            {leftIcon ? <View style={styles.iconContainer}>{leftIcon}</View> : null}

            <TextInput
              ref={innerInputRef}
              style={inputStyle}
              placeholderTextColor={COLORS.TEXT_MUTED}
              onFocus={handleFocus}
              onBlur={handleBlur}
              secureTextEntry={isActuallySecure}
              multiline={multiline}
              textAlignVertical={multiline ? 'top' : 'center'}
              value={safeValue}
              {...props}
            />

            {secureTextEntry ? (
              <TouchableOpacity
                onPress={togglePasswordVisibility}
                style={styles.eyeIconBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={COLORS.TEXT_SECONDARY}
                />
              </TouchableOpacity>
            ) : null}
          </Pressable>

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : helperText ? (
            <Text style={styles.helperText}>{helperText}</Text>
          ) : null}
        </View>
      );
    }
  )
);

InputField.displayName = 'InputField';

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
    minHeight: 48,
  },
  multilineWrapper: {
    alignItems: 'flex-start',
    paddingVertical: SPACING.SM,
  },
  inputFocused: {
    borderColor: COLORS.PRIMARY,
    backgroundColor: COLORS.WHITE,
  },
  inputError: {
    borderColor: COLORS.ERROR,
    backgroundColor: COLORS.BG_PRIMARY,
  },
  iconContainer: {
    marginRight: SPACING.SM,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeIconBtn: {
    padding: 4,
    marginLeft: SPACING.SM,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? SPACING.SM + 4 : SPACING.SM + 2,
    fontSize: FONT_SIZE.BODY_MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    minHeight: 44,
  },
  multilineInput: {
    minHeight: 70,
    paddingTop: Platform.OS === 'ios' ? 0 : 2,
    textAlignVertical: 'top',
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
