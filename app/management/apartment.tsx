import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Dimensions, Linking, ActivityIndicator } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { apartmentService } from '../../services/apartment';

const { width } = Dimensions.get('window');

export default function ApartmentManagementScreen() {
    const { colors, fonts } = useTheme();
    const router = useRouter();

    const [guestName, setGuestName] = useState('');
    const [maintenanceTitle, setMaintenanceTitle] = useState('');
    const [maintenanceDesc, setMaintenanceDesc] = useState('');
    const [maintenanceCategory, setMaintenanceCategory] = useState('General');
    const [loading, setLoading] = useState(false);
    const [guests, setGuests] = useState<any[]>([]);
    const [maintenanceHistory, setMaintenanceHistory] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [guestData, maintenanceData] = await Promise.all([
                apartmentService.listGuests(),
                apartmentService.listMaintenance()
            ]);
            setGuests(guestData);
            setMaintenanceHistory(maintenanceData);
        } catch (error) {
            console.error('Failed to load apartment data:', error);
        }
    };

    const handleRegisterGuest = async () => {
        if (!guestName) return Alert.alert("Error", "Please enter guest name");
        
        setLoading(true);
        try {
            const response = await apartmentService.registerGuest({ 
                guest_name: guestName,
                purpose: 'Visit' 
            });
            Alert.alert("Success", response.message);
            setGuestName('');
            loadData();
        } catch (error: any) {
            Alert.alert("Error", error.response?.data?.message || "Failed to register guest");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitMaintenance = async () => {
        if (!maintenanceTitle || !maintenanceDesc) {
            return Alert.alert("Error", "Please fill in all fields");
        }
        
        setLoading(true);
        try {
            const response = await apartmentService.submitMaintenance({
                category: maintenanceCategory,
                title: maintenanceTitle,
                description: maintenanceDesc,
                priority: 'normal'
            });
            
            Alert.alert(
                "Request Received", 
                response.message,
                [
                    { 
                        text: "Contact via WhatsApp", 
                        onPress: () => Linking.openURL(response.whatsapp_url) 
                    },
                    { text: "Done", style: 'cancel' }
                ]
            );
            
            setMaintenanceTitle('');
            setMaintenanceDesc('');
            loadData();
        } catch (error: any) {
            Alert.alert("Error", error.response?.data?.message || "Failed to submit request");
        } finally {
            setLoading(false);
        }
    };

    const categories = ['General', 'AC', 'Plumbing', 'Electrical', 'Internet', 'Furniture', 'Cleaning'];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={28} color={colors.text} />
                </TouchableOpacity>
                <View>
                    <Text style={[styles.headerTitle, { color: colors.text, fontFamily: fonts.heading }]}>Apartment Management</Text>
                    <Text style={[styles.headerSub, { color: colors.text, opacity: 0.5 }]}>Resident Support & Guest Access</Text>
                </View>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                
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
                        <TouchableOpacity 
                            style={[styles.addBtn, { backgroundColor: colors.tint }]} 
                            onPress={handleRegisterGuest}
                            disabled={loading}
                        >
                            {loading ? <ActivityIndicator color="#FFF" /> : <Ionicons name="add" size={24} color="#FFF" />}
                        </TouchableOpacity>
                    </View>
                    <Text style={[styles.inputSub, { color: colors.text }]}>Pre-registered guests will be granted access at the main gate.</Text>
                    
                    {guests.length > 0 && (
                        <View style={styles.historyList}>
                            {guests.slice(0, 3).map(guest => (
                                <View key={guest.id} style={styles.historyItem}>
                                    <Text style={[styles.historyName, { color: colors.text }]}>{guest.guest_name}</Text>
                                    <View style={[styles.statusBadge, { backgroundColor: guest.status === 'approved' ? '#27AE6020' : '#F39C1220' }]}>
                                        <Text style={[styles.statusText, { color: guest.status === 'approved' ? '#27AE60' : '#F39C12' }]}>{guest.status}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                {/* Maintenance Request */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionLabel, { color: colors.text, fontFamily: fonts.heading }]}>Maintenance Request</Text>
                        <Ionicons name="construct-outline" size={20} color={colors.tint} />
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
                        {categories.map(cat => (
                            <TouchableOpacity 
                                key={cat}
                                onPress={() => setMaintenanceCategory(cat)}
                                style={[
                                    styles.catBtn, 
                                    { borderColor: maintenanceCategory === cat ? colors.tint : colors.border },
                                    maintenanceCategory === cat && { backgroundColor: colors.tint + '10' }
                                ]}
                            >
                                <Text style={[styles.catText, { color: maintenanceCategory === cat ? colors.tint : colors.text }]}>{cat}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <View style={[styles.inputGroup, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: 15 }]}>
                        <TextInput
                            style={[styles.input, { color: colors.text, fontFamily: fonts.body }]}
                            placeholder="Brief title (e.g. AC not cooling)"
                            placeholderTextColor="#999"
                            value={maintenanceTitle}
                            onChangeText={setMaintenanceTitle}
                        />
                    </View>

                    <View style={[styles.textAreaContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <TextInput
                            style={[styles.textArea, { color: colors.text, fontFamily: fonts.body }]}
                            placeholder="Detailed description of the issue..."
                            placeholderTextColor="#999"
                            multiline
                            numberOfLines={4}
                            value={maintenanceDesc}
                            onChangeText={setMaintenanceDesc}
                        />
                    </View>
                    <TouchableOpacity 
                        style={[styles.submitBtn, { backgroundColor: colors.tint }]} 
                        onPress={handleSubmitMaintenance}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={[styles.submitBtnText, { color: '#FFF', fontFamily: fonts.button }]}>Submit & Contact WhatsApp</Text>}
                    </TouchableOpacity>
                </View>

                {maintenanceHistory.length > 0 && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionLabel, { color: colors.text, fontFamily: fonts.heading, marginBottom: 15 }]}>Recent Requests</Text>
                        {maintenanceHistory.slice(0, 3).map(item => (
                            <View key={item.id} style={[styles.historyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <View style={styles.historyCardHeader}>
                                    <Text style={[styles.historyCardTitle, { color: colors.text }]}>{item.title}</Text>
                                    <View style={[styles.statusBadge, { backgroundColor: item.status === 'resolved' ? '#27AE6020' : '#F39C1220' }]}>
                                        <Text style={[styles.statusText, { color: item.status === 'resolved' ? '#27AE60' : '#F39C12' }]}>{item.status}</Text>
                                    </View>
                                </View>
                                <Text style={[styles.historyCardDate, { color: colors.text }]}>{new Date(item.created_at).toLocaleDateString()}</Text>
                            </View>
                        ))}
                    </View>
                )}

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
        height: 54,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitBtnText: {
        fontSize: 15,
        fontWeight: '700',
    },
    catScroll: {
        marginBottom: 15,
    },
    catBtn: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
        marginRight: 10,
    },
    catText: {
        fontSize: 13,
        fontWeight: '500',
    },
    historyList: {
        marginTop: 15,
    },
    historyItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    historyName: {
        fontSize: 14,
        fontWeight: '500',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 9,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    historyCard: {
        padding: 15,
        borderRadius: 15,
        borderWidth: 1,
        marginBottom: 10,
    },
    historyCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    historyCardTitle: {
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
    },
    historyCardDate: {
        fontSize: 11,
        opacity: 0.5,
    },
});
