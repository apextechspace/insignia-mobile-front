import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function BookingScreen() {
    const { id, name, price } = useLocalSearchParams();
    const { colors, fonts } = useTheme();
    const router = useRouter();

    const [guests, setGuests] = useState(1);

    // Real Date State
    const [checkIn, setCheckIn] = useState(new Date(new Date().setDate(new Date().getDate() + 1)));
    const [checkOut, setCheckOut] = useState(new Date(new Date().setDate(new Date().getDate() + 3)));
    const [showPicker, setShowPicker] = useState<'in' | 'out' | null>(null);

    const nights = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));

    const checkInStr = checkIn.toISOString().split('T')[0];
    const checkOutStr = checkOut.toISOString().split('T')[0];
    const displayCheckIn = checkIn.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    const displayCheckOut = checkOut.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

    // Robust price parsing (handles numbers, formatted strings, and decimal points)
    const parsePrice = (p: any) => {
        if (!p) return 0;
        if (typeof p === 'number') return p;
        // Remove currency symbols and commas, but keep the decimal point
        const cleaned = p.replace(/[₦,]/g, '');
        return parseFloat(cleaned) || 0;
    };

    const basePrice = parsePrice(price);
    const total = basePrice * nights;

    const onDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') setShowPicker(null);
        if (selectedDate) {
            if (showPicker === 'in') {
                setCheckIn(selectedDate);
                // Ensure check-out is at least 1 night after check-in
                if (selectedDate >= checkOut) {
                    const nextDay = new Date(selectedDate);
                    nextDay.setDate(selectedDate.getDate() + 1);
                    setCheckOut(nextDay);
                }
            } else {
                setCheckOut(selectedDate);
            }
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="close-outline" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text, fontFamily: fonts.heading }]}>Reserve Your Stay</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.suiteInfo}>
                    <Text style={[styles.suiteName, { color: colors.text, fontFamily: fonts.heading }]}>{name || 'Selected Suite'}</Text>
                    <Text style={[styles.suiteDetails, { color: colors.text }]}>{price} / night • Professional Residency</Text>
                </View>

                {/* Duration / Date Selection */}
                <View style={styles.section}>
                    <Text style={[styles.sectionLabel, { color: colors.text, fontFamily: fonts.heading }]}>Stay Dates</Text>

                    <View style={[styles.datePickerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <TouchableOpacity
                            style={styles.dateBlock}
                            onPress={() => setShowPicker('in')}
                        >
                            <Text style={[styles.dateLabel, { color: colors.text }]}>CHECK-IN</Text>
                            <Text style={[styles.dateValue, { color: colors.tint, fontFamily: fonts.button }]}>{displayCheckIn}</Text>
                        </TouchableOpacity>

                        <View style={[styles.divider, { backgroundColor: colors.border }]} />

                        <TouchableOpacity
                            style={styles.dateBlock}
                            onPress={() => setShowPicker('out')}
                        >
                            <Text style={[styles.dateLabel, { color: colors.text }]}>CHECK-OUT</Text>
                            <Text style={[styles.dateValue, { color: colors.tint, fontFamily: fonts.button }]}>{displayCheckOut}</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={{ fontSize: 12, color: colors.text, opacity: 0.5, marginTop: 12, textAlign: 'center' }}>
                        Total Duration: {nights} {nights === 1 ? 'Night' : 'Nights'}
                    </Text>
                </View>

                {showPicker && (
                    <DateTimePicker
                        value={showPicker === 'in' ? checkIn : checkOut}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={onDateChange}
                        minimumDate={showPicker === 'in' ? new Date() : new Date(checkIn.getTime() + 86400000)}
                    />
                )}

                {/* Guest Selection */}
                <View style={styles.section}>
                    <Text style={[styles.sectionLabel, { color: colors.text, fontFamily: fonts.heading }]}>Number of Guests</Text>
                    <View style={styles.guestControl}>
                        <TouchableOpacity
                            style={[styles.controlBtn, { borderColor: colors.border }]}
                            onPress={() => setGuests(Math.max(1, guests - 1))}
                        >
                            <Ionicons name="remove" size={24} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={[styles.guestCount, { color: colors.text, fontFamily: fonts.heading }]}>{guests}</Text>
                        <TouchableOpacity
                            style={[styles.controlBtn, { borderColor: colors.border }]}
                            onPress={() => setGuests(Math.min(4, guests + 1))}
                        >
                            <Ionicons name="add" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>
                    <Text style={{ fontSize: 12, color: colors.text, opacity: 0.5, marginTop: 8 }}>Max 4 guests per executive residency.</Text>
                </View>

                {/* Requirements */}
                <View style={styles.section}>
                    <Text style={[styles.sectionLabel, { color: colors.text, fontFamily: fonts.heading }]}>Special Requirements</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text, fontFamily: fonts.body }]}
                        placeholder="e.g., Late check-in, dietary preferences..."
                        placeholderTextColor="#999"
                        multiline
                        numberOfLines={4}
                    />
                </View>

                {/* Summary */}
                <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.summaryRow}>
                        <Text style={[styles.summaryText, { color: colors.text }]}>Stay ({nights} {nights === 1 ? 'night' : 'nights'})</Text>
                        <Text style={[styles.summaryValue, { color: colors.text }]}>₦{(basePrice * nights).toLocaleString()}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={[styles.summaryText, { color: colors.text }]}>Executive Service Fee</Text>
                        <Text style={[styles.summaryValue, { color: colors.text }]}>₦25,000</Text>
                    </View>
                    <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.summaryRow}>
                        <Text style={[styles.totalLabel, { color: colors.text, fontFamily: fonts.heading }]}>Total Amount</Text>
                        <Text style={[styles.totalValue, { color: colors.tint, fontFamily: fonts.heading }]}>₦{(total + 25000).toLocaleString()}</Text>
                    </View>
                </View>
            </ScrollView>

            <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
                <TouchableOpacity
                    style={styles.proceedBtn}
                    onPress={() => router.push({
                        pathname: '/suites/payment',
                        params: {
                            total: total + 25000,
                            name,
                            roomId: id,
                            checkIn: checkInStr,
                            checkOut: checkOutStr,
                            guests,
                            stayTotal: total,
                            serviceFee: 25000
                        }
                    })}
                >
                    <LinearGradient
                        colors={[colors.tint, '#6B2D5A']}
                        style={styles.proceedBtnGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Text style={[styles.proceedBtnText, { fontFamily: fonts.button }]}>Proceed to Checkout</Text>
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
    suiteInfo: {
        marginBottom: 30,
    },
    suiteName: {
        fontSize: 24,
        marginBottom: 5,
    },
    suiteDetails: {
        fontSize: 14,
        opacity: 0.6,
    },
    section: {
        marginBottom: 30,
    },
    sectionLabel: {
        fontSize: 16,
        marginBottom: 15,
    },
    datePickerCard: {
        flexDirection: 'row',
        borderRadius: 20,
        borderWidth: 1,
        padding: 20,
        alignItems: 'center',
    },
    dateBlock: {
        flex: 1,
    },
    dateLabel: {
        fontSize: 10,
        letterSpacing: 1,
        opacity: 0.5,
        marginBottom: 5,
    },
    dateValue: {
        fontSize: 16,
    },
    divider: {
        width: 1,
        height: 40,
        marginHorizontal: 15,
    },
    guestControl: {
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
    guestCount: {
        fontSize: 20,
        marginHorizontal: 25,
    },
    durationControl: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    durationDisplay: {
        alignItems: 'center',
        marginHorizontal: 25,
    },
    durationCount: {
        fontSize: 24,
    },
    durationUnit: {
        fontSize: 10,
        fontWeight: '700',
        marginTop: -4,
    },
    input: {
        borderRadius: 15,
        borderWidth: 1,
        padding: 15,
        textAlignVertical: 'top',
        height: 100,
    },
    summaryCard: {
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 100,
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
    },
});
