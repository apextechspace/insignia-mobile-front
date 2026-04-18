import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const BRANCHES = [
    {
        id: 'wuse',
        name: 'Insignia Court - Wuse II',
        location: 'Wuse II, Abuja',
        status: 'Active',
        image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    },
    {
        id: 'maitama',
        name: 'COMING SOON',
        location: 'Maitama, Abuja',
        status: 'Coming Soon',
        image: 'https://images.unsplash.com/photo-1578683062331-1f912443491f?auto=format&fit=crop&w=800&q=80',
    },
    {
        id: 'gwarimpa',
        name: 'COMING SOON',
        location: 'Gwarimpa, Abuja',
        status: 'Coming Soon',
        image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
    },
];

export default function BranchSelectionScreen() {
    const { colors, fonts } = useTheme();
    const router = useRouter();

    const handleSelect = (branch: any) => {
        if (branch.status === 'Active') {
            router.replace('/(tabs)');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <LinearGradient
                colors={[colors.tint + '10', 'transparent']}
                style={styles.bgGradient}
            />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Image 
                        source={require('../assets/images/logo.png')} 
                        style={styles.logo} 
                        resizeMode="contain" 
                    />
                    <Text style={[styles.title, { color: colors.tint, fontFamily: fonts.heading }]}>
                        WELCOME TO INSIGNIA COURT
                    </Text>
                    <Text style={[styles.subtitle, { color: colors.text, fontFamily: fonts.body }]}>
                        Select your stay:
                    </Text>
                </View>

                {BRANCHES.map((branch) => {
                    const isActive = branch.status === 'Active';
                    return (
                        <TouchableOpacity
                            key={branch.id}
                            style={[
                                styles.branchCard,
                                { backgroundColor: colors.card, borderColor: isActive ? colors.border : colors.tint + '20' },
                                !isActive && { opacity: 0.8 }
                            ]}
                            onPress={() => handleSelect(branch)}
                            disabled={!isActive}
                        >
                            {isActive ? (
                                <>
                                    <Image source={{ uri: branch.image }} style={styles.branchImage} />
                                    <LinearGradient
                                        colors={['transparent', 'rgba(0,0,0,0.7)']}
                                        style={styles.imageOverlay}
                                    />

                                    <View style={styles.branchDetails}>
                                        <View style={styles.statusRow}>
                                            <Text style={[styles.location, { color: '#FFF' }]}>{branch.location}</Text>
                                            <View style={[
                                                styles.statusBadge,
                                                { backgroundColor: colors.tint }
                                            ]}>
                                                <Text style={styles.statusText}>{branch.status.toUpperCase()}</Text>
                                            </View>
                                        </View>
                                        <Text style={[styles.branchName, { color: '#FFF', fontFamily: fonts.heading }]}>
                                            {branch.name}
                                        </Text>
                                    </View>

                                    <View style={[styles.arrowBox, { backgroundColor: colors.tint }]}>
                                        <Ionicons name="chevron-forward" size={24} color="#FFF" />
                                    </View>
                                </>
                            ) : (
                                <View style={styles.comingSoonContainer}>
                                    <LinearGradient
                                        colors={[colors.tint + '10', colors.tint + '05']}
                                        style={StyleSheet.absoluteFill}
                                    />
                                    <Ionicons name="time-outline" size={32} color={colors.tint} style={{ marginBottom: 10, opacity: 0.5 }} />
                                    <Text style={[styles.comingSoonText, { color: colors.tint, fontFamily: fonts.heading }]}>
                                        {branch.name}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}

                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: colors.text, fontFamily: fonts.body }]}>
                        Need assistance?{' '}
                        <Text
                            style={{ color: colors.tint, fontWeight: 'bold' }}
                            onPress={() => Linking.openURL('https://wa.me/2349110111133')}
                        >
                            Contact Concierge
                        </Text>
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    bgGradient: {
        ...StyleSheet.absoluteFillObject,
        height: 300,
    },
    scrollContent: {
        padding: 25,
        paddingTop: 80,
    },
    header: {
        marginBottom: 40,
        alignItems: 'center',
    },
    logo: {
        width: 150,
        height: 50,
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        opacity: 0.6,
        lineHeight: 24,
        fontStyle: 'italic',
        textAlign: 'center',
    },
    branchCard: {
        height: 200,
        borderRadius: 24,
        borderWidth: 1,
        marginBottom: 25,
        overflow: 'hidden',
        position: 'relative',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
    },
    branchImage: {
        width: '100%',
        height: '100%',
    },
    imageOverlay: {
        ...StyleSheet.absoluteFillObject,
    },
    branchDetails: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 60,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    location: {
        fontSize: 12,
        opacity: 0.8,
        marginRight: 10,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    statusText: {
        color: '#FFF',
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    branchName: {
        fontSize: 22,
    },
    arrowBox: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        marginTop: 20,
        alignItems: 'center',
        paddingBottom: 40,
    },
    footerText: {
        fontSize: 14,
        opacity: 0.5,
    },
    comingSoonContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    comingSoonText: {
        fontSize: 20,
        textAlign: 'center',
        opacity: 0.8,
    },
});
