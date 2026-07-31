import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ScreenLayout } from '@/components/byd/ScreenLayout';
import { LoginForm } from '@/components/byd/LoginForm';
import { router } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

export default function AuthenticationScreen() {
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
      {status === 'loading' ? <ActivityIndicator color="#ffffff" />:
      <LoginForm
        initialUsername={savedUsername}
        initialCountryCode={countryCode}
        initialRememberMe={rememberMe}
        status={status}
        errorMessage={errorMessage}
        onLogin={(user, pwd, cCode, rem) => login(user, pwd, cCode, rem)}
      />}

    </ScreenLayout>
  );
}

