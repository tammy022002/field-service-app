import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Image, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { AuthContext } from '../AuthContext';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

const EngineerDashboard = ({ navigation }) => {
    const { userToken, logout } = useContext(AuthContext);
    const [engineerName, setEngineerName] = useState('');
    const [interactions, setInteractions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('today');

    const filters = [
        { key: 'today', label: 'Today' },
        { key: 'yesterday', label: 'Yesterday' },
        { key: 'this_week', label: 'This Week' },
        { key: 'last_week', label: 'Last Week' },
        { key: 'this_month', label: 'This Month' },
        { key: 'last_month', label: 'Last Month' },
    ];

    useEffect(() => {
        fetchProfile();
        fetchMyInteractions();
    }, []);

    useEffect(() => {
        fetchMyInteractions();
    }, [selectedFilter]);

    const fetchProfile = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/profile`, {
                headers: { Authorization: `Bearer ${userToken}` }
            });
            setEngineerName(response.data.name || response.data.email.split('@')[0]);
        } catch (error) {
            console.log('Failed to fetch profile:', error);
        }
    };

    const getDateRange = () => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        switch (selectedFilter) {
            case 'today':
                return { start: today, end: now };
            case 'yesterday':
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                return { start: yesterday, end: today };
            case 'this_week':
                const weekStart = new Date(today);
                weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                return { start: weekStart, end: now };
            case 'last_week':
                const lastWeekEnd = new Date(today);
                lastWeekEnd.setDate(lastWeekEnd.getDate() - lastWeekEnd.getDay());
                const lastWeekStart = new Date(lastWeekEnd);
                lastWeekStart.setDate(lastWeekStart.getDate() - 7);
                return { start: lastWeekStart, end: lastWeekEnd };
            case 'this_month':
                const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                return { start: monthStart, end: now };
            case 'last_month':
                const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
                return { start: lastMonthStart, end: lastMonthEnd };
            default:
                return { start: today, end: now };
        }
    };

    const fetchMyInteractions = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/my-interactions`, {
                headers: { Authorization: `Bearer ${userToken}` }
            });

            const { start, end } = getDateRange();
            const filtered = response.data.filter(item => {
                const itemDate = new Date(item.timestamp);
                return itemDate >= start && itemDate <= end;
            });

            setInteractions(filtered);
        } catch (error) {
            console.log('Failed to fetch interactions:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchMyInteractions();
    };

    const getStatusColor = (status) => {
        return status === 'done' ? colors.success : colors.warning;
    };

    const getTypeColor = (type) => {
        const typeColors = {
            'call': colors.call,
            'email': colors.email,
            'message': colors.message
        };
        return typeColors[type?.toLowerCase()] || colors.direction;
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const renderInteraction = ({ item }) => (
        <TouchableOpacity
            style={styles.interactionCard}
            onPress={() => navigation.navigate('InteractionDetail', { interaction: item })}
            activeOpacity={0.7}
        >
            <View style={styles.interactionHeader}>
                <Text style={styles.clientName}>{item.client_name}</Text>
                <Text style={styles.timeStamp}>{formatTime(item.timestamp)}</Text>
            </View>
            <View style={styles.badgeRow}>
                <View style={[styles.badge, { backgroundColor: getTypeColor(item.interaction_type) }]}>
                    <Text style={styles.badgeText}>{item.interaction_type?.toUpperCase()}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: colors.direction }]}>
                    <Text style={styles.badgeText}>{item.direction?.toUpperCase()}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.badgeText}>{item.status === 'done' ? '✓ DONE' : '⏳ PENDING'}</Text>
                </View>
            </View>
            <Text style={styles.summary} numberOfLines={2}>{item.summary}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor={colors.primary} translucent={false} />
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <Text style={styles.greeting}>Hi, {engineerName || 'Engineer'}</Text>
                        <Text style={styles.welcomeText}>Welcome back!</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.profileButton}
                        onPress={() => navigation.navigate('Profile')}
                    >
                        <Text style={styles.profileIcon}>👤</Text>
                    </TouchableOpacity>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionsRow}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('NewInteraction')}
                    >
                        <Text style={styles.actionIcon}>➕</Text>
                        <Text style={styles.actionText}>New</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('TeamHistory')}
                    >
                        <Text style={styles.actionIcon}>👥</Text>
                        <Text style={styles.actionText}>Team</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.logoutActionButton]}
                        onPress={logout}
                    >
                        <Text style={styles.actionIcon}>🚪</Text>
                        <Text style={styles.actionText}>Logout</Text>
                    </TouchableOpacity>
                </View>

                {/* Filter Section */}
                <View style={styles.filterSection}>
                    <Text style={styles.sectionTitle}>My History</Text>
                    <FlatList
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        data={filters}
                        keyExtractor={(item) => item.key}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.filterChip,
                                    selectedFilter === item.key && styles.filterChipSelected
                                ]}
                                onPress={() => setSelectedFilter(item.key)}
                            >
                                <Text style={[
                                    styles.filterChipText,
                                    selectedFilter === item.key && styles.filterChipTextSelected
                                ]}>
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        )}
                        contentContainerStyle={styles.filterList}
                    />
                </View>

                {/* Interactions List */}
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                ) : interactions.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>📋</Text>
                        <Text style={styles.emptyText}>No interactions</Text>
                        <Text style={styles.emptySubtext}>for {filters.find(f => f.key === selectedFilter)?.label.toLowerCase()}</Text>
                    </View>
                ) : (
                    <FlatList
                        data={interactions}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderInteraction}
                        contentContainerStyle={styles.listContent}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={[colors.primary]}
                            />
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.primary
    },
    container: {
        flex: 1,
        backgroundColor: colors.backgroundLight
    },
    header: {
        backgroundColor: colors.primary,
        paddingTop: spacing.md,
        paddingBottom: spacing.lg,
        paddingHorizontal: spacing.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    headerContent: {
        flex: 1
    },
    greeting: {
        fontSize: typography.fontSize.xxxl,
        fontWeight: typography.fontWeight.bold,
        color: colors.textWhite
    },
    welcomeText: {
        fontSize: typography.fontSize.md,
        color: colors.textWhite,
        opacity: 0.8,
        marginTop: spacing.xs
    },
    profileButton: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    profileIcon: {
        fontSize: 22
    },
    actionsRow: {
        flexDirection: 'row',
        padding: spacing.md,
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.border
    },
    actionButton: {
        flex: 1,
        backgroundColor: colors.primary,
        paddingVertical: spacing.md,
        marginHorizontal: spacing.xs,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        ...shadows.sm
    },
    logoutActionButton: {
        backgroundColor: colors.danger
    },
    actionIcon: {
        fontSize: 20,
        marginBottom: 4
    },
    actionText: {
        color: colors.textWhite,
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold
    },
    filterSection: {
        backgroundColor: colors.background,
        paddingTop: spacing.md,
        paddingBottom: spacing.sm
    },
    sectionTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.sm
    },
    filterList: {
        paddingHorizontal: spacing.md
    },
    filterChip: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.round,
        backgroundColor: colors.backgroundLight,
        marginHorizontal: spacing.xs,
        borderWidth: 1,
        borderColor: colors.border
    },
    filterChipSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary
    },
    filterChipText: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        fontWeight: typography.fontWeight.medium
    },
    filterChipTextSelected: {
        color: colors.textWhite
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.xxxl
    },
    emptyIcon: {
        fontSize: 50,
        marginBottom: spacing.md
    },
    emptyText: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textSecondary
    },
    emptySubtext: {
        fontSize: typography.fontSize.md,
        color: colors.textMuted,
        marginTop: spacing.xs
    },
    listContent: {
        padding: spacing.md
    },
    interactionCard: {
        backgroundColor: colors.background,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.sm,
        ...shadows.sm
    },
    interactionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm
    },
    clientName: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
        flex: 1
    },
    timeStamp: {
        fontSize: typography.fontSize.sm,
        color: colors.textLight
    },
    badgeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xs,
        marginBottom: spacing.sm
    },
    badge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 3,
        borderRadius: borderRadius.lg
    },
    badgeText: {
        color: colors.textWhite,
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.semibold
    },
    summary: {
        fontSize: typography.fontSize.md,
        color: colors.textMuted,
        lineHeight: typography.lineHeight.tight
    }
});

export default EngineerDashboard;
