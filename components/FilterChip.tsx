import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from '@/lib/useTheme';

interface Props {
  label: string;
  active: boolean;
  onPress: () => void;
}

export default function FilterChip({ label, active, onPress }: Props) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.92, {}, () => {
      scale.value = withSpring(1);
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={handlePress}
        style={[
          styles.chip,
          active
            ? { backgroundColor: colors.primary, borderColor: colors.primary }
            : { backgroundColor: 'transparent', borderColor: colors.border },
        ]}
      >
        <Text
          style={[
            styles.label,
            { color: active ? '#0D0D0D' : colors.textSecondary },
          ]}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 1.5,
    marginRight: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
});
