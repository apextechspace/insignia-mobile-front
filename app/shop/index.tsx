import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Dimensions, TextInput } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useWishlist } from '../../hooks/useWishlist';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 60) / 2;

const CATEGORIES = ['All', 'Aromatherapy', 'Textiles', 'Decor', 'Wellness'];

import { productService } from '../../services/products';

export default function ShopIndexScreen() {
    const { colors, fonts } = useTheme();
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const { toggleWishlist, isInWishlist } = useWishlist();

    useEffect(() => {
        loadProducts();
    }, [selectedCategory]);

    const loadProducts = async () => {
        setLoading(true);
        try {
            const data = await productService.getAllProducts(selectedCategory === 'All' ? undefined : selectedCategory);
            setProducts(data);

        } catch (error) {
            console.error('Failed to load products:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // const filteredProducts = ... (handled in loadProducts)

    const renderProduct = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[styles.productItem, { borderColor: colors.border, backgroundColor: colors.card, opacity: item.stock > 0 ? 1 : 0.7 }]}
            onPress={() => router.push({ pathname: '/shop/[id]', params: { id: item.id } })}
        >
            <View style={styles.imageContainer}>
                <Image source={{ uri: item.image }} style={styles.productImage} />
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.5)']}
                    style={styles.imageOverlay}
                />
                <TouchableOpacity 
                    style={styles.wishlistBtn}
                    onPress={() => toggleWishlist(item.id)}
                >
                    <Ionicons 
                        name={isInWishlist(item.id) ? "heart" : "heart-outline"} 
                        size={18} 
                        color={colors.tint} 
                    />
                </TouchableOpacity>
                
                {item.stock <= 0 && (
                    <View style={styles.outOfStockBadge}>
                        <Text style={styles.outOfStockText}>SOLD OUT</Text>
                    </View>
                )}
            </View>
            <View style={styles.productInfo}>
                <Text style={[styles.productCategory, { color: colors.tint, fontFamily: fonts.body }]}>{item.category}</Text>
                <Text style={[styles.productName, { color: colors.text, fontFamily: fonts.heading }]} numberOfLines={1}>
                    {item.name}
                </Text>
                <View style={styles.priceRow}>
                    <Text style={[styles.productPrice, { color: colors.tint, fontFamily: fonts.button, flex: 1, marginRight: 5 }]} numberOfLines={1}>{item.price}</Text>
                    <Ionicons name="add-circle" size={24} color={colors.tint} />
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text, fontFamily: fonts.heading }]}>Shop Selection</Text>
                <TouchableOpacity style={styles.cartBtn}>
                    <Ionicons name="cart-outline" size={24} color={colors.text} />
                    <View style={[styles.cartBadge, { backgroundColor: colors.tint, borderColor: colors.card }]} />
                </TouchableOpacity>
            </View>

            <View style={[styles.searchBar, { borderColor: colors.border, backgroundColor: colors.card }]}>
                <Ionicons name="search-outline" size={20} color={colors.text} style={{ opacity: 0.5 }} />
                <TextInput
                    style={[styles.searchInput, { color: colors.text, fontFamily: fonts.body }]}
                    placeholder="Search luxury products..."
                    placeholderTextColor={colors.text + '80'}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
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
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
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
                data={filteredProducts}
                renderItem={renderProduct}
                keyExtractor={(item) => item.id}
                numColumns={2}
                key={`shop-list-${selectedCategory}`} // Force fresh render on filter
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 25,
        paddingTop: 65,
        paddingBottom: 20,
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    title: {
        fontSize: 22,
    },
    cartBtn: {
        width: 40,
        height: 40,
        alignItems: 'flex-end',
        justifyContent: 'center',
        position: 'relative',
    },
    cartBadge: {
        position: 'absolute',
        top: 8,
        right: 0,
        width: 8,
        height: 8,
        borderRadius: 4,
        borderWidth: 1.5,
    },
    categoryContainer: {
        marginVertical: 15,
    },
    categoryList: {
        paddingHorizontal: 25,
    },
    categoryBtnWrapper: {
        marginRight: 10,
    },
    categoryBtn: {
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 14,
        borderWidth: 1,
    },
    categoryBtnActive: {
        paddingHorizontal: 18,
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
    searchBar: {
        marginHorizontal: 25,
        marginVertical: 10,
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FAFAFA',
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 14,
        paddingVertical: 0, // Remove Android padding
    },
    productItem: {
        width: ITEM_WIDTH,
        borderRadius: 24,
        borderWidth: 1,
        marginBottom: 20,
        overflow: 'hidden',
    },
    imageContainer: {
        width: '100%',
        height: ITEM_WIDTH * 1.1,
        position: 'relative',
    },
    imageOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 60,
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    wishlistBtn: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    productInfo: {
        padding: 15,
    },
    productCategory: {
        fontSize: 9,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
        opacity: 0.7,
    },
    productName: {
        fontSize: 14,
        marginBottom: 10,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    productPrice: {
        fontSize: 14,
    },
    outOfStockBadge: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    outOfStockText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
        backgroundColor: '#E74C3C',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
    },
});
