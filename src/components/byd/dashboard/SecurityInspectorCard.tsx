import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';

export const SecurityInspectorCard: React.FC = () => {
  const { theme } = useTheme();
  const [showTokens, setShowTokens] = useState(false);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          borderRadius: theme.radius.lg,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.header}
        onPress={() => setShowTokens(!showTokens)}
        activeOpacity={theme.opacity.pressed}
      >
        <Text style={[styles.title, { color: theme.textSecondary }]}>
          JETONS DE SÉCURITÉ DI-LINK (TOKENS)
        </Text>
        <Text style={[styles.toggleText, { color: theme.primary }]}>
          {showTokens ? 'MASQUER ▲' : 'AFFICHER ▼'}
        </Text>
      </TouchableOpacity>

      {showTokens && (
        <View style={[styles.body, { borderTopColor: theme.borderSubtle }]}>
          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              Statut d&apos;authentification :
            </Text>
            <Text style={[styles.value, { color: theme.success }]}>
              Session chiffrée active
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              Protocole sécurisé :
            </Text>
            <Text style={[styles.value, { color: theme.primary }]}>
              Bangcle AES-128-CBC
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              Stockage local :
            </Text>
            <Text style={[styles.value, { color: theme.primary }]}>
              Chiffré (aucun mot de passe)
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  toggleText: {
    fontSize: 11,
    fontWeight: '700',
  },
  body: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
  },
  value: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
});
