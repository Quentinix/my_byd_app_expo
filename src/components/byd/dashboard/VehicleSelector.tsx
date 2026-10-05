import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { BydVehicle } from '../../../services/byd/client';

interface VehicleSelectorProps {
  vehicles: BydVehicle[];
  activeVin: string;
  onSelectVehicle: (vin: string) => void;
}

export const VehicleSelector: React.FC<VehicleSelectorProps> = ({
  vehicles,
  activeVin,
  onSelectVehicle,
}) => {
  const { theme } = useTheme();

  if (vehicles.length <= 1) return null;

  return (
    <View style={[styles.container, { borderTopColor: theme.borderSubtle }]}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>
        VÉHICULES ASSOCIÉS AU COMPTE :
      </Text>
      <View style={styles.pillsRow}>
        {vehicles.map((v) => {
          const isSelected = v.vin === activeVin;
          return (
            <TouchableOpacity
              key={v.vin}
              style={[
                styles.pill,
                {
                  backgroundColor: isSelected ? theme.primary : theme.surfaceVariant,
                  borderColor: isSelected ? theme.primary : theme.border,
                  borderRadius: theme.radius.md,
                },
              ]}
              onPress={() => onSelectVehicle(v.vin)}
              activeOpacity={theme.opacity.pressed}
            >
              <Text
                style={[
                  styles.pillText,
                  {
                    color: isSelected ? theme.primaryText : theme.textSecondary,
                  },
                ]}
              >
                {v.carName || v.vin.substring(0, 8)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 8,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
