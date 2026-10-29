import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Dimensions, ActivityIndicator } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useWishlist } from '../../hooks/useWishlist';
import { productService } from '../../services/products';
import { serviceService } from '../../services/services';
import { roomService } from '../../services/rooms';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 60) / 2;

export default function WishlistScreen() {
    const { colors, fonts } = useTheme();
    const router = useRouter();
    const { wishlist, toggleWishlist } = useWishlist();
    const [favorites, setFavorites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadWishlistItems();
    }, [wishlist]);

    const loadWishlistItems = async () => {
        if (wishlist.length === 0) {
            setFavorites([]);
            setLoading(false);
            return;
        }

        try {
            // Fetch everything in parallel for "Pro" performance
            const [allProducts, allServices, allRooms] = await Promise.all([
                productService.getAllProducts(),
                serviceService.getAllServices(),
                roomService.getAllRooms()
            ]);

            // Combine and filter
            const likedProducts = allProducts
                .filter((p: any) => wishlist.includes(`product:${p.id}`))
                .map((p: any) => ({ ...p, wishType: 'product' }));

            const likedServices = allServices
                .filter((s: any) => wishlist.includes(`service:${s.id}`))
                .map((s: any) => ({ ...s, wishType: 'service' }));

            const likedRooms = allRooms
                .filter((r: any) => wishlist.includes(`room:${r.id}`))
                .map((r: any) => ({ 
                    ...r, 
                    wishType: 'room', 
                    image: r.images?.[0] || r.image, // Ensure image exists for rooms
                    price: `₦${Number(r.price_per_night).toLocaleString()}` 
                }));

            setFavorites([...likedProducts, ...likedServices, ...likedRooms]);
        } catch (error) {
            console.error('Failed to load wishlist items:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNavigate = (item: any) => {
        switch (item.wishType) {
            case 'product':
                router.push({ pathname: '/shop/[id]', params: { id: item.id } });
                break;
            case 'service':
                router.push({
                    pathname: '/services/request',
                    params: { 
                        id: item.id, 
                        name: item.name, 
                        price: item.price, 
                        image: item.image_url || item.image,
                        category: item.category,
                        description: item.description
                    }
                });
                break;
            case 'room':
                router.push({ pathname: '/suites/[id]', params: { id: item.id } });
                break;
        }
    };

    const renderFavorite = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[styles.itemCard, { borderColor: colors.border, backgroundColor: colors.card }]}
            onPress={() => handleNavigate(item)}
        >
            <View style={styles.imageContainer}>
                <Image source={{ uri: item.image_url || item.image }} style={styles.itemImage} />
                <TouchableOpacity 
                    style={styles.removeBtn}
                    onPress={() => toggleWishlist(item.id, item.wishType)}
                >
                    <Ionicons name="close" size={16} color="#FFF" />
                </TouchableOpacity>
                <View style={[styles.typeBadge, { backgroundColor: colors.tint }]}>
                    <Text style={styles.typeText}>{item.wishType.toUpperCase()}</Text>
                </View>
            </View>
            <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: colors.text, fontFamily: fonts.heading }]} numberOfLines={1}>
                    {item.name}
                </Text>
                <Text style={[styles.itemPrice, { color: colors.tint, fontFamily: fonts.button }]}>{item.wishType === 'room' ? item.price : `₦${Number(item.price).toLocaleString()}`}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text, fontFamily: fonts.heading }]}>My Favorites</Text>
                <View style={{ width: 44 }} />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.tint} />
                </View>
            ) : favorites.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="heart-dislike-outline" size={80} color={colors.border} />
                    <Text style={[styles.emptyTitle, { color: colors.text, fontFamily: fonts.heading }]}>Your wishlist is empty</Text>
                    <Text style={[styles.emptySub, { color: colors.text, fontFamily: fonts.body }]}>Save the services and products you love to find them later.</Text>
                    <TouchableOpacity 
                        style={[styles.exploreBtn, { backgroundColor: colors.tint }]}
                        onPress={() => router.push('/(tabs)/services')}
                    >
                        <Text style={[styles.exploreBtnText, { fontFamily: fonts.button }]}>Explore Services</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={favorites}
                    renderItem={renderFavorite}
                    keyExtractor={(item) => `${item.wishType}-${item.id}`}
                    numColumns={2}
                    columnWrapperStyle={styles.row}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    backBtn: { width: 44, height: 44, justifyContent: 'center' },
    title: { fontSize: 22 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { paddingHorizontal: 20, paddingBottom: 40 },
    row: { justifyContent: 'space-between' },
    itemCard: {
        width: ITEM_WIDTH,
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 20,
        overflow: 'hidden',
    },
    imageContainer: {
        width: '100%',
        height: ITEM_WIDTH,
        position: 'relative',
    },
    itemImage: { width: '100%', height: '100%' },
    removeBtn: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 5,
    },
    typeBadge: {
        position: 'absolute',
        bottom: 8,
        left: 8,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    typeText: { color: '#FFF', fontSize: 8, fontWeight: '700', letterSpacing: 0.5 },
    itemInfo: { padding: 12 },
    itemName: { fontSize: 14, marginBottom: 4 },
    itemPrice: { fontSize: 14 },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyTitle: { fontSize: 20, marginTop: 20, textAlign: 'center' },
    emptySub: { fontSize: 14, textAlign: 'center', opacity: 0.5, marginTop: 10, marginBottom: 30 },
    exploreBtn: { paddingHorizontal: 30, paddingVertical: 15, borderRadius: 15 },
    exploreBtnText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
});
