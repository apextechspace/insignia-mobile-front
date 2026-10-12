import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

const { width } = Dimensions.get('window');

export default function NotificationsScreen() {
  const { colors, fonts } = useTheme();
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(true);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.post(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date() } : n));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleClearAll = async () => {
    try {
      await api.post('/notifications/read-all');
      fetchNotifications();
    } catch (error) {
      console.error('Error clearing all:', error);
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text, fontFamily: fonts.heading }]}>Concierge Alerts</Text>
        <TouchableOpacity onPress={handleClearAll}>
          <Text style={[styles.markRead, { color: colors.tint, fontFamily: fonts.body }]}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.tint} />
        }
      >
        {loading ? (
          <ActivityIndicator size="large" color={colors.tint} style={{ marginTop: 100 }} />
        ) : notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={64} color={colors.border} />
            <Text style={[styles.emptyText, { color: colors.text, fontFamily: fonts.body }]}>No alerts at the moment.</Text>
          </View>
        ) : (
          notifications.map((item) => {
            const data = item.data;
            return (
              <TouchableOpacity 
                key={item.id} 
                onPress={() => handleMarkAsRead(item.id)}
                style={[
                  styles.notificationCard, 
                  { 
                    backgroundColor: colors.card, 
                    borderColor: item.read_at ? colors.border : colors.tint + '40',
                    opacity: item.read_at ? 0.7 : 1
                  }
                ]}
              >
                <View style={[styles.iconBox, { backgroundColor: item.read_at ? colors.border + '30' : colors.tint + '15' }]}>
                  <Ionicons 
                    name={data.icon || 'notifications-outline'} 
                    size={22} 
                    color={item.read_at ? colors.text : colors.tint} 
                  />
                </View>
                <View style={styles.info}>
                  <View style={styles.row}>
                    <Text style={[styles.title, { color: colors.text, fontFamily: fonts.heading }]}>{data.title}</Text>
                    {!item.read_at && <View style={[styles.unreadBadge, { backgroundColor: colors.tint }]} />}
                  </View>
                  <Text style={[styles.body, { color: colors.text, fontFamily: fonts.body, opacity: 0.8 }]} numberOfLines={2}>
                    {data.message}
                  </Text>
                  <Text style={[styles.time, { color: colors.text, fontFamily: fonts.body, opacity: 0.4 }]}>
                    {getTimeAgo(item.created_at)}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingTop: 60, 
    paddingBottom: 20 
  },
  backBtn: { width: 44, height: 44, justifyContent: 'center' },
  headerTitle: { fontSize: 18 },
  markRead: { fontSize: 13 },
  content: { padding: 20 },
  notificationCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 15,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  info: { flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  title: { fontSize: 15 },
  unreadBadge: { width: 8, height: 8, borderRadius: 4 },
  body: { fontSize: 13, lineHeight: 18, marginBottom: 8 },
  time: { fontSize: 11 },
  emptyState: { alignItems: 'center', paddingTop: 100 },
  emptyText: { marginTop: 20, fontSize: 15, opacity: 0.5 },
});
