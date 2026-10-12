import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';

const { width } = Dimensions.get('window');

export default function PaymentMethodsScreen() {
    const { colors, fonts } = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text, fontFamily: fonts.heading }]}>
                    Payment Methods
                </Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Active Gateway Banner */}
                <View style={styles.bannerContainer}>
                    <LinearGradient
                        colors={[colors.tint, '#5D1031']}
                        style={styles.bannerGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.bannerHeader}>
                            <View style={styles.bannerIconBox}>
                                <Ionicons name="flash" size={22} color={colors.tint} />
                            </View>
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Text style={[styles.bannerLabel, { fontFamily: fonts.button }]}>PRIMARY GATEWAY</Text>
                                <Text style={[styles.bannerTitle, { fontFamily: fonts.heading }]}>OPay Express Cashier</Text>
                            </View>
                            <View style={styles.activePill}>
                                <Text style={[styles.activePillText, { fontFamily: fonts.button }]}>ACTIVE</Text>
                            </View>
                        </View>
                        <Text style={[styles.bannerDesc, { fontFamily: fonts.body }]}>
                            Instant automated settlements enabled for your stays, boutique orders, room service, and concierge services.
                        </Text>
                    </LinearGradient>
                </View>

                {/* Available Channels */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fonts.heading }]}>
                        Supported Channels
                    </Text>

                    {/* 1. OPay Wallet */}
                    <View style={[styles.channelCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={[styles.channelIconBox, { backgroundColor: colors.tint + '15' }]}>
                            <Ionicons name="wallet-outline" size={22} color={colors.tint} />
                        </View>
                        <View style={styles.channelInfo}>
                            <Text style={[styles.channelName, { color: colors.text, fontFamily: fonts.button }]}>
                                OPay App Wallet
                            </Text>
                            <Text style={[styles.channelSub, { color: colors.text, fontFamily: fonts.body }]}>
                                One-tap instant payment from your mobile wallet
                            </Text>
                        </View>
                        <Ionicons name="checkmark-circle" size={20} color="#27AE60" />
                    </View>

                    {/* 2. Instant Bank Transfer */}
                    <View style={[styles.channelCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={[styles.channelIconBox, { backgroundColor: colors.tint + '15' }]}>
                            <MaterialCommunityIcons name="bank-transfer" size={24} color={colors.tint} />
                        </View>
                        <View style={styles.channelInfo}>
                            <Text style={[styles.channelName, { color: colors.text, fontFamily: fonts.button }]}>
                                Dynamic Bank Transfer
                            </Text>
                            <Text style={[styles.channelSub, { color: colors.text, fontFamily: fonts.body }]}>
                                Auto-generated one-time OPay virtual account
                            </Text>
                        </View>
                        <Ionicons name="checkmark-circle" size={20} color="#27AE60" />
                    </View>

                    {/* 3. Debit / Credit Cards */}
                    <View style={[styles.channelCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={[styles.channelIconBox, { backgroundColor: colors.tint + '15' }]}>
                            <Ionicons name="card-outline" size={22} color={colors.tint} />
                        </View>
                        <View style={styles.channelInfo}>
                            <Text style={[styles.channelName, { color: colors.text, fontFamily: fonts.button }]}>
                                Debit & Credit Cards
                            </Text>
                            <Text style={[styles.channelSub, { color: colors.text, fontFamily: fonts.body }]}>
                                Mastercard, Visa & Verve with 3D Secure
                            </Text>
                        </View>
                        <Ionicons name="checkmark-circle" size={20} color="#27AE60" />
                    </View>
                </View>

                {/* VIP Offline Transfer Account */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fonts.heading }]}>
                        VIP Corporate Settlement Account
                    </Text>
                    <View style={[styles.corporateCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={styles.corpRow}>
                            <Text style={[styles.corpKey, { color: colors.text }]}>Bank</Text>
                            <Text style={[styles.corpValue, { color: colors.text, fontFamily: fonts.button }]}>First Executive Bank</Text>
                        </View>
                        <View style={styles.corpRow}>
                            <Text style={[styles.corpKey, { color: colors.text }]}>Account Number</Text>
                            <Text style={[styles.corpValue, { color: colors.tint, fontFamily: fonts.heading }]}>0123 4567 8910</Text>
                        </View>
                        <View style={styles.corpRow}>
                            <Text style={[styles.corpKey, { color: colors.text }]}>Account Name</Text>
                            <Text style={[styles.corpValue, { color: colors.text, fontFamily: fonts.button }]}>Insignia Courts Group</Text>
                        </View>
                        <View style={styles.corpRow}>
                            <Text style={[styles.corpKey, { color: colors.text }]}>Manual Verification</Text>
                            <Text style={[styles.corpValue, { color: '#F39C12', fontFamily: fonts.button }]}>Available as Fallback</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    backBtn: { width: 44, height: 44, justifyContent: 'center' },
    headerTitle: { fontSize: 18 },
    scrollContent: { padding: 25 },
    bannerContainer: { borderRadius: 20, overflow: 'hidden', marginBottom: 30 },
    bannerGradient: { padding: 22 },
    bannerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    bannerIconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bannerLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 10, letterSpacing: 1 },
    bannerTitle: { color: '#FFF', fontSize: 18 },
    activePill: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: 'rgba(39, 174, 96, 0.3)',
        borderWidth: 1,
        borderColor: '#27AE60',
    },
    activePillText: { color: '#FFF', fontSize: 10, letterSpacing: 0.5 },
    bannerDesc: { color: 'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: 18 },
    section: { marginBottom: 30 },
    sectionTitle: { fontSize: 16, marginBottom: 15, letterSpacing: 0.5 },
    channelCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        marginBottom: 12,
    },
    channelIconBox: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    channelInfo: { flex: 1 },
    channelName: { fontSize: 15, marginBottom: 4 },
    channelSub: { fontSize: 12, opacity: 0.65, lineHeight: 16 },
    corporateCard: { borderRadius: 16, padding: 18, borderWidth: 1 },
    corpRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
    corpKey: { fontSize: 13, opacity: 0.7 },
    corpValue: { fontSize: 14 },
});
