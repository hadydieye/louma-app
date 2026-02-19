import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/lib/useTheme';

type EquipmentType = 'water' | 'electricity' | 'generator' | 'ac' | 'parking' | 'security' | 'internet' | 'hotwater';

interface Props {
  type: EquipmentType;
  available: boolean;
  detail?: string;
}

const config: Record<EquipmentType, { icon: string; lib: 'ion' | 'mci'; label: string }> = {
  water: { icon: 'water', lib: 'ion', label: 'Eau' },
  electricity: { icon: 'flash', lib: 'ion', label: 'Électricité' },
  generator: { icon: 'engine', lib: 'mci', label: 'Groupe' },
  ac: { icon: 'snowflake', lib: 'mci', label: 'Clim' },
  parking: { icon: 'car', lib: 'ion', label: 'Parking' },
  security: { icon: 'shield-checkmark', lib: 'ion', label: 'Sécurité' },
  internet: { icon: 'wifi', lib: 'ion', label: 'Internet' },
  hotwater: { icon: 'water-boiler', lib: 'mci', label: 'Eau chaude' },
};

export default function EquipmentIcon({ type, available, detail }: Props) {
  const { colors } = useTheme();
  const c = config[type];
  const color = available ? '#B8F53A' : colors.textMuted;
  const iconColor = available ? '#0D0D0D' : colors.textMuted;

  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: available ? 'rgba(184,245,58,0.15)' : 'rgba(160,160,160,0.08)' }]}>
        {c.lib === 'ion' ? (
          <Ionicons name={c.icon as any} size={22} color={iconColor} />
        ) : (
          <MaterialCommunityIcons name={c.icon as any} size={22} color={iconColor} />
        )}
      </View>
      <Text style={[styles.label, { color: available ? colors.textPrimary : colors.textMuted }]} numberOfLines={1}>
        {c.label}
      </Text>
      {detail && <Text style={[styles.detail, { color: colors.textMuted }]} numberOfLines={1}>{detail}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', width: 72 },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  label: { fontSize: 11, fontWeight: '600' as const, textAlign: 'center' },
  detail: { fontSize: 9, textAlign: 'center', marginTop: 1 },
});
