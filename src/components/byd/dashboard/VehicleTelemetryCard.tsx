import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { BydVehicle } from '../../../services/byd/client';

interface VehicleTelemetryCardProps {
  vehicle: BydVehicle;
  onRefresh?: () => Promise<void> | void;
}

function formatPressureBar(kpa?: number): string {
  if (!kpa || kpa <= 0) return 'N/A';
  return `${(kpa / 100).toFixed(2)} bar`;
}

export const VehicleTelemetryCard: React.FC<VehicleTelemetryCardProps> = ({
  vehicle,
  onRefresh,
}) => {
  const { theme } = useTheme();
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

  const frontTires = `${formatPressureBar(vehicle.tirePressures?.leftFront)} / ${formatPressureBar(vehicle.tirePressures?.rightFront)}`;
  const rearTires = `${formatPressureBar(vehicle.tirePressures?.leftRear)} / ${formatPressureBar(vehicle.tirePressures?.rightRear)}`;

  return (
    <View style={[styles.container, { borderTopColor: theme.borderSubtle }]}>
      <Text style={[styles.sectionTitle, { color: theme.primary }]}>
        TÉLÉMÉTRIE TEMPS RÉEL (T-BOX)
      </Text>

      <View style={styles.grid}>
        <View
          style={[
            styles.metricCard,
            {
              backgroundColor: theme.surfaceVariant,
              borderColor: theme.border,
              borderRadius: theme.radius.md,
            },
          ]}
        >
          <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
            TEMP. HABITACLE
          </Text>
          <Text style={[styles.metricValue, { color: theme.textPrimary }]}>
            {typeof vehicle.tempInCar === 'number' ? `${vehicle.tempInCar}°C` : 'N/A'}
          </Text>
        </View>

        <View
          style={[
            styles.metricCard,
            {
              backgroundColor: theme.surfaceVariant,
              borderColor: theme.border,
              borderRadius: theme.radius.md,
            },
          ]}
        >
          <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
            PNEUS (AV G / AV D)
          </Text>
          <Text style={[styles.metricValue, { color: theme.textPrimary }]}>
            {frontTires}
          </Text>
        </View>
      </View>

      {vehicle.tirePressures && (
        <View
          style={[
            styles.metricCard,
            {
              marginTop: 8,
              backgroundColor: theme.surfaceVariant,
              borderColor: theme.border,
              borderRadius: theme.radius.md,
            },
          ]}
        >
          <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
            PNEUS (AR G / AR D)
          </Text>
          <Text style={[styles.metricValue, { color: theme.textPrimary }]}>
            {rearTires}
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
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 10,
  },
  grid: {
    flexDirection: 'row',
    gap: 8,
  },
  metricCard: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  refreshButton: {
    marginTop: 12,
    borderWidth: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  refreshButtonText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
