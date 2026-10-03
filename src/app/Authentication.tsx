import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { ScreenLayout } from '@/components/byd/ScreenLayout';
import { LoginForm } from '@/components/byd/LoginForm';
import { router } from 'expo-router';
import { ActivityIndicator } from 'react-native';

export default function AuthenticationScreen() {
  const { theme } = useTheme();
  const {
    status,
    session,
    errorMessage,
    rememberMe,
    savedUsername,
    countryCode,
    login,
  } = useAuth();

  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.replace('/Dashboard');
    }
  }, [status, session]);

  return (
    <ScreenLayout>
      {status === 'loading' ? (
        <ActivityIndicator color={theme.primary} size="large" />
      ) : (
        <LoginForm
          initialUsername={savedUsername}
          initialCountryCode={countryCode}
          initialRememberMe={rememberMe}
          status={status}
          errorMessage={errorMessage}
          onLogin={(user, pwd, cCode, rem) => login(user, pwd, cCode, rem)}
        />
      )}
    </ScreenLayout>
  );
}

