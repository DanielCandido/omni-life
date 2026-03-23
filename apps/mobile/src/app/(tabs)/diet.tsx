import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/ui/AppHeader';
import { Card } from '../../components/ui/Card';
import { CircularProgress } from '../../components/ui/CircularProgress';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Colors, Spacing, Typography } from '../../utils/theme';
import { mealsService } from '../../services/meals.service';

const CALORIE_GOAL = 2200;
const PROTEIN_GOAL = 150; // g
const CARBS_GOAL = 275; // g
const FAT_GOAL = 73; // g

interface Meal {
  id: string;
  name: string;
  type: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  time: string;
}

export default function DietScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [meals, setMeals] = useState<Meal[]>([
    { id: '1', name: 'Oatmeal with Berries', type: 'BREAKFAST', calories: 350, protein: 12, carbs: 60, fat: 6, time: '07:30 AM' },
    { id: '2', name: 'Grilled Chicken Salad', type: 'LUNCH', calories: 480, protein: 42, carbs: 20, fat: 18, time: '12:30 PM' },
    { id: '3', name: 'Greek Yogurt', type: 'SNACK', calories: 150, protein: 15, carbs: 12, fat: 3, time: '03:00 PM' },
    { id: '4', name: 'Salmon & Veggies', type: 'DINNER', calories: 520, protein: 45, carbs: 30, fat: 22, time: '07:00 PM' },
  ]);
  const [totals, setTotals] = useState({ calories: 1500, protein: 114, carbs: 122, fat: 49 });

  const loadData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const data = await mealsService.getDailyNutrition(today);
      if (data?.meals?.length) {
        setMeals(data.meals.map((m: any) => ({
          ...m,
          time: new Date(m.loggedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        })));
        setTotals(data.totals || totals);
      }
    } catch { /* silent */ }
  };

  useEffect(() => { loadData(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const calorieProgress = Math.min(100, (totals.calories / CALORIE_GOAL) * 100);
  const remaining = Math.max(0, CALORIE_GOAL - totals.calories);
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase();

  const mealTypeColors: Record<string, string> = {
    BREAKFAST: '#F59E0B',
    LUNCH: Colors.success,
    SNACK: Colors.primary,
    DINNER: '#8B5CF6',
  };

  const mealTypeIcons: Record<string, string> = {
    BREAKFAST: 'sunny-outline',
    LUNCH: 'restaurant-outline',
    SNACK: 'nutrition-outline',
    DINNER: 'moon-outline',
  };

  return (
    <View style={styles.root}>
      <AppHeader />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroDate}>{dateStr}</Text>
          <Text style={styles.heroTitle}>Your nutrition{'\n'}at a glance.</Text>
        </View>

        <View style={styles.content}>
          {/* Daily Nutrition Ring Card */}
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
                size={120}
                strokeWidth={11}
                progress={calorieProgress}
                color="#1B5E20"
                trackColor="#E5E7EB"
              >
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 20, fontWeight: '700', color: Colors.textPrimary }}>
                    {totals.calories.toLocaleString()}
                  </Text>
                  <Text style={{ fontSize: 9, color: Colors.textMuted, marginTop: -1 }}>kcal</Text>
                </View>
              </CircularProgress>

              <View style={{ marginLeft: 20, flex: 1 }}>
                <Text style={styles.sectionLabel}>REMAINING</Text>
                <Text style={{ fontSize: 22, fontWeight: '700', color: Colors.textPrimary, marginTop: 2 }}>
                  {remaining.toLocaleString()} kcal
                </Text>

                <View style={{ marginTop: 12, gap: 6 }}>
                  {[
                    { name: 'PROTEIN', value: totals.protein, goal: PROTEIN_GOAL, color: Colors.success },
                    { name: 'CARBS', value: totals.carbs, goal: CARBS_GOAL, color: Colors.primary },
                    { name: 'FAT', value: totals.fat || 0, goal: FAT_GOAL, color: '#F59E0B' },
                  ].map(macro => (
                    <View key={macro.name}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                        <Text style={styles.macroLabel}>{macro.name}</Text>
                        <Text style={[styles.macroLabel, { color: Colors.textSecondary }]}>
                          {Math.round(macro.value)}g
                        </Text>
                      </View>
                      <ProgressBar
                        progress={Math.min(100, (macro.value / macro.goal) * 100)}
                        color={macro.color}
                        trackColor={Colors.border}
                        height={4}
                      />
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </Card>

          {/* Macro Summary Row */}
          <Card style={styles.card} padding={16}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              {[
                { label: 'Protein', value: totals.protein, goal: PROTEIN_GOAL, unit: 'g', color: Colors.success },
                { label: 'Carbs', value: totals.carbs, goal: CARBS_GOAL, unit: 'g', color: Colors.primary },
                { label: 'Fat', value: totals.fat || 0, goal: FAT_GOAL, unit: 'g', color: '#F59E0B' },
                { label: 'Calories', value: totals.calories, goal: CALORIE_GOAL, unit: 'kcal', color: '#8B5CF6' },
              ].map((m, i) => (
                <React.Fragment key={m.label}>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: m.color }}>{Math.round(m.value)}</Text>
                    <Text style={{ fontSize: 9, color: Colors.textMuted, marginTop: 1 }}>{m.unit}</Text>
                    <Text style={{ fontSize: 10, fontWeight: '600', color: Colors.textSecondary, marginTop: 4 }}>{m.label}</Text>
                  </View>
                  {i < 3 && <View style={{ width: 1, backgroundColor: Colors.border }} />}
                </React.Fragment>
              ))}
            </View>
          </Card>

          {/* Today's Meals */}
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Today's Meals</Text>
              <TouchableOpacity style={styles.addMealBtn}>
                <Ionicons name="add" size={16} color="#fff" />
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#fff', marginLeft: 4 }}>Log Meal</Text>
              </TouchableOpacity>
            </View>

            {meals.map((meal, index) => (
              <Card key={meal.id} style={{ marginBottom: index < meals.length - 1 ? 10 : 0 }} padding={14}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={[styles.mealIcon, { backgroundColor: mealTypeColors[meal.type] + '20' }]}>
                    <Ionicons
                      name={(mealTypeIcons[meal.type] || 'restaurant-outline') as any}
                      size={18}
                      color={mealTypeColors[meal.type] || Colors.primary}
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.textPrimary, flex: 1 }}>
                        {meal.name}
                      </Text>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.textPrimary }}>
                        {meal.calories} kcal
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 10 }}>
                      <View style={[styles.typeBadge, { backgroundColor: mealTypeColors[meal.type] + '15' }]}>
                        <Text style={{ fontSize: 10, fontWeight: '600', color: mealTypeColors[meal.type] }}>
                          {meal.type}
                        </Text>
                      </View>
                      <Text style={{ fontSize: 11, color: Colors.textMuted }}>{meal.time}</Text>
                      {meal.protein && (
                        <Text style={{ fontSize: 11, color: Colors.textMuted }}>P: {meal.protein}g</Text>
                      )}
                      {meal.carbs && (
                        <Text style={{ fontSize: 11, color: Colors.textMuted }}>C: {meal.carbs}g</Text>
                      )}
                    </View>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  hero: { paddingHorizontal: Spacing.md, paddingTop: 4, paddingBottom: 20 },
  heroDate: { fontSize: 10, fontWeight: '600', letterSpacing: 1, color: Colors.textMuted, marginBottom: 8, textTransform: 'uppercase' },
  heroTitle: { fontSize: 28, fontWeight: '700', color: Colors.textPrimary, lineHeight: 36 },
  content: { paddingHorizontal: Spacing.md },
  card: { marginBottom: 14 },
  sectionLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 1, color: Colors.textMuted, textTransform: 'uppercase' },
  cardTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginTop: 2 },
  macroLabel: { fontSize: 9, fontWeight: '600', letterSpacing: 0.5, color: Colors.textMuted, textTransform: 'uppercase' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  addMealBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
  },
  mealIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  fab: {
    position: 'absolute', bottom: 84, right: 20,
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
});
