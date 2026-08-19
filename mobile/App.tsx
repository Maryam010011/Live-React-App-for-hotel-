import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

/**
 * LuxeStay Mobile App - Root Entry Point
 * Wraps the entire app in AuthProvider for global session state,
 * then renders the AppNavigator which contains all screens and tabs.
 */
export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
