import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Dimensions } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function ApartmentManagementScreen() {
    const { colors, fonts } = useTheme();
    const router = useRouter();

    const [guestName, setGuestName] = useState('');
    const [maintenanceDesc, setMaintenanceDesc] = useState('');
    const [isUnlocked, setIsUnlocked] = useState(false);

    const handleUnlock = () => {
        setIsUnlocked(true);
        setTimeout(() => setIsUnlocked(false), 3000);
    };

    const handleRegisterGuest = () => {
        if (!guestName) return Alert.alert("Error", "Please enter guest name");
        Alert.alert("Success", `${guestName} has been registered and security notified.`);
        setGuestName('');
    };

    const handleSubmitMaintenance = () => {
        if (!maintenanceDesc) return Alert.alert("Error", "Please describe the issue");
        Alert.alert("Request Received", "Our facility team has been notified and will be with you shortly.");
        setMaintenanceDesc('');
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={28} color={colors.text} />
                </TouchableOpacity>
                <View>
                    <Text style={[styles.headerTitle, { color: colors.text, fontFamily: fonts.heading }]}>Apartment Management</Text>
                    <Text style={[styles.headerSub, { color: colors.text, opacity: 0.5 }]}>The Imperial Suite • Room 401</Text>
                </View>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Access Key Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionLabel, { color: colors.text, fontFamily: fonts.heading }]}>Digital Access Key</Text>
                    <View style={[styles.keyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={styles.keyHeader}>
                            <View style={[styles.keyIconContainer, { backgroundColor: isUnlocked ? '#27AE60' + '20' : colors.tint + '10' }]}>
                                <Ionicons name={isUnlocked ? "lock-open" : "lock-closed"} size={32} color={isUnlocked ? "#27AE60" : colors.tint} />
                            </View>
                            <View>
                                <Text style={[styles.keyTitle, { color: colors.text, fontFamily: fonts.heading }]}>Room Entry PIN</Text>
                                <Text style={[styles.keyPIN, { color: colors.tint, fontFamily: fonts.heading }]}>8 4 2 1</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.unlockBtn} onPress={handleUnlock}>
                            <LinearGradient
                                colors={isUnlocked ? ['#27AE60', '#2ECC71'] : [colors.tint, '#6B2D5A']}
                                style={styles.unlockBtnGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <Ionicons name={isUnlocked ? "checkmark-circle" : "bluetooth"} size={20} color="#FFF" style={{ marginRight: 10 }} />
                                <Text style={[styles.unlockBtnText, { fontFamily: fonts.button }]}>{isUnlocked ? "UNLOCKED" : "TAP TO UNLOCK (BLE)"}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Guest Registration */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionLabel, { color: colors.text, fontFamily: fonts.heading }]}>Guest Registration</Text>
                        <Ionicons name="people-outline" size={20} color={colors.tint} />
                    </View>
                    <View style={[styles.inputGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <TextInput
                            style={[styles.input, { color: colors.text, fontFamily: fonts.body }]}
                            placeholder="Enter guest full name"
                            placeholderTextColor="#999"
                            value={guestName}
                            onChangeText={setGuestName}
                        />
                        <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.tint }]} onPress={handleRegisterGuest}>
                            <Ionicons name="add" size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                    <Text style={[styles.inputSub, { color: colors.text }]}>Pre-registered guests will be granted access at the main gate.</Text>
                </View>

                {/* Maintenance Request */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionLabel, { color: colors.text, fontFamily: fonts.heading }]}>Maintenance Request</Text>
                        <Ionicons name="construct-outline" size={20} color={colors.tint} />
                    </View>
                    <View style={[styles.textAreaContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <TextInput
                            style={[styles.textArea, { color: colors.text, fontFamily: fonts.body }]}
                            placeholder="Describe the issue (e.g. AC cooling, plumbing...)"
                            placeholderTextColor="#999"
                            multiline
                            numberOfLines={4}
                            value={maintenanceDesc}
                            onChangeText={setMaintenanceDesc}
                        />
                    </View>
                    <TouchableOpacity style={[styles.submitBtn, { borderColor: colors.tint }]} onPress={handleSubmitMaintenance}>
                        <Text style={[styles.submitBtnText, { color: colors.tint, fontFamily: fonts.button }]}>Submit Request</Text>
                    </TouchableOpacity>
                </View>

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
    headerSub: {
        fontSize: 12,
        marginTop: 2,
    },
    scrollContent: {
        padding: 25,
    },
    section: {
        marginBottom: 35,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    sectionLabel: {
        fontSize: 16,
    },
    keyCard: {
        padding: 24,
        borderRadius: 24,
        borderWidth: 1,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    keyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
    },
    keyIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 20,
    },
    keyTitle: {
        fontSize: 14,
        opacity: 0.5,
        marginBottom: 4,
    },
    keyPIN: {
        fontSize: 32,
        letterSpacing: 10,
    },
    unlockBtn: {
        height: 54,
    },
    unlockBtnGradient: {
        width: '100%',
        height: '100%',
        borderRadius: 15,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    unlockBtnText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 1,
    },
    inputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 15,
        borderWidth: 1,
        paddingLeft: 15,
        overflow: 'hidden',
    },
    input: {
        flex: 1,
        height: 54,
        fontSize: 15,
    },
    addBtn: {
        width: 54,
        height: 54,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputSub: {
        fontSize: 12,
        opacity: 0.5,
        marginTop: 10,
    },
    textAreaContainer: {
        borderRadius: 15,
        borderWidth: 1,
        padding: 15,
        marginBottom: 15,
    },
    textArea: {
        height: 100,
        fontSize: 15,
        textAlignVertical: 'top',
    },
    submitBtn: {
        height: 50,
        borderRadius: 15,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitBtnText: {
        fontSize: 14,
        fontWeight: '600',
    },
});
