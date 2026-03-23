import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '../../store/auth.store';
import { scoringService } from '../../services/scoring.service';
import { mealsService } from '../../services/meals.service';
import { transactionsService } from '../../services/transactions.service';
import { tasksService } from '../../services/tasks.service';
import { AppHeader } from '../../components/ui/AppHeader';
import { Card } from '../../components/ui/Card';
import { CircularProgress } from '../../components/ui/CircularProgress';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Colors, Typography, Spacing } from '../../utils/theme';

const DAILY_CALORIE_GOAL = 2200;

export default function DashboardScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [nutrition, setNutrition] = useState({ calories: 1640, protein: 35, carbs: 120 });
  const [balance, setBalance] = useState({ income: 8400, expenses: 3120, daily: 84.20 });
  const [agenda, setAgenda] = useState([
    { id: '1', time: '10:30 AM', category: 'WORK FOCUS', title: 'Product Sync', subtitle: 'The Sanctuary Redesign', icon: 'briefcase-outline', isNow: true },
    { id: '2', time: '02:00 PM', category: 'HEALTH', title: 'HIIT Session', subtitle: 'Wellness Center', icon: 'fitness-outline', isNow: true },
    { id: '3', time: '07:30 PM', category: 'PERSONAL', title: 'Dinner with Sarah', subtitle: 'Blue Moon Bistro', icon: 'restaurant-outline', isNow: false },
  ]);

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase();

  const loadData = async () => {
    try {
      const [nutritionData, summary, tasks] = await Promise.allSettled([
        mealsService.getDailyNutrition(),
        transactionsService.getMonthlySummary(),
        tasksService.getAll(),
      ]);

      if (nutritionData.status === 'fulfilled') {
        const t = nutritionData.value?.totals || {};
        if (t.calories) setNutrition({ calories: t.calories, protein: t.protein || 0, carbs: t.carbs || 0 });
      }
      if (summary.status === 'fulfilled') {
        const s = summary.value;
        setBalance({ income: s.income || 0, expenses: s.expenses || 0, daily: (s.expenses || 0) / 30 });
      }
      if (tasks.status === 'fulfilled') {
        const list = (tasks.value as any[]).slice(0, 3);
        if (list.length > 0) {
          setAgenda(list.map((t: any, i: number) => ({
            id: t.id,
            time: ['10:30 AM', '02:00 PM', '07:30 PM'][i] || '12:00 PM',
            category: t.priority === 'HIGH' ? 'WORK FOCUS' : 'PERSONAL',
            title: t.title,
            subtitle: t.description || 'No description',
            icon: 'calendar-outline',
            isNow: i < 2,
          })));
        }
      }
    } catch { /* silent */ }
  };

  useEffect(() => { loadData(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const calorieProgress = Math.min(100, (nutrition.calories / DAILY_CALORIE_GOAL) * 100);
  const remaining = Math.max(0, DAILY_CALORIE_GOAL - nutrition.calories);
  const totalBalance = balance.income - balance.expenses;

  return (
    <View style={styles.root}>
      <AppHeader />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroDate}>{dateStr}</Text>
          <Text style={styles.heroTitle}>Your morning at a{'\n'}glance.</Text>
        </View>

        <View style={styles.content}>
          {/* Active Focus Card */}
          <Card style={styles.card}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <Ionicons name="flash" size={14} color={Colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.sectionLabel}>ACTIVE FOCUS</Text>
            </View>
            <Text style={styles.cardTitle}>Deep Work Session</Text>
            <Text style={styles.cardSub}>Started 42 minutes ago • Ends in 18m</Text>
            <View style={{ marginTop: 14 }}>
              <View style={styles.focusAvatar}>
                <Ionicons name="timer-outline" size={18} color={Colors.primary} />
              </View>
            </View>
          </Card>

          {/* Nutrition Card */}
          <Card style={styles.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <View>
                <Text style={[styles.sectionLabel, { color: Colors.success }]}>NUTRITION</Text>
                <Text style={styles.cardTitle}>Daily Fuel</Text>
              </View>
              <Ionicons name="restaurant-outline" size={20} color={Colors.textMuted} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <CircularProgress
                size={110}
                strokeWidth={10}
                progress={calorieProgress}
                color="#1B5E20"
                trackColor="#E5E7EB"
              >
                <View style={{ alignItems: 'center' }}>
                  <Text style={styles.ringValue}>{Math.round(nutrition.calories).toLocaleString()}</Text>
                  <Text style={styles.ringUnit}>kcal</Text>
                </View>
              </CircularProgress>

              <View style={{ marginLeft: 20, flex: 1 }}>
                <Text style={styles.sectionLabel}>REMAINING</Text>
                <Text style={{ fontSize: 20, fontWeight: '700', color: Colors.textPrimary, marginTop: 2 }}>
                  {remaining.toLocaleString()} kcal
                </Text>
                <View style={{ marginTop: 12, gap: 6 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={styles.macroLabel}>PROTEIN</Text>
                    <Text style={styles.macroLabel}>CARBS</Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <ProgressBar progress={Math.min(100, (nutrition.protein / 50) * 100)} color={Colors.success} height={5} style={{ flex: 1 }} />
                    <ProgressBar progress={Math.min(100, (nutrition.carbs / 200) * 100)} color={Colors.primary} height={5} style={{ flex: 1 }} />
                  </View>
                </View>
              </View>
            </View>
          </Card>

          {/* Finance Capital Card */}
          <Card style={styles.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Text style={styles.sectionLabel}>FINANCE</Text>
              <Ionicons name="wallet-outline" size={20} color={Colors.textMuted} />
            </View>
            <Text style={styles.cardTitle}>Capital</Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginTop: 10 }}>
              <Text style={{ fontSize: 32, fontWeight: '700', color: Colors.textPrimary }}>
                ${Math.abs(totalBalance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
              <Text style={{ fontSize: 10, color: Colors.textMuted, marginLeft: 4, marginBottom: 6 }}>USD</Text>
            </View>
            <Text style={{ ...Typography.caption, color: Colors.textMuted }}>Available Balance</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
              <Text style={{ ...Typography.body, color: Colors.textSecondary }}>Daily Spend</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.danger }}>
                -${balance.daily.toFixed(2)}
              </Text>
            </View>
            <ProgressBar progress={42} color="#374151" trackColor={Colors.border} height={6} style={{ marginTop: 10 }} />
          </Card>

          {/* Upcoming Agenda */}
          <View style={{ marginTop: 4 }}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming{'\n'}Agenda</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/calendar')}>
                <Text style={styles.sectionLink}>VIEW{'\n'}CALENDAR</Text>
              </TouchableOpacity>
            </View>

            {agenda.map((item, index) => (
              <Card
                key={item.id}
                style={{ marginBottom: index < agenda.length - 1 ? 10 : 0 }}
                padding={16}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <View style={{
                    paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20,
                    backgroundColor: item.isNow ? '#DCFCE7' : '#F3F4F6',
                  }}>
                    <Text style={{ fontSize: 11, fontWeight: '600', color: item.isNow ? Colors.success : Colors.textMuted }}>
                      {item.time}
                    </Text>
                  </View>
                  <Ionicons name={item.icon as any} size={16} color={Colors.textMuted} />
                </View>
                <Text style={{ fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 }}>
                  {item.title}
                </Text>
                <Text style={{ fontSize: 12, color: Colors.textMuted }}>{item.subtitle}</Text>
              </Card>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  hero: { paddingHorizontal: Spacing.md, paddingTop: 4, paddingBottom: 20 },
  heroDate: { fontSize: 10, fontWeight: '600', letterSpacing: 1, color: Colors.textMuted, marginBottom: 8, textTransform: 'uppercase' },
  heroTitle: { fontSize: 30, fontWeight: '700', color: Colors.textPrimary, lineHeight: 38 },
  content: { paddingHorizontal: Spacing.md },
  card: { marginBottom: 14 },
  sectionLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 1, color: Colors.textMuted, textTransform: 'uppercase' },
  cardTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginTop: 2 },
  cardSub: { fontSize: 12, color: Colors.textMuted, marginTop: 4 },
  focusAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  ringValue: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  ringUnit: { fontSize: 9, color: Colors.textMuted, marginTop: -2 },
  macroLabel: { fontSize: 9, fontWeight: '600', letterSpacing: 0.5, color: Colors.textMuted },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  sectionLink: { fontSize: 10, fontWeight: '700', color: Colors.primary, letterSpacing: 0.5, textAlign: 'right', textTransform: 'uppercase' },
});
