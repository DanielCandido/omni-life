import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useAuthStore } from '../../store/auth.store';
import { useTasksStore } from '../../store/tasks.store';
import { scoringService } from '../../services/scoring.service';
import { formatDate } from '@omni-life/shared';

interface TodayScore {
  points: number;
  tasksCompleted: number;
}

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const { tasks, fetchTasks } = useTasksStore();
  const [todayScore, setTodayScore] = useState<TodayScore | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    const today = new Date().toISOString().split('T')[0];
    await fetchTasks({ date: today });
    try {
      const score = await scoringService.getTodayScore();
      setTodayScore(score);
    } catch {
      setTodayScore({ points: 0, tasksCompleted: 0 });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const pendingTasks = tasks.filter(t => t.status === 'PENDING');
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED');
  const todayStr = formatDate(new Date());

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header Banner */}
      <View className="bg-primary-600 px-6 pt-8 pb-10">
        <Text className="text-white text-lg font-medium">Good morning,</Text>
        <Text className="text-white text-3xl font-bold mt-1">{user?.name?.split(' ')[0]} 👋</Text>
        <Text className="text-primary-200 text-sm mt-2">{todayStr}</Text>
      </View>

      {/* Score Card */}
      <View className="mx-4 -mt-6 bg-white rounded-2xl shadow-sm p-5 flex-row justify-around">
        <View className="items-center">
          <Text className="text-3xl font-bold text-primary-600">{todayScore?.points ?? 0}</Text>
          <Text className="text-gray-500 text-sm mt-1">Points Today</Text>
        </View>
        <View className="w-px bg-gray-200" />
        <View className="items-center">
          <Text className="text-3xl font-bold text-success">{todayScore?.tasksCompleted ?? 0}</Text>
          <Text className="text-gray-500 text-sm mt-1">Completed</Text>
        </View>
        <View className="w-px bg-gray-200" />
        <View className="items-center">
          <Text className="text-3xl font-bold text-warning">{pendingTasks.length}</Text>
          <Text className="text-gray-500 text-sm mt-1">Pending</Text>
        </View>
      </View>

      {/* Today's Tasks */}
      <View className="mx-4 mt-6">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-bold text-gray-900">Today's Tasks</Text>
          <Text className="text-primary-600 text-sm font-medium">
            {completedTasks.length}/{tasks.length} done
          </Text>
        </View>

        {tasks.length === 0 ? (
          <View className="bg-white rounded-xl p-6 items-center">
            <Text className="text-4xl mb-2">✅</Text>
            <Text className="text-gray-500 text-center">No tasks for today. Add some!</Text>
          </View>
        ) : (
          tasks.slice(0, 5).map(task => (
            <View
              key={task.id}
              className="bg-white rounded-xl p-4 mb-2 flex-row items-center shadow-sm"
            >
              <View
                className={`w-3 h-3 rounded-full mr-3 ${
                  task.priority === 'HIGH'
                    ? 'bg-danger'
                    : task.priority === 'MEDIUM'
                      ? 'bg-warning'
                      : 'bg-success'
                }`}
              />
              <View className="flex-1">
                <Text
                  className={`font-medium text-gray-900 ${
                    task.status === 'COMPLETED' ? 'line-through text-gray-400' : ''
                  }`}
                >
                  {task.title}
                </Text>
                <Text className="text-gray-400 text-xs mt-0.5">+{task.points} pts</Text>
              </View>
              <Text
                className={`text-xs px-2 py-1 rounded-full ${
                  task.status === 'COMPLETED'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {task.status}
              </Text>
            </View>
          ))
        )}
      </View>

      {/* Quick Actions */}
      <View className="mx-4 mt-6 mb-8">
        <Text className="text-lg font-bold text-gray-900 mb-3">Quick Actions</Text>
        <View className="flex-row gap-3">
          {[
            { label: 'Log Meal', icon: '🥗', color: 'bg-green-100' },
            { label: 'Add Task', icon: '✅', color: 'bg-blue-100' },
            { label: 'Log Expense', icon: '💰', color: 'bg-yellow-100' },
          ].map(action => (
            <TouchableOpacity
              key={action.label}
              className={`flex-1 ${action.color} rounded-xl p-4 items-center`}
            >
              <Text className="text-2xl mb-1">{action.icon}</Text>
              <Text className="text-xs font-medium text-gray-700">{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
