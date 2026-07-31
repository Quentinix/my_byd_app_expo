import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
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
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <View style={styles.statusIndicator}>
            <View style={styles.activeDot} />
            <Text style={styles.statusText}>SESSION CLOUD ACTIVE</Text>
          </View>
          <Text style={styles.userBadge}>{username}</Text>
        </View>
        <Text style={styles.statusSubtext}>
          Connecté à l&apos;API Cloud Internationale (eu.byd.auto)
        </Text>
      </View>

      {/* Carte Véhicule Actif */}
      {activeVehicle ? (
        <View style={styles.vehicleCard}>
          <View style={styles.vehicleHeader}>
            <View>
              <Text style={styles.carName}>{activeVehicle.carName || 'Véhicule BYD'}</Text>
              <Text style={styles.modelName}>{activeVehicle.modelName || 'DiLink EV'}</Text>
            </View>
            {activeVehicle.carPlate ? (
              <View style={styles.plateBadge}>
                <Text style={styles.plateText}>{activeVehicle.carPlate}</Text>
              </View>
            ) : null}
          </View>

          {/* SoC & Batterie */}
          <View style={styles.batteryRow}>
            <View style={styles.batteryInfo}>
              <Text style={styles.socLabel}>NIVEAU DE BATTERIE (SoC Temps Réel)</Text>
              <Text style={styles.socValue}>
                {typeof activeVehicle.soc === 'number' ? `${activeVehicle.soc}%` : 'N/A'}
              </Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.vehicleStatusText}>{activeVehicle.status || 'Connecté'}</Text>
            </View>
          </View>

          {/* Barre de Progression Batterie */}
          <View style={styles.batteryTrack}>
            <View
              style={[
                styles.batteryFill,
                { width: `${typeof activeVehicle.soc === 'number' ? activeVehicle.soc : 0}%` },
                (activeVehicle.soc ?? 0) < 20 ? styles.batteryLow : styles.batteryNormal,
              ]}
            />
          </View>

          {/* Détails Techniques (VIN & Kilométrage) */}
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>N° DE SÉRIE (VIN)</Text>
              <Text style={styles.detailValue}>{activeVehicle.vin}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>KILOMÉTRAGE CUMULÉ</Text>
              <Text style={styles.detailValue}>
                {activeVehicle.totalMileage ? `${activeVehicle.totalMileage.toLocaleString()} km` : 'N/A'}
              </Text>
            </View>
          </View>

          {/* Télémétrie en temps réel (Habitacle & TPMS) */}
          <View style={styles.realtimeSection}>
            <Text style={styles.realtimeSectionTitle}>TÉLÉMÉTRIE TEMPS RÉEL (T-BOX)</Text>
            
            <View style={styles.realtimeGrid}>
              <View style={styles.realtimeCard}>
                <Text style={styles.realtimeLabel}>TEMP. HABITACLE</Text>
                <Text style={styles.realtimeValue}>
                  {typeof activeVehicle.tempInCar === 'number' ? `${activeVehicle.tempInCar}°C` : 'N/A'}
                </Text>
              </View>

              <View style={styles.realtimeCard}>
                <Text style={styles.realtimeLabel}>PNEUS (AV G / AV D)</Text>
                <Text style={styles.realtimeValue}>
                  {formatBar(activeVehicle.tirePressures?.leftFront)} / {formatBar(activeVehicle.tirePressures?.rightFront)}
                </Text>
              </View>
            </View>

            {activeVehicle.tirePressures && (
              <View style={[styles.realtimeCard, { marginTop: 8 }]}>
                <Text style={styles.realtimeLabel}>PNEUS (AR G / AR D)</Text>
                <Text style={styles.realtimeValue}>
                  {formatBar(activeVehicle.tirePressures?.leftRear)} / {formatBar(activeVehicle.tirePressures?.rightRear)}
                </Text>
              </View>
            )}

            {onRefresh && (
              <TouchableOpacity
                style={[styles.refreshButton, isRefreshing && styles.refreshButtonDisabled]}
                onPress={handleRefresh}
                disabled={isRefreshing}
              >
                <Text style={styles.refreshButtonText}>
                  {isRefreshing ? 'ACQUISITION TEMPS RÉEL...' : '🔄 DÉCLENCHER UNE MESURE T-BOX'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Sélecteur de VIN si plusieurs véhicules */}
          {vehicles.length > 1 && (
            <View style={styles.vinSelectorContainer}>
              <Text style={styles.selectorLabel}>VÉHICULES ASSOCIÉS AU COMPTE :</Text>
              <View style={styles.vinPillsRow}>
                {vehicles.map((v) => (
                  <TouchableOpacity
                    key={v.vin}
                    style={[
                      styles.vinPill,
                      v.vin === activeVehicle.vin && styles.vinPillActive,
                    ]}
                    onPress={() => onSelectVehicle(v.vin)}
                  >
                    <Text
                      style={[
                        styles.vinPillText,
                        v.vin === activeVehicle.vin && styles.vinPillTextActive,
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
        <View style={styles.noVehicleCard}>
          <Text style={styles.noVehicleText}>Aucun véhicule détecté sur ce compte BYD.</Text>
        </View>
      )}

      {/* Inspecteur de Tokens de Sécurité */}
      <View style={styles.tokensCard}>
        <TouchableOpacity
          style={styles.tokensHeader}
          onPress={() => setShowTokens(!showTokens)}
        >
          <Text style={styles.tokensTitle}>JETONS DE SÉCURITÉ DI-LINK (TOKENS)</Text>
          <Text style={styles.tokensToggleText}>{showTokens ? 'MASQUER ▲' : 'AFFICHER ▼'}</Text>
        </TouchableOpacity>

        {showTokens && (
          <View style={styles.tokensBody}>
            <View style={styles.tokenRow}>
              <Text style={styles.tokenLabel}>User ID :</Text>
              <Text style={styles.tokenValue}>{session.user_id}</Text>
            </View>
            <View style={styles.tokenRow}>
              <Text style={styles.tokenLabel}>Sign Token :</Text>
              <Text style={styles.tokenValue}>{maskToken(session.sign_token)}</Text>
            </View>
            <View style={styles.tokenRow}>
              <Text style={styles.tokenLabel}>Encry Token :</Text>
              <Text style={styles.tokenValue}>{maskToken(session.encry_token)}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Bouton de Déconnexion */}
      <TouchableOpacity style={styles.logoutButton} onPress={onLogout} activeOpacity={0.8}>
        <Text style={styles.logoutText}>SE DÉCONNECTER DU CLOUD BYD</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
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
    backgroundColor: '#10B981',
    marginRight: 8,
  },
  statusText: {
    color: '#10B981',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 1,
  },
  userBadge: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  statusSubtext: {
    color: '#CBD5E1',
    fontSize: 12,
  },
  vehicleCard: {
    backgroundColor: '#161B22',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 16,
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  carName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  modelName: {
    color: '#00F0FF',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  plateBadge: {
    backgroundColor: '#0D1117',
    borderWidth: 1,
    borderColor: '#30363D',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  plateText: {
    color: '#F8FAFC',
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
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 2,
  },
  socValue: {
    color: '#00F0FF',
    fontSize: 32,
    fontWeight: '900',
  },
  statusBadge: {
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    borderColor: 'rgba(0, 240, 255, 0.3)',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 6,
  },
  vehicleStatusText: {
    color: '#00F0FF',
    fontSize: 12,
    fontWeight: '700',
  },
  batteryTrack: {
    height: 10,
    backgroundColor: '#0D1117',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#30363D',
  },
  batteryFill: {
    height: '100%',
    borderRadius: 5,
  },
  batteryNormal: {
    backgroundColor: '#00F0FF',
  },
  batteryLow: {
    backgroundColor: '#EF4444',
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#21262D',
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  detailValue: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '600',
  },
  realtimeSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#21262D',
  },
  realtimeSectionTitle: {
    color: '#00F0FF',
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
    backgroundColor: '#0D1117',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#21262D',
  },
  realtimeLabel: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  realtimeValue: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '700',
  },
  refreshButton: {
    marginTop: 12,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    borderColor: 'rgba(0, 240, 255, 0.4)',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  refreshButtonDisabled: {
    opacity: 0.5,
  },
  refreshButtonText: {
    color: '#00F0FF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  vinSelectorContainer: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#21262D',
  },
  selectorLabel: {
    color: '#64748B',
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
    backgroundColor: '#0D1117',
    borderWidth: 1,
    borderColor: '#30363D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  vinPillActive: {
    backgroundColor: '#0066FF',
    borderColor: '#0066FF',
  },
  vinPillText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  vinPillTextActive: {
    color: '#FFFFFF',
  },
  noVehicleCard: {
    backgroundColor: '#161B22',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  noVehicleText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  tokensCard: {
    backgroundColor: '#161B22',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 20,
  },
  tokensHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tokensTitle: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  tokensToggleText: {
    color: '#00F0FF',
    fontSize: 11,
    fontWeight: '700',
  },
  tokensBody: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#21262D',
  },
  tokenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tokenLabel: {
    color: '#64748B',
    fontSize: 12,
  },
  tokenValue: {
    color: '#00F0FF',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  logoutButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#EF4444',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 24,
  },
  logoutText: {
    color: '#EF4444',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 1,
  },
});
