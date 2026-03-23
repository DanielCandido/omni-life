import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Colors, Radius } from '../../utils/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
}

export const Card = ({ children, style, padding = 20 }: CardProps) => (
  <View
    style={[
      {
        backgroundColor: Colors.card,
        borderRadius: Radius.xl,
        padding,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
      },
      style,
    ]}
  >
    {children}
  </View>
);
