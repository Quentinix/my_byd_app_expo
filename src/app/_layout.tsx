import { Stack } from 'expo-router';
import { Host } from '@expo/ui';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';

function RootLayoutNav() {
  const { theme, colorScheme } = useTheme();

  return (
    <Host style={{ flex: 1 }} colorScheme={colorScheme} seedColor={theme.primary}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.background },
        }}
      />
    </Host>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </ThemeProvider>
  );
}
