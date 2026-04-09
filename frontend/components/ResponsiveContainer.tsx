import React from 'react';
import { View, StyleSheet, useWindowDimensions, Platform } from 'react-native';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  maxWidth?: number;
}

export default function ResponsiveContainer({ children, maxWidth = 800 }: ResponsiveContainerProps) {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isLargeScreen = isWeb && width > 768;

  return (
    <View style={[
      styles.container,
      isLargeScreen && { maxWidth, alignSelf: 'center', width: '100%' }
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
