import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../hooks/useTheme';
import { authService } from '../services/auth';
import { sessionService } from '../services/session';
import { registerForPushNotificationsAsync } from '../utils/notifications';

export default function LoginScreen() {
    const router = useRouter();
    const { colors, fonts } = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            alert("Please enter both email and password.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await authService.login({ email, password });
            if (response.access_token) {
                await sessionService.setToken(response.access_token);
                void registerForPushNotificationsAsync().catch(console.error);
            }
            router.replace('/branch-selection');
        } catch (error: any) {
            console.error('Login failed:', error);
            const msg = error.response?.data?.message || 'Login failed. Please check credentials or network.';
            alert(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGuest = () => {
        router.replace('/branch-selection');
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: colors.background }]}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Image 
                        source={require('../assets/images/logo.png')} 
                        style={styles.logo} 
                        resizeMode="contain" 
                    />
                    <Text style={[styles.title, { color: colors.tint, fontFamily: fonts.heading }]}>
                        Welcome
                    </Text>
                    <Text style={[styles.subtitle, { color: colors.text, fontFamily: fonts.body }]}>
                        Please sign in to continue to Insignia Courts
                    </Text>
                </View>

                <View style={styles.form}>
                    <TouchableOpacity onPress={() => router.push('/access-stay')} style={{ paddingVertical: 16 }}>
                        <Text style={{ color: colors.text }}>Access My Stay with an email sign-in link</Text>
                    </TouchableOpacity>
                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: colors.text, fontFamily: fonts.body }]}>Email Address</Text>
                        <TextInput
                            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
                            placeholder="e.g. guest@example.com"
                            placeholderTextColor="#999"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: colors.text, fontFamily: fonts.body }]}>Password</Text>
                        <TextInput
                            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
                            placeholder="••••••••"
                            placeholderTextColor="#999"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.loginButton, { backgroundColor: colors.tint, opacity: isLoading ? 0.7 : 1 }]}
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        <Text style={[styles.loginButtonText, { fontFamily: fonts.button }]}>
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.dividerContainer}>
                        <View style={[styles.line, { backgroundColor: colors.border }]} />
                        <Text style={[styles.orText, { color: colors.text, fontFamily: fonts.body }]}>OR</Text>
                        <View style={[styles.line, { backgroundColor: colors.border }]} />
                    </View>

                    <TouchableOpacity
                        style={[styles.guestButton, { borderColor: colors.tint }]}
                        onPress={handleGuest}
                    >
                        <Text style={[styles.guestButtonText, { color: colors.tint, fontFamily: fonts.button }]}>
                            Continue as Guest
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <View style={styles.footerRow}>
                        <Text style={[styles.footerText, { color: colors.text, fontFamily: fonts.body }]}>
                            Don't have an account?
                        </Text>
                        <TouchableOpacity onPress={() => router.push('/signup')}>
                            <Text style={[styles.footerLink, { color: colors.tint, fontFamily: fonts.button }]}> Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 30,
        justifyContent: 'center',
    },
    header: {
        marginBottom: 40,
        alignItems: 'center',
    },
    logo: {
        width: 180,
        height: 60,
        marginBottom: 20,
    },
    title: {
        fontSize: 32,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        opacity: 0.6,
        textAlign: 'center',
    },
    form: {
        width: '100%',
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        marginBottom: 8,
        opacity: 0.8,
    },
    input: {
        height: 55,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 15,
        fontSize: 16,
    },
    loginButton: {
        height: 55,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    loginButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 30,
    },
    line: {
        flex: 1,
        height: 1,
    },
    orText: {
        marginHorizontal: 15,
        fontSize: 12,
        opacity: 0.5,
    },
    guestButton: {
        height: 55,
        borderRadius: 12,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    guestButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        marginTop: 40,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        opacity: 0.7,
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    footerLink: {
        fontSize: 14,
        marginLeft: 5,
    },
});
