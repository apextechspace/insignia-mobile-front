import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { serviceService } from '../../services/services';
import { foodService } from '../../services/food';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function ServiceOrdersScreen() {
    const { colors, fonts } = useTheme();
    const router = useRouter();
    const [bookings, setBookings] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    useFocusEffect(React.useCallback(() => {
        let active = true;
        const loadBookings = async () => {
        try {
            const [services, dining] = await Promise.all([
                serviceService.getMyServiceBookings(), foodService.getMyOrders(),
            ]);
            const data = [
                ...services.map((order: any) => ({ ...order, history_key: `service-${order.id}` })),
                ...dining.data.map((order: any) => ({
                    ...order, history_key: `dining-${order.id}`, total_price: order.total_amount,
                    service: { name: 'Dining order' },
                    notes: order.items?.map((item: any) => `${item.quantity} × ${item.menu_item?.name || 'Menu item'}`).join(', '),
                })),
            ];
            // Sort by created_at descending if possible
            const sortedData = data.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            if (active) setBookings(sortedData);
        } catch (error) {
            console.error('Failed to load service bookings:', error);
        } finally {
            if (active) setLoading(false);
        }
        };
        void loadBookings();
        return () => { active = false; };
    }, []));

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'completed': return '#27AE60';
            case 'confirmed': return '#3498DB';
            case 'in-progress': return '#9B59B6';
            case 'cancelled': return '#E74C3C';
            default: return '#F1C40F'; // Pending
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: colors.text, fontFamily: fonts.body }}>Loading Concierge Requests...</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text, fontFamily: fonts.heading }]}>Service Orders</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fonts.heading }]}>Your Dining & Concierge History</Text>

                {bookings.length === 0 && (
                    <Text style={{ color: colors.text, opacity: 0.5, textAlign: 'center', marginTop: 40, fontFamily: fonts.body }}>No service records found.</Text>
                )}

                {bookings.map(order => (
                    <View key={order.history_key} style={[styles.activeCard, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: 20 }]}>
                        <View style={styles.cardHeader}>
                            <View style={[styles.productThumb, { backgroundColor: colors.tint + '15', justifyContent: 'center', alignItems: 'center' }]}>
                                <Ionicons name="star" size={24} color={colors.tint} />
                            </View>
                            <View style={styles.productInfo}>
                                <Text style={[styles.productName, { color: colors.text, fontFamily: fonts.heading }]}>{order.service?.name || 'Concierge Service'}</Text>
                                <Text style={[styles.secondaryText, { color: colors.text, fontFamily: fonts.body }]}>Value: ₦{Number(order.total_price || 0).toLocaleString()}</Text>
                            </View>
                        </View>

                        <View style={styles.activeInfo}>
                            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                                <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>{order.status?.toUpperCase() || 'PENDING'}</Text>
                            </View>

                            <Text style={[styles.roomInfo, { color: colors.text, fontFamily: fonts.body }]}>
                                REF: {order.payment_reference || 'N/A'} • {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'Today'}
                            </Text>

                            <View style={styles.notesBadge}>
                                <Ionicons name="document-text-outline" size={12} color={colors.tint} style={{ marginRight: 5, marginTop: 2 }} />
                                <Text style={[styles.notesText, { color: colors.text, fontFamily: fonts.body }]} numberOfLines={2}>{order.notes || 'No special requests'}</Text>
                            </View>

                            {order.receipt_url && (
                                <View style={styles.receiptSection}>
                                    <Text style={[styles.receiptLabel, { color: colors.text, opacity: 0.5, fontFamily: fonts.body }]}>Proof of Request:</Text>
                                    <View style={[styles.receiptThumbWrapper, { borderColor: colors.border }]}>
                                        <Image source={{ uri: order.receipt_url }} style={styles.receiptThumb} />
                                        <View style={styles.verifiedBadge}>
                                            <Ionicons name="checkmark-circle" size={14} color="#27AE60" />
                                            <Text style={styles.verifiedText}>Filed</Text>
                                        </View>
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>
                ))}

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
    backBtn: { width: 44, height: 44, justifyContent: 'center' },
    headerTitle: { fontSize: 18 },
    scrollContent: { padding: 25 },
    sectionTitle: { fontSize: 16, marginBottom: 20, opacity: 0.7 },
    activeCard: { borderRadius: 24, borderWidth: 1, padding: 15, overflow: 'hidden' },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    productThumb: { width: 60, height: 60, borderRadius: 12, marginRight: 15 },
    productInfo: { flex: 1 },
    productName: { fontSize: 16, marginBottom: 4 },
    secondaryText: { fontSize: 13, opacity: 0.6 },
    activeInfo: { borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', paddingTop: 15 },
    statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, marginBottom: 10 },
    statusText: { fontSize: 10, fontWeight: '700' },
    roomInfo: { fontSize: 13, opacity: 0.5, marginBottom: 10 },
    notesBadge: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 15, opacity: 0.8 },
    notesText: { fontSize: 12, flex: 1, lineHeight: 16 },
    receiptSection: { marginTop: 5 },
    receiptLabel: { fontSize: 12, marginBottom: 8 },
    receiptThumbWrapper: { flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 12, borderWidth: 1, backgroundColor: 'rgba(0,0,0,0.02)' },
    receiptThumb: { width: 40, height: 40, borderRadius: 8, marginRight: 10 },
    verifiedBadge: { flexDirection: 'row', alignItems: 'center' },
    verifiedText: { fontSize: 11, color: '#27AE60', fontWeight: '600', marginLeft: 4 },
});
