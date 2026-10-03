import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export const HeaderBrand: React.FC = () => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View
          style={[
            styles.logoBadge,
            {
              backgroundColor: theme.primaryContainer,
              borderColor: theme.border,
              borderRadius: theme.radius.md,
            },
          ]}
        >
          <Text style={[styles.logoText, { color: theme.primary }]}>BYD</Text>
          <Text style={[styles.subLogoText, { color: theme.textSecondary }]}>CLOUD</Text>
        </View>

        <View
          style={[
            styles.livePill,
            {
              backgroundColor: theme.surfaceVariant,
              borderColor: theme.border,
              borderRadius: theme.radius.pill,
            },
          ]}
        >
          <View
            style={[
              styles.liveDot,
              {
                backgroundColor: theme.success,
                borderRadius: theme.radius.full,
              },
            ]}
          />
          <Text style={[styles.modeText, { color: theme.textSecondary }]}>CONNECTIVITÉ CLOUD</Text>
        </View>
      </View>

      <Text style={[styles.title, { color: theme.textPrimary }]}>Connexion DiLink Cloud</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Accédez à la télémétrie et aux commandes à distance de votre véhicule BYD
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  logoBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 3,
  },
  subLogoText: {
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 6,
    letterSpacing: 2,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  modeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
});

