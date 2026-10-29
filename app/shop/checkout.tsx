import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { roomService } from '../../services/rooms';

const { width } = Dimensions.get('window');

const RESIDENCIES = [
    { id: '1', name: 'Atala Suite (Standard)' },
    { id: '2', name: 'Junonia Suite (Standard)' },
    { id: '3', name: 'Lyria Executive Room' },
    { id: '4', name: 'Evania Executive Room' },
    { id: '5', name: 'Morpho Suite' },
    { id: '6', name: 'Papilio Suite' },
];

export default function CheckoutScreen() {
    const { id, name, price, image, stock } = useLocalSearchParams();
    const { colors, fonts } = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [quantity, setQuantity] = useState(1);
    const [suites, setSuites] = useState(RESIDENCIES);
    const [selectedSuite, setSelectedSuite] = useState(RESIDENCIES[0].id);

    useEffect(() => {
        let isMounted = true;
        roomService.getAllRooms()
            .then((data: any) => {
                if (!isMounted || !Array.isArray(data) || data.length === 0) return;
                const activeRooms = data.filter((r: any) => r.is_available !== false);
                const mapped = (activeRooms.length > 0 ? activeRooms : data).map((r: any) => {
                    const rawName = String(r.name || `Suite ${r.id}`).trim();
                    const type = r.type ? ` (${r.type.replace(' Room', '')})` : '';
                    const displayName = rawName.toLowerCase().includes('suite') || rawName.toLowerCase().includes('room')
                        ? `${rawName}${type}`
                        : `${rawName} Suite${type}`;
                    return {
                        id: String(r.id),
                        name: displayName,
                    };
                });
                if (mapped.length > 0) {
                    setSuites(mapped);
                    setSelectedSuite(mapped[0].id);
                }
            })
            .catch(() => {
                // Silently keep default RESIDENCIES
            });
        return () => { isMounted = false; };
    }, []);

    // Robust price parsing (handles numbers, formatted strings, and decimal points)
    const parsePrice = (p: any) => {
        if (!p) return 0;
        if (typeof p === 'number') return p;
        const cleaned = p.replace(/[₦,]/g, '');
        return parseFloat(cleaned) || 0;
    };

    const unitPrice = parsePrice(price);
    const total = unitPrice * quantity;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="close-outline" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text, fontFamily: fonts.heading }]}>Secure Checkout</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Product Summary */}
                <View style={[styles.productCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Image source={{ uri: image as string }} style={styles.productImage} />
                    <View style={styles.productDetails}>
                        <Text style={[styles.productName, { color: colors.text, fontFamily: fonts.heading }]}>{name}</Text>
                        <Text style={[styles.productPrice, { color: colors.tint, fontFamily: fonts.button }]}>{price}</Text>
                    </View>
                </View>

                {/* Quantity Selection */}
                <View style={styles.section}>
                    <Text style={[styles.sectionLabel, { color: colors.text, fontFamily: fonts.heading }]}>Quantity</Text>
                    <View style={styles.quantityControl}>
                        <TouchableOpacity
                            style={[styles.controlBtn, { borderColor: colors.border }]}
                            onPress={() => setQuantity(Math.max(1, quantity - 1))}
                        >
                            <Ionicons name="remove" size={24} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={[styles.quantityText, { color: colors.text, fontFamily: fonts.heading }]}>{quantity}</Text>
                        <TouchableOpacity
                            style={[styles.controlBtn, { borderColor: colors.border }]}
                            onPress={() => setQuantity(Math.min(parseInt(stock as string || '1'), quantity + 1))}
                        >
                            <Ionicons name="add" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Delivery Selection */}
                <View style={styles.section}>
                    <Text style={[styles.sectionLabel, { color: colors.text, fontFamily: fonts.heading }]}>Deliver to Suite</Text>
                    {suites.map((suite) => (
                        <TouchableOpacity
                            key={suite.id}
                            style={[
                                styles.suiteOption,
                                {
                                    backgroundColor: colors.card,
                                    borderColor: selectedSuite === suite.id ? colors.tint : colors.border
                                }
                            ]}
                            onPress={() => setSelectedSuite(suite.id)}
                        >
                            <View style={styles.suiteInfo}>
                                <Ionicons
                                    name={selectedSuite === suite.id ? "radio-button-on" : "radio-button-off"}
                                    size={20}
                                    color={selectedSuite === suite.id ? colors.tint : colors.text}
                                    style={{ marginRight: 12 }}
                                />
                                <Text style={[styles.suiteName, { color: colors.text, fontFamily: fonts.body }]}>{suite.name}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Order Summary */}
                <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.summaryRow}>
                        <Text style={[styles.summaryText, { color: colors.text }]}>Subtotal ({quantity} item{quantity > 1 ? 's' : ''})</Text>
                        <Text style={[styles.summaryValue, { color: colors.text }]}>₦{total.toLocaleString()}</Text>
                    </View>
                    <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.summaryRow}>
                        <Text style={[styles.totalLabel, { color: colors.text, fontFamily: fonts.heading }]}>Total Amount</Text>
                        <Text style={[styles.totalValue, { color: colors.tint, fontFamily: fonts.heading }]}>₦{total.toLocaleString()}</Text>
                    </View>
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom, 25) }]}>
                <TouchableOpacity
                    style={styles.proceedBtn}
                    onPress={() => router.push({
                        pathname: '/shop/payment',
                        params: {
                            total,
                            name,
                            id,
                            quantity,
                            delivery_location: suites.find(s => String(s.id) === String(selectedSuite))?.name || 'Suite'
                        }
                    })}
                >
                    <LinearGradient
                        colors={[colors.tint, '#6B2D5A']}
                        style={styles.proceedBtnGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Text style={[styles.proceedBtnText, { fontFamily: fonts.button }]}>Proceed to Payment</Text>
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
    productCard: {
        flexDirection: 'row',
        padding: 15,
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 30,
        alignItems: 'center',
    },
    productImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
        marginRight: 15,
    },
    productDetails: {
        flex: 1,
    },
    productName: {
        fontSize: 16,
        marginBottom: 5,
    },
    productPrice: {
        fontSize: 15,
    },
    section: {
        marginBottom: 30,
    },
    sectionLabel: {
        fontSize: 16,
        marginBottom: 15,
    },
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    controlBtn: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityText: {
        fontSize: 20,
        marginHorizontal: 25,
    },
    suiteOption: {
        padding: 18,
        borderRadius: 15,
        borderWidth: 1,
        marginBottom: 12,
    },
    suiteInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    suiteName: {
        fontSize: 14,
    },
    summaryCard: {
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    summaryText: {
        fontSize: 14,
        opacity: 0.7,
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '500',
    },
    summaryDivider: {
        height: 1,
        marginVertical: 15,
    },
    totalLabel: {
        fontSize: 18,
    },
    totalValue: {
        fontSize: 20,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 25,
        paddingBottom: 40,
        borderTopWidth: 1,
    },
    proceedBtn: {
        height: 54,
    },
    proceedBtnGradient: {
        width: '100%',
        height: '100%',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    proceedBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    }
});
