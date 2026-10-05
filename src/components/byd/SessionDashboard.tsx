import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Session, BydVehicle } from '../../services/byd/client';
import { VehicleBatteryCard } from './dashboard/VehicleBatteryCard';
import { VehicleTelemetryCard } from './dashboard/VehicleTelemetryCard';
import { VehicleSelector } from './dashboard/VehicleSelector';
import { SecurityInspectorCard } from './dashboard/SecurityInspectorCard';

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
  vehicles,
  activeVehicle,
  username,
  onSelectVehicle,
  onLogout,
  onRefresh,
}) => {
  const { theme, isDark } = useTheme();

  return (
    <View style={styles.container}>
      {/* Statut de session */}
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
            <Text style={[styles.statusText, { color: theme.success }]}>
              SESSION CLOUD ACTIVE
            </Text>
          </View>
          <Text style={[styles.userBadge, { color: theme.textSecondary }]}>{username}</Text>
        </View>
        <Text style={[styles.statusSubtext, { color: theme.textSecondary }]}>
          Connecté à l&apos;API Cloud Internationale (eu.byd.auto)
        </Text>
      </View>

      {/* Détails du véhicule actif */}
      {activeVehicle ? (
        <VehicleBatteryCard vehicle={activeVehicle}>
          <VehicleTelemetryCard vehicle={activeVehicle} onRefresh={onRefresh} />
          <VehicleSelector
            vehicles={vehicles}
            activeVin={activeVehicle.vin}
            onSelectVehicle={onSelectVehicle}
          />
        </VehicleBatteryCard>
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

      {/* Inspecteur de sécurité */}
      <SecurityInspectorCard />

      {/* Bouton de déconnexion */}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusCard: {
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
  noVehicleCard: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
  },
  noVehicleText: {
    fontSize: 14,
  },
  logoutButton: {
    borderWidth: 1,
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
