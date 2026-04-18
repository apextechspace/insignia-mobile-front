import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../../services/auth';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function CreatePinScreen() {
    const { colors, fonts } = useTheme();
    const router = useRouter();
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePress = async (num: string) => {
        if (pin.length < 4) {
            const newPin = pin + num;
            setPin(newPin);
            
            if (newPin.length === 4) {
                // Execute Creation
                setLoading(true);
                try {
                    await authService.setupPin(newPin);
                    Alert.alert("Success", "Executive PIN securely established.", [
                        { text: "Continue", onPress: () => router.replace('/management/edit-profile') }
                    ]);
                } catch (error: any) {
                    Alert.alert("Error", error.response?.data?.message || "Failed to establish PIN.");
                    setPin('');
                } finally {
                    setLoading(false);
                }
            }
        }
    };

    const handleDelete = () => {
        setPin(pin.slice(0, -1));
    };

    const NumberPad = () => {
        const rows = [
            ['1', '2', '3'],
            ['4', '5', '6'],
            ['7', '8', '9'],
            ['', '0', 'del']
        ];

        return (
            <View style={styles.padContainer}>
                {rows.map((row, i) => (
                    <View key={i} style={styles.padRow}>
                        {row.map((btn) => (
                            <TouchableOpacity
                                key={btn}
                                style={[styles.padBtn, { backgroundColor: btn !== '' && btn !== 'del' ? colors.card : 'transparent', borderColor: btn !== '' && btn !== 'del' ? colors.border : 'transparent', borderWidth: 1 }]}
                                onPress={() => btn === 'del' ? handleDelete() : btn !== '' ? handlePress(btn) : null}
                                disabled={btn === '' || loading}
                            >
                                {btn === 'del' ? (
                                    <Ionicons name="backspace-outline" size={28} color={colors.text} />
                                ) : (
                                    <Text style={[styles.padBtnText, { color: colors.text, fontFamily: fonts.heading }]}>{btn}</Text>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                ))}
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="close" size={28} color={colors.text} />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <View style={[styles.iconBox, { backgroundColor: colors.tint + '15' }]}>
                    <Ionicons name="lock-closed" size={32} color={colors.tint} />
                </View>

                <Text style={[styles.title, { color: colors.text, fontFamily: fonts.heading }]}>Initialize Vault PIN</Text>
                <Text style={[styles.subtitle, { color: colors.text, fontFamily: fonts.body }]}>
                    To access your profile settings, please establish a firm 4-digit Executive PIN.
                </Text>

                <View style={styles.dotsContainer}>
                    {[0, 1, 2, 3].map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.dot,
                                {
                                    backgroundColor: i < pin.length ? colors.tint : 'transparent',
                                    borderColor: i < pin.length ? colors.tint : colors.border
                                }
                            ]}
                        />
                    ))}
                </View>

                {loading && <Text style={{ color: colors.tint, fontFamily: fonts.body, marginTop: 20 }}>Encrypting Sandbox...</Text>}
            </View>

            <View style={styles.padWrapper}>
                <NumberPad />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingHorizontal: 20, paddingTop: 60 },
    backBtn: { width: 44, height: 44, justifyContent: 'center' },
    content: { alignItems: 'center', paddingTop: 20, paddingHorizontal: 40 },
    iconBox: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 25 },
    title: { fontSize: 24, marginBottom: 10, textAlign: 'center' },
    subtitle: { fontSize: 14, textAlign: 'center', opacity: 0.6, lineHeight: 22, marginBottom: 40 },
    dotsContainer: { flexDirection: 'row', gap: 20 },
    dot: { width: 22, height: 22, borderRadius: 11, borderWidth: 2 },
    padWrapper: { flex: 1, justifyContent: 'flex-end', paddingBottom: 50 },
    padContainer: { paddingHorizontal: 40 },
    padRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    padBtn: { width: 75, height: 75, borderRadius: 38, justifyContent: 'center', alignItems: 'center' },
    padBtnText: { fontSize: 30 }
});
