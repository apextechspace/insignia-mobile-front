import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { bookingService } from '../../services/bookings';

const { width } = Dimensions.get('window');

export default function RoomBookingsScreen() {
    const { colors, fonts } = useTheme();
    const router = useRouter();
    const [bookings, setBookings] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            const data = await bookingService.getMyBookings();
            setBookings(data);
        } catch (error) {
            console.error('Failed to load bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: colors.text, fontFamily: fonts.body }}>Loading Stays...</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text, fontFamily: fonts.heading }]}>Room Bookings</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fonts.heading }]}>Your Stays</Text>

                {bookings.length === 0 && (
                    <Text style={{ color: colors.text, opacity: 0.5, textAlign: 'center', marginTop: 40, fontFamily: fonts.body }}>No bookings found.</Text>
                )}

                {bookings.map(booking => (
                    <View key={booking.id} style={[styles.activeCard, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: 20 }]}>
                        <Image source={{ uri: booking.room?.image || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800' }} style={styles.activeImage} />
                        <View style={styles.activeInfo}>
                            <View style={styles.statusBadgeHolder}>
                                <View style={[styles.statusBadge, { backgroundColor: booking.status === 'confirmed' ? '#27AE6020' : '#F39C1220' }]}>
                                    <Text style={[styles.statusText, { color: booking.status === 'confirmed' ? '#27AE60' : '#F39C12' }]}>{booking.status}</Text>
                                </View>
                            </View>
                            <Text style={[styles.suiteName, { color: colors.text, fontFamily: fonts.heading }]}>{booking.room?.name || 'Luxury Suite'}</Text>
                            <Text style={[styles.roomInfo, { color: colors.text, fontFamily: fonts.body }]}>REF: {booking.payment_reference || 'N/A'} • {booking.check_in} to {booking.check_out}</Text>

                            {booking.receipt_url && (
                                <View style={styles.receiptSection}>
                                    <Text style={[styles.receiptLabel, { color: colors.text, opacity: 0.5, fontFamily: fonts.body }]}>Proof of Payment:</Text>
                                    <View style={[styles.receiptThumbWrapper, { borderColor: colors.border }]}>
                                        <Image source={{ uri: booking.receipt_url }} style={styles.receiptThumb} />
                                        <View style={styles.verifiedBadge}>
                                            <Ionicons name="checkmark-circle" size={14} color="#27AE60" />
                                            <Text style={styles.verifiedText}>Uploaded</Text>
                                        </View>
                                    </View>
                                </View>
                            )}

                            <TouchableOpacity
                                style={styles.manageBtn}
                                onPress={() => router.push('/management/apartment')}
                            >
                                <LinearGradient
                                    colors={[colors.tint, '#6B2D5A']}
                                    style={styles.manageBtnGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    <Ionicons name="settings-outline" size={18} color="#FFF" style={{ marginRight: 8 }} />
                                    <Text style={[styles.manageBtnText, { fontFamily: fonts.button }]}>Manage Suite</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    backBtn: {
        width: 44,
        height: 44,
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
    },
    scrollContent: {
        padding: 25,
    },
    sectionTitle: {
        fontSize: 16,
        marginBottom: 20,
        opacity: 0.7,
    },
    activeCard: {
        borderRadius: 24,
        borderWidth: 1,
        overflow: 'hidden',
    },
    activeImage: {
        width: '100%',
        height: 180,
    },
    activeInfo: {
        padding: 20,
    },
    statusBadgeHolder: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    suiteName: {
        fontSize: 22,
        marginBottom: 5,
    },
    roomInfo: {
        fontSize: 14,
        opacity: 0.5,
        marginBottom: 20,
    },
    manageBtn: {
        height: 50,
    },
    manageBtnGradient: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    manageBtnText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
    receiptSection: {
        marginBottom: 20,
    },
    receiptLabel: {
        fontSize: 12,
        marginBottom: 8,
    },
    receiptThumbWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderRadius: 12,
        borderWidth: 1,
        backgroundColor: 'rgba(0,0,0,0.02)',
    },
    receiptThumb: {
        width: 40,
        height: 40,
        borderRadius: 8,
        marginRight: 10,
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    verifiedText: {
        fontSize: 11,
        color: '#27AE60',
        fontWeight: '600',
        marginLeft: 4,
    },
});
