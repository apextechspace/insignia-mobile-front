import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useWishlist } from '../../hooks/useWishlist';

const { width } = Dimensions.get('window');

import { productService } from '../../services/products';

export default function ProductDetailScreen() {
    const { colors, fonts } = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { id } = useLocalSearchParams();
    const [product, setProduct] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);
    const { toggleWishlist, isInWishlist } = useWishlist();

    React.useEffect(() => {
        if (id) loadProduct();
    }, [id]);

    const loadProduct = async () => {
        try {
            const data = await productService.getProductById(id as string);
            setProduct(data);
        } catch (error) {
            console.error('Failed to load product:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !product) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: colors.text }}>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.imageWrapper}>
                    <Image source={{ uri: product.image }} style={styles.image} />
                    <LinearGradient
                        colors={['rgba(0,0,0,0.3)', 'transparent']}
                        style={styles.topOverlay}
                    />
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>

                <View style={[styles.content, { backgroundColor: colors.background }]}>
                    <View style={styles.infoRow}>
                        <View style={{ flex: 1, marginRight: 15 }}>
                            <Text style={[styles.category, { color: colors.tint, fontFamily: fonts.body }]}>
                                {product.category} • {product.stock > 10 ? 'In Stock' : product.stock > 0 ? 'Limited Availability' : 'Sold Out'}
                            </Text>
                            <Text style={[styles.name, { color: colors.text, fontFamily: fonts.heading }]} numberOfLines={2}>{product.name}</Text>
                        </View>
                        <Text style={[styles.price, { color: colors.tint, fontFamily: fonts.button }]}>{product.price}</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fonts.heading }]}>Description</Text>
                        <Text style={[styles.description, { color: colors.text, fontFamily: fonts.body }]}>
                            {product.description}
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fonts.heading }]}>Specifications</Text>
                        {product.details?.map((detail: string, index: number) => (
                            <View key={index} style={styles.detailItem}>
                                <Ionicons name="checkmark-circle-outline" size={18} color={colors.tint} style={{ marginRight: 10 }} />
                                <Text style={[styles.detailText, { color: colors.text, fontFamily: fonts.body }]}>{detail}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>

            <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.card, paddingBottom: Math.max(insets.bottom, 25) }]}>
                <TouchableOpacity 
                    style={[styles.wishlistIcon, { borderColor: colors.border }]}
                    onPress={() => toggleWishlist(product.id)}
                >
                    <Ionicons 
                        name={isInWishlist(product.id) ? "heart" : "heart-outline"} 
                        size={24} 
                        color={isInWishlist(product.id) ? colors.tint : colors.text} 
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: product.stock > 0 ? colors.tint : '#BDC3C7' }]}
                    disabled={product.stock <= 0}
                    onPress={() => router.push({
                        pathname: '/shop/checkout',
                        params: { id: product.id, name: product.name, price: product.price, image: product.image, stock: product.stock }
                    })}
                >
                    <Text style={[styles.actionBtnText, { fontFamily: fonts.button }]}>
                        {product.stock > 0 ? 'Reserve Product' : 'Out of Stock'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    imageWrapper: {
        width: width,
        height: width * 1.25,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    topOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 100,
    },
    backBtn: {
        position: 'absolute',
        top: 60,
        left: 25,
        width: 45,
        height: 45,
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 22.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 25,
        backgroundColor: '#FAF9F8', // Slightly off from background for depth
        borderTopLeftRadius: 35,
        borderTopRightRadius: 35,
        marginTop: -35,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 25,
    },
    category: {
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    name: {
        fontSize: 26,
    },
    price: {
        fontSize: 24,
        fontWeight: '700',
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 18,
        marginBottom: 12,
    },
    description: {
        fontSize: 15,
        lineHeight: 24,
        opacity: 0.7,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    detailText: {
        fontSize: 14,
        opacity: 0.8,
    },
    footer: {
        padding: 25,
        paddingTop: 15,
        paddingBottom: 40,
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
    },
    wishlistIcon: {
        width: 55,
        height: 55,
        borderRadius: 15,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    actionBtn: {
        flex: 1,
        height: 55,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
