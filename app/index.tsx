import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Image, Dimensions, Platform } from 'react-native';
const { width } = Dimensions.get('window');
import { useRouter } from 'expo-router';
import { useTheme } from '../hooks/useTheme';
import { authService } from '../services/auth';
import { sessionService } from '../services/session';

export default function SplashScreen() {
    const router = useRouter();
    const { colors, fonts } = useTheme();
    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
        let isMounted = true;

        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: Platform.OS !== 'web',
        }).start();

        const bootstrapSession = async () => {
            try {
                await new Promise(resolve => setTimeout(resolve, 1800));

                const token = await sessionService.getToken();
                if (!token) {
                    if (isMounted) {
                        router.replace('/login');
                    }
                    return;
                }

                try {
                    await authService.getUser();
                    if (isMounted) {
                        router.replace('/branch-selection');
                    }
                } catch (error) {
                    console.error('Stored session is no longer valid:', error);
                    await sessionService.clearToken();
                    if (isMounted) {
                        router.replace('/login');
                    }
                }
            } catch (error) {
                console.error('Session bootstrap failed, fallback to login:', error);
                if (isMounted) {
                    router.replace('/login');
                }
            }
        };

        bootstrapSession();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
                <Image 
                    source={require('../assets/images/logo.png')} 
                    style={styles.logo} 
                    resizeMode="contain" 
                />
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
    logo: {
        width: 150,
        height: 50,
        marginBottom: 20,
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
