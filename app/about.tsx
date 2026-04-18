import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function AboutScreen() {
    const { colors, fonts } = useTheme();
    const router = useRouter();

    const sections = [
        "Set in the heart of Abuja’s prime business and leisure district, Insignia Court offers a thoughtfully prepared serviced residence designed for comfort and convenience.",
        "Each room and suite is arranged to support both relaxation and productivity, with select spaces featuring a fitted kitchenette or coffee and tea corner.",
        "Guests have access to an in-house breakfast offering, other dining options for partner restaurants, laundry service, and neighbourhood errand support.",
        "For work and meetings, our partner boutique coworking space is available at preferred guest rates.",
        "For relaxation, massage therapies and other wellness services can be arranged on request.",
        "Within the residence, you’ll find a Japanese-inspired tea station and a curated décor collection, with select pieces available for purchase.",
        "The property is secured with controlled access and on-site personnel, and is conveniently located close to key business, shopping, and leisure destinations in Abuja.",
        "Our team remains available to support you and ensure a comfortable, well-coordinated stay."
    ];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                {/* Header Image */}
                <View style={styles.headerImageContainer}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80' }}
                        style={styles.headerImage}
                    />
                    <LinearGradient
                        colors={['rgba(0,0,0,0.3)', 'transparent', colors.background]}
                        style={styles.overlay}
                    />
                    
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>

                    <View style={styles.titleContainer}>
                        <Text style={[styles.title, { color: '#FFF', fontFamily: fonts.heading }]}>INSIGNIA COURT</Text>
                        <View style={[styles.titleLine, { backgroundColor: colors.tint }]} />
                        <Text style={[styles.subtitle, { color: '#FFF', fontFamily: fonts.body }]}>A Note From Us</Text>
                    </View>
                </View>

                {/* Content */}
                <View style={styles.content}>
                    {sections.map((text, index) => (
                        <View key={index} style={styles.section}>
                            <View style={[styles.accentLine, { backgroundColor: colors.tint + '40' }]} />
                            <Text style={[styles.paragraph, { color: colors.text, fontFamily: fonts.body }]}>
                                {text}
                            </Text>
                        </View>
                    ))}

                    <TouchableOpacity 
                        style={[styles.ctaBtn, { backgroundColor: colors.tint }]}
                        onPress={() => router.push('/(tabs)/suites')}
                    >
                        <Text style={[styles.ctaText, { fontFamily: fonts.button }]}>EXPLORE OUR RESIDENCES</Text>
                        <Ionicons name="arrow-forward" size={18} color="#FFF" style={{ marginLeft: 10 }} />
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Image 
                            source={{ uri: 'https://images.unsplash.com/photo-1578683062331-1f912443491f?auto=format&fit=crop&w=300&q=80' }}
                            style={styles.footerIcon}
                        />
                        <Text style={[styles.footerText, { color: colors.text, fontFamily: fonts.body }]}>
                            Curated Serviced Living
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerImageContainer: {
        height: height * 0.45,
        width: width,
        position: 'relative',
    },
    headerImage: {
        width: '100%',
        height: '100%',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
    },
    backBtn: {
        position: 'absolute',
        top: 60,
        left: 20,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleContainer: {
        position: 'absolute',
        bottom: 40,
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    title: {
        fontSize: 34,
        letterSpacing: 4,
        textAlign: 'center',
    },
    titleLine: {
        width: 40,
        height: 2,
        marginVertical: 12,
    },
    subtitle: {
        fontSize: 16,
        letterSpacing: 2,
        opacity: 0.9,
        textTransform: 'uppercase',
    },
    content: {
        paddingHorizontal: 30,
        paddingTop: 10,
        paddingBottom: 60,
    },
    section: {
        marginBottom: 25,
        position: 'relative',
        paddingLeft: 20,
    },
    accentLine: {
        position: 'absolute',
        left: 0,
        top: 8,
        bottom: 8,
        width: 1,
    },
    paragraph: {
        fontSize: 16,
        lineHeight: 28,
        letterSpacing: 0.3,
        opacity: 0.85,
        textAlign: 'justify',
    },
    ctaBtn: {
        height: 60,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
    },
    ctaText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 2,
    },
    footer: {
        marginTop: 60,
        alignItems: 'center',
        opacity: 0.4,
    },
    footerIcon: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginBottom: 10,
    },
    footerText: {
        fontSize: 12,
        letterSpacing: 1,
    }
});
