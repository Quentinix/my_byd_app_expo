import React from 'react';
import { View, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { HeaderBrand } from './HeaderBrand';

interface ScreenLayoutProps {
  children: React.ReactNode;
  showHeaderBrand?: boolean;
}

export function ScreenLayout({ children, showHeaderBrand = true }: ScreenLayoutProps) {
  const { theme, isDark } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View
          style={[
            styles.container,
            {
              maxWidth: theme.layout.maxContentWidth,
              paddingHorizontal: theme.layout.screenPadding,
            },
          ]}
        >
          {showHeaderBrand && <HeaderBrand />}
          {children}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  container: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
  },
});
