import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { roomService } from '../../services/rooms';
import { getAmenityData } from '../../utils/amenities';

const { width } = Dimensions.get('window');

export default function SuiteDetailScreen() {
    const { id } = useLocalSearchParams();
    const { colors, fonts } = useTheme();
    const router = useRouter();

    const [room, setRoom] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRoom = async () => {
            try {
                const data = await roomService.getRoomById(id as string);
                setRoom(data);
            } catch (error) {
                console.error('Failed to fetch room detail:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchRoom();
    }, [id]);

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color={colors.tint} />
            </View>
        );
    }

    if (!room) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: colors.text, fontFamily: fonts.body }}>Room not found.</Text>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
                    <Text style={{ color: colors.tint, fontFamily: fonts.button }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const roomImages = room.images && room.images.length > 0
        ? room.images
        : ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=80'];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Gallery */}
                <View style={styles.imageContainer}>
                    <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
                        {roomImages.map((img: string, index: number) => (
                            <Image key={index} source={{ uri: img }} style={styles.galleryImage} />
                        ))}
                    </ScrollView>
                    <LinearGradient
                        colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.6)']}
                        style={styles.imageOverlay}
                    />
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.shareBtn}>
                        <Ionicons name="share-social-outline" size={24} color="#FFF" />
                    </TouchableOpacity>

                    <View style={styles.imageIndicators}>
                        {roomImages.map((_: any, i: number) => (
                            <View key={i} style={[styles.indicator, { backgroundColor: i === 0 ? '#FFF' : 'rgba(255,255,255,0.4)' }]} />
                        ))}
                    </View>
                </View>

                {/* Info */}
                <View style={[styles.content, { backgroundColor: colors.card }]}>
                    <View style={styles.headerRow}>
                        <View style={styles.nameContainer}>
                            <View style={styles.categoryRow}>
                                <Text style={[styles.type, { color: colors.tint, fontFamily: fonts.body }]}>{room.type}</Text>
                                <View style={[styles.typeDot, { backgroundColor: colors.tint }]} />
                                <Text style={[styles.tag, { color: colors.text, fontFamily: fonts.body, opacity: 0.6 }]}>{room.tag}</Text>
                            </View>
                            <Text style={[styles.name, { color: colors.text, fontFamily: fonts.heading }]} numberOfLines={2}>{room.name}</Text>
                        </View>
                        <View style={styles.priceBox}>
                            <Text style={[styles.price, { color: colors.tint, fontFamily: fonts.button }]}>₦{Number(room.price_per_night).toLocaleString()}</Text>
                            <Text style={[styles.perNight, { color: colors.text }]}>/ night</Text>
                        </View>
                    </View>

                    <Text style={[styles.description, { color: colors.text, fontFamily: fonts.body }]}>
                        {room.description}
                    </Text>

                    {/* Elite Features */}
                    {room.features && room.features.length > 0 && (
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fonts.heading }]}>Elite Features</Text>
                            <View style={styles.featuresRow}>
                                {room.features.map((feature: string, index: number) => (
                                    <View key={index} style={[styles.featureCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                        <Ionicons name="checkmark-circle" size={16} color={colors.tint} />
                                        <Text style={[styles.featureText, { color: colors.text, fontFamily: fonts.body }]}>{feature}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Amenities Grid */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fonts.heading }]}>Premier Amenities</Text>
                        <View style={styles.amenitiesGrid}>
                            {(room.amenities || []).map((key: string, index: number) => {
                                const amenity = getAmenityData(key);
                                return (
                                    <View key={index} style={styles.amenityItem}>
                                        <View style={[styles.amenityIconContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                            <Ionicons name={amenity.icon} size={22} color={colors.tint} />
                                        </View>
                                        <Text style={[styles.amenityName, { color: colors.text, fontFamily: fonts.body }]}>{amenity.name}</Text>
                                    </View>
                                );
                            })}
                        </View>
                    </View>

                    <View style={{ height: 120 }} />
                </View>
            </ScrollView>

            {/* Floating Action Bar */}
            <View style={[styles.actionBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
                <View>
                    <Text style={[styles.actionPrice, { color: colors.text, fontFamily: fonts.heading }]}>₦{Number(room.price_per_night).toLocaleString()}</Text>
                    <Text style={[styles.actionSub, { color: colors.text }]}>Total estimate</Text>
                </View>
                <TouchableOpacity
                    style={styles.bookBtn}
                    onPress={() => router.push({ pathname: '/suites/book', params: { id, name: room.name, price: room.price_per_night } })}
                >
                    <LinearGradient
                        colors={[colors.tint, '#6B2D5A']}
                        style={styles.bookBtnGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Text style={[styles.bookBtnText, { fontFamily: fonts.button }]}>Reserve Suite</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    imageContainer: {
        position: 'relative',
        height: 400,
    },
    galleryImage: {
        width: width,
        height: '100%',
    },
    imageOverlay: {
        ...StyleSheet.absoluteFillObject,
    },
    backBtn: {
        position: 'absolute',
        top: 60,
        left: 20,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    shareBtn: {
        position: 'absolute',
        top: 60,
        right: 20,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageIndicators: {
        position: 'absolute',
        bottom: 30,
        flexDirection: 'row',
        alignSelf: 'center',
    },
    indicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    content: {
        padding: 25,
        marginTop: -20,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    categoryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    type: {
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    typeDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        marginHorizontal: 10,
    },
    tag: {
        fontSize: 12,
        fontStyle: 'italic',
    },
    nameContainer: {
        flex: 1,
        marginRight: 15,
    },
    name: {
        fontSize: 28,
        letterSpacing: 1,
    },
    priceBox: {
        alignItems: 'flex-end',
    },
    price: {
        fontSize: 20,
        fontWeight: '700',
    },
    perNight: {
        fontSize: 12,
        opacity: 0.5,
    },
    description: {
        fontSize: 15,
        lineHeight: 24,
        opacity: 0.7,
        marginBottom: 30,
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 18,
        marginBottom: 15,
    },
    featuresRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    featureCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
    },
    featureText: {
        fontSize: 13,
        marginLeft: 8,
    },
    amenitiesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    amenityItem: {
        width: (width - 70) / 3,
        alignItems: 'center',
        marginBottom: 20,
    },
    amenityIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 20,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    amenityName: {
        fontSize: 12,
        textAlign: 'center',
        opacity: 0.8,
    },
    actionBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 25,
        paddingVertical: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        paddingBottom: 40,
    },
    actionPrice: {
        fontSize: 22,
    },
    actionSub: {
        fontSize: 12,
        opacity: 0.5,
    },
    bookBtn: {
        flex: 1,
        marginLeft: 25,
        height: 54,
    },
    bookBtnGradient: {
        width: '100%',
        height: '100%',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bookBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
