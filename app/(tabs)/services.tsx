import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useWishlist } from '../../hooks/useWishlist';

const { width } = Dimensions.get('window');

const CATEGORIES = ['All', 'Interiors', 'Dining', 'Wellness', 'Concierge', 'Transport', 'Experiences', 'Workspace'];

import { serviceService } from '../../services/services';

export default function ServicesHub() {
    const { colors, fonts } = useTheme();
    const params = useLocalSearchParams();
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [bookingId, setBookingId] = useState<string | null>(null);
    const { toggleWishlist, isInWishlist } = useWishlist();

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        try {
            const data = await serviceService.getAllServices(selectedCategory === 'All' ? undefined : selectedCategory);
            setServices(data);
        } catch (error) {
            console.error('Failed to load services:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBookService = (service: any) => {
        if (service.type === 'order') {
            router.push({
                pathname: '/services/dining',
                params: { 
                    id: service.id,
                    name: service.name
                }
            });
            return;
        }

        router.push({
            pathname: '/services/request',
            params: { 
                id: service.id, 
                name: service.name, 
                price: service.price, 
                image: service.image,
                category: service.category,
                description: service.description
            }
        });
    };

    useEffect(() => {
        if (params.category) {
            setSelectedCategory(params.category as string);
        }
    }, [params.category]);

    const filteredServices = selectedCategory === 'All'
        ? services
        : services.filter(s => s.category === selectedCategory);

    const renderService = ({ item }: { item: any }) => (
        <TouchableOpacity style={[styles.serviceItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.imageWrapper}>
                <Image source={{ uri: item.image }} style={styles.serviceImage} />
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.6)']}
                    style={styles.imageOverlay}
                />
                <View style={[styles.categoryBadge, { backgroundColor: 'rgba(255,255,255,0.9)' }]}>
                    <Text style={[styles.categoryBadgeText, { color: colors.tint, fontFamily: fonts.button }]}>{item.category}</Text>
                </View>
                <TouchableOpacity 
                    style={styles.wishlistBtn}
                    onPress={() => toggleWishlist(item.id)}
                >
                    <Ionicons 
                        name={isInWishlist(item.id) ? "heart" : "heart-outline"} 
                        size={20} 
                        color={isInWishlist(item.id) ? colors.tint : "#FFF"} 
                    />
                </TouchableOpacity>
            </View>
            <View style={styles.serviceInfo}>
                <Text style={[styles.serviceName, { color: colors.text, fontFamily: fonts.heading }]} numberOfLines={2}>{item.name}</Text>
                <View style={styles.priceRow}>
                    <Text style={[styles.servicePrice, { color: colors.tint, fontFamily: fonts.button, flex: 1, marginRight: 5 }]} numberOfLines={1}>{item.price}</Text>
                    <TouchableOpacity
                        style={styles.addBtn}
                        onPress={() => handleBookService(item)}
                        disabled={bookingId === item.id}
                    >
                        <LinearGradient
                            colors={item.gradient || [colors.tint, '#6B2D5A']}
                            style={styles.addBtnGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            {bookingId === item.id ? (
                                <ActivityIndicator size="small" color="#FFF" />
                            ) : (
                                <Ionicons name="add" size={20} color="#FFF" />
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text, fontFamily: fonts.heading }]}>Elite Services</Text>
                <Text style={[styles.subtitle, { color: colors.text, fontFamily: fonts.body }]}>Exceptional care for your residence</Text>
            </View>

            <View style={styles.categoryContainer}>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={CATEGORIES}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => setSelectedCategory(item)}
                            style={styles.categoryBtnWrapper}
                        >
                            {selectedCategory === item ? (
                                <LinearGradient
                                    colors={[colors.tint, '#6B2D5A']}
                                    style={styles.categoryBtnActive}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <Text style={[styles.categoryText, { color: '#FFF', fontFamily: fonts.button }]}>{item}</Text>
                                </LinearGradient>
                            ) : (
                                <View style={[styles.categoryBtn, { borderColor: colors.border, backgroundColor: colors.card }]}>
                                    <Text style={[styles.categoryText, { color: colors.text, fontFamily: fonts.body }]}>{item}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    )}
                    contentContainerStyle={styles.categoryList}
                />
            </View>

            <FlatList
                data={filteredServices}
                renderItem={renderService}
                keyExtractor={(item) => item.id}
                numColumns={2}
                key={`services-grid-${selectedCategory}`}
                columnWrapperStyle={styles.row}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 25,
        paddingTop: 65,
        paddingBottom: 20,
    },
    title: {
        fontSize: 30,
    },
    subtitle: {
        fontSize: 15,
        opacity: 0.5,
        marginTop: 2,
    },
    categoryContainer: {
        marginBottom: 15,
    },
    categoryList: {
        paddingHorizontal: 25,
        paddingBottom: 10,
    },
    categoryBtnWrapper: {
        marginRight: 10,
    },
    categoryBtn: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 14,
        borderWidth: 1,
    },
    categoryBtnActive: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 14,
    },
    categoryText: {
        fontSize: 13,
    },
    listContent: {
        paddingHorizontal: 25,
        paddingBottom: 40,
    },
    row: {
        justifyContent: 'space-between',
    },
    serviceItem: {
        width: '48%',
        borderRadius: 24,
        borderWidth: 1,
        marginBottom: 20,
        overflow: 'hidden',
    },
    imageWrapper: {
        position: 'relative',
        width: '100%',
        height: 140,
    },
    serviceImage: {
        width: '100%',
        height: '100%',
    },
    imageOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 60,
    },
    categoryBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    categoryBadgeText: {
        fontSize: 9,
        letterSpacing: 0.5,
    },
    serviceInfo: {
        padding: 16,
    },
    serviceName: {
        fontSize: 15,
        marginBottom: 12,
        height: 40, // Allows for exactly 2 lines while keeping alignment
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    servicePrice: {
        fontSize: 14,
    },
    addBtn: {
        width: 36,
        height: 36,
    },
    addBtnGradient: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    wishlistBtn: {
        position: 'absolute',
        top: 12,
        left: 12,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
});
