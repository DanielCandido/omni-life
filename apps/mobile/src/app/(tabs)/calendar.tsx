import React, { useState, useEffect } from 'react';
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
import { tasksService } from '../../services/tasks.service';

const DAYS_OF_WEEK = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

// Days that have events (dot indicators) — illustrative
const EVENT_DAYS = [15, 21];

interface AgendaEvent {
  id: string;
  time: string;
  timeLabel: string;
  category: string;
  categoryColor: string;
  title: string;
  meta1?: string;
  meta2?: string;
  isActive?: boolean;
  isDone?: boolean;
}

export default function CalendarScreen() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [refreshing, setRefreshing] = useState(false);
  const [events, setEvents] = useState<AgendaEvent[]>([
    {
      id: '1', time: '09', timeLabel: 'AM', category: 'PERSONAL', categoryColor: Colors.success,
      title: 'Mindful Stretching', meta1: '45 min', meta2: 'Home Studio',
    },
    {
      id: '2', time: '11', timeLabel: 'AM', category: 'WORK FOCUS', categoryColor: Colors.primary,
      title: 'Architecture Review', meta1: '3 Participants', meta2: 'Link Attached',
      isActive: true,
    },
    {
      id: '3', time: '02', timeLabel: 'PM', category: 'HEALTH', categoryColor: '#F59E0B',
      title: 'Nutritional Planning', meta1: 'Weekly Prep', isDone: true,
    },
  ]);

  const loadTasks = async () => {
    try {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
      const tasks = await tasksService.getAll({ date: dateStr });
      if ((tasks as any[]).length > 0) {
        setEvents((tasks as any[]).slice(0, 4).map((t: any, i: number) => ({
          id: t.id,
          time: ['09','11','02','05'][i] || '09',
          timeLabel: i < 2 ? 'AM' : 'PM',
          category: t.priority === 'HIGH' ? 'WORK FOCUS' : i % 2 === 0 ? 'PERSONAL' : 'HEALTH',
          categoryColor: [Colors.success, Colors.primary, '#F59E0B', Colors.danger][i % 4],
          title: t.title,
          meta1: t.description || '45 min',
          isActive: i === 1,
          isDone: t.status === 'COMPLETED',
        })));
      }
    } catch { /* silent */ }
  };

  useEffect(() => { loadTasks(); }, [selectedDay, currentMonth]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const isToday = (day: number) =>
    day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();

  const calendarCells = [];
  for (let i = 0; i < firstDayOfMonth; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  const scheduledCount = events.length;

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
          <Text style={styles.heroTitle}>
            {'Your '}
            <Text style={{ color: Colors.primary }}>{dayName}</Text>
            {'\nat a glance'}
          </Text>
          <Text style={styles.heroSub}>{scheduledCount} events scheduled for today</Text>
        </View>

        <View style={styles.content}>
          {/* Calendar Card */}
          <Card style={styles.card}>
            {/* Month Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 17, fontWeight: '700', color: Colors.textPrimary }}>
                {MONTHS[currentMonth]} {currentYear}
              </Text>
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <TouchableOpacity onPress={prevMonth}>
                  <Ionicons name="chevron-back" size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={nextMonth}>
                  <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Day Labels */}
            <View style={styles.daysRow}>
              {DAYS_OF_WEEK.map(d => (
                <Text key={d} style={styles.dayLabel}>{d}</Text>
              ))}
            </View>

            {/* Calendar Grid */}
            <View style={styles.grid}>
              {calendarCells.map((day, index) => {
                if (!day) return <View key={`empty-${index}`} style={styles.cell} />;
                const selected = day === selectedDay;
                const todayDay = isToday(day);
                const hasEvent = EVENT_DAYS.includes(day);
                return (
                  <TouchableOpacity
                    key={day}
                    style={styles.cell}
                    onPress={() => setSelectedDay(day)}
                  >
                    <View style={[
                      styles.dayCircle,
                      selected && todayDay && styles.todayCircle,
                      selected && !todayDay && styles.selectedCircle,
                      !selected && todayDay && styles.todayRing,
                    ]}>
                      <Text style={[
                        styles.dayText,
                        (selected || todayDay) && { color: selected ? '#fff' : Colors.primary, fontWeight: '700' },
                      ]}>
                        {day}
                      </Text>
                    </View>
                    {hasEvent && !selected && (
                      <View style={styles.dot} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>

          {/* Current Event Card */}
          <Card style={styles.card} padding={16}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.textPrimary }}>Morning Review</Text>
                <Text style={{ fontSize: 13, color: Colors.textMuted, marginTop: 2 }}>Deep Focus Session</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
                  <View style={styles.eventAvatar}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: Colors.primary }}>DS</Text>
                  </View>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: Colors.primary, marginLeft: 'auto' }}>45 MIN LEFT</Text>
                </View>
              </View>
              <View style={styles.nowBadge}>
                <View style={styles.nowDot} />
                <Text style={styles.nowText}>NOW</Text>
              </View>
            </View>
          </Card>

          {/* Focus Balance */}
          <Card style={styles.card} padding={16}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <Text style={[styles.sectionLabel, { letterSpacing: 1.5 }]}>FOCUS BALANCE</Text>
              <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.primary }}>78%</Text>
            </View>
            <ProgressBar progress={78} color={Colors.primary} trackColor={Colors.border} height={8} />
            <Text style={{ fontSize: 12, fontStyle: 'italic', color: Colors.textMuted, marginTop: 10 }}>
              Consistency is key to the sanctuary.
            </Text>
          </Card>

          {/* Agenda Section */}
          <View style={{ marginTop: 4 }}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Agenda</Text>
              <TouchableOpacity>
                <Text style={styles.sectionLink}>VIEW ALL</Text>
              </TouchableOpacity>
            </View>

            {events.map((event, index) => (
              <EventRow key={event.id} event={event} isLast={index === events.length - 1} />
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

function EventRow({ event, isLast }: { event: AgendaEvent; isLast: boolean }) {
  if (event.isActive) {
    return (
      <View style={{ flexDirection: 'row', marginBottom: isLast ? 0 : 16 }}>
        {/* Time */}
        <View style={styles.timeBlock}>
          <Text style={styles.timeHour}>{event.time}</Text>
          <Text style={styles.timePeriod}>{event.timeLabel}</Text>
        </View>
        {/* Active Card (blue) */}
        <View style={[styles.agendaCard, styles.activeAgendaCard, { flex: 1 }]}>
          <Text style={{ fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.7)', letterSpacing: 1, textTransform: 'uppercase' }}>
            {event.category}
          </Text>
          <Text style={{ fontSize: 17, fontWeight: '700', color: '#fff', marginTop: 4 }}>{event.title}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 16 }}>
            {event.meta1 && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="people-outline" size={12} color="rgba(255,255,255,0.7)" />
                <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', marginLeft: 4 }}>{event.meta1}</Text>
              </View>
            )}
            {event.meta2 && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="link-outline" size={12} color="rgba(255,255,255,0.7)" />
                <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', marginLeft: 4 }}>{event.meta2}</Text>
              </View>
            )}
          </View>
          <View style={styles.arrowBtn}>
            <Ionicons name="arrow-up-forward" size={14} color={Colors.primary} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flexDirection: 'row', marginBottom: isLast ? 0 : 16 }}>
      {/* Time */}
      <View style={styles.timeBlock}>
        <Text style={styles.timeHour}>{event.time}</Text>
        <Text style={styles.timePeriod}>{event.timeLabel}</Text>
      </View>
      {/* Normal Row */}
      <View style={[styles.agendaCard, { flex: 1, backgroundColor: '#fff' }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: event.categoryColor, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 3 }}>
              {event.category}
            </Text>
            <Text style={{ fontSize: 15, fontWeight: '700', color: Colors.textPrimary }}>{event.title}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 12 }}>
              {event.meta1 && (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="time-outline" size={11} color={Colors.textMuted} />
                  <Text style={{ fontSize: 11, color: Colors.textMuted, marginLeft: 3 }}>{event.meta1}</Text>
                </View>
              )}
              {event.meta2 && (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="location-outline" size={11} color={Colors.textMuted} />
                  <Text style={{ fontSize: 11, color: Colors.textMuted, marginLeft: 3 }}>{event.meta2}</Text>
                </View>
              )}
            </View>
          </View>
          {event.isDone ? (
            <Ionicons name="checkmark" size={20} color={Colors.success} />
          ) : (
            <TouchableOpacity>
              <Ionicons name="ellipsis-horizontal" size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  hero: { paddingHorizontal: Spacing.md, paddingTop: 4, paddingBottom: 20 },
  heroTitle: { fontSize: 28, fontWeight: '700', color: Colors.textPrimary, lineHeight: 36 },
  heroSub: { fontSize: 13, color: Colors.textMuted, marginTop: 6 },
  content: { paddingHorizontal: Spacing.md },
  card: { marginBottom: 14 },
  sectionLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 1, color: Colors.textMuted, textTransform: 'uppercase' },
  daysRow: { flexDirection: 'row', marginBottom: 8 },
  dayLabel: { flex: 1, textAlign: 'center', fontSize: 10, fontWeight: '600', color: Colors.textMuted, letterSpacing: 0.5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '14.285%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 2 },
  dayCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  todayCircle: { backgroundColor: Colors.primary },
  selectedCircle: { backgroundColor: Colors.primaryLight },
  todayRing: { borderWidth: 1.5, borderColor: Colors.primary },
  dayText: { fontSize: 13, color: Colors.textPrimary },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.primary, position: 'absolute', bottom: 4 },
  nowBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#DCFCE7',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  nowDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.success, marginRight: 4 },
  nowText: { fontSize: 11, fontWeight: '700', color: Colors.success },
  eventAvatar: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary },
  sectionLink: { fontSize: 11, fontWeight: '700', color: Colors.primary, letterSpacing: 0.5 },
  timeBlock: { width: 44, alignItems: 'flex-start', paddingTop: 4 },
  timeHour: { fontSize: 18, fontWeight: '700', color: Colors.primary, lineHeight: 20 },
  timePeriod: { fontSize: 10, color: Colors.textMuted, fontWeight: '500', letterSpacing: 0.3 },
  agendaCard: {
    borderRadius: 16, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  activeAgendaCard: { backgroundColor: Colors.primary, position: 'relative' },
  arrowBtn: {
    position: 'absolute', right: 14, top: 14,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
  },
  fab: {
    position: 'absolute', bottom: 84, right: 20,
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
});
