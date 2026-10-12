import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Switch } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { authService } from '../../services/auth';
import { BACKEND_URL } from '../../services/api';
import { sessionService } from '../../services/session';

export default function ProfileScreen() {
    const { colors, fonts } = useTheme();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const data = await authService.getUser();
                setUser(data);
            } catch (error) {
                console.error('Failed to load user in profile:', error);
            }
        };
        loadUser();
    }, []);

    const MenuItem = ({ icon, title, subtitle, onPress }: any) => (
        <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            onPress={onPress}
        >
            <View style={[styles.iconBox, { backgroundColor: colors.tint + '10' }]}>
                <Ionicons name={icon} size={22} color={colors.tint} />
            </View>
            <View style={styles.menuInfo}>
                <Text style={[styles.menuTitle, { color: colors.text, fontFamily: fonts.body }]}>{title}</Text>
                {subtitle && <Text style={[styles.menuSub, { color: colors.text, fontFamily: fonts.body }]}>{subtitle}</Text>}
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.border} />
        </TouchableOpacity>
    );

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <View style={[styles.profileImageContainer, { borderColor: colors.tint }]}>
                    <Image
                        source={{ uri: user?.avatar_url ? (user.avatar_url.startsWith('http') ? user.avatar_url : `${BACKEND_URL}${user.avatar_url}`) : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80' }}
                        style={styles.profileImage}
                    />
                </View>
                <Text style={[styles.userName, { color: colors.text, fontFamily: fonts.heading }]}>{user?.name || 'Guest User'}</Text>
                <Text style={[styles.userEmail, { color: colors.text, fontFamily: fonts.body }]}>{user?.email || 'N/A'}</Text>
                {user?.phone && (
                    <Text style={[styles.userPhone, { color: colors.text, fontFamily: fonts.body }]}>{user.phone}</Text>
                )}
                <TouchableOpacity 
                    style={[styles.editBtn, { borderColor: colors.tint }]}
                    onPress={() => {
                        if (user?.has_security_pin) {
                            router.push('/management/security-check');
                        } else {
                            router.push('/management/create-pin');
                        }
                    }}
                >
                    <Text style={[styles.editBtnText, { color: colors.tint, fontFamily: fonts.button }]}>Edit Profile</Text>
                </TouchableOpacity>
            </View>

            {(user?.role === 'admin' || user?.role === 'staff') && (
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fonts.heading }]}>Executive Management</Text>
                    <MenuItem icon="business-outline" title="Apartment Management" subtitle="Maintenance & Guest Access" onPress={() => router.push('/management/apartment')} />
                    <MenuItem icon="stats-chart-outline" title="Stock Analytics" subtitle="Consumables & Tracking" onPress={() => router.push('/management/stock')} />
                    <MenuItem icon="fitness-outline" title="Personal Activities" subtitle="Bookings & Schedules" onPress={() => router.push('/management/activities')} />
                </View>
            )}

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fonts.heading }]}>Your Activity</Text>
                <MenuItem icon="calendar-outline" title="Room Bookings" subtitle="Manage your stays" onPress={() => router.push('/management/bookings')} />
                <MenuItem icon="cart-outline" title="Shop Orders" subtitle="Track luxury purchases" onPress={() => router.push('/management/orders')} />
                <MenuItem icon="restaurant-outline" title="Service Orders" subtitle="Food, Massage, Transport" onPress={() => router.push('/management/service-orders')} />
                <MenuItem icon="notifications-outline" title="Notifications" subtitle="Booking updates & alerts" onPress={() => router.push('/management/notifications')} />
                <MenuItem icon="heart-outline" title="My Favorites" subtitle="Saved services, rooms & products" onPress={() => router.push('/management/wishlist')} />
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fonts.heading }]}>Preferences</Text>
                <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
                    <View style={styles.settingInfo}>
                        <Ionicons name="notifications-outline" size={22} color={colors.tint} style={styles.settingIcon} />
                        <Text style={[styles.menuTitle, { color: colors.text, fontFamily: fonts.body }]}>Push Notifications</Text>
                    </View>
                    <Switch value={true} trackColor={{ true: colors.tint }} />
                </View>
                <MenuItem icon="card-outline" title="Payment Methods" subtitle="Manage saved cards" onPress={() => router.push('/management/payment-methods')} />
                <MenuItem icon="shield-checkmark-outline" title="Security PIN" subtitle={user?.has_security_pin ? 'PIN is active' : 'Set up your PIN'} onPress={() => router.push(user?.has_security_pin ? '/management/security-check' : '/management/create-pin')} />
            </View>

            <TouchableOpacity
                style={styles.logoutBtn}
                onPress={async () => {
                    try {
                        await authService.logout();
                    } catch (error) {
                        console.warn('Logout request failed, clearing local session anyway.', error);
                    } finally {
                        await sessionService.clearToken();
                        router.replace('/login');
                    }
                }}
            >
                <Ionicons name="log-out-outline" size={22} color="#E74C3C" />
                <Text style={[styles.logoutText, { fontFamily: fonts.button }]}>Log Out</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
                <Text style={[styles.footerText, { color: colors.text, fontFamily: fonts.body }]}>Insignia Courts v1.0.0</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        alignItems: 'center',
        paddingVertical: 50,
    },
    profileImageContainer: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 2,
        padding: 3,
        marginBottom: 15,
    },
    profileImage: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
    },
    userName: {
        fontSize: 22,
        marginBottom: 5,
    },
    userEmail: {
        fontSize: 14,
        opacity: 0.6,
        marginBottom: 4,
    },
    userPhone: {
        fontSize: 13,
        opacity: 0.45,
        marginBottom: 20,
    },
    editBtn: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    editBtnText: {
        fontSize: 13,
    },
    section: {
        paddingHorizontal: 25,
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 16,
        marginBottom: 15,
        opacity: 0.7,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
    },
    iconBox: {
        width: 42,
        height: 42,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    menuInfo: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 15,
        fontWeight: '500',
    },
    menuSub: {
        fontSize: 12,
        opacity: 0.5,
        marginTop: 2,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        borderBottomWidth: 1,
    },
    settingInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingIcon: {
        marginRight: 15,
        width: 42,
        textAlign: 'center',
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 30,
    },
    logoutText: {
        color: '#E74C3C',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 10,
    },
    footer: {
        alignItems: 'center',
        paddingBottom: 40,
    },
    footerText: {
        fontSize: 12,
        opacity: 0.3,
    },
});
