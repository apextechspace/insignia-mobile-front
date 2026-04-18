import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { roomService } from '../../services/rooms';
import { getAmenityData } from '../../utils/amenities';

export default function RoomSelectionScreen() {
  const { colors, fonts } = useTheme();
  const router = useRouter();
  const [rooms, setRooms] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      const data = await roomService.getAllRooms();
      setRooms(data);
    } catch (error) {
      console.error('Failed to load rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupedRooms = useMemo(() => {
    const groups: { [key: string]: any[] } = {};
    rooms.forEach(room => {
      const type = room.type || 'Other';
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(room);
    });
    
    // Sort groups in desired order
    const order = ['Standard Room', 'Executive Room', 'Suite'];
    return Object.keys(groups)
      .sort((a, b) => order.indexOf(a) - order.indexOf(b))
      .map(key => ({
        title: key.toUpperCase() + 'S',
        description: groups[key][0]?.category_description || '',
        data: groups[key]
      }));
  }, [rooms]);

  const renderRoom = (item: any) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.roomCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => router.push({ pathname: '/suites/[id]', params: { id: item.id } })}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.images[0] || item.image }} style={styles.roomImage} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          style={styles.imageOverlay}
        />
        {item.tag && (
          <View style={[styles.tagBadge, { backgroundColor: colors.tint }]}>
            <Text style={[styles.tagText, { fontFamily: fonts.button }]}>{item.tag}</Text>
          </View>
        )}
      </View>
      <View style={styles.roomInfo}>
        <View style={styles.roomHeader}>
          <View style={styles.nameContainer}>
            <Text style={[styles.roomName, { color: colors.text, fontFamily: fonts.heading }]} numberOfLines={1}>{item.name}</Text>
            <Text style={[styles.roomTagline, { color: colors.text, fontFamily: fonts.body, opacity: 0.6 }]}>{item.tag}</Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={[styles.roomPrice, { color: colors.tint, fontFamily: fonts.button }]}>₦{Number(item.price_per_night).toLocaleString()}</Text>
            <Text style={[styles.perNight, { color: colors.text }]}>/ night</Text>
          </View>
        </View>

        <View style={styles.amenities}>
          {(item.amenities || []).slice(0, 5).map((key: string, index: number) => {
            const amenity = getAmenityData(key);
            return (
              <Ionicons key={index} name={amenity.icon as any} size={16} color={colors.text} style={[styles.amenityIcon, { opacity: 0.6 }]} />
            );
          })}
        </View>

        <TouchableOpacity onPress={() => router.push({ pathname: '/suites/[id]', params: { id: item.id } })}>
          <LinearGradient
            colors={[colors.tint, '#6B2D5A']}
            style={styles.bookBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={[styles.bookBtnText, { fontFamily: fonts.button }]}>Reserve {item.name}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text, fontFamily: fonts.heading }]}>Our Residencies</Text>
        <Text style={[styles.subtitle, { color: colors.text, fontFamily: fonts.body }]}>Curated luxury for the modern executive</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {groupedRooms.map((group, groupIndex) => (
          <View key={groupIndex} style={styles.groupContainer}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fonts.heading }]}>{group.title}</Text>
              <Text style={[styles.sectionDesc, { color: colors.text, fontFamily: fonts.body, opacity: 0.6 }]}>{group.description}</Text>
            </View>
            {group.data.map(room => renderRoom(room))}
          </View>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 25,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backBtn: {
    marginBottom: 15,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 4,
  },
  scrollContent: {
    paddingHorizontal: 25,
  },
  groupContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    marginBottom: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    letterSpacing: 2,
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  roomCard: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    height: 220,
  },
  roomImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  tagBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  roomInfo: {
    padding: 20,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  nameContainer: {
    flex: 1,
    marginRight: 10,
  },
  roomName: {
    fontSize: 22,
    marginBottom: 2,
  },
  roomTagline: {
    fontSize: 13,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  roomPrice: {
    fontSize: 18,
    fontWeight: '700',
  },
  perNight: {
    fontSize: 11,
    opacity: 0.5,
    marginTop: 2,
  },
  amenities: {
    flexDirection: 'row',
    marginBottom: 25,
  },
  amenityIcon: {
    marginRight: 18,
  },
  bookBtn: {
    height: 54,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookBtnText: {
    color: '#FFF',
    fontSize: 15,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
