import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useContext } from 'react';
import { AuthContext } from '../AuthContext';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

const EngineerDetailScreen = ({ route, navigation }) => {
    const { engineerId, engineerName } = route.params;
    const [interactions, setInteractions] = useState([]);
    const { userToken } = useContext(AuthContext);

    useEffect(() => {
        fetchInteractions();
    }, []);

    const fetchInteractions = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/interactions/${engineerId}`, {
                headers: { Authorization: `Bearer ${userToken}` }
            });
            setInteractions(response.data);
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch interactions');
        }
    };

    const handleDeleteEngineer = () => {
        Alert.alert(
            '⚠️ Delete Engineer',
            `Are you sure you want to permanently delete "${engineerName}"? This action cannot be undone. All their interactions and logs will be deleted.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: confirmDeleteEngineer
                }
            ]
        );
    };

    const confirmDeleteEngineer = async () => {
        try {
            await axios.delete(`${API_BASE_URL}/admin/delete-user/${engineerId}`, {
                headers: { Authorization: `Bearer ${userToken}` }
            });
            Alert.alert('Success', `Engineer "${engineerName}" has been deleted.`, [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            const msg = error.response?.data?.msg || 'Failed to delete engineer';
            Alert.alert('Error', msg);
        }
    };

    const getTypeColor = (type) => {
        const typeColors = {
            'call': colors.call,
            'email': colors.email,
            'message': colors.message
        };
        return typeColors[type?.toLowerCase()] || colors.direction;
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => Alert.alert('Interaction Details', `Type: ${item.interaction_type}\nDirection: ${item.direction}\nStatus: ${item.status}\nSummary: ${item.summary}`)}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.clientName}>{item.client_name}</Text>
                <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleDateString()}</Text>
            </View>
            <View style={styles.typeContainer}>
                <Text style={[styles.type, { backgroundColor: getTypeColor(item.interaction_type) }]}>
                    {item.interaction_type.toUpperCase()}
                </Text>
                <Text style={styles.direction}>{item.direction.toUpperCase()}</Text>
                <Text style={[styles.status, item.status === 'done' ? styles.statusDone : styles.statusPending]}>
                    {item.status ? item.status.toUpperCase() : 'PENDING'}
                </Text>
            </View>
            <Text style={styles.summary} numberOfLines={2}>{item.summary}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor={colors.primary} translucent={false} />
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Text style={styles.backText}>← Back</Text>
                    </TouchableOpacity>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>{engineerName}</Text>
                        <Text style={styles.subheader}>{interactions.length} interactions</Text>
                    </View>
                    <TouchableOpacity onPress={handleDeleteEngineer} style={styles.deleteButton}>
                        <Text style={styles.deleteButtonIcon}>🗑️</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.refreshButton} onPress={fetchInteractions}>
                    <Text style={styles.refreshButtonText}>↻ Refresh</Text>
                </TouchableOpacity>

                {interactions.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No interactions yet</Text>
                    </View>
                ) : (
                    <FlatList
                        data={interactions}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContent}
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
        paddingTop: spacing.sm,
        paddingBottom: spacing.lg,
        paddingHorizontal: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center'
    },
    backButton: {
        marginRight: spacing.md
    },
    backText: {
        color: colors.textWhite,
        fontSize: typography.fontSize.lg
    },
    headerContent: {
        flex: 1
    },
    headerTitle: {
        fontSize: typography.fontSize.xxl,
        fontWeight: typography.fontWeight.bold,
        color: colors.textWhite
    },
    subheader: {
        fontSize: typography.fontSize.md,
        color: colors.textWhite,
        opacity: 0.8,
        marginTop: 2
    },
    refreshButton: {
        backgroundColor: colors.accent,
        margin: spacing.lg,
        marginBottom: spacing.sm,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center'
    },
    refreshButtonText: {
        color: colors.textWhite,
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold
    },
    listContent: {
        padding: spacing.lg,
        paddingTop: spacing.sm
    },
    card: {
        backgroundColor: colors.background,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
        ...shadows.sm
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm
    },
    clientName: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary
    },
    timestamp: {
        fontSize: typography.fontSize.sm,
        color: colors.textLight
    },
    typeContainer: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.sm
    },
    type: {
        color: colors.textWhite,
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: borderRadius.lg,
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.semibold,
        overflow: 'hidden'
    },
    direction: {
        backgroundColor: colors.direction,
        color: colors.textWhite,
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: borderRadius.lg,
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.semibold,
        overflow: 'hidden'
    },
    status: {
        color: colors.textWhite,
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: borderRadius.lg,
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.semibold,
        overflow: 'hidden'
    },
    statusPending: {
        backgroundColor: colors.warning
    },
    statusDone: {
        backgroundColor: colors.success
    },
    summary: {
        fontSize: typography.fontSize.md,
        color: colors.textMuted,
        lineHeight: typography.lineHeight.tight
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    emptyText: {
        fontSize: typography.fontSize.lg,
        color: colors.textLight
    },
    deleteButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: spacing.sm
    },
    deleteButtonIcon: {
        fontSize: 18
    }
});

export default EngineerDetailScreen;
