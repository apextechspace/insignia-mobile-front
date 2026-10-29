import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, TextInput, ScrollView, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../../services/auth';
import { BACKEND_URL } from '../../services/api';
import { appendImage } from '../../utils/uploads';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

export default function EditProfileScreen() {
    const { colors, fonts } = useTheme();
    const router = useRouter();

    const [user, setUser] = useState<any>(null);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [avatarUri, setAvatarUri] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const data = await authService.getUser();
                setUser(data);
                setName(data.name || '');
                setPhone(data.phone || '');
            } catch (error) {
                console.error('Failed to load user:', error);
            }
        };
        loadUser();
    }, []);

    const handlePickAvatar = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("Permission Denied", "Insignia requires gallery access to update Executive Badges.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setAvatarUri(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('phone', phone);

            if (avatarUri) {
                await appendImage(formData, 'avatar', { uri: avatarUri });
            }

            await authService.updateProfile(formData);
            Alert.alert("Profile Preserved", "Your Executive details have been securely synchronized.", [
                { text: "Return", onPress: () => router.replace('/(tabs)/profile') }
            ]);
        } catch (error: any) {
            Alert.alert("Sync Error", error.response?.data?.message || "Failed to save profile.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text, fontFamily: fonts.heading }]}>Secure Sandbox</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                
                <View style={styles.avatarSection}>
                    <TouchableOpacity onPress={handlePickAvatar} style={styles.avatarWrapper}>
                        <Image 
                            source={{ uri: avatarUri || (user?.avatar_url ? (user.avatar_url.startsWith('http') ? user.avatar_url : `${BACKEND_URL}${user.avatar_url}`) : null) || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80' }} 
                            style={[styles.avatar, { borderColor: colors.tint }]} 
                        />
                        <View style={[styles.editIconBadge, { backgroundColor: colors.tint }]}>
                            <Ionicons name="camera" size={16} color="#FFF" />
                        </View>
                    </TouchableOpacity>
                    <Text style={[styles.avatarLabel, { color: colors.text, fontFamily: fonts.body }]}>Update Executive Badge</Text>
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.text, fontFamily: fonts.heading }]}>Full Name</Text>
                    <TextInput 
                        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.card, fontFamily: fonts.body }]}
                        value={name}
                        onChangeText={setName}
                        placeholderTextColor="#999"
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.text, fontFamily: fonts.heading }]}>Direct Contact Number</Text>
                    <TextInput 
                        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.card, fontFamily: fonts.body }]}
                        value={phone}
                        onChangeText={setPhone}
                        placeholder="e.g. +234 800 000 0000"
                        keyboardType="phone-pad"
                        placeholderTextColor="#999"
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.text, fontFamily: fonts.heading }]}>Confidential Email</Text>
                    <TextInput 
                        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.card, opacity: 0.5, fontFamily: fonts.body }]}
                        value={user?.email || ''}
                        editable={false}
                        placeholderTextColor="#999"
                    />
                    <Text style={{ fontSize: 11, color: '#999', marginTop: 5, marginLeft: 5 }}>Contact management to alter email addresses.</Text>
                </View>

            </ScrollView>

            <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
                    <LinearGradient
                        colors={[colors.tint, '#6B2D5A']}
                        style={styles.saveBtnGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Text style={[styles.saveBtnText, { fontFamily: fonts.button }]}>
                            {loading ? 'Encrypting Changes...' : 'Commit Settings'}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
    backBtn: { width: 44, height: 44, justifyContent: 'center' },
    headerTitle: { fontSize: 18 },
    content: { padding: 25 },
    avatarSection: { alignItems: 'center', marginBottom: 40 },
    avatarWrapper: { position: 'relative', marginBottom: 15 },
    avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 3 },
    editIconBadge: { position: 'absolute', bottom: -5, right: -5, width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#1F1F1F' },
    avatarLabel: { fontSize: 13, opacity: 0.6 },
    formGroup: { marginBottom: 25 },
    label: { fontSize: 14, marginBottom: 10, opacity: 0.8 },
    input: { height: 56, borderWidth: 1, borderRadius: 15, paddingHorizontal: 20, fontSize: 15 },
    footer: { padding: 25, borderTopWidth: 1, paddingBottom: 40 },
    saveBtn: { height: 56 },
    saveBtnGradient: { width: '100%', height: '100%', borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
    saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '600' }
});
