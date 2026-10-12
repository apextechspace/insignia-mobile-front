import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { serviceService } from '../../services/services';

const { width } = Dimensions.get('window');

export default function ServiceRequestScreen() {
    const { id, name: initialName, price: initialPrice, image, category, description: initialDescription } = useLocalSearchParams();
    const { colors, fonts } = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // Data State
    const [service, setService] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Universal State
    const [selectedDay, setSelectedDay] = useState('Today');
    const [selectedPeriod, setSelectedPeriod] = useState('ASAP');
    const [exactTime, setExactTime] = useState('15 Mins');
    const [notes, setNotes] = useState('');
    const [showPicker, setShowPicker] = useState(false);
    const [customDate, setCustomDate] = useState(new Date());
    const [isCustomTime, setIsCustomTime] = useState(false);

    // Dynamic Field States
    const [selectedVariant, setSelectedVariant] = useState<any>(null);
    const [guestCount, setGuestCount] = useState(1);
    const [checkIn, setCheckIn] = useState(new Date());
    const [checkOut, setCheckOut] = useState(new Date());
    const [requestDetails, setRequestDetails] = useState('');
    const [flightNumber, setFlightNumber] = useState('');
    const [terminal, setTerminal] = useState('');
    const [pickupLocation, setPickupLocation] = useState('');
    const [destination, setDestination] = useState('');
    const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');

    const TIME_SLOTS: Record<string, string[]> = {
        'ASAP': ['15 Mins', '30 Mins', '1 Hour'],
        'Morning': ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM'],
        'Afternoon': ['12:00 PM', '2:00 PM', '4:00 PM', '5:00 PM'],
        'Evening': ['6:00 PM', '8:00 PM', '10:00 PM'],
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        if (event.type === 'dismissed') {
            setShowPicker(false);
            return;
        }

        if (selectedDate) {
            const currentDate = selectedDate;
            
            if (Platform.OS === 'android' && pickerMode === 'date') {
                setCustomDate(currentDate);
                setPickerMode('time');
            } else {
                setCustomDate(currentDate);
                setShowPicker(false);
                setIsCustomTime(true);
                setPickerMode('date');
            }
        } else {
            setShowPicker(false);
        }
    };

    useEffect(() => {
        loadServiceDetails();
    }, [id]);

    const loadServiceDetails = async () => {
        try {
            const response = await serviceService.getAllServices();
            const foundService = response.find((s: any) => s.id.toString() === id.toString());
            if (foundService) {
                setService(foundService);
                if (foundService.requires_variant && foundService.variants?.length > 0) {
                    setSelectedVariant(foundService.variants[0]);
                }
            }
        } catch (error) {
            console.error('Failed to load service details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProceed = () => {
        if (service?.requires_variant && !selectedVariant) {
            Alert.alert('Selection Required', 'Please select a variant before proceeding.');
            return;
        }

        let dbDate = '';
        let displaySchedule = '';

        if (isCustomTime) {
            dbDate = customDate.toISOString().slice(0, 19).replace('T', ' ');
            displaySchedule = customDate.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        } else {
            const now = new Date();
            const scheduleDate = new Date();
            if (selectedDay === 'Tomorrow') scheduleDate.setDate(now.getDate() + 1);
            
            if (selectedPeriod === 'ASAP') {
                const mins = parseInt(exactTime) || 15;
                scheduleDate.setMinutes(now.getMinutes() + mins);
            } else {
                const [time, modifier] = exactTime.split(' ');
                let [hours, minutes] = time.split(':').map(Number);
                if (modifier === 'PM' && hours < 12) hours += 12;
                if (modifier === 'AM' && hours === 12) hours = 0;
                scheduleDate.setHours(hours, minutes, 0);
            }
            dbDate = scheduleDate.toISOString().slice(0, 19).replace('T', ' ');
            displaySchedule = `${selectedDay} at ${exactTime}`;
        }

        // Prepare dynamic params based on type
        const bookingParams: any = {
            id,
            name: service?.name || initialName,
            price: selectedVariant ? selectedVariant.price : (service?.price || initialPrice),
            image,
            service_variant_id: selectedVariant?.id,
            scheduled_at: dbDate,
            display_schedule: displaySchedule,
            notes: notes || 'No special requests',
            type: service?.type || 'booking'
        };

        if (service?.type === 'reservation') {
            bookingParams.check_in = checkIn.toISOString();
            bookingParams.check_out = checkOut.toISOString();
            bookingParams.guests = guestCount;
        }

        if (service?.type === 'request') {
            bookingParams.request_details = requestDetails || notes;
        }

        if (service?.category === 'Transport') {
            bookingParams.flight_number = flightNumber;
            bookingParams.terminal = terminal;
            bookingParams.pickup_location = pickupLocation;
            bookingParams.destination = destination;
        }

        router.push({
            pathname: '/services/payment',
            params: bookingParams
        });
    };

    const renderDynamicFields = () => {
        if (!service) return null;

        return (
            <View style={styles.dynamicSection}>
                {/* Variant Selection */}
                {service.requires_variant && service.variants?.length > 0 && (
                    <View style={{ marginBottom: 25 }}>
                        <Text style={[styles.fieldLabel, { color: colors.text, fontFamily: fonts.heading }]}>Select Duration / Type</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.variantScroll}>
                            {service.variants.map((variant: any) => (
                                <TouchableOpacity 
                                    key={variant.id}
                                    onPress={() => setSelectedVariant(variant)}
                                    style={[
                                        styles.variantCard, 
                                        { 
                                            backgroundColor: selectedVariant?.id === variant.id ? colors.tint : colors.card,
                                            borderColor: colors.border 
                                        }
                                    ]}
                                >
                                    <Text style={[styles.variantName, { color: selectedVariant?.id === variant.id ? '#FFF' : colors.text }]}>{variant.name}</Text>
                                    <Text style={[styles.variantPrice, { color: selectedVariant?.id === variant.id ? 'rgba(255,255,255,0.8)' : colors.tint }]}>₦{parseFloat(variant.price).toLocaleString()}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Type-Specific Fields */}
                {service.category === 'Transport' && (
                    <View style={{ marginBottom: 20 }}>
                        <Text style={[styles.fieldLabel, { color: colors.text, fontFamily: fonts.heading }]}>Transport Details</Text>
                        <TextInput 
                            placeholder="Flight Number (e.g. EK782)"
                            placeholderTextColor="#999"
                            style={[styles.input, { color: colors.text, backgroundColor: colors.card, borderColor: colors.border, marginBottom: 10 }]}
                            value={flightNumber}
                            onChangeText={setFlightNumber}
                        />
                        <TextInput 
                            placeholder="Terminal (e.g. Terminal 3)"
                            placeholderTextColor="#999"
                            style={[styles.input, { color: colors.text, backgroundColor: colors.card, borderColor: colors.border, marginBottom: 10 }]}
                            value={terminal}
                            onChangeText={setTerminal}
                        />
                        <TextInput 
                            placeholder="Pickup Location"
                            placeholderTextColor="#999"
                            style={[styles.input, { color: colors.text, backgroundColor: colors.card, borderColor: colors.border, marginBottom: 10 }]}
                            value={pickupLocation}
                            onChangeText={setPickupLocation}
                        />
                        <TextInput 
                            placeholder="Destination Address"
                            placeholderTextColor="#999"
                            style={[styles.input, { color: colors.text, backgroundColor: colors.card, borderColor: colors.border }]}
                            value={destination}
                            onChangeText={setDestination}
                        />
                    </View>
                )}

                {service.type === 'reservation' && (
                    <View>
                        <Text style={[styles.fieldLabel, { color: colors.text, fontFamily: fonts.heading }]}>Number of Guests</Text>
                        <View style={styles.counterRow}>
                            <TouchableOpacity onPress={() => setGuestCount(Math.max(1, guestCount - 1))} style={[styles.counterBtn, { borderColor: colors.border }]}>
                                <Ionicons name="remove" size={20} color={colors.text} />
                            </TouchableOpacity>
                            <Text style={[styles.counterValue, { color: colors.text, fontFamily: fonts.heading }]}>{guestCount}</Text>
                            <TouchableOpacity onPress={() => setGuestCount(guestCount + 1)} style={[styles.counterBtn, { borderColor: colors.border }]}>
                                <Ionicons name="add" size={20} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {service.type === 'request' && (
                    <View>
                        <Text style={[styles.fieldLabel, { color: colors.text, fontFamily: fonts.heading }]}>Request Details</Text>
                        <TextInput 
                            placeholder="Describe your request in detail..."
                            placeholderTextColor="#999"
                            style={[styles.textArea, { color: colors.text, backgroundColor: colors.card, borderColor: colors.border }]}
                            multiline
                            value={requestDetails}
                            onChangeText={setRequestDetails}
                        />
                    </View>
                )}
            </View>
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.tint} />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                {/* 1. UNIVERSAL TOP: Service Header */}
                <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <Ionicons name="close-outline" size={28} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text, fontFamily: fonts.heading }]}>{service?.type === 'request' ? 'Request Service' : 'Booking Flow'}</Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    <View style={styles.featuredCard}>
                        <Image source={{ uri: image as string }} style={styles.featuredImage} />
                        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={styles.featuredOverlay} />
                        <View style={styles.featuredInfo}>
                            <Text style={[styles.featuredName, { fontFamily: fonts.heading }]}>{service?.name || initialName}</Text>
                            <Text style={[styles.featuredDesc, { color: 'rgba(255,255,255,0.7)', fontFamily: fonts.body }]} numberOfLines={2}>{service?.description || initialDescription}</Text>
                        </View>
                    </View>

                    {/* 2. STEP 1: THE APPOINTMENT (Only for booking and reservation) */}
                    {(service?.type === 'booking' || service?.type === 'reservation') && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <MaterialCommunityIcons name="calendar-clock" size={22} color={colors.tint} />
                                <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fonts.heading }]}>1. Scheduling</Text>
                            </View>

                            <View style={styles.timelineToggle}>
                                <TouchableOpacity 
                                    style={[styles.toggleBtn, !isCustomTime && { backgroundColor: colors.tint }]} 
                                    onPress={() => setIsCustomTime(false)}
                                >
                                    <Text style={[styles.toggleText, !isCustomTime && { color: '#FFF' }]}>Curated Slots</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.toggleBtn, isCustomTime && { backgroundColor: colors.tint }]} 
                                    onPress={() => {
                                        setIsCustomTime(true);
                                        setShowPicker(true);
                                    }}
                                >
                                    <Text style={[styles.toggleText, isCustomTime && { color: '#FFF' }]}>Exact Time</Text>
                                </TouchableOpacity>
                            </View>

                            {!isCustomTime ? (
                                <>
                                    <View style={styles.dayRow}>
                                        {['Today', 'Tomorrow'].map(day => (
                                            <TouchableOpacity 
                                                key={day} 
                                                onPress={() => setSelectedDay(day)}
                                                style={[styles.dayChip, { backgroundColor: selectedDay === day ? colors.tint + '15' : 'transparent', borderColor: selectedDay === day ? colors.tint : colors.border }]}
                                            >
                                                <Text style={{ color: selectedDay === day ? colors.tint : colors.text }}>{day}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.periodScroll}>
                                        {Object.keys(TIME_SLOTS).map(p => (
                                            <TouchableOpacity 
                                                key={p} 
                                                onPress={() => { setSelectedPeriod(p); setExactTime(TIME_SLOTS[p][0]); }}
                                                style={[styles.periodChip, { backgroundColor: selectedPeriod === p ? colors.tint : colors.card }]}
                                            >
                                                <Text style={{ color: selectedPeriod === p ? '#FFF' : colors.text }}>{p}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                    <View style={styles.timeGrid}>
                                        {TIME_SLOTS[selectedPeriod].map(t => (
                                            <TouchableOpacity 
                                                key={t} 
                                                onPress={() => setExactTime(t)}
                                                style={[styles.timeSlot, { borderColor: exactTime === t ? colors.tint : colors.border, backgroundColor: exactTime === t ? colors.tint + '10' : 'transparent' }]}
                                            >
                                                <Text style={{ color: exactTime === t ? colors.tint : colors.text }}>{t}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </>
                            ) : (
                                <TouchableOpacity style={styles.customTimeDisplay} onPress={() => setShowPicker(true)}>
                                    <Ionicons name="time" size={20} color={colors.tint} />
                                    <Text style={[styles.customTimeText, { color: colors.text }]}>
                                        {customDate.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                    <Text style={{ color: colors.tint, fontSize: 12 }}>Change →</Text>
                                </TouchableOpacity>
                            )}
                            
                            {showPicker && (
                                <DateTimePicker
                                    value={customDate}
                                    mode={Platform.OS === 'ios' ? 'datetime' : pickerMode}
                                    is24Hour={false}
                                    onChange={handleDateChange}
                                    minimumDate={new Date()}
                                />
                            )}
                        </View>
                    )}

                    {/* 3. STEP 2: SERVICE INTELLIGENCE */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <MaterialCommunityIcons name="tune" size={22} color={colors.tint} />
                            <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fonts.heading }]}>{service?.type === 'request' ? '1. Requirements' : '2. Personalization'}</Text>
                        </View>
                        {renderDynamicFields()}
                        
                        <View style={styles.noteBox}>
                            <Text style={[styles.fieldLabel, { color: colors.text, fontFamily: fonts.heading }]}>Special Instructions</Text>
                            <TextInput 
                                placeholder="Any specific requirements or concierge prep instructions..."
                                placeholderTextColor="#999"
                                style={[styles.textArea, { color: colors.text, backgroundColor: colors.card, borderColor: colors.border }]}
                                multiline
                                value={notes}
                                onChangeText={setNotes}
                            />
                        </View>
                    </View>

                    <View style={{ height: 120 }} />
                </ScrollView>

                {/* 4. FIXED FOOTER */}
                <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom, 25) }]}>
                    <View style={styles.priceContainer}>
                        <Text style={[styles.totalLabel, { color: colors.text, opacity: 0.5 }]}>{service?.type === 'request' && service.price == 0 ? 'Custom Quote' : 'Estimated Total'}</Text>
                        <Text style={[styles.totalValue, { color: colors.text, fontFamily: fonts.heading }]}>
                            {service?.type === 'request' && service.price == 0 
                                ? 'Price on Request' 
                                : `₦${parseFloat(selectedVariant ? selectedVariant.price : (service?.price || initialPrice)).toLocaleString()}`}
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.payBtn} onPress={handleProceed}>
                        <LinearGradient colors={[colors.tint, '#5D1031']} style={styles.payGradient}>
                            <Text style={styles.payText}>{service?.type === 'request' ? 'Submit Request' : 'Pay & Book'}</Text>
                            <Ionicons name={service?.type === 'request' ? "paper-plane" : "shield-checkmark"} size={18} color="#FFF" style={{ marginLeft: 8 }} />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 15 },
    backBtn: { width: 44, height: 44, justifyContent: 'center' },
    headerTitle: { fontSize: 17, letterSpacing: 1, textTransform: 'uppercase', opacity: 0.8 },
    scrollContent: { padding: 25 },
    featuredCard: { width: '100%', height: 180, borderRadius: 24, overflow: 'hidden', marginBottom: 35 },
    featuredImage: { width: '100%', height: '100%' },
    featuredOverlay: { ...StyleSheet.absoluteFillObject },
    featuredInfo: { position: 'absolute', bottom: 20, left: 20, right: 20 },
    featuredName: { color: '#FFF', fontSize: 24, marginBottom: 5 },
    featuredDesc: { fontSize: 13, lineHeight: 18 },
    section: { marginBottom: 35 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    sectionTitle: { fontSize: 16, marginLeft: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
    timelineToggle: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 12, padding: 4, marginBottom: 20 },
    toggleBtn: { flex: 1, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    toggleText: { fontSize: 12, fontWeight: '600' },
    dayRow: { flexDirection: 'row', marginBottom: 15 },
    dayChip: { paddingHorizontal: 20, height: 40, borderRadius: 20, borderLines: 1, justifyContent: 'center', alignItems: 'center', marginRight: 10, borderWidth: 1 },
    periodScroll: { marginBottom: 15 },
    periodChip: { paddingHorizontal: 15, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    timeGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    timeSlot: { width: '31%', height: 44, borderRadius: 10, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginRight: '2%', marginBottom: 10 },
    customTimeDisplay: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: 'rgba(115, 29, 63, 0.05)', borderRadius: 15, justifyContent: 'space-between' },
    customTimeText: { fontSize: 16, fontWeight: '600' },
    dynamicSection: { marginBottom: 20 },
    variantScroll: { flexDirection: 'row', marginTop: 5 },
    variantCard: { width: 130, padding: 15, borderRadius: 16, borderWidth: 1, marginRight: 12, justifyContent: 'center' },
    variantName: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
    variantPrice: { fontSize: 12, fontWeight: '600' },
    fieldLabel: { fontSize: 14, marginBottom: 12 },
    optionRow: { flexDirection: 'row' },
    optionChip: { paddingHorizontal: 15, height: 36, borderRadius: 18, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    optionText: { fontSize: 13 },
    input: { height: 50, borderRadius: 12, borderWidth: 1, paddingHorizontal: 15, fontSize: 14 },
    counterRow: { flexDirection: 'row', alignItems: 'center' },
    counterBtn: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
    counterValue: { fontSize: 22, marginHorizontal: 25 },
    noteBox: { marginTop: 10 },
    textArea: { height: 100, borderRadius: 15, borderWidth: 1, padding: 15, textAlignVertical: 'top', fontSize: 14 },
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 25, borderTopWidth: 1, flexDirection: 'row', alignItems: 'center' },
    priceContainer: { flex: 1 },
    totalLabel: { fontSize: 10, textTransform: 'uppercase', marginBottom: 4 },
    totalValue: { fontSize: 20 },
    payBtn: { width: 180, height: 54 },
    payGradient: { width: '100%', height: '100%', borderRadius: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    payText: { color: '#FFF', fontSize: 15, fontWeight: '700' }
});
