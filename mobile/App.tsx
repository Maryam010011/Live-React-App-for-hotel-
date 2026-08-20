import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo: errorInfo.componentStack || 'No component stack available' });
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <ScrollView contentContainerStyle={styles.errorScroll}>
            <Text style={styles.errorTitle}>App Crashed</Text>
            <Text style={styles.errorSubtitle}>An unexpected error caused the app to stop.</Text>
            <View style={styles.errorCard}>
              <Text style={styles.errorLabel}>ERROR MESSAGE</Text>
              <Text style={styles.errorText}>{this.state.error?.message || 'Unknown error'}</Text>
            </View>
            <View style={styles.errorCard}>
              <Text style={styles.errorLabel}>STACK TRACE</Text>
              <Text style={styles.errorStack}>{this.state.error?.stack || 'No stack trace'}</Text>
            </View>
            {this.state.errorInfo ? (
              <View style={styles.errorCard}>
                <Text style={styles.errorLabel}>COMPONENT STACK</Text>
                <Text style={styles.errorStack}>{this.state.errorInfo}</Text>
              </View>
            ) : null}
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  errorScroll: {
    padding: 24,
    paddingTop: 60,
  },
  errorTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#e74c3c',
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    color: '#b2bec3',
    marginBottom: 24,
  },
  errorCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  errorLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 1,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f87171',
    lineHeight: 20,
  },
  errorStack: {
    fontSize: 11,
    color: '#94a3b8',
    lineHeight: 16,
    fontFamily: 'monospace',
  },
});

/**
 * LuxeStay Mobile App - Root Entry Point
 * Wraps the entire app in an ErrorBoundary (to display crashes on-screen in release builds)
 * then AuthProvider for global session state, then AppNavigator.
 */
export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </ErrorBoundary>
  );
}
