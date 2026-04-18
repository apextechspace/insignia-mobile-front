import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { productService } from '../../services/products';

const { width } = Dimensions.get('window');

export default function OrdersHistoryScreen() {
    const { colors, fonts } = useTheme();
    const router = useRouter();
    const [orders, setOrders] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            const data = await productService.getMyOrders();
            setOrders(data);
        } catch (error) {
            console.error('Failed to load orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'delivered': return '#27AE60';
            case 'processing': return '#3498DB';
            case 'cancelled': return '#E74C3C';
            default: return '#F1C40F'; // Pending
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: colors.text, fontFamily: fonts.body }}>Loading Orders...</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text, fontFamily: fonts.heading }]}>Boutique Orders</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fonts.heading }]}>Your Purchases</Text>

                {orders.length === 0 && (
                    <Text style={{ color: colors.text, opacity: 0.5, textAlign: 'center', marginTop: 40, fontFamily: fonts.body }}>No orders found.</Text>
                )}

                {orders.map(order => (
                    <View key={order.id} style={[styles.activeCard, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: 20 }]}>
                        <View style={styles.cardHeader}>
                            <Image 
                                source={{ uri: order.product?.image || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800' }} 
                                style={styles.productThumb} 
                            />
                            <View style={styles.productInfo}>
                                <Text style={[styles.productName, { color: colors.text, fontFamily: fonts.heading }]}>{order.product?.name || 'Luxury Item'}</Text>
                                <Text style={[styles.secondaryText, { color: colors.text, fontFamily: fonts.body }]}>Qty: {order.quantity} | Total: ₦{Number(order.total_price).toLocaleString()}</Text>
                            </View>
                        </View>

                        <View style={styles.activeInfo}>
                            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                                <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>{order.status?.toUpperCase() || 'PENDING'}</Text>
                            </View>

                            <Text style={[styles.roomInfo, { color: colors.text, fontFamily: fonts.body }]}>
                                REF: {order.payment_reference || 'N/A'} • {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'Today'}
                            </Text>

                            {order.delivery_location && (
                                <View style={styles.locationBadge}>
                                    <Ionicons name="location-outline" size={12} color={colors.tint} style={{ marginRight: 5 }} />
                                    <Text style={[styles.locationText, { color: colors.text, fontFamily: fonts.body }]}>{order.delivery_location}</Text>
                                </View>
                            )}

                            {order.receipt_url && (
                                <View style={styles.receiptSection}>
                                    <Text style={[styles.receiptLabel, { color: colors.text, opacity: 0.5, fontFamily: fonts.body }]}>Proof of Payment:</Text>
                                    <View style={[styles.receiptThumbWrapper, { borderColor: colors.border }]}>
                                        <Image source={{ uri: order.receipt_url }} style={styles.receiptThumb} />
                                        <View style={styles.verifiedBadge}>
                                            <Ionicons name="checkmark-circle" size={14} color="#27AE60" />
                                            <Text style={styles.verifiedText}>Uploaded</Text>
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
        padding: 15,
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    productThumb: {
        width: 60,
        height: 60,
        borderRadius: 12,
        marginRight: 15,
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: 16,
        marginBottom: 4,
    },
    secondaryText: {
        fontSize: 13,
        opacity: 0.6,
    },
    activeInfo: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        paddingTop: 15,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 8,
        marginBottom: 10,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
    },
    roomInfo: {
        fontSize: 13,
        opacity: 0.5,
        marginBottom: 10,
    },
    locationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        opacity: 0.8,
    },
    locationText: {
        fontSize: 12,
    },
    receiptSection: {
        marginTop: 5,
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
