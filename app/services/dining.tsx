import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Dimensions, ScrollView, ActivityIndicator, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { foodService } from '../../services/food';

const { width, height } = Dimensions.get('window');

export default function DiningMenuScreen() {
    const { colors, fonts } = useTheme();
    const router = useRouter();
    const params = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [cart, setCart] = useState<any[]>([]);
    const [selectedItem, setSelectedItem] = useState<any | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [showCart, setShowCart] = useState(false);
    useEffect(() => {
        if (params.id) {
            loadMenu(parseInt(params.id as string));
        }
    }, [params.id]);

    const loadMenu = async (serviceId: number) => {
        try {
            const response = await foodService.getMenu(serviceId);
            setCategories(response.data);
            if (response.data.length > 0) {
                setSelectedCategory(response.data[0].id);
            }
        } catch (error) {
            console.error('Failed to load menu:', error);
            Alert.alert('Error', 'Failed to load dining menu');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        if (!selectedItem) return;
        
        setCart(prevCart => {
            const existingItem = prevCart.find(i => i.id === selectedItem.id);
            if (existingItem) {
                return prevCart.map(i => i.id === selectedItem.id ? { ...i, quantity: i.quantity + quantity } : i);
            }
            return [...prevCart, { ...selectedItem, quantity }];
        });
        
        setSelectedItem(null);
        setQuantity(1);
    };

    const removeFromCart = (itemId: number) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(i => i.id === itemId);
            if (existingItem && existingItem.quantity > 1) {
                return prevCart.map(i => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i);
            }
            return prevCart.filter(i => i.id !== itemId);
        });
    };

    const getTotal = () => {
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const handlePlaceOrder = (type: 'room_service' | 'pickup') => {
        if (cart.length === 0) return;

        setShowCart(false);
        router.push({
            pathname: '/services/dining-payment',
            params: {
                serviceName: String(params.name || 'Dining'),
                total: String(getTotal()),
                type,
                items: JSON.stringify(
                    cart.map(item => ({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                    }))
                ),
            },
        });
    };

    const activeCategoryData = categories.find(c => c.id === selectedCategory);

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color={colors.tint} />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { fontFamily: fonts.heading, color: colors.text }]}>{params.name || 'Dining'}</Text>
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.iconBtn}><Ionicons name="heart-outline" size={22} color={colors.text} /></TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn}><Ionicons name="search-outline" size={22} color={colors.text} /></TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn}><Ionicons name="share-social-outline" size={22} color={colors.text} /></TouchableOpacity>
                </View>
            </View>

            {/* Categories */}
            <View style={[styles.categoriesContainer, { borderBottomColor: colors.border }]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
                    {categories.map(cat => (
                        <TouchableOpacity
                            key={cat.id}
                            onPress={() => setSelectedCategory(cat.id)}
                            style={[styles.categoryItem, selectedCategory === cat.id && styles.categoryItemActive]}
                        >
                            <Text style={[
                                styles.categoryText,
                                { color: selectedCategory === cat.id ? colors.tint : colors.tabIconDefault, fontWeight: selectedCategory === cat.id ? 'bold' : 'normal' }
                            ]}>
                                {cat.name}
                            </Text>
                            {selectedCategory === cat.id && <View style={[styles.activeUnderline, { backgroundColor: colors.tint }]} />}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Item List */}
            <FlatList
                data={activeCategoryData?.menu_items || []}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.itemList}
                renderItem={({ item }) => (
                    <View style={styles.itemRow}>
                        <TouchableOpacity 
                            style={styles.itemTextContent}
                            onPress={() => setSelectedItem(item)}
                        >
                            <Text style={[styles.itemName, { fontFamily: fonts.heading }]}>{item.name}</Text>
                            <Text style={[styles.itemDesc, { fontFamily: fonts.body }]} numberOfLines={2}>{item.description}</Text>
                            <Text style={styles.itemPrice}>from ₦{parseFloat(item.price).toLocaleString()}</Text>
                        </TouchableOpacity>
                        <View style={styles.itemImageContainer}>
                            <Image source={{ uri: item.image }} style={styles.itemImage} />
                            <TouchableOpacity 
                                style={[styles.addPlusBtn, { backgroundColor: colors.tint + '10', borderColor: colors.tint + '30' }]}
                                onPress={() => setSelectedItem(item)}
                            >
                                <Text style={[styles.addPlusText, { color: colors.tint }]}>Add +</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: colors.border }]} />}
            />

            {/* Footer Cart Bar */}
            {cart.length > 0 && (
                <TouchableOpacity style={[styles.cartBar, { backgroundColor: colors.tint }]} onPress={() => setShowCart(true)}>
                    <View style={styles.cartBarContent}>
                        <View style={[styles.cartCountBadge, { backgroundColor: colors.card }]}>
                            <Text style={[styles.cartCountText, { color: colors.tint }]}>{cart.length}</Text>
                        </View>
                        <Text style={styles.cartBarText}>View Cart • ₦{getTotal().toLocaleString()}</Text>
                    </View>
                    <Ionicons name="arrow-forward" size={20} color="#FFF" />
                </TouchableOpacity>
            )}

            {/* Item Detail Modal */}
            <Modal
                visible={!!selectedItem}
                animationType="slide"
                transparent={false}
                onRequestClose={() => setSelectedItem(null)}
            >
                <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
                    <ScrollView bounces={false}>
                        <View style={styles.modalImageContainer}>
                            <Image source={{ uri: selectedItem?.image }} style={styles.modalImage} />
                            <TouchableOpacity 
                                style={[styles.closeBtn, { backgroundColor: colors.card }]}
                                onPress={() => setSelectedItem(null)}
                            >
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalContent}>
                            <Text style={[styles.modalName, { fontFamily: fonts.heading, color: colors.text }]}>{selectedItem?.name}</Text>
                            <Text style={[styles.modalDesc, { fontFamily: fonts.body, color: colors.text + '99' }]}>{selectedItem?.description}</Text>
                            <Text style={[styles.modalPrice, { color: colors.text }]}>from ₦{parseFloat(selectedItem?.price || 0).toLocaleString()}</Text>
                            
                        </View>
                    </ScrollView>

                    {/* Modal Footer */}
                    <View style={[styles.modalFooter, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
                        <View style={[styles.qtyContainer, { borderColor: colors.border }]}>
                            <TouchableOpacity onPress={() => quantity > 1 && setQuantity(q => q - 1)} style={styles.qtyBtn}>
                                <Ionicons name="remove" size={24} color={colors.text} />
                            </TouchableOpacity>
                            <Text style={[styles.qtyValue, { color: colors.text }]}>{quantity}</Text>
                            <TouchableOpacity onPress={() => setQuantity(q => q + 1)} style={styles.qtyBtn}>
                                <Ionicons name="add" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={[styles.addToCartBtn, { backgroundColor: colors.tint }]} onPress={handleAddToCart}>
                            <Text style={styles.addToCartText}>Add ₦{(parseFloat(selectedItem?.price || 0) * quantity).toLocaleString()}</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </Modal>

            {/* Cart Overlay (Simplified) */}
            <Modal visible={showCart} animationType="fade" transparent={true}>
                 <View style={styles.cartOverlay}>
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowCart(false)} />
                    <View style={[styles.cartSheet, { backgroundColor: colors.card }]}>
                        <Text style={[styles.sheetTitle, { fontFamily: fonts.heading, color: colors.text }]}>Your Cart</Text>
                        <ScrollView style={{ maxHeight: 300 }}>
                            {cart.map(item => (
                                <View key={item.id} style={styles.cartRow}>
                                    <Text style={[styles.cartRowName, { color: colors.text }]}>{item.quantity}x {item.name}</Text>
                                    <Text style={[styles.cartRowPrice, { color: colors.text }]}>₦{(item.price * item.quantity).toLocaleString()}</Text>
                                </View>
                            ))}
                        </ScrollView>
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />
                        <View style={styles.sheetTotalRow}>
                            <Text style={[styles.sheetTotalLabel, { color: colors.text }]}>Total</Text>
                            <Text style={[styles.sheetTotalValue, { color: colors.tint }]}>₦{getTotal().toLocaleString()}</Text>
                        </View>
                        <TouchableOpacity 
                            style={[styles.finalCheckoutBtn, { backgroundColor: colors.tint }]}
                            onPress={() => handlePlaceOrder('room_service')}
                        >
                            <Text style={styles.finalCheckoutText}>Checkout</Text>
                        </TouchableOpacity>
                    </View>
                 </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: '#FFF',
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center' },
    headerRight: { flexDirection: 'row', alignItems: 'center' },
    iconBtn: { padding: 8 },
    headerTitle: { fontSize: 18, marginLeft: 10 },
    categoriesContainer: { borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    categoryList: { paddingHorizontal: 15 },
    categoryItem: {
        paddingVertical: 12,
        marginRight: 20,
        position: 'relative'
    },
    categoryItemActive: {},
    categoryText: { fontSize: 14, fontWeight: '500' },
    activeUnderline: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: '#00A86B'
    },
    itemList: { padding: 15 },
    itemRow: {
        flexDirection: 'row',
        paddingVertical: 15,
        justifyContent: 'space-between'
    },
    itemTextContent: { flex: 1, paddingRight: 15 },
    itemName: { fontSize: 16, marginBottom: 4, color: '#333' },
    itemDesc: { fontSize: 13, color: '#777', marginBottom: 8, lineHeight: 18 },
    itemPrice: { fontSize: 14, color: '#333', fontWeight: '500' },
    itemImageContainer: { alignItems: 'center' },
    itemImage: { width: 90, height: 90, borderRadius: 12, backgroundColor: '#F5F5F5' },
    addPlusBtn: {
        marginTop: -15,
        backgroundColor: '#E6F7F0',
        paddingHorizontal: 15,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#C2EBDD'
    },
    addPlusText: { color: '#00A86B', fontSize: 13, fontWeight: 'bold' },
    separator: { height: 1, backgroundColor: '#F0F0F0' },
    cartBar: {
        position: 'absolute',
        bottom: 20,
        left: 15,
        right: 15,
        height: 54,
        backgroundColor: '#004A3C',
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4
    },
    cartBarContent: { flexDirection: 'row', alignItems: 'center' },
    cartCountBadge: {
        backgroundColor: '#00A86B',
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    cartCountText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
    cartBarText: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },
    
    // Modal Styles
    modalContainer: { flex: 1, backgroundColor: '#FFF' },
    modalImageContainer: { width: '100%', height: 250, position: 'relative' },
    modalImage: { width: '100%', height: '100%' },
    closeBtn: {
        position: 'absolute',
        top: 20,
        right: 20,
        backgroundColor: '#FFF',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2
    },
    modalContent: { padding: 20 },
    modalName: { fontSize: 22, marginBottom: 8 },
    modalDesc: { fontSize: 15, color: '#666', lineHeight: 22, marginBottom: 12 },
    modalPrice: { fontSize: 18, fontWeight: 'bold', color: '#000', marginBottom: 20 },
    divider: { height: 8, backgroundColor: '#F8F8F8', marginHorizontal: -20 },
    optionSection: { paddingVertical: 20 },
    optionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    optionTitle: { fontSize: 16, fontWeight: 'bold', flex: 1 },
    requiredBadge: { backgroundColor: '#FEECEC', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    requiredText: { color: '#E53935', fontSize: 12, fontWeight: '500' },
    optionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    optionName: { flex: 1, fontSize: 15 },
    optionPrice: { marginRight: 15, fontSize: 14, color: '#777' },
    
    modalFooter: {
        padding: 20,
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        alignItems: 'center'
    },
    qtyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 12,
        padding: 4,
        marginRight: 15
    },
    qtyBtn: { padding: 8 },
    qtyValue: { fontSize: 16, fontWeight: 'bold', marginHorizontal: 15 },
    addToCartBtn: {
        flex: 1,
        backgroundColor: '#004A3C',
        height: 54,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center'
    },
    addToCartText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },

    cartOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    cartSheet: { backgroundColor: '#FFF', padding: 25, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
    sheetTitle: { fontSize: 20, marginBottom: 20 },
    cartRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    cartRowName: { fontSize: 15 },
    cartRowPrice: { fontSize: 15, fontWeight: 'bold' },
    sheetTotalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15 },
    sheetTotalLabel: { fontSize: 18, fontWeight: 'bold' },
    sheetTotalValue: { fontSize: 18, fontWeight: 'bold', color: '#00A86B' },
    finalCheckoutBtn: { backgroundColor: '#004A3C', height: 54, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
    finalCheckoutText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});
