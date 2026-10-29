import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import api from '../../services/api';

type InventoryItem = {
    id: number; name: string; category: string; unit: string;
    current_stock: number; minimum_alert_level: number; is_low_stock: boolean;
};

export default function StockAnalyticsScreen() {
    const { colors, fonts } = useTheme();
    const router = useRouter();
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [refresh, setRefresh] = useState(0);

    useFocusEffect(useCallback(() => {
        let active = true;
        setLoading(true);
        setError('');
        api.get<InventoryItem[]>('/inventory').then(({ data }) => {
            if (active) setItems(data);
        }).catch((failure) => {
            if (active) {
                setItems([]);
                setError(failure.response?.status === 403 ? 'Inventory is available to authorized staff only.' : 'Unable to load inventory. Please try again.');
            }
        }).finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [refresh]));

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Go back">
                    <Ionicons name="arrow-back" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text style={{ color: colors.text, fontFamily: fonts.heading, fontSize: 22 }}>Inventory</Text>
                <TouchableOpacity onPress={() => setRefresh(value => value + 1)} accessibilityLabel="Refresh inventory">
                    <Ionicons name="refresh" size={24} color={colors.tint} />
                </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.content}>
                {loading ? <ActivityIndicator size="large" color={colors.tint} /> : error ? (
                    <Text style={{ color: colors.text, fontFamily: fonts.body }}>{error}</Text>
                ) : (
                    <>
                        <Text style={[styles.summary, { color: colors.text, fontFamily: fonts.body }]}>
                            {items.length} tracked items · {items.filter(item => item.is_low_stock).length} at or below minimum stock
                        </Text>
                        {items.length === 0 && <Text style={{ color: colors.text }}>No inventory has been recorded yet.</Text>}
                        {items.map(item => (
                            <View key={item.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <Text style={{ color: colors.text, fontFamily: fonts.heading, fontSize: 18 }}>{item.name}</Text>
                                <Text style={[styles.detail, { color: colors.text }]}>{item.category.replace(/_/g, ' ')}</Text>
                                <Text style={[styles.detail, { color: item.is_low_stock ? '#b45309' : colors.text }]}>
                                    {item.current_stock} {item.unit} available · Minimum {item.minimum_alert_level}
                                </Text>
                                {item.is_low_stock && <Text style={{ color: '#b45309' }}>Restock required</Text>}
                            </View>
                        ))}
                    </>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    content: { padding: 24 },
    summary: { marginBottom: 20, lineHeight: 23 },
    card: { padding: 20, borderRadius: 16, borderWidth: 1, marginBottom: 14 },
    detail: { marginVertical: 7 },
});
