import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

export type PaymentMethod = 'flutterwave' | 'opay' | 'bank_transfer';

interface Props {
    selectedMethod: PaymentMethod;
    onSelect: (method: PaymentMethod) => void;
}

export default function PaymentMethodSelector({ selectedMethod, onSelect }: Props) {
    const { colors, fonts } = useTheme();

    const isFlutterwave = selectedMethod === 'flutterwave' || selectedMethod === 'opay';

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { color: colors.text, fontFamily: fonts.heading }]}>
                Select Payment Method
            </Text>

            {/* 1. Flutterwave Checkout Option */}
            <TouchableOpacity
                style={[
                    styles.card,
                    {
                        backgroundColor: colors.card,
                        borderColor: isFlutterwave ? colors.tint : colors.border,
                        borderWidth: isFlutterwave ? 2 : 1,
                    },
                ]}
                onPress={() => onSelect('flutterwave')}
                activeOpacity={0.8}
            >
                <View style={styles.cardHeader}>
                    <View style={[styles.iconBox, { backgroundColor: colors.tint + '15' }]}>
                        <MaterialCommunityIcons name="shield-check" size={22} color={colors.tint} />
                    </View>
                    <View style={styles.cardInfo}>
                        <View style={styles.nameRow}>
                            <Text style={[styles.methodName, { color: colors.text, fontFamily: fonts.button }]}>
                                Flutterwave Checkout
                            </Text>
                            <View style={[styles.badge, { backgroundColor: '#27AE60' + '20' }]}>
                                <Text style={[styles.badgeText, { color: '#27AE60', fontFamily: fonts.button }]}>
                                    INSTANT
                                </Text>
                            </View>
                        </View>
                        <Text style={[styles.methodDesc, { color: colors.text, fontFamily: fonts.body }]}>
                            Cards (Mastercard, Visa, Verve), Bank Transfer & USSD
                        </Text>
                    </View>
                    <View
                        style={[
                            styles.radio,
                            {
                                borderColor: isFlutterwave ? colors.tint : colors.border,
                                backgroundColor: isFlutterwave ? colors.tint : 'transparent',
                            },
                        ]}
                    >
                        {isFlutterwave && <Ionicons name="checkmark" size={14} color="#FFF" />}
                    </View>
                </View>
            </TouchableOpacity>

            {/* 2. Manual Bank Transfer Option */}
            <TouchableOpacity
                style={[
                    styles.card,
                    {
                        backgroundColor: colors.card,
                        borderColor: selectedMethod === 'bank_transfer' ? colors.tint : colors.border,
                        borderWidth: selectedMethod === 'bank_transfer' ? 2 : 1,
                    },
                ]}
                onPress={() => onSelect('bank_transfer')}
                activeOpacity={0.8}
            >
                <View style={styles.cardHeader}>
                    <View style={[styles.iconBox, { backgroundColor: colors.border + '30' }]}>
                        <MaterialCommunityIcons name="bank" size={20} color={colors.text} />
                    </View>
                    <View style={styles.cardInfo}>
                        <View style={styles.nameRow}>
                            <Text style={[styles.methodName, { color: colors.text, fontFamily: fonts.button }]}>
                                Direct Bank Transfer
                            </Text>
                            <View style={[styles.badge, { backgroundColor: '#F39C12' + '20' }]}>
                                <Text style={[styles.badgeText, { color: '#F39C12', fontFamily: fonts.button }]}>
                                    MANUAL REVIEW
                                </Text>
                            </View>
                        </View>
                        <Text style={[styles.methodDesc, { color: colors.text, fontFamily: fonts.body }]}>
                            Transfer to corporate account & upload receipt
                        </Text>
                    </View>
                    <View
                        style={[
                            styles.radio,
                            {
                                borderColor: selectedMethod === 'bank_transfer' ? colors.tint : colors.border,
                                backgroundColor: selectedMethod === 'bank_transfer' ? colors.tint : 'transparent',
                            },
                        ]}
                    >
                        {selectedMethod === 'bank_transfer' && <Ionicons name="checkmark" size={14} color="#FFF" />}
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 25,
    },
    title: {
        fontSize: 16,
        marginBottom: 12,
        letterSpacing: 0.5,
    },
    card: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    cardInfo: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    methodName: {
        fontSize: 15,
        marginRight: 8,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    badgeText: {
        fontSize: 10,
        letterSpacing: 0.5,
    },
    methodDesc: {
        fontSize: 12,
        opacity: 0.7,
        lineHeight: 16,
    },
    radio: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
});
