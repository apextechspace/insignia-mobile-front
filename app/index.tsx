import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../hooks/useTheme';

export default function SplashScreen() {
    const router = useRouter();
    const { colors, fonts } = useTheme();
    const fadeAnim = new Animated.Value(0);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
        }).start();

        const timer = setTimeout(() => {
            router.replace('/login');
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
                <Text style={[styles.title, { color: colors.tint, fontFamily: fonts.heading }]}>
                    INSIGNIA
                </Text>
                <Text style={[styles.subtitle, { color: colors.text, fontFamily: fonts.elegant }]}>
                    COURTS
                </Text>
                <View style={[styles.divider, { backgroundColor: colors.tint }]} />
                <Text style={[styles.tagline, { color: colors.text, fontFamily: fonts.body }]}>
                    Curated Serviced Living
                </Text>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 42,
        letterSpacing: 8,
    },
    subtitle: {
        fontSize: 24,
        letterSpacing: 4,
        marginTop: -10,
    },
    divider: {
        width: 40,
        height: 1,
        marginVertical: 20,
    },
    tagline: {
        fontSize: 14,
        letterSpacing: 2,
        textTransform: 'uppercase',
        opacity: 0.7,
    },
});
