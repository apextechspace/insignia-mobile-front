import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    title: 'Order Delivered',
    body: 'Your Midnight Oud Candle has been delivered to Room 401.',
    time: '2 mins ago',
    type: 'order',
    read: false,
  },
  {
    id: '2',
    title: 'Massage Confirmed',
    body: 'Your 5:00 PM Swedish Massage is confirmed. Our specialist will arrive shortly.',
    time: '1 hour ago',
    type: 'service',
    read: true,
  },
  {
    id: '3',
    title: 'Welcome to Insignia',
    body: 'We are delighted to have you. Explore our premium boutique and concierge services.',
    time: '5 hours ago',
    type: 'system',
    read: true,
  },
];

export default function NotificationsScreen() {
  const { colors, fonts } = useTheme();
  const router = useRouter();

  const getIcon = (type: string) => {
    switch (type) {
      case 'order': return 'cart-outline';
      case 'service': return 'leaf-outline';
      default: return 'notifications-outline';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text, fontFamily: fonts.heading }]}>Concierge Alerts</Text>
        <TouchableOpacity>
          <Text style={[styles.markRead, { color: colors.tint, fontFamily: fonts.body }]}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {MOCK_NOTIFICATIONS.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={64} color={colors.border} />
            <Text style={[styles.emptyText, { color: colors.text, fontFamily: fonts.body }]}>No alerts at the moment.</Text>
          </View>
        ) : (
          MOCK_NOTIFICATIONS.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.notificationCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={[styles.iconBox, { backgroundColor: item.read ? colors.border + '30' : colors.tint + '15' }]}>
                <Ionicons name={getIcon(item.type)} size={22} color={item.read ? colors.text : colors.tint} />
              </View>
              <View style={styles.info}>
                <View style={styles.row}>
                  <Text style={[styles.title, { color: colors.text, fontFamily: fonts.heading, opacity: item.read ? 0.7 : 1 }]}>{item.title}</Text>
                  {!item.read && <View style={[styles.unreadBadge, { backgroundColor: colors.tint }]} />}
                </View>
                <Text style={[styles.body, { color: colors.text, fontFamily: fonts.body, opacity: 0.6 }]} numberOfLines={2}>
                  {item.body}
                </Text>
                <Text style={[styles.time, { color: colors.text, fontFamily: fonts.body, opacity: 0.4 }]}>{item.time}</Text>
              </View>
            </TouchableOpacity>
          ))
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
