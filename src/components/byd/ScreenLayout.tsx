import React from 'react';
import { View, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HeaderBrand } from './HeaderBrand';

interface ScreenLayoutProps {
  children: React.ReactNode;
  showHeaderBrand?: boolean;
}

export function ScreenLayout({ children, showHeaderBrand = true }: ScreenLayoutProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1117" />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
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
    backgroundColor: '#0D1117',
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
});
