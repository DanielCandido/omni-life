import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Colors } from '../../utils/theme';

interface ProgressBarProps {
  progress: number; // 0–100
  color?: string;
  trackColor?: string;
  height?: number;
  style?: ViewStyle;
  borderRadius?: number;
}

export const ProgressBar = ({
  progress,
  color = Colors.primary,
  trackColor = Colors.border,
  height = 6,
  style,
  borderRadius = 999,
}: ProgressBarProps) => (
  <View
    style={[
      {
        height,
        backgroundColor: trackColor,
        borderRadius,
        overflow: 'hidden',
      },
      style,
    ]}
  >
    <View
      style={{
        height,
        width: `${Math.min(100, Math.max(0, progress))}%`,
        backgroundColor: color,
        borderRadius,
      }}
    />
  </View>
);
