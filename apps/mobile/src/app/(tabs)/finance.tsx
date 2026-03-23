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
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Colors, Spacing, Typography } from '../../utils/theme';
import { transactionsService } from '../../services/transactions.service';

interface Transaction {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  icon: string;
  iconBg: string;
}

interface SavingsGoal {
  id: string;
  name: string;
  progress: number;
}

interface SpendingCategory {
  name: string;
  amount: number;
  max: number;
  color: string;
  icon: string;
}

export default function FinanceScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState({ income: 8400, expenses: 3120, balance: 24582.40 });
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: '1', title: 'Whole Foods', subtitle: 'TODAY, 2:45 PM', amount: -124.50, type: 'EXPENSE', icon: 'cart-outline', iconBg: '#F3F4F6' },
    { id: '2', title: 'Stripe Payout', subtitle: 'YESTERDAY', amount: 2400.00, type: 'INCOME', icon: 'briefcase-outline', iconBg: '#F3F4F6' },
    { id: '3', title: 'Shell Gas', subtitle: 'OCT 24', amount: -68.00, type: 'EXPENSE', icon: 'car-outline', iconBg: '#F3F4F6' },
  ]);
  const [categories] = useState<SpendingCategory[]>([
    { name: 'Dining & Drinks', amount: 840, max: 1200, color: Colors.primary, icon: 'restaurant-outline' },
    { name: 'Housing', amount: 1200, max: 1200, color: '#374151', icon: 'home-outline' },
    { name: 'Lifestyle', amount: 450, max: 1200, color: Colors.success, icon: 'bag-outline' },
  ]);
  const [goals] = useState<SavingsGoal[]>([
    { id: '1', name: 'New Tesla S', progress: 70 },
    { id: '2', name: 'Japan Trip', progress: 45 },
  ]);

  const loadData = async () => {
    try {
      const data = await transactionsService.getMonthlySummary();
      const recent = await transactionsService.getAll({ endDate: new Date().toISOString() });
      setSummary({
        income: data.income || 8400,
        expenses: data.expenses || 3120,
        balance: (data.income || 8400) - (data.expenses || 3120) + 20000,
      });
      const list = (recent as any[]).slice(0, 3);
      if (list.length > 0) {
        setTransactions(list.map((t: any) => ({
          id: t.id,
          title: t.title,
          subtitle: new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          amount: t.type === 'INCOME' ? t.amount : -t.amount,
          type: t.type,
          icon: t.type === 'INCOME' ? 'briefcase-outline' : 'cart-outline',
          iconBg: '#F3F4F6',
        })));
      }
    } catch { /* silent */ }
  };

  useEffect(() => { loadData(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const fmt = (n: number, plus = false) => {
    const s = Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (plus && n >= 0) return `+$${s}`;
    if (n < 0) return `-$${s}`;
    return `$${s}`;
  };

  return (
    <View style={styles.root}>
      <AppHeader />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        <View style={styles.content}>
          {/* Total Balance Card */}
          <Card style={styles.card} padding={24}>
            <Text style={styles.sectionLabel}>TOTAL BALANCE</Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginTop: 6 }}>
              <Text style={{ fontSize: 38, fontWeight: '700', color: Colors.textPrimary }}>
                ${Math.floor(summary.balance).toLocaleString()}.
              </Text>
              <Text style={{ fontSize: 20, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 }}>
                {String(Math.round((summary.balance % 1) * 100)).padStart(2, '0')}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 24, marginTop: 14 }}>
              <View>
                <Text style={{ fontSize: 10, fontWeight: '600', color: Colors.success, letterSpacing: 0.5, marginBottom: 2 }}>INCOME</Text>
                <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.success }}>+${summary.income.toLocaleString()}</Text>
              </View>
              <View>
                <Text style={{ fontSize: 10, fontWeight: '600', color: Colors.danger, letterSpacing: 0.5, marginBottom: 2 }}>EXPENSES</Text>
                <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.danger }}>-${summary.expenses.toLocaleString()}</Text>
              </View>
            </View>
          </Card>

          {/* Top Spending */}
          <Card style={styles.card}>
            <View style={styles.sectionHeader}>
              <Text style={styles.cardTitle}>Top Spending</Text>
              <Text style={styles.sectionLabel}>THIS MONTH</Text>
            </View>
            <View style={{ gap: 16, marginTop: 6 }}>
              {categories.map(cat => (
                <View key={cat.name}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <View style={styles.catIcon}>
                      <Ionicons name={cat.icon as any} size={18} color={Colors.textSecondary} />
                    </View>
                    <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: Colors.textPrimary, marginLeft: 12 }}>
                      {cat.name}
                    </Text>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.textPrimary }}>
                      ${cat.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Text>
                  </View>
                  <ProgressBar
                    progress={(cat.amount / cat.max) * 100}
                    color={cat.color}
                    trackColor={Colors.border}
                    height={5}
                  />
                </View>
              ))}
            </View>
          </Card>

          {/* Savings Goals (blue card) */}
          <View style={styles.savingsCard}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 4 }}>Savings Goals</Text>
            <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 20 }}>Saving for the future</Text>
            {goals.map(goal => (
              <View key={goal.id} style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>{goal.name}</Text>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.8)' }}>{goal.progress}%</Text>
                </View>
                <ProgressBar
                  progress={goal.progress}
                  color="#fff"
                  trackColor="rgba(255,255,255,0.25)"
                  height={6}
                />
              </View>
            ))}
            <TouchableOpacity style={styles.addGoalBtn}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.primary }}>Add Goal</Text>
            </TouchableOpacity>
          </View>

          {/* Recent Activity */}
          <View style={{ marginTop: 6 }}>
            <View style={styles.sectionHeader}>
              <Text style={styles.cardTitle}>Recent Activity</Text>
              <TouchableOpacity>
                <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.primary, letterSpacing: 0.5 }}>VIEW ALL</Text>
              </TouchableOpacity>
            </View>
            <View style={{ gap: 10 }}>
              {transactions.map(t => (
                <Card key={t.id} padding={14}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={[styles.txIcon, { backgroundColor: t.iconBg }]}>
                      <Ionicons name={t.icon as any} size={18} color={Colors.textSecondary} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.textPrimary }}>{t.title}</Text>
                      <Text style={{ fontSize: 11, color: Colors.textMuted, marginTop: 2 }}>{t.subtitle}</Text>
                    </View>
                    <Text style={{
                      fontSize: 15, fontWeight: '700',
                      color: t.amount >= 0 ? Colors.success : Colors.danger,
                    }}>
                      {fmt(t.amount, t.amount >= 0)}
                    </Text>
                  </View>
                </Card>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.md, paddingTop: 8, paddingBottom: 32 },
  card: { marginBottom: 14 },
  sectionLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 1, color: Colors.textMuted, textTransform: 'uppercase' },
  cardTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  catIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#F9FAFB',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  savingsCard: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
  },
  addGoalBtn: {
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  txIcon: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
});
