import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const STOCK_DATA = [
    {
        id: '1', category: 'Executive Bar', items: [
            { name: 'Hennessy XO', level: 0.8, unit: '750ml' },
            { name: 'Moët & Chandon', level: 0.2, unit: 'Bottle' },
            { name: 'Mineral Water', level: 0.4, unit: '6pk' },
        ]
    },
    {
        id: '2', category: 'Pantry & Snacks', items: [
            { name: 'Nespresso Pods', level: 0.9, unit: 'Sleeves' },
            { name: 'Artisan Crackers', level: 0.3, unit: 'Pack' },
            { name: 'Premium Nuts', level: 1.0, unit: 'Jar' },
        ]
    },
    {
        id: '3', category: 'Wellness & Toiletries', items: [
            { name: 'Hermès Soap', level: 0.5, unit: 'Bar' },
            { name: 'Bath Salts', level: 0.1, unit: 'Vial' },
            { name: 'Luxury Lotion', level: 0.7, unit: 'Bottle' },
        ]
    }
];

export default function StockAnalyticsScreen() {
    const { colors, fonts } = useTheme();
    const router = useRouter();

    const StockItem = ({ item }: { item: any }) => (
        <View style={[styles.stockItem, { borderBottomColor: colors.border }]}>
            <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: colors.text, fontFamily: fonts.body }]}>{item.name}</Text>
                <Text style={[styles.itemUnit, { color: colors.text }]}>{item.unit}</Text>
            </View>
            <View style={styles.statusCol}>
                <View style={styles.levelContainer}>
                    <View style={[styles.levelBg, { backgroundColor: colors.border }]}>
                        <View
                            style={[
                                styles.levelFill,
                                {
                                    width: `${item.level * 100}%`,
                                    backgroundColor: item.level < 0.3 ? '#E74C3C' : colors.tint
                                }
                            ]}
                        />
                    </View>
                    <Text style={[styles.levelText, { color: colors.text }]}>{Math.round(item.level * 100)}%</Text>
                </View>
                <TouchableOpacity style={[styles.refillBtn, { borderColor: colors.tint }]}>
                    <Text style={[styles.refillText, { color: colors.tint, fontFamily: fonts.button }]}>Refill</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={28} color={colors.text} />
                </TouchableOpacity>
                <View>
                    <Text style={[styles.headerTitle, { color: colors.text, fontFamily: fonts.heading }]}>Stock Analytics</Text>
                    <Text style={[styles.headerSub, { color: colors.text, opacity: 0.5 }]}>Consumables Tracking</Text>
                </View>
                <TouchableOpacity style={styles.historyBtn}>
                    <Ionicons name="time-outline" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Summary Card */}
                <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.summaryItem}>
                        <Text style={[styles.summaryVal, { color: colors.tint, fontFamily: fonts.heading }]}>3</Text>
                        <Text style={[styles.summaryLab, { color: colors.text }]}>Low Items</Text>
                    </View>
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    <View style={styles.summaryItem}>
                        <Text style={[styles.summaryVal, { color: colors.text, fontFamily: fonts.heading }]}>12</Text>
                        <Text style={[styles.summaryLab, { color: colors.text }]}>Total Tracking</Text>
                    </View>
                </View>

                {STOCK_DATA.map((section) => (
                    <View key={section.id} style={styles.categorySection}>
                        <Text style={[styles.categoryTitle, { color: colors.text, fontFamily: fonts.heading, opacity: 0.7 }]}>
                            {section.category}
                        </Text>
                        <View style={[styles.itemsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            {section.items.map((item, idx) => (
                                <StockItem key={idx} item={item} />
                            ))}
                        </View>
                    </View>
                ))}

                <TouchableOpacity style={styles.autoRefillBar}>
                    <Ionicons name="flash-outline" size={18} color={colors.tint} />
                    <Text style={[styles.autoRefillText, { color: colors.text, fontFamily: fonts.body }]}>
                        Auto-Refill is <Text style={{ color: colors.tint, fontWeight: '700' }}>ENABLED</Text> for VIP suites
                    </Text>
                </TouchableOpacity>

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
    historyBtn: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'flex-end',
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
    summaryCard: {
        flexDirection: 'row',
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 30,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    summaryItem: {
        alignItems: 'center',
    },
    summaryVal: {
        fontSize: 24,
        marginBottom: 4,
    },
    summaryLab: {
        fontSize: 12,
        opacity: 0.5,
    },
    divider: {
        width: 1,
        height: 40,
    },
    categorySection: {
        marginBottom: 30,
    },
    categoryTitle: {
        fontSize: 14,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 15,
        marginLeft: 5,
    },
    itemsCard: {
        borderRadius: 24,
        borderWidth: 1,
        paddingHorizontal: 20,
    },
    stockItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 18,
        borderBottomWidth: 1,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 15,
        marginBottom: 4,
    },
    itemUnit: {
        fontSize: 11,
        opacity: 0.4,
    },
    statusCol: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    levelContainer: {
        alignItems: 'flex-end',
        marginRight: 15,
    },
    levelBg: {
        width: 60,
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 4,
    },
    levelFill: {
        height: '100%',
        borderRadius: 3,
    },
    levelText: {
        fontSize: 10,
        opacity: 0.5,
    },
    refillBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
    },
    refillText: {
        fontSize: 11,
        fontWeight: '600',
    },
    autoRefillBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        backgroundColor: 'rgba(0,0,0,0.03)',
        borderRadius: 12,
    },
    autoRefillText: {
        fontSize: 12,
        marginLeft: 10,
        opacity: 0.8,
    },
});
