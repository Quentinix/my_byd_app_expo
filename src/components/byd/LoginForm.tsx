import { AuthStatus } from '@/context/AuthContext';
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
    <View style={styles.card}>
      {errorMessage ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Échec de la connexion</Text>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

      {/* Identifiant */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>IDENTIFIANT (E-MAIL OU TÉLÉPHONE)</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="votre.email@exemple.com"
            placeholderTextColor="#64748B"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
      </View>

      {/* Mot de passe */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>MOT DE PASSE</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={[styles.input, { paddingRight: 50 }]}
            placeholder="••••••••••••"
            placeholderTextColor="#64748B"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Text style={styles.eyeText}>{showPassword ? 'MASQUER' : 'AFFICHER'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Code Pays */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>PAYS / RÉGION DU COMPTE</Text>
        <TouchableOpacity
          style={styles.selectWrapper}
          onPress={() => setShowCountryModal(true)}
        >
          <Text style={styles.selectText}>{selectedCountry.label}</Text>
          <Text style={styles.selectArrow}>▼</Text>
        </TouchableOpacity>
      </View>

      {/* Options & Avertissement */}
      <View style={styles.optionsRow}>
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setRememberMe(!rememberMe)}
          activeOpacity={0.8}
        >
          <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
            {rememberMe && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>Se souvenir de moi</Text>
        </TouchableOpacity>
      </View>

      {/* Bouton de Connexion */}
      <TouchableOpacity
        style={[styles.submitButton, status === 'loading' && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={status === 'loading'}
        activeOpacity={0.85}
      >
        {status === 'loading' ? (
          <ActivityIndicator color="#0D1117" size="small" />
        ) : (
          <Text style={styles.submitButtonText}>SE CONNECTER AU CLOUD BYD</Text>
        )}
      </TouchableOpacity>

      {/* Modal Sélection de Pays */}
      <Modal visible={showCountryModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sélectionnez votre Pays / Région</Text>
            <ScrollView style={{ maxHeight: 240 }}>
              {COUNTRY_CODES.map((item) => (
                <TouchableOpacity
                  key={item.code}
                  style={[
                    styles.modalOption,
                    item.code === countryCode && styles.modalOptionSelected,
                  ]}
                  onPress={() => {
                    setCountryCode(item.code);
                    setShowCountryModal(false);
                  }}
                >
                  <Text style={styles.modalOptionText}>{item.label}</Text>
                  {item.code === countryCode && <Text style={styles.modalCheck}>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowCountryModal(false)}
            >
              <Text style={styles.modalCloseText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#161B22',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorTitle: {
    color: '#EF4444',
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 2,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 12,
    lineHeight: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 6,
    letterSpacing: 1,
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    backgroundColor: '#0D1117',
    borderWidth: 1,
    borderColor: '#30363D',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 15,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  eyeText: {
    color: '#00F0FF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  selectWrapper: {
    backgroundColor: '#0D1117',
    borderWidth: 1,
    borderColor: '#30363D',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  selectArrow: {
    color: '#64748B',
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
    borderColor: '#475569',
    backgroundColor: '#0D1117',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: '#0066FF',
    borderColor: '#0066FF',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    color: '#CBD5E1',
    fontSize: 13,
  },
  noticeLink: {
    color: '#00F0FF',
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  submitButton: {
    backgroundColor: '#00F0FF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#090D16',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#161B22',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#30363D',
  },
  modalTitle: {
    color: '#FFFFFF',
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
  modalOptionSelected: {
    backgroundColor: 'rgba(0, 102, 255, 0.2)',
  },
  modalOptionText: {
    color: '#E2E8F0',
    fontSize: 14,
  },
  modalCheck: {
    color: '#00F0FF',
    fontWeight: 'bold',
  },
  modalCloseButton: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 10,
  },
  modalCloseText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
});
