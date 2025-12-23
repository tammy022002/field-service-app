import React, { useState, useContext, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Alert,
    ActivityIndicator,
    Modal,
    FlatList
} from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { AuthContext } from '../AuthContext';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

const InteractionDetailScreen = ({ navigation, route }) => {
    const { interaction: initialInteraction } = route.params;
    const [interaction, setInteraction] = useState(initialInteraction);
    const [isUpdating, setIsUpdating] = useState(false);
    const [showReassignModal, setShowReassignModal] = useState(false);
    const [engineers, setEngineers] = useState([]);
    const [selectedEngineer, setSelectedEngineer] = useState(null);
    const [isLoadingEngineers, setIsLoadingEngineers] = useState(false);
    const [isReassigning, setIsReassigning] = useState(false);
    const { userToken, userId } = useContext(AuthContext);

    // Check if current user is the owner of this interaction
    const isOwner = userId && interaction.engineer_id === parseInt(userId);

    useEffect(() => {
        // Only fetch engineers if user is the owner (for reassignment)
        if (isOwner) {
            fetchEngineers();
        }
    }, [isOwner]);

    const fetchEngineers = async () => {
        setIsLoadingEngineers(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/team-engineers`, {
                headers: { Authorization: `Bearer ${userToken}` }
            });
            // Filter out the current engineer
            const otherEngineers = response.data.filter(eng => eng.id !== interaction.engineer_id);
            setEngineers(otherEngineers);
        } catch (error) {
            console.log('Failed to fetch engineers:', error);
        } finally {
            setIsLoadingEngineers(false);
        }
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

    const getEngineerInitial = (name) => {
        if (!name) return '?';
        return name.charAt(0).toUpperCase();
    };

    const formatDateTime = (timestamp) => {
        const date = new Date(timestamp);
        return {
            date: date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            time: date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            })
        };
    };

    const handleMarkAsDone = () => {
        Alert.alert(
            '✓ Mark as Done',
            'Are you sure you want to mark this task as completed?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Mark Done',
                    style: 'default',
                    onPress: confirmMarkAsDone
                }
            ]
        );
    };

    const confirmMarkAsDone = async () => {
        setIsUpdating(true);
        try {
            await axios.put(
                `${API_BASE_URL}/interaction/${interaction.id}/status`,
                { status: 'done' },
                { headers: { Authorization: `Bearer ${userToken}` } }
            );
            setInteraction({ ...interaction, status: 'done' });
            Alert.alert('Success', 'Task marked as done!');
        } catch (error) {
            const msg = error.response?.data?.msg || 'Failed to update status';
            Alert.alert('Error', msg);
        } finally {
            setIsUpdating(false);
        }
    };

    const openReassignModal = () => {
        setSelectedEngineer(null);
        setShowReassignModal(true);
    };

    const handleReassign = async () => {
        if (!selectedEngineer) {
            Alert.alert('Error', 'Please select an engineer');
            return;
        }

        setIsReassigning(true);
        try {
            const response = await axios.put(
                `${API_BASE_URL}/interaction/${interaction.id}/reassign`,
                { engineer_id: selectedEngineer.id },
                { headers: { Authorization: `Bearer ${userToken}` } }
            );

            setInteraction({
                ...interaction,
                engineer_id: selectedEngineer.id,
                engineer_name: selectedEngineer.name
            });

            setShowReassignModal(false);
            Alert.alert('Success', `Task reassigned to ${selectedEngineer.name}!`);
        } catch (error) {
            const msg = error.response?.data?.msg || 'Failed to reassign task';
            Alert.alert('Error', msg);
        } finally {
            setIsReassigning(false);
        }
    };

    const renderEngineerItem = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.engineerItem,
                selectedEngineer?.id === item.id && styles.engineerItemSelected
            ]}
            onPress={() => setSelectedEngineer(item)}
        >
            <View style={[
                styles.engineerItemAvatar,
                selectedEngineer?.id === item.id && styles.engineerItemAvatarSelected
            ]}>
                <Text style={[
                    styles.engineerItemAvatarText,
                    selectedEngineer?.id === item.id && styles.engineerItemAvatarTextSelected
                ]}>
                    {getEngineerInitial(item.name)}
                </Text>
            </View>
            <View style={styles.engineerItemInfo}>
                <Text style={[
                    styles.engineerItemName,
                    selectedEngineer?.id === item.id && styles.engineerItemNameSelected
                ]}>
                    {item.name}
                </Text>
                <Text style={styles.engineerItemEmail}>{item.email}</Text>
            </View>
            {selectedEngineer?.id === item.id && (
                <View style={styles.checkCircle}>
                    <Text style={styles.checkMark}>✓</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    const { date, time } = formatDateTime(interaction.timestamp);
    const isPending = interaction.status !== 'done';

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor={colors.primary} translucent={false} />
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Text style={styles.backText}>← Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Interaction Details</Text>
                </View>

                <ScrollView style={styles.content}>
                    {/* Engineer Section */}
                    <View style={styles.engineerSection}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{getEngineerInitial(interaction.engineer_name)}</Text>
                        </View>
                        <View style={styles.engineerInfo}>
                            <Text style={styles.engineerName}>{interaction.engineer_name}</Text>
                            <Text style={styles.engineerLabel}>Engineer</Text>
                        </View>
                    </View>

                    {/* Status Badges */}
                    <View style={styles.badgesSection}>
                        <View style={[styles.largeBadge, { backgroundColor: getTypeColor(interaction.interaction_type) }]}>
                            <Text style={styles.largeBadgeText}>{interaction.interaction_type?.toUpperCase()}</Text>
                        </View>
                        <View style={[styles.largeBadge, styles.directionBadge]}>
                            <Text style={styles.largeBadgeText}>{interaction.direction?.toUpperCase()}</Text>
                        </View>
                        <View style={[styles.largeBadge, { backgroundColor: getStatusColor(interaction.status) }]}>
                            <Text style={styles.largeBadgeText}>
                                {interaction.status === 'done' ? '✓ DONE' : '⏳ PENDING'}
                            </Text>
                        </View>
                    </View>

                    {/* Details Card */}
                    <View style={styles.detailsCard}>
                        <Text style={styles.sectionTitle}>Client Information</Text>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Client Name</Text>
                            <Text style={styles.detailValue}>{interaction.client_name}</Text>
                        </View>
                    </View>

                    <View style={styles.detailsCard}>
                        <Text style={styles.sectionTitle}>Interaction Details</Text>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Type</Text>
                            <Text style={styles.detailValue}>{interaction.interaction_type}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Direction</Text>
                            <Text style={styles.detailValue}>{interaction.direction}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Status</Text>
                            <Text style={[styles.detailValue, { color: getStatusColor(interaction.status) }]}>
                                {interaction.status?.toUpperCase()}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.detailsCard}>
                        <Text style={styles.sectionTitle}>Date & Time</Text>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Date</Text>
                            <Text style={styles.detailValue}>{date}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Time</Text>
                            <Text style={styles.detailValue}>{time}</Text>
                        </View>
                    </View>

                    <View style={styles.summaryCard}>
                        <Text style={styles.sectionTitle}>Summary</Text>
                        <Text style={styles.summaryText}>{interaction.summary}</Text>
                    </View>

                    {/* Action Buttons - Only show if pending AND user is the owner */}
                    {isPending && isOwner && (
                        <View style={styles.actionSection}>
                            <TouchableOpacity
                                style={styles.markDoneButton}
                                onPress={handleMarkAsDone}
                                disabled={isUpdating}
                                activeOpacity={0.8}
                            >
                                {isUpdating ? (
                                    <ActivityIndicator color={colors.textWhite} />
                                ) : (
                                    <>
                                        <Text style={styles.markDoneIcon}>✓</Text>
                                        <Text style={styles.markDoneText}>Mark as Done</Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.reassignButton}
                                onPress={openReassignModal}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.reassignIcon}>↪</Text>
                                <Text style={styles.reassignText}>Assign to Another Engineer</Text>
                            </TouchableOpacity>

                            <Text style={styles.actionHint}>Can't complete this task? Reassign it to a colleague</Text>
                        </View>
                    )}

                    {/* View-only message for non-owners viewing pending tasks */}
                    {isPending && !isOwner && (
                        <View style={styles.viewOnlySection}>
                            <Text style={styles.viewOnlyIcon}>👁️</Text>
                            <Text style={styles.viewOnlyText}>View Only</Text>
                            <Text style={styles.viewOnlyHint}>This task belongs to another engineer</Text>
                        </View>
                    )}

                    {/* Completed Message - Show if done */}
                    {!isPending && (
                        <View style={styles.completedSection}>
                            <Text style={styles.completedIcon}>✓</Text>
                            <Text style={styles.completedText}>This task has been completed</Text>
                        </View>
                    )}

                    {/* Spacer for bottom padding */}
                    <View style={{ height: 30 }} />
                </ScrollView>
            </View>

            {/* Reassign Modal */}
            <Modal
                visible={showReassignModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowReassignModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <View style={styles.modalHeaderLeft}>
                                <View style={styles.modalIconContainer}>
                                    <Text style={styles.modalIcon}>↪</Text>
                                </View>
                                <Text style={styles.modalTitle}>Reassign Task</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.modalCloseButton}
                                onPress={() => setShowReassignModal(false)}
                            >
                                <Text style={styles.modalCloseText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalSubtitle}>Select an engineer to reassign this task to:</Text>

                        {isLoadingEngineers ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={colors.primary} />
                                <Text style={styles.loadingText}>Loading engineers...</Text>
                            </View>
                        ) : engineers.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyIcon}>👥</Text>
                                <Text style={styles.emptyText}>No other engineers available</Text>
                            </View>
                        ) : (
                            <FlatList
                                data={engineers}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={renderEngineerItem}
                                style={styles.engineerList}
                            />
                        )}

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setShowReassignModal(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.confirmButton,
                                    !selectedEngineer && styles.confirmButtonDisabled
                                ]}
                                onPress={handleReassign}
                                disabled={!selectedEngineer || isReassigning}
                            >
                                {isReassigning ? (
                                    <ActivityIndicator color={colors.textWhite} size="small" />
                                ) : (
                                    <Text style={styles.confirmButtonText}>Assign</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
        marginRight: spacing.lg
    },
    backText: {
        color: colors.textWhite,
        fontSize: typography.fontSize.lg
    },
    headerTitle: {
        color: colors.textWhite,
        fontSize: typography.fontSize.xxl,
        fontWeight: typography.fontWeight.bold
    },
    content: {
        flex: 1
    },
    engineerSection: {
        backgroundColor: colors.background,
        padding: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: colors.border
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.accent,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md
    },
    avatarText: {
        color: colors.textWhite,
        fontSize: 26,
        fontWeight: typography.fontWeight.bold
    },
    engineerInfo: {
        flex: 1
    },
    engineerName: {
        fontSize: typography.fontSize.xxl,
        fontWeight: typography.fontWeight.bold,
        color: colors.textSecondary
    },
    engineerLabel: {
        fontSize: typography.fontSize.md,
        color: colors.textMuted,
        marginTop: 2
    },
    badgesSection: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: spacing.md,
        backgroundColor: colors.background,
        gap: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.border
    },
    largeBadge: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.round
    },
    directionBadge: {
        backgroundColor: colors.direction
    },
    largeBadgeText: {
        color: colors.textWhite,
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold
    },
    detailsCard: {
        backgroundColor: colors.background,
        marginTop: spacing.sm,
        padding: spacing.lg
    },
    sectionTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: colors.textSecondary,
        marginBottom: spacing.md,
        paddingBottom: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.border
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight
    },
    detailLabel: {
        fontSize: typography.fontSize.md,
        color: colors.textMuted
    },
    detailValue: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textSecondary,
        textAlign: 'right',
        flex: 1,
        marginLeft: spacing.lg
    },
    summaryCard: {
        backgroundColor: colors.background,
        marginTop: spacing.sm,
        padding: spacing.lg
    },
    summaryText: {
        fontSize: typography.fontSize.md,
        color: colors.textSecondary,
        lineHeight: typography.lineHeight.normal
    },
    // Mark as Done Button Styles
    actionSection: {
        padding: spacing.lg,
        alignItems: 'center'
    },
    markDoneButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.success,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xxl,
        borderRadius: borderRadius.lg,
        width: '100%',
        ...shadows.sm
    },
    markDoneIcon: {
        fontSize: 20,
        color: colors.textWhite,
        marginRight: spacing.sm,
        fontWeight: typography.fontWeight.bold
    },
    markDoneText: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: colors.textWhite
    },
    actionHint: {
        fontSize: typography.fontSize.sm,
        color: colors.textMuted,
        marginTop: spacing.sm,
        textAlign: 'center'
    },
    // Completed Section Styles
    completedSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E8F5E9',
        padding: spacing.lg,
        marginTop: spacing.sm,
        marginHorizontal: spacing.md,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.success
    },
    completedIcon: {
        fontSize: 24,
        color: colors.success,
        marginRight: spacing.sm,
        fontWeight: typography.fontWeight.bold
    },
    completedText: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        color: colors.success
    },
    // View-only Section Styles (for viewing other engineers' tasks)
    viewOnlySection: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.backgroundLight,
        padding: spacing.lg,
        marginTop: spacing.sm,
        marginHorizontal: spacing.md,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.border
    },
    viewOnlyIcon: {
        fontSize: 32,
        marginBottom: spacing.sm
    },
    viewOnlyText: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: colors.textMuted
    },
    viewOnlyHint: {
        fontSize: typography.fontSize.sm,
        color: colors.textLight,
        marginTop: spacing.xs,
        textAlign: 'center'
    },
    // Reassign Button Styles
    reassignButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xxl,
        borderRadius: borderRadius.lg,
        width: '100%',
        marginTop: spacing.sm,
        ...shadows.sm
    },
    reassignIcon: {
        fontSize: 20,
        color: colors.textWhite,
        marginRight: spacing.sm
    },
    reassignText: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: colors.textWhite
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end'
    },
    modalContainer: {
        backgroundColor: colors.background,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        maxHeight: '80%',
        ...shadows.lg
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.backgroundLight
    },
    modalHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    modalIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md
    },
    modalIcon: {
        fontSize: 20,
        color: colors.textWhite
    },
    modalTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.textSecondary
    },
    modalCloseButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.backgroundDark,
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalCloseText: {
        fontSize: 16,
        color: colors.textMuted,
        fontWeight: typography.fontWeight.bold
    },
    modalSubtitle: {
        fontSize: typography.fontSize.md,
        color: colors.textMuted,
        padding: spacing.md,
        paddingBottom: spacing.sm
    },
    engineerList: {
        maxHeight: 300
    },
    engineerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight
    },
    engineerItemSelected: {
        backgroundColor: '#E6F7FA'
    },
    engineerItemAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.backgroundDark,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md
    },
    engineerItemAvatarSelected: {
        backgroundColor: colors.primary
    },
    engineerItemAvatarText: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: colors.textMuted
    },
    engineerItemAvatarTextSelected: {
        color: colors.textWhite
    },
    engineerItemInfo: {
        flex: 1
    },
    engineerItemName: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textSecondary
    },
    engineerItemNameSelected: {
        color: colors.primary
    },
    engineerItemEmail: {
        fontSize: typography.fontSize.sm,
        color: colors.textLight,
        marginTop: 2
    },
    checkCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center'
    },
    checkMark: {
        fontSize: 14,
        color: colors.textWhite,
        fontWeight: typography.fontWeight.bold
    },
    loadingContainer: {
        padding: spacing.xxxl,
        alignItems: 'center'
    },
    loadingText: {
        marginTop: spacing.md,
        fontSize: typography.fontSize.md,
        color: colors.textMuted
    },
    emptyContainer: {
        padding: spacing.xxxl,
        alignItems: 'center'
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: spacing.md
    },
    emptyText: {
        fontSize: typography.fontSize.lg,
        color: colors.textMuted
    },
    modalFooter: {
        flexDirection: 'row',
        padding: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        gap: spacing.sm
    },
    cancelButton: {
        flex: 1,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        backgroundColor: colors.backgroundDark,
        alignItems: 'center'
    },
    cancelButtonText: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textSecondary
    },
    confirmButton: {
        flex: 1,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        backgroundColor: colors.primary,
        alignItems: 'center'
    },
    confirmButtonDisabled: {
        backgroundColor: colors.border
    },
    confirmButtonText: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: colors.textWhite
    }
});

export default InteractionDetailScreen;
