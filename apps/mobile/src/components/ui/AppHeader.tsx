import React from 'react';
import { View, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography } from '../../utils/theme';

interface AppHeaderProps {
  title?: string;
  showBell?: boolean;
  showPlus?: boolean;
  onBellPress?: () => void;
  onPlusPress?: () => void;
  style?: ViewStyle;
}

export const AppHeader = ({
  title = 'OmniLife',
  showBell = true,
  showPlus = true,
  onBellPress,
  onPlusPress,
  style,
}: AppHeaderProps) => (
  <View
    style={[
      {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 14,
        backgroundColor: Colors.background,
      },
      style,
    ]}
  >
    {/* Avatar */}
    <View
      style={{
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F4A896',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
      }}
    >
      <Ionicons name="person" size={18} color="#C2604C" />
    </View>

    {/* Title */}
    <Text
      style={{
        ...Typography.subtitle,
        color: Colors.primary,
        flex: 1,
        fontWeight: '700',
      }}
    >
      {title}
    </Text>

    {/* Right Actions */}
    {showBell && (
      <TouchableOpacity onPress={onBellPress} style={{ marginRight: 12 }}>
        <Ionicons name="notifications-outline" size={22} color={Colors.textPrimary} />
      </TouchableOpacity>
    )}
    {showPlus && (
      <TouchableOpacity
        onPress={onPlusPress}
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: Colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name="add" size={20} color="#fff" />
      </TouchableOpacity>
    )}
  </View>
);
