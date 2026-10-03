import { AuthStatus } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';

interface LoginFormProps {
  initialUsername?: string;
  initialCountryCode?: string;
  initialRememberMe?: boolean;
  status: AuthStatus;
  errorMessage: string | null;
  onLogin: (username: string, password: string, countryCode: string, rememberMe: boolean) => void;
}

const COUNTRY_CODES = [
  { code: 'FR', label: 'France (+33 / EU)' },
  { code: 'DE', label: 'Allemagne (DE)' },
  { code: 'UK', label: 'Royaume-Uni (UK)' },
  { code: 'ES', label: 'Espagne (ES)' },
  { code: 'IT', label: 'Italie (IT)' },
  { code: 'CN', label: 'Chine (+86)' },
];

export const LoginForm: React.FC<LoginFormProps> = ({
  initialUsername = '',
  initialCountryCode = 'FR',
  initialRememberMe = true,
  status,
  errorMessage,
  onLogin,
}) => {
  const { theme, isDark } = useTheme();
  const [username, setUsername] = useState(initialUsername);
  const [password, setPassword] = useState('');
  const [countryCode, setCountryCode] = useState(initialCountryCode);
  const [rememberMe, setRememberMe] = useState(initialRememberMe);
  const [showPassword, setShowPassword] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);

  const handleSubmit = () => {
    if (!username.trim()) return;
    onLogin(username.trim(), password, countryCode, rememberMe);
  };

  const selectedCountry = COUNTRY_CODES.find((c) => c.code === countryCode) || COUNTRY_CODES[0];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          shadowColor: theme.shadow,
          borderRadius: theme.radius.lg,
        },
      ]}
    >
      {errorMessage ? (
        <View
          style={[
            styles.errorContainer,
            {
              backgroundColor: isDark ? 'rgba(239, 68, 68, 0.12)' : '#FEF2F2',
              borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : '#FCA5A5',
              borderRadius: theme.radius.md,
            },
          ]}
        >
          <Text style={[styles.errorTitle, { color: theme.error }]}>Échec de la connexion</Text>
          <Text style={[styles.errorText, { color: theme.error }]}>{errorMessage}</Text>
        </View>
      ) : null}

      {/* Identifiant */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>
          IDENTIFIANT (E-MAIL OU TÉLÉPHONE)
        </Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.inputBackground,
                borderColor: theme.border,
                color: theme.textPrimary,
                borderRadius: theme.radius.md,
              },
            ]}
            placeholder="votre.email@exemple.com"
            placeholderTextColor={theme.textMuted}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
      </View>

      {/* Mot de passe */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>MOT DE PASSE</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.inputBackground,
                borderColor: theme.border,
                color: theme.textPrimary,
                borderRadius: theme.radius.md,
                paddingRight: 50,
              },
            ]}
            placeholder="••••••••••••"
            placeholderTextColor={theme.textMuted}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
            activeOpacity={theme.opacity.pressed}
          >
            <Text style={[styles.eyeText, { color: theme.primary }]}>
              {showPassword ? 'MASQUER' : 'AFFICHER'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Code Pays */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>PAYS / RÉGION DU COMPTE</Text>
        <TouchableOpacity
          style={[
            styles.selectWrapper,
            {
              backgroundColor: theme.inputBackground,
              borderColor: theme.border,
              borderRadius: theme.radius.md,
            },
          ]}
          onPress={() => setShowCountryModal(true)}
          activeOpacity={theme.opacity.pressed}
        >
          <Text style={[styles.selectText, { color: theme.textPrimary }]}>
            {selectedCountry.label}
          </Text>
          <Text style={[styles.selectArrow, { color: theme.textMuted }]}>▼</Text>
        </TouchableOpacity>
      </View>

      {/* Options & Avertissement */}
      <View style={styles.optionsRow}>
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setRememberMe(!rememberMe)}
          activeOpacity={theme.opacity.pressed}
        >
          <View
            style={[
              styles.checkbox,
              {
                backgroundColor: rememberMe ? theme.primary : theme.inputBackground,
                borderColor: rememberMe ? theme.primary : theme.border,
                borderRadius: theme.radius.xs,
              },
            ]}
          >
            {rememberMe && (
              <Text style={[styles.checkmark, { color: theme.primaryText }]}>✓</Text>
            )}
          </View>
          <Text style={[styles.checkboxLabel, { color: theme.textSecondary }]}>
            Se souvenir de moi
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bouton de Connexion */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          {
            backgroundColor: theme.primary,
            shadowColor: theme.primary,
            borderRadius: theme.radius.md,
          },
          status === 'loading' && { opacity: theme.opacity.disabled },
        ]}
        onPress={handleSubmit}
        disabled={status === 'loading'}
        activeOpacity={theme.opacity.pressed}
      >
        {status === 'loading' ? (
          <ActivityIndicator color={theme.primaryText} size="small" />
        ) : (
          <Text style={[styles.submitButtonText, { color: theme.primaryText }]}>
            SE CONNECTER AU CLOUD BYD
          </Text>
        )}
      </TouchableOpacity>

      {/* Modal Sélection de Pays */}
      <Modal visible={showCountryModal} transparent animationType="fade">
        <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                borderRadius: theme.radius.lg,
              },
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
              Sélectionnez votre Pays / Région
            </Text>
            <ScrollView style={{ maxHeight: 240 }}>
              {COUNTRY_CODES.map((item) => (
                <TouchableOpacity
                  key={item.code}
                  style={[
                    styles.modalOption,
                    { borderRadius: theme.radius.sm },
                    item.code === countryCode && {
                      backgroundColor: theme.primaryContainer,
                    },
                  ]}
                  onPress={() => {
                    setCountryCode(item.code);
                    setShowCountryModal(false);
                  }}
                  activeOpacity={theme.opacity.pressed}
                >
                  <Text style={[styles.modalOptionText, { color: theme.textPrimary }]}>
                    {item.label}
                  </Text>
                  {item.code === countryCode && (
                    <Text style={[styles.modalCheck, { color: theme.primary }]}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowCountryModal(false)}
              activeOpacity={theme.opacity.pressed}
            >
              <Text style={[styles.modalCloseText, { color: theme.textSecondary }]}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  errorContainer: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorTitle: {
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 2,
  },
  errorText: {
    fontSize: 12,
    lineHeight: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 1,
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  eyeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  selectWrapper: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectText: {
    fontSize: 14,
  },
  selectArrow: {
    fontSize: 10,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 4,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkmark: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 13,
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  modalOption: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalOptionText: {
    fontSize: 14,
  },
  modalCheck: {
    fontWeight: 'bold',
  },
  modalCloseButton: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 10,
  },
  modalCloseText: {
    fontSize: 13,
    fontWeight: '600',
  },
});

