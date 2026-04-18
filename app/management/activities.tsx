import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { serviceService } from '../../services/services';

const { width } = Dimensions.get('window');

export default function PersonalActivitiesScreen() {
    const { colors, fonts } = useTheme();
    const router = useRouter();
    const [activities, setActivities] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        loadActivities();
    }, []);

    const loadActivities = async () => {
        try {
            const data = await serviceService.getMyServiceBookings();
            setActivities(data);
        } catch (error) {
            console.error('Failed to load activities:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: colors.text, fontFamily: fonts.body }}>Loading Schedule...</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={28} color={colors.text} />
                </TouchableOpacity>
                <View>
                    <Text style={[styles.headerTitle, { color: colors.text, fontFamily: fonts.heading }]}>Personal Activities</Text>
                    <Text style={[styles.headerSub, { color: colors.text, opacity: 0.5 }]}>Executive Schedule • History</Text>
                </View>
                <TouchableOpacity style={styles.calendarBtn}>
                    <Ionicons name="calendar-outline" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.timelineContainer}>
                    {activities.length === 0 && (
                        <Text style={{ color: colors.text, opacity: 0.5, textAlign: 'center', marginTop: 20, fontFamily: fonts.body }}>No activities scheduled.</Text>
                    )}
                    {activities.map((activity, index) => (
                        <View key={activity.id} style={styles.timelineItem}>
                            <View style={styles.timeCol}>
                                <Text style={[styles.timeText, { color: colors.text, opacity: 0.6 }]}>
                                    {activity.scheduled_at ? new Date(activity.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'ASAP'}
                                </Text>
                                {index !== activities.length - 1 && (
                                    <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
                                )}
                            </View>
                            <View style={styles.indicatorCol}>
                                <View style={[styles.timelineDot, { backgroundColor: activity.status === 'completed' ? '#999' : colors.tint }]} />
                            </View>
                            <TouchableOpacity
                                style={[styles.activityCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                            >
                                <View style={[styles.iconBox, { backgroundColor: colors.tint + '15' }]}>
                                    <Ionicons name="sparkles" size={22} color={colors.tint} />
                                </View>
                                <View style={styles.activityInfo}>
                                    <Text style={[styles.activityTitle, { color: colors.text, fontFamily: fonts.heading }]}>{activity.service?.name || 'Insignia Service'}</Text>
                                    <View style={styles.statusRow}>
                                        <View style={[styles.statusBadge, { backgroundColor: colors.tint + '15' }]}>
                                            <Text style={[styles.statusText, { color: colors.tint }]}>{activity.status}</Text>
                                        </View>
                                    </View>
                                    {activity.receipt_url && (
                                        <View style={styles.receiptProof}>
                                            <Ionicons name="image-outline" size={12} color={colors.tint} />
                                            <Text style={[styles.receiptText, { color: colors.tint }]}>Payment Verified</Text>
                                        </View>
                                    )}
                                </View>
                                <Ionicons name="chevron-forward" size={18} color={colors.border} />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

                <View style={[styles.insightBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Ionicons name="sparkles-outline" size={24} color={colors.tint} />
                    <View style={styles.insightContent}>
                        <Text style={[styles.insightTitle, { color: colors.text, fontFamily: fonts.heading }]}>Elite Suggestion</Text>
                        <Text style={[styles.insightText, { color: colors.text, fontFamily: fonts.body, opacity: 0.6 }]}>Your history shows a preference for wellness. Would you like to book a private Rooftop Yoga session?</Text>
                        <TouchableOpacity onPress={() => router.push('/(tabs)/services')}>
                            <Text style={[styles.insightLink, { color: colors.tint, fontFamily: fonts.button }]}>View Wellness Services →</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.bookMoreBtn}
                    onPress={() => router.push('/(tabs)/services')}
                >
                    <LinearGradient
                        colors={[colors.tint, '#6B2D5A']}
                        style={styles.bookMoreBtnGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Ionicons name="add" size={24} color="#FFF" style={{ marginRight: 10 }} />
                        <Text style={[styles.bookMoreBtnText, { fontFamily: fonts.button }]}>Schedule New Activity</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
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
    calendarBtn: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    headerTitle: {
        fontSize: 18,
    },
    headerSub: {
        fontSize: 12,
        marginTop: 2,
    },
    scrollContent: {
        padding: 25,
    },
    timelineContainer: {
        marginBottom: 40,
    },
    timelineItem: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    timeCol: {
        width: 70,
        alignItems: 'center',
    },
    timeText: {
        fontSize: 11,
        fontWeight: '600',
    },
    timelineLine: {
        width: 2,
        flex: 1,
        marginTop: 10,
    },
    indicatorCol: {
        width: 30,
        alignItems: 'center',
        paddingTop: 4,
    },
    timelineDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        zIndex: 1,
    },
    activityCard: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 20,
        borderWidth: 1,
        marginLeft: 5,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    activityInfo: {
        flex: 1,
    },
    activityTitle: {
        fontSize: 14,
        marginBottom: 6,
    },
    statusRow: {
        flexDirection: 'row',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    insightBox: {
        flexDirection: 'row',
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        marginBottom: 40,
    },
    insightContent: {
        flex: 1,
        marginLeft: 20,
    },
    insightTitle: {
        fontSize: 16,
        marginBottom: 8,
    },
    insightText: {
        fontSize: 13,
        lineHeight: 20,
        marginBottom: 12,
    },
    insightLink: {
        fontSize: 13,
    },
    bookMoreBtn: {
        height: 54,
    },
    bookMoreBtnGradient: {
        width: '100%',
        height: '100%',
        borderRadius: 15,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bookMoreBtnText: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '700',
    },
    receiptProof: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    receiptText: {
        fontSize: 10,
        fontWeight: '600',
        marginLeft: 4,
    },
});
