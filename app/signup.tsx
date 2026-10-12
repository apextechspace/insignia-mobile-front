import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../services/auth';
import { sessionService } from '../services/session';

export default function SignupScreen() {
    const router = useRouter();
    const { colors, fonts } = useTheme();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSignup = async () => {
        if (!name || !email || !password) {
            alert("Please fill in all fields.");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        setIsLoading(true);
        try {
            const response = await authService.register({
                name,
                email,
                password,
                password_confirmation: confirmPassword
            });
            console.log('Signup success:', response);

            if (response.access_token) {
                await sessionService.setToken(response.access_token);
            }

            // For now, proceed as if successful
            router.replace('/branch-selection');
        } catch (error: any) {
            console.error('Signup failed:', error);
            const msg = error.response?.data?.message || 'Signup failed. Please try again.';
            alert(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: colors.background }]}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>

                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.tint, fontFamily: fonts.heading }]}>
                        Create Account
                    </Text>
                    <Text style={[styles.subtitle, { color: colors.text, fontFamily: fonts.body }]}>
                        Join Insignia Courts for an exclusive experience
                    </Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: colors.text, fontFamily: fonts.body }]}>Full Name</Text>
                        <TextInput
                            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
                            placeholder="e.g. John Doe"
                            placeholderTextColor="#999"
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: colors.text, fontFamily: fonts.body }]}>Email Address</Text>
                        <TextInput
                            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
                            placeholder="e.g. john@example.com"
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

                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: colors.text, fontFamily: fonts.body }]}>Confirm Password</Text>
                        <TextInput
                            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
                            placeholder="••••••••"
                            placeholderTextColor="#999"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.signupButton, { backgroundColor: colors.tint, opacity: isLoading ? 0.7 : 1 }]}
                        onPress={handleSignup}
                        disabled={isLoading}
                    >
                        <Text style={[styles.signupButtonText, { fontFamily: fonts.button }]}>
                            {isLoading ? 'Creating Account...' : 'Sign Up'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <View style={styles.footerRow}>
                        <Text style={[styles.footerText, { color: colors.text, fontFamily: fonts.body }]}>
                            Already have an account?
                        </Text>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Text style={[styles.footerLink, { color: colors.tint, fontFamily: fonts.button }]}> Sign In</Text>
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
        paddingTop: 60,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        marginBottom: 20,
    },
    header: {
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        opacity: 0.6,
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
    signupButton: {
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
    signupButtonText: {
        color: '#FFF',
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
