import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Session, BydVehicle } from '../../services/byd/client';

interface SessionDashboardProps {
  session: Session;
  vehicles: BydVehicle[];
  activeVehicle: BydVehicle | null;
  username: string;
  onSelectVehicle: (vin: string) => void;
  onLogout: () => void;
  onRefresh?: () => void;
}

export const SessionDashboard: React.FC<SessionDashboardProps> = ({
  session,
  vehicles,
  activeVehicle,
  username,
  onSelectVehicle,
  onLogout,
  onRefresh,
}) => {
  const { theme, isDark } = useTheme();
  const [showTokens, setShowTokens] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!onRefresh || isRefreshing) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatBar = (kpa?: number) => {
    if (!kpa || kpa <= 0) return 'N/A';
    return `${(kpa / 100).toFixed(2)} bar`;
  };

  const maskToken = (token: string) => {
    if (!token) return '••••••••';
    if (token.length <= 8) return token;
    return `${token.substring(0, 4)}••••••••${token.substring(token.length - 4)}`;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Carte Statut Session */}
      <View
        style={[
          styles.statusCard,
          {
            backgroundColor: isDark ? 'rgba(16, 185, 129, 0.08)' : '#ECFDF5',
            borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : '#A7F3D0',
            borderRadius: theme.radius.lg,
          },
        ]}
      >
        <View style={styles.statusHeader}>
          <View style={styles.statusIndicator}>
            <View
              style={[
                styles.activeDot,
                { backgroundColor: theme.success, borderRadius: theme.radius.full },
              ]}
            />
            <Text style={[styles.statusText, { color: theme.success }]}>SESSION CLOUD ACTIVE</Text>
          </View>
          <Text style={[styles.userBadge, { color: theme.textSecondary }]}>{username}</Text>
        </View>
        <Text style={[styles.statusSubtext, { color: theme.textSecondary }]}>
          Connecté à l&apos;API Cloud Internationale (eu.byd.auto)
        </Text>
      </View>

      {/* Carte Véhicule Actif */}
      {activeVehicle ? (
        <View
          style={[
            styles.vehicleCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              borderRadius: theme.radius.lg,
            },
          ]}
        >
          <View style={styles.vehicleHeader}>
            <View>
              <Text style={[styles.carName, { color: theme.textPrimary }]}>
                {activeVehicle.carName || 'Véhicule BYD'}
              </Text>
              <Text style={[styles.modelName, { color: theme.primary }]}>
                {activeVehicle.modelName || 'DiLink EV'}
              </Text>
            </View>
            {activeVehicle.carPlate ? (
              <View
                style={[
                  styles.plateBadge,
                  {
                    backgroundColor: theme.surfaceVariant,
                    borderColor: theme.border,
                    borderRadius: theme.radius.sm,
                  },
                ]}
              >
                <Text style={[styles.plateText, { color: theme.textPrimary }]}>
                  {activeVehicle.carPlate}
                </Text>
              </View>
            ) : null}
          </View>

          {/* SoC & Batterie */}
          <View style={styles.batteryRow}>
            <View style={styles.batteryInfo}>
              <Text style={[styles.socLabel, { color: theme.textSecondary }]}>
                NIVEAU DE BATTERIE (SoC Temps Réel)
              </Text>
              <Text
                style={[
                  styles.socValue,
                  { color: theme.getBatteryColor(activeVehicle.soc) },
                ]}
              >
                {typeof activeVehicle.soc === 'number' ? `${activeVehicle.soc}%` : 'N/A'}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: theme.primaryContainer,
                  borderColor: theme.border,
                  borderRadius: theme.radius.pill,
                },
              ]}
            >
              <Text style={[styles.vehicleStatusText, { color: theme.primary }]}>
                {activeVehicle.status || 'Connecté'}
              </Text>
            </View>
          </View>

          {/* Barre de Progression Batterie */}
          <View
            style={[
              styles.batteryTrack,
              {
                backgroundColor: theme.surfaceVariant,
                borderColor: theme.border,
                borderRadius: theme.radius.xs,
              },
            ]}
          >
            <View
              style={[
                styles.batteryFill,
                {
                  width: `${typeof activeVehicle.soc === 'number' ? activeVehicle.soc : 0}%`,
                  backgroundColor: theme.getBatteryColor(activeVehicle.soc),
                  borderRadius: theme.radius.xs,
                },
              ]}
            />
          </View>

          {/* Détails Techniques (VIN & Kilométrage) */}
          <View style={[styles.detailsGrid, { borderTopColor: theme.borderSubtle }]}>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                N° DE SÉRIE (VIN)
              </Text>
              <Text style={[styles.detailValue, { color: theme.textPrimary }]}>
                {activeVehicle.vin}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                KILOMÉTRAGE CUMULÉ
              </Text>
              <Text style={[styles.detailValue, { color: theme.textPrimary }]}>
                {activeVehicle.totalMileage
                  ? `${activeVehicle.totalMileage.toLocaleString()} km`
                  : 'N/A'}
              </Text>
            </View>
          </View>

          {/* Télémétrie en temps réel (Habitacle & TPMS) */}
          <View style={[styles.realtimeSection, { borderTopColor: theme.borderSubtle }]}>
            <Text style={[styles.realtimeSectionTitle, { color: theme.primary }]}>
              TÉLÉMÉTRIE TEMPS RÉEL (T-BOX)
            </Text>

            <View style={styles.realtimeGrid}>
              <View
                style={[
                  styles.realtimeCard,
                  {
                    backgroundColor: theme.surfaceVariant,
                    borderColor: theme.border,
                    borderRadius: theme.radius.md,
                  },
                ]}
              >
                <Text style={[styles.realtimeLabel, { color: theme.textSecondary }]}>
                  TEMP. HABITACLE
                </Text>
                <Text style={[styles.realtimeValue, { color: theme.textPrimary }]}>
                  {typeof activeVehicle.tempInCar === 'number'
                    ? `${activeVehicle.tempInCar}°C`
                    : 'N/A'}
                </Text>
              </View>

              <View
                style={[
                  styles.realtimeCard,
                  {
                    backgroundColor: theme.surfaceVariant,
                    borderColor: theme.border,
                    borderRadius: theme.radius.md,
                  },
                ]}
              >
                <Text style={[styles.realtimeLabel, { color: theme.textSecondary }]}>
                  PNEUS (AV G / AV D)
                </Text>
                <Text style={[styles.realtimeValue, { color: theme.textPrimary }]}>
                  {formatBar(activeVehicle.tirePressures?.leftFront)} /{' '}
                  {formatBar(activeVehicle.tirePressures?.rightFront)}
                </Text>
              </View>
            </View>

            {activeVehicle.tirePressures && (
              <View
                style={[
                  styles.realtimeCard,
                  {
                    marginTop: 8,
                    backgroundColor: theme.surfaceVariant,
                    borderColor: theme.border,
                    borderRadius: theme.radius.md,
                  },
                ]}
              >
                <Text style={[styles.realtimeLabel, { color: theme.textSecondary }]}>
                  PNEUS (AR G / AR D)
                </Text>
                <Text style={[styles.realtimeValue, { color: theme.textPrimary }]}>
                  {formatBar(activeVehicle.tirePressures?.leftRear)} /{' '}
                  {formatBar(activeVehicle.tirePressures?.rightRear)}
                </Text>
              </View>
            )}

            {onRefresh && (
              <TouchableOpacity
                style={[
                  styles.refreshButton,
                  {
                    backgroundColor: theme.primaryContainer,
                    borderColor: theme.primary,
                    borderRadius: theme.radius.md,
                  },
                  isRefreshing && { opacity: theme.opacity.disabled },
                ]}
                onPress={handleRefresh}
                disabled={isRefreshing}
                activeOpacity={theme.opacity.pressed}
              >
                <Text style={[styles.refreshButtonText, { color: theme.primary }]}>
                  {isRefreshing ? 'ACQUISITION TEMPS RÉEL...' : '🔄 DÉCLENCHER UNE MESURE T-BOX'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Sélecteur de VIN si plusieurs véhicules */}
          {vehicles.length > 1 && (
            <View style={[styles.vinSelectorContainer, { borderTopColor: theme.borderSubtle }]}>
              <Text style={[styles.selectorLabel, { color: theme.textSecondary }]}>
                VÉHICULES ASSOCIÉS AU COMPTE :
              </Text>
              <View style={styles.vinPillsRow}>
                {vehicles.map((v) => (
                  <TouchableOpacity
                    key={v.vin}
                    style={[
                      styles.vinPill,
                      {
                        backgroundColor:
                          v.vin === activeVehicle.vin ? theme.primary : theme.surfaceVariant,
                        borderColor:
                          v.vin === activeVehicle.vin ? theme.primary : theme.border,
                        borderRadius: theme.radius.md,
                      },
                    ]}
                    onPress={() => onSelectVehicle(v.vin)}
                    activeOpacity={theme.opacity.pressed}
                  >
                    <Text
                      style={[
                        styles.vinPillText,
                        {
                          color:
                            v.vin === activeVehicle.vin
                              ? theme.primaryText
                              : theme.textSecondary,
                        },
                      ]}
                    >
                      {v.carName || v.vin.substring(0, 8)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      ) : (
        <View
          style={[
            styles.noVehicleCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              borderRadius: theme.radius.lg,
            },
          ]}
        >
          <Text style={[styles.noVehicleText, { color: theme.textSecondary }]}>
            Aucun véhicule détecté sur ce compte BYD.
          </Text>
        </View>
      )}

      {/* Inspecteur de Tokens de Sécurité */}
      <View
        style={[
          styles.tokensCard,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            borderRadius: theme.radius.lg,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.tokensHeader}
          onPress={() => setShowTokens(!showTokens)}
          activeOpacity={theme.opacity.pressed}
        >
          <Text style={[styles.tokensTitle, { color: theme.textSecondary }]}>
            JETONS DE SÉCURITÉ DI-LINK (TOKENS)
          </Text>
          <Text style={[styles.tokensToggleText, { color: theme.primary }]}>
            {showTokens ? 'MASQUER ▲' : 'AFFICHER ▼'}
          </Text>
        </TouchableOpacity>

        {showTokens && (
          <View style={[styles.tokensBody, { borderTopColor: theme.borderSubtle }]}>
            <View style={styles.tokenRow}>
              <Text style={[styles.tokenLabel, { color: theme.textSecondary }]}>User ID :</Text>
              <Text style={[styles.tokenValue, { color: theme.primary }]}>{session.user_id}</Text>
            </View>
            <View style={styles.tokenRow}>
              <Text style={[styles.tokenLabel, { color: theme.textSecondary }]}>Sign Token :</Text>
              <Text style={[styles.tokenValue, { color: theme.primary }]}>
                {maskToken(session.sign_token)}
              </Text>
            </View>
            <View style={styles.tokenRow}>
              <Text style={[styles.tokenLabel, { color: theme.textSecondary }]}>Encry Token :</Text>
              <Text style={[styles.tokenValue, { color: theme.primary }]}>
                {maskToken(session.encry_token)}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Bouton de Déconnexion */}
      <TouchableOpacity
        style={[
          styles.logoutButton,
          {
            backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2',
            borderColor: theme.error,
            borderRadius: theme.radius.md,
          },
        ]}
        onPress={onLogout}
        activeOpacity={theme.opacity.pressed}
      >
        <Text style={[styles.logoutText, { color: theme.error }]}>
          SE DÉCONNECTER DU CLOUD BYD
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 1,
  },
  userBadge: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusSubtext: {
    fontSize: 12,
  },
  vehicleCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  carName: {
    fontSize: 20,
    fontWeight: '800',
  },
  modelName: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  plateBadge: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  plateText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  batteryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  batteryInfo: {
    flexDirection: 'column',
  },
  socLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 2,
  },
  socValue: {
    fontSize: 32,
    fontWeight: '900',
  },
  statusBadge: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 6,
  },
  vehicleStatusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  batteryTrack: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
  },
  batteryFill: {
    height: '100%',
    borderRadius: 5,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  realtimeSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  realtimeSectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 10,
  },
  realtimeGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  realtimeCard: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  realtimeLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  realtimeValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  refreshButton: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  refreshButtonDisabled: {
    opacity: 0.5,
  },
  refreshButtonText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  vinSelectorContainer: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  selectorLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 8,
  },
  vinPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  vinPill: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  vinPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  noVehicleCard: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
  },
  noVehicleText: {
    fontSize: 14,
  },
  tokensCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  tokensHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tokensTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  tokensToggleText: {
    fontSize: 11,
    fontWeight: '700',
  },
  tokensBody: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  tokenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tokenLabel: {
    fontSize: 12,
  },
  tokenValue: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  logoutButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 24,
  },
  logoutText: {
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 1,
  },
});

