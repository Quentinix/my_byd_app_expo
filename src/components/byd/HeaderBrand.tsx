import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const HeaderBrand: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoText}>BYD</Text>
          <Text style={styles.subLogoText}>CLOUD</Text>
        </View>

        <View style={styles.livePill}>
          <View style={styles.liveDot} />
          <Text style={styles.modeText}>CONNECTIVITÉ CLOUD</Text>
        </View>
      </View>

      <Text style={styles.title}>Connexion DiLink Cloud</Text>
      <Text style={styles.subtitle}>
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
    backgroundColor: 'rgba(0, 102, 255, 0.12)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 102, 255, 0.3)',
  },
  logoText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#00F0FF',
    letterSpacing: 3,
  },
  subLogoText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8A99AD',
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
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    borderColor: 'rgba(0, 240, 255, 0.3)',
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
    backgroundColor: '#00F0FF',
  },
  modeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E2E8F0',
    letterSpacing: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
  },
});
