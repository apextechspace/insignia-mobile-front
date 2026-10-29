import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList, Dimensions } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useWishlist } from '../../hooks/useWishlist';
import { useFocusEffect } from '@react-navigation/native';
import { bookingService, type BookingResponse } from '../../services/bookings';
import { productService } from '../../services/products';
import { sessionService } from '../../services/session';

import { authService } from '../../services/auth';
import api from '../../services/api';

const { width } = Dimensions.get('window');

const SERVICES = [
  { id: '1', title: 'Rooms and Suites', icon: 'bed-outline', type: 'ion', route: '/(tabs)/suites', gradient: ['#4A0E2E', '#5D1031'] },
  { id: '2', title: 'Dining', icon: 'restaurant-outline', type: 'ion', route: '/(tabs)/services', category: 'Dining', gradient: ['#8E44AD', '#A569BD'] },
  { id: '9', title: 'Concierge', icon: 'walk-outline', type: 'ion', route: '/(tabs)/services', category: 'Concierge', gradient: ['#1ABC9C', '#16A085'] },
  { id: '3', title: 'Wellness', icon: 'leaf-outline', type: 'ion', route: '/(tabs)/services', category: 'Wellness', gradient: ['#27AE60', '#58D68D'] },
  { id: '10', title: 'Experiences', icon: 'sparkles-outline', type: 'ion', route: '/(tabs)/services', category: 'Experiences', gradient: ['#D4AF37', '#996515'] },
  { id: '12', title: 'Transport', icon: 'car-outline', type: 'ion', route: '/(tabs)/services', category: 'Transport', gradient: ['#34495E', '#1C2833'] },
  { id: '8', title: 'Shop', icon: 'cart-outline', type: 'ion', route: '/(tabs)/shop', gradient: ['#F39C12', '#E67E22'] },
  { id: '6', title: 'Workspace', icon: 'laptop-outline', type: 'ion', route: '/(tabs)/services', category: 'Workspace', gradient: ['#2C3E50', '#566573'] },
  { id: '13', title: 'Interiors', icon: 'brush-outline', type: 'ion', route: '/(tabs)/services', category: 'Interiors', gradient: ['#7D6608', '#AF9014'] },
];

export default function HomeScreen() {
  const { colors, fonts } = useTheme();
  const router = useRouter();

  const [userProfile, setUserProfile] = React.useState<any>(null);
  const [activeStay, setActiveStay] = React.useState<BookingResponse | null>(null);
  const [featuredProducts, setFeaturedProducts] = React.useState<any[]>([]);
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [unreadCount, setUnreadCount] = React.useState(0);

  useFocusEffect(React.useCallback(() => {
    let active = true;
    const fetchData = async () => {
      setUserProfile(null);
      setActiveStay(null);
      setUnreadCount(0);
      productService.getAllProducts().then(products => {
        if (active) setFeaturedProducts(products.slice(0, 3));
      }).catch(() => { if (active) setFeaturedProducts([]); });
      if (!(await sessionService.getToken())) return;
      try {
        const [userData, notifData, stays] = await Promise.all([
          authService.getUser(),
          api.get('/notifications'),
          bookingService.getMyBookings(),
        ]);
        if (!active) return;
        setUserProfile(userData);
        setActiveStay(stays.find(stay => stay.paid_at && stay.checked_in_at && !stay.checked_out_at
          && ['confirmed', 'paid'].includes(stay.status)) || null);
        const unread = notifData.data.data.filter((n: any) => !n.read_at).length;
        setUnreadCount(unread);
      } catch (error) {
        console.log('Guest user or session expired');
      }
    };
    fetchData();
    return () => { active = false; };
  }, []));

  const renderServiceCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.cardWrapper}
      onPress={() => {
        if (item.category) {
          router.push({ pathname: item.route, params: { category: item.category } });
        } else {
          router.push(item.route);
        }
      }}
    >
      <LinearGradient
        colors={[colors.card, colors.card]}
        style={[styles.card, { borderColor: colors.border }]}
      >
        <LinearGradient
          colors={item.gradient}
          style={styles.iconCircle}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {item.type === 'ion' ? (
            <Ionicons name={item.icon} size={24} color="#FFF" />
          ) : (
            <MaterialCommunityIcons name={item.icon} size={24} color="#FFF" />
          )}
        </LinearGradient>
        <Text style={[styles.cardTitle, { color: colors.text, fontFamily: fonts.body }]} numberOfLines={1}>
          {item.title}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.text, fontFamily: fonts.body }]}>Dear</Text>
          <Text style={[styles.userName, { color: colors.tint, fontFamily: fonts.heading }]}>
            {userProfile?.name || 'Distinguished Guest'}
          </Text>
        </View>
        <TouchableOpacity 
          style={[styles.notificationBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
          onPress={() => router.push('/management/notifications')}
        >
          <Ionicons name="notifications-outline" size={22} color={colors.text} />
          {unreadCount > 0 && <View style={[styles.notificationDot, { backgroundColor: '#E74C3C' }]} />}
        </TouchableOpacity>
      </View>

      {activeStay && (
        <View style={styles.keycardContainer}>
          <LinearGradient
            colors={[colors.tint, '#5D1031']}
            style={styles.keycardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.keycardHeader}>
              <View style={styles.keycardIconBox}>
                <Ionicons name="key" size={22} color={colors.tint} />
              </View>
              <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={[styles.keycardLabel, { fontFamily: fonts.button }]}>YOUR CURRENT STAY</Text>
                <Text style={[styles.keycardSuit, { fontFamily: fonts.heading }]}>{activeStay.room?.name || 'Your Suite'}</Text>
              </View>
              <View style={styles.timerBadge}>
                <Ionicons name="time" size={12} color="#FFF" style={{ marginRight: 4 }} />
                <Text style={[styles.keycardTimer, { fontFamily: fonts.button }]}>Checked in</Text>
              </View>
            </View>

            <View style={styles.keycardCodeRow}>
              <Text style={[styles.keycardSub, { fontFamily: fonts.body }]}>Departure: {activeStay.check_out}</Text>
              <Text style={[styles.keycardSub, { fontFamily: fonts.body }]}>Please contact reception for room access assistance.</Text>
            </View>

            <TouchableOpacity style={styles.keycardBtn} onPress={() => router.push('/management/bookings')}>
              <Ionicons name="calendar-outline" size={18} color={colors.tint} style={{ marginRight: 8 }} />
              <Text style={[styles.keycardBtnText, { color: colors.tint, fontFamily: fonts.button }]}>VIEW MY STAYS</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      )}

      <View style={styles.promoContainer}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=80' }}
          style={styles.promoImage}
        />
        <LinearGradient
          colors={['transparent', 'rgba(75, 29, 63, 0.9)']}
          style={styles.promoOverlay}
        >
          <View style={styles.promoLabel}>
            <Text style={[styles.promoLabelText, { fontFamily: fonts.button }]}>A Note from Us</Text>
          </View>
          <Text style={[styles.promoTitle, { fontFamily: fonts.heading }]}>Welcome To Insignia Court</Text>
          <Text style={[styles.promoSub, { fontFamily: fonts.body }]}>Comfort and function, carefully aligned.</Text>
          <TouchableOpacity style={styles.promoBtn} onPress={() => router.push('/about')}>
            <Text style={[styles.promoBtnText, { color: '#FFF', fontFamily: fonts.button }]}>View Details</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFF" style={{ marginLeft: 5 }} />
          </TouchableOpacity>
        </LinearGradient>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fonts.heading }]}>Our Service Offerings</Text>
          <Text style={[styles.viewAll, { color: colors.tint, fontFamily: fonts.body, opacity: 0.6 }]}>QUICK ACCESS</Text>
        </View>
        <FlatList
          data={SERVICES}
          renderItem={renderServiceCard}
          keyExtractor={(item) => item.id}
          numColumns={3}
          key={3}
          scrollEnabled={false}
          columnWrapperStyle={styles.row}
        />
      </View>

      <View style={styles.bottomSection}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fonts.heading }]}>Shop Selection</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/shop')}>
            <Text style={[styles.viewAll, { color: colors.tint, fontFamily: fonts.body }]}>View Shop</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
          {featuredProducts.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.productCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push(`/shop/${item.id}`)}
            >
              <View style={styles.productImageWrapper}>
                <Image
                  source={{ uri: item.image_url }}
                  style={styles.productImage}
                />
                <View style={[styles.productBadge, { backgroundColor: colors.tint + '20' }]}>
                  <Text style={[styles.productBadgeText, { color: colors.tint, fontFamily: fonts.button }]}>NEW</Text>
                </View>
                <TouchableOpacity 
                  style={styles.wishlistBtn}
                  onPress={() => toggleWishlist(String(item.id))}
                >
                  <Ionicons 
                    name={isInWishlist(String(item.id)) ? "heart" : "heart-outline"}
                    size={16} 
                    color={isInWishlist(String(item.id)) ? colors.tint : "#FFF"}
                  />
                </TouchableOpacity>
              </View>
              <Text style={[styles.productName, { color: colors.text, fontFamily: fonts.body }]} numberOfLines={1}>{item.name}</Text>
              <View style={styles.productFooter}>
                <Text style={[styles.productPrice, { color: colors.tint, fontFamily: fonts.button }]}>₦{Number(item.price).toLocaleString()}</Text>
                <Ionicons name="add-circle" size={24} color={colors.tint} />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 25,
    paddingTop: 65,
    paddingBottom: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 13,
    letterSpacing: 1,
    opacity: 0.5,
    textTransform: 'uppercase',
  },
  userName: {
    fontSize: 26,
    marginTop: 2,
  },
  notificationBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 13,
    right: 14,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  keycardContainer: {
    marginHorizontal: 25,
    marginBottom: 25,
    borderRadius: 28,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#4B1D3F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  keycardGradient: {
    padding: 24,
  },
  keycardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  keycardIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keycardLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    letterSpacing: 1,
  },
  keycardSuit: {
    color: '#FFF',
    fontSize: 15,
    marginTop: 2,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  keycardTimer: {
    color: '#FFF',
    fontSize: 12,
  },
  keycardCodeRow: {
    alignItems: 'center',
    marginBottom: 25,
  },
  keycardPIN: {
    color: '#FFF',
    fontSize: 34,
    letterSpacing: 8,
  },
  keycardSub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    marginTop: 4,
  },
  keycardBtn: {
    backgroundColor: '#FFF',
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keycardBtnText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  promoContainer: {
    marginHorizontal: 25,
    height: 240,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#4B1D3F',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
    marginBottom: 35,
  },
  promoImage: {
    width: '100%',
    height: '100%',
  },
  promoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    padding: 25,
    justifyContent: 'flex-end',
  },
  promoLabel: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  promoLabelText: {
    color: '#FFF',
    fontSize: 10,
    letterSpacing: 1,
  },
  promoTitle: {
    color: '#FFF',
    fontSize: 28,
    marginBottom: 5,
  },
  promoSub: {
    color: '#FFF',
    fontSize: 15,
    marginBottom: 20,
    opacity: 0.8,
  },
  promoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  promoBtnText: {
    fontSize: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#FFF',
  },
  section: {
    paddingHorizontal: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
  },
  viewAll: {
    fontSize: 11,
    opacity: 0.8,
    letterSpacing: 0.5,
  },
  row: {
    justifyContent: 'space-between',
  },
  cardWrapper: {
    width: '31%',
    marginBottom: 20,
  },
  card: {
    padding: 15,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  bottomSection: {
    paddingVertical: 35,
  },
  horizontalScroll: {
    paddingLeft: 25,
  },
  productCard: {
    width: 180,
    padding: 10,
    borderRadius: 24,
    borderWidth: 1,
    marginRight: 20,
  },
  productImageWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  productImage: {
    width: '100%',
    height: 140,
    borderRadius: 18,
  },
  productBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  productBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  productName: {
    fontSize: 14,
    marginBottom: 8,
    paddingHorizontal: 5,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingBottom: 5,
  },
  productPrice: {
    fontSize: 16,
  },
  wishlistBtn: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});
