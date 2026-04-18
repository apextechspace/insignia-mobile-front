import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function ServiceRequestScreen() {
    const { id, name, price, image } = useLocalSearchParams();
    const { colors, fonts } = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [selectedDay, setSelectedDay] = useState('Today');
    const [selectedPeriod, setSelectedPeriod] = useState('ASAP');
    const [exactTime, setExactTime] = useState('15 Mins');
    const [notes, setNotes] = useState('');

    const TIME_SLOTS: Record<string, string[]> = {
        'ASAP': ['15 Mins', '30 Mins', '1 Hour'],
        'Morning': ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM'],
        'Afternoon': ['12:00 PM', '2:00 PM', '4:00 PM', '5:00 PM'],
        'Evening': ['6:00 PM', '8:00 PM', '10:00 PM'],
    };

    const handlePeriodSelect = (period: string) => {
        setSelectedPeriod(period);
        setExactTime(TIME_SLOTS[period][0]); // Auto-select the first available exact time
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="close-outline" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text, fontFamily: fonts.heading }]}>Concierge Form</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Service Summary */}
                <View style={[styles.serviceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Image source={{ uri: image as string }} style={styles.serviceImage} />
                    <View style={styles.serviceDetails}>
                        <Text style={[styles.serviceName, { color: colors.text, fontFamily: fonts.heading }]}>{name}</Text>
                        <Text style={[styles.servicePrice, { color: colors.tint, fontFamily: fonts.button }]}>{price}</Text>
                    </View>
                </View>

                {/* Scheduling (Luxury Slot Selector) */}
                <View style={styles.section}>
                    <Text style={[styles.sectionLabel, { color: colors.text, fontFamily: fonts.heading }]}>Preferred Timeline</Text>
                    
                    {/* Day Selection */}
                    <View style={styles.slotRow}>
                        {['Today', 'Tomorrow'].map((day) => (
                            <TouchableOpacity
                                key={day}
                                style={[
                                    styles.slotBtn,
                                    { borderColor: colors.border, backgroundColor: selectedDay === day ? colors.tint + '15' : colors.card, marginRight: 10 }
                                ]}
                                onPress={() => setSelectedDay(day)}
                            >
                                <Ionicons name="calendar-outline" size={16} color={selectedDay === day ? colors.tint : colors.text} style={{ marginRight: 6 }} />
                                <Text style={[styles.slotText, { color: selectedDay === day ? colors.tint : colors.text, fontFamily: fonts.button }]}>
                                    {day}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Time Window Selection */}
                    <View style={styles.slotGrid}>
                        {Object.keys(TIME_SLOTS).map((period) => (
                            <TouchableOpacity
                                key={period}
                                style={[
                                    styles.slotBtnTime,
                                    { 
                                        borderColor: selectedPeriod === period ? colors.tint : colors.border, 
                                        backgroundColor: selectedPeriod === period ? colors.tint : colors.card,
                                    }
                                ]}
                                onPress={() => handlePeriodSelect(period)}
                            >
                                <Text style={[styles.slotText, { color: selectedPeriod === period ? '#FFF' : colors.text, fontFamily: fonts.button }]}>
                                    {period}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Exact Time Selection (Cascading) */}
                    <View style={styles.exactTimeContainer}>
                        <Text style={[styles.exactTimeLabel, { color: colors.text, opacity: 0.6 }]}>Select Exact Time:</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 5 }}>
                            {TIME_SLOTS[selectedPeriod].map((timeOption) => (
                                <TouchableOpacity
                                    key={timeOption}
                                    style={[
                                        styles.exactTimeBtn,
                                        { 
                                            borderColor: exactTime === timeOption ? colors.tint : colors.border, 
                                            backgroundColor: exactTime === timeOption ? colors.tint + '15' : 'transparent',
                                        }
                                    ]}
                                    onPress={() => setExactTime(timeOption)}
                                >
                                    <Text style={[styles.exactTimeText, { color: exactTime === timeOption ? colors.tint : colors.text, fontFamily: fonts.body }]}>
                                        {timeOption}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>

                {/* Instructions */}
                <View style={styles.section}>
                    <Text style={[styles.sectionLabel, { color: colors.text, fontFamily: fonts.heading }]}>Special Requests</Text>
                    <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border, height: 100, alignItems: 'flex-start' }]}>
                        <TextInput
                            style={[styles.inputArea, { color: colors.text, fontFamily: fonts.body }]}
                            placeholder="Any allergies, specific requirements, or concierge prep instructions..."
                            placeholderTextColor="#999"
                            multiline
                            textAlignVertical="top"
                            value={notes}
                            onChangeText={setNotes}
                        />
                    </View>
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom, 25) }]}>
                <TouchableOpacity
                    style={styles.proceedBtn}
                    onPress={() => router.push({
                        pathname: '/services/payment',
                        params: {
                            id,
                            name,
                            price,
                            image,
                            scheduled_at: `${selectedDay} - ${exactTime}`,
                            notes: notes || 'No special requests'
                        }
                    })}
                >
                    <LinearGradient
                        colors={[colors.tint, '#6B2D5A']}
                        style={styles.proceedBtnGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Text style={[styles.proceedBtnText, { fontFamily: fonts.button }]}>Proceed to Transfer</Text>
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
    serviceCard: {
        flexDirection: 'row',
        padding: 15,
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 35,
        alignItems: 'center',
    },
    serviceImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
        marginRight: 15,
    },
    serviceDetails: {
        flex: 1,
    },
    serviceName: {
        fontSize: 18,
        marginBottom: 5,
    },
    servicePrice: {
        fontSize: 16,
    },
    section: {
        marginBottom: 30,
    },
    sectionLabel: {
        fontSize: 16,
        marginBottom: 15,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        height: 56,
        borderRadius: 15,
        borderWidth: 1,
    },
    input: {
        flex: 1,
        height: '100%',
        fontSize: 15,
    },
    slotRow: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    slotGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    slotBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    slotBtnTime: {
        width: '48%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 10,
    },
    slotText: {
        fontSize: 14,
    },
    exactTimeContainer: {
        marginTop: 10,
    },
    exactTimeLabel: {
        fontSize: 12,
        marginBottom: 8,
    },
    exactTimeBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        marginRight: 10,
    },
    exactTimeText: {
        fontSize: 13,
    },
    inputArea: {
        flex: 1,
        height: '100%',
        paddingTop: 15,
        fontSize: 15,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 25,
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
