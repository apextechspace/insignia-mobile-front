import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Dimensions, ActivityIndicator } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useWishlist } from '../../hooks/useWishlist';
import { productService } from '../../services/products';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 60) / 2;

export default function WishlistScreen() {
    const { colors, fonts } = useTheme();
    const router = useRouter();
    const { wishlist, toggleWishlist } = useWishlist();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadWishlistProducts();
    }, [wishlist]);

    const loadWishlistProducts = async () => {
        if (wishlist.length === 0) {
            setProducts([]);
            setLoading(false);
            return;
        }

        try {
            // In a real app, you might have a dedicated API for this.
            // For now, we'll fetch all products and filter locally for simplicity.
            const allProducts = await productService.getAllProducts();
            const filtered = allProducts.filter((p: any) => wishlist.includes(p.id));
            setProducts(filtered);
        } catch (error) {
            console.error('Failed to load wishlist products:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderProduct = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[styles.productItem, { borderColor: colors.border, backgroundColor: colors.card }]}
            onPress={() => router.push({ pathname: '/shop/[id]', params: { id: item.id } })}
        >
            <View style={styles.imageContainer}>
                <Image source={{ uri: item.image }} style={styles.productImage} />
                <TouchableOpacity 
                    style={styles.removeBtn}
                    onPress={() => toggleWishlist(item.id)}
                >
                    <Ionicons name="close" size={16} color="#FFF" />
                </TouchableOpacity>
            </View>
            <View style={styles.productInfo}>
                <Text style={[styles.productName, { color: colors.text, fontFamily: fonts.heading }]} numberOfLines={1}>
                    {item.name}
                </Text>
                <Text style={[styles.productPrice, { color: colors.tint, fontFamily: fonts.button }]}>{item.price}</Text>
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
            ) : products.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="heart-dislike-outline" size={80} color={colors.border} />
                    <Text style={[styles.emptyTitle, { color: colors.text, fontFamily: fonts.heading }]}>Your wishlist is empty</Text>
                    <Text style={[styles.emptySub, { color: colors.text, fontFamily: fonts.body }]}>Save items you love to find them later.</Text>
                    <TouchableOpacity 
                        style={[styles.shopBtn, { backgroundColor: colors.tint }]}
                        onPress={() => router.push('/shop')}
                    >
                        <Text style={[styles.shopBtnText, { fontFamily: fonts.button }]}>Go Shopping</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={products}
                    renderItem={renderProduct}
                    keyExtractor={(item) => item.id}
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
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    backBtn: {
        width: 44,
        height: 44,
        justifyContent: 'center',
    },
    title: {
        fontSize: 22,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    row: {
        justifyContent: 'space-between',
    },
    productItem: {
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
    productImage: {
        width: '100%',
        height: '100%',
    },
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
    },
    productInfo: {
        padding: 12,
    },
    productName: {
        fontSize: 14,
        marginBottom: 4,
    },
    productPrice: {
        fontSize: 14,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 20,
        marginTop: 20,
        textAlign: 'center',
    },
    emptySub: {
        fontSize: 14,
        textAlign: 'center',
        opacity: 0.5,
        marginTop: 10,
        marginBottom: 30,
    },
    shopBtn: {
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 15,
    },
    shopBtnText: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '600',
    },
});
