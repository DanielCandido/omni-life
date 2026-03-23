import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { AppHeader } from '../../components/ui/AppHeader';
import { Card } from '../../components/ui/Card';
import { Colors, Spacing, Typography } from '../../utils/theme';
import { useAuthStore } from '../../store/auth.store';
import { scoringService } from '../../services/scoring.service';

interface StatItem { label: string; value: string; color: string; }
interface MenuItem { icon: string; label: string; onPress: () => void; danger?: boolean; }

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const [weeklyScore, setWeeklyScore] = useState({ totalPoints: 0, totalTasksCompleted: 0 });

  useEffect(() => {
    scoringService.getWeeklySummary()
      .then(data => setWeeklyScore(data))
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/sign-in');
        },
      },
    ]);
  };

  const stats: StatItem[] = [
    { label: 'Weekly Points', value: weeklyScore.totalPoints.toString(), color: Colors.primary },
    { label: 'Tasks Done', value: weeklyScore.totalTasksCompleted.toString(), color: Colors.success },
    { label: 'Day Streak', value: '7', color: '#F59E0B' },
  ];

  const menuGroups = [
    {
      title: 'Account',
      items: [
        { icon: 'person-outline', label: 'Edit Profile', onPress: () => {} },
        { icon: 'lock-closed-outline', label: 'Change Password', onPress: () => {} },
        { icon: 'notifications-outline', label: 'Notifications', onPress: () => {} },
      ],
    },
    {
      title: 'App',
      items: [
        { icon: 'flag-outline', label: 'Goals & Targets', onPress: () => {} },
        { icon: 'color-palette-outline', label: 'Appearance', onPress: () => {} },
        { icon: 'language-outline', label: 'Language', onPress: () => {} },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: 'help-circle-outline', label: 'Help & FAQ', onPress: () => {} },
        { icon: 'document-text-outline', label: 'Privacy Policy', onPress: () => {} },
        { icon: 'information-circle-outline', label: 'About', onPress: () => {} },
      ],
    },
  ];

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <View style={styles.root}>
      <AppHeader showBell={false} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{user?.name || 'User'}</Text>
          <Text style={styles.email}>{user?.email || ''}</Text>
        </View>

        <View style={styles.content}>
          {/* Stats */}
          <Card style={styles.card} padding={16}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              {stats.map((s, i) => (
                <React.Fragment key={s.label}>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 24, fontWeight: '700', color: s.color }}>{s.value}</Text>
                    <Text style={{ fontSize: 11, color: Colors.textMuted, marginTop: 3 }}>{s.label}</Text>
                  </View>
                  {i < stats.length - 1 && <View style={{ width: 1, backgroundColor: Colors.border }} />}
                </React.Fragment>
              ))}
            </View>
          </Card>

          {/* Score Progress Banner */}
          <View style={styles.scoreBanner}>
            <Ionicons name="trophy" size={22} color="#FFF9C4" style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>
                {weeklyScore.totalPoints} pts this week
              </Text>
              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>
                Keep completing tasks to earn more!
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.6)" />
          </View>

          {/* Menu Groups */}
          {menuGroups.map(group => (
            <View key={group.title} style={{ marginBottom: 20 }}>
              <Text style={styles.groupTitle}>{group.title}</Text>
              <Card padding={0} style={{ overflow: 'hidden' }}>
                {group.items.map((item, index) => (
                  <TouchableOpacity
                    key={item.label}
                    style={[
                      styles.menuItem,
                      index < group.items.length - 1 && styles.menuItemBorder,
                    ]}
                    onPress={item.onPress}
                  >
                    <View style={styles.menuIcon}>
                      <Ionicons name={item.icon as any} size={18} color={Colors.textSecondary} />
                    </View>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                    <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                  </TouchableOpacity>
                ))}
              </Card>
            </View>
          ))}

          {/* Sign Out */}
          <TouchableOpacity style={styles.signOutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={18} color={Colors.danger} style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.danger }}>Sign Out</Text>
          </TouchableOpacity>

          <Text style={styles.version}>OmniLife v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  profileHeader: { alignItems: 'center', paddingVertical: 24, paddingHorizontal: Spacing.md },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 28, fontWeight: '700', color: '#fff' },
  name: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary },
  email: { fontSize: 13, color: Colors.textMuted, marginTop: 4 },
  content: { paddingHorizontal: Spacing.md },
  card: { marginBottom: 16 },
  scoreBanner: {
    backgroundColor: Colors.primary,
    borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 20,
  },
  groupTitle: {
    fontSize: 12, fontWeight: '700', color: Colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 1,
    marginBottom: 8, marginLeft: 4,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  menuItemBorder: {
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  menuIcon: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: '#F9FAFB',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12,
  },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '500', color: Colors.textPrimary },
  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FFF0F0',
    borderRadius: 14, paddingVertical: 14,
    marginBottom: 16,
  },
  version: { textAlign: 'center', fontSize: 12, color: Colors.textMuted, marginBottom: 8 },
});
