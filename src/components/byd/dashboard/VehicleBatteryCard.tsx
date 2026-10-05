import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { BydVehicle } from '../../../services/byd/client';

interface VehicleBatteryCardProps {
  vehicle: BydVehicle;
  children?: React.ReactNode;
}

export const VehicleBatteryCard: React.FC<VehicleBatteryCardProps> = ({ vehicle, children }) => {
  const { theme } = useTheme();
  const socPercent = typeof vehicle.soc === 'number' ? vehicle.soc : 0;
  const batteryColor = theme.getBatteryColor(vehicle.soc);

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
      <View style={styles.header}>
        <View>
          <Text style={[styles.carName, { color: theme.textPrimary }]}>
            {vehicle.carName || 'Véhicule BYD'}
          </Text>
          <Text style={[styles.modelName, { color: theme.primary }]}>
            {vehicle.modelName || 'DiLink EV'}
          </Text>
        </View>

        {vehicle.carPlate && (
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
              {vehicle.carPlate}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.batteryRow}>
        <View>
          <Text style={[styles.socLabel, { color: theme.textSecondary }]}>
            NIVEAU DE BATTERIE (SOC TEMPS RÉEL)
          </Text>
          <Text style={[styles.socValue, { color: batteryColor }]}>
            {typeof vehicle.soc === 'number' ? `${vehicle.soc}%` : 'N/A'}
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
            {vehicle.status || 'Connecté'}
          </Text>
        </View>
      </View>

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
              width: `${Math.min(100, Math.max(0, socPercent))}%`,
              backgroundColor: batteryColor,
              borderRadius: theme.radius.xs,
            },
          ]}
        />
      </View>

      <View style={[styles.detailsGrid, { borderTopColor: theme.borderSubtle }]}>
        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
            N° DE SÉRIE (VIN)
          </Text>
          <Text style={[styles.detailValue, { color: theme.textPrimary }]}>
            {vehicle.vin}
          </Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
            KILOMÉTRAGE CUMULÉ
          </Text>
          <Text style={[styles.detailValue, { color: theme.textPrimary }]}>
            {vehicle.totalMileage
              ? `${vehicle.totalMileage.toLocaleString()} km`
              : 'N/A'}
          </Text>
        </View>
      </View>

      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  header: {
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
    marginBottom: 6,
  },
  vehicleStatusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  batteryTrack: {
    height: 10,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
  },
  batteryFill: {
    height: '100%',
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
});
