import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Platform } from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { AuthContext } from '../AuthContext';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

const NewInteractionScreen = ({ navigation, route }) => {
    const { userToken, logout } = useContext(AuthContext);
    const [clientName, setClientName] = useState('');
    const [interactionType, setInteractionType] = useState('call');
    const [direction, setDirection] = useState('incoming');
    const [summary, setSummary] = useState('');
    const [engineerName, setEngineerName] = useState('');
    const [status, setStatus] = useState('pending');
    const [showStatusModal, setShowStatusModal] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

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

    const handleSubmit = async () => {
        if (!summary.trim()) {
            Alert.alert('Error', 'Please enter a summary');
            return;
        }

        if (!clientName.trim()) {
            Alert.alert('Error', 'Please enter a client name');
            return;
        }

        setShowStatusModal(true);
    };

    const confirmSubmit = async () => {
        try {
            await axios.post(
                `${API_BASE_URL}/interaction`,
                {
                    client_name: clientName,
                    interaction_type: interactionType,
                    direction: direction,
                    summary: summary,
                    status: status
                },
                { headers: { Authorization: `Bearer ${userToken}` } }
            );
            Alert.alert('Success', 'Interaction logged successfully');
            setSummary('');
            setClientName('');
            setStatus('pending');
            setShowStatusModal(false);
            navigation.goBack();
        } catch (error) {
            console.log('Submit Interaction Error:', error);
            const msg = error.response?.data?.msg || error.message || 'Unknown error';
            Alert.alert('Error', `Failed to log interaction: ${msg}`);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor={colors.primary} translucent={false} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>New Interaction</Text>
            </View>
            <ScrollView style={styles.container}>

                <Text style={styles.sectionTitle}>Interaction Type</Text>
                <View style={styles.toggleGroup}>
                    <TouchableOpacity
                        style={[styles.toggleButton, interactionType === 'call' && styles.toggleButtonSelected]}
                        onPress={() => setInteractionType('call')}
                    >
                        <Text style={[styles.toggleButtonText, interactionType === 'call' && styles.toggleButtonTextSelected]}>
                            CALL
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.toggleButton, interactionType === 'email' && styles.toggleButtonSelected]}
                        onPress={() => setInteractionType('email')}
                    >
                        <Text style={[styles.toggleButtonText, interactionType === 'email' && styles.toggleButtonTextSelected]}>
                            EMAIL
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.toggleButton, interactionType === 'message' && styles.toggleButtonSelected]}
                        onPress={() => setInteractionType('message')}
                    >
                        <Text style={[styles.toggleButtonText, interactionType === 'message' && styles.toggleButtonTextSelected]}>
                            MESSAGE
                        </Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionTitle}>Direction</Text>
                <View style={styles.toggleGroup}>
                    <TouchableOpacity
                        style={[styles.toggleButtonWide, direction === 'incoming' && styles.toggleButtonSelected]}
                        onPress={() => setDirection('incoming')}
                    >
                        <Text style={[styles.toggleButtonText, direction === 'incoming' && styles.toggleButtonTextSelected]}>
                            INCOMING
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.toggleButtonWide, direction === 'outgoing' && styles.toggleButtonSelected]}
                        onPress={() => setDirection('outgoing')}
                    >
                        <Text style={[styles.toggleButtonText, direction === 'outgoing' && styles.toggleButtonTextSelected]}>
                            OUTGOING
                        </Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionTitle}>Client Name</Text>
                <TextInput
                    style={styles.clientInput}
                    value={clientName}
                    onChangeText={setClientName}
                    placeholder="Enter client name..."
                    placeholderTextColor={colors.textLight}
                />

                <Text style={styles.sectionTitle}>Summary</Text>
                <TextInput
                    style={styles.summaryInput}
                    value={summary}
                    onChangeText={setSummary}
                    multiline
                    placeholder="Enter interaction summary..."
                    textAlignVertical="top"
                />

                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                    <Text style={styles.submitButtonText}>Submit Interaction</Text>
                </TouchableOpacity>

                {showStatusModal && (
                    <View style={styles.modalOverlay}>
                        <View style={styles.statusModal}>
                            <Text style={styles.modalTitle}>Select Job Status</Text>

                            <TouchableOpacity
                                style={[styles.statusOption, status === 'pending' && styles.statusSelected]}
                                onPress={() => setStatus('pending')}
                            >
                                <Text style={[styles.statusText, status === 'pending' && styles.statusTextSelected]}>
                                    Pending
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.statusOption, status === 'done' && styles.statusSelected]}
                                onPress={() => setStatus('done')}
                            >
                                <Text style={[styles.statusText, status === 'done' && styles.statusTextSelected]}>
                                    Done
                                </Text>
                            </TouchableOpacity>

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={styles.modalCancelButton}
                                    onPress={() => setShowStatusModal(false)}
                                >
                                    <Text style={styles.modalCancelText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.modalConfirmButton}
                                    onPress={confirmSubmit}
                                >
                                    <Text style={styles.modalConfirmText}>Confirm Submit</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.primary },
    header: {
        backgroundColor: colors.primary,
        paddingTop: spacing.sm,
        paddingBottom: spacing.lg,
        paddingHorizontal: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center'
    },
    backButton: { marginRight: spacing.lg },
    backText: { color: colors.textWhite, fontSize: typography.fontSize.lg },
    headerTitle: { color: colors.textWhite, fontSize: typography.fontSize.xxl, fontWeight: typography.fontWeight.bold },
    container: {
        flex: 1,
        padding: spacing.lg,
        backgroundColor: colors.backgroundLight
    },
    sectionTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        marginTop: spacing.lg,
        marginBottom: spacing.sm,
        color: colors.textPrimary
    },
    toggleGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.sm
    },
    toggleButton: {
        flex: 1,
        paddingVertical: spacing.md,
        marginHorizontal: spacing.xs,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.background,
        alignItems: 'center'
    },
    toggleButtonWide: {
        flex: 1,
        paddingVertical: spacing.md,
        marginHorizontal: spacing.xs,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.background,
        alignItems: 'center'
    },
    toggleButtonSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary
    },
    toggleButtonText: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textSecondary
    },
    toggleButtonTextSelected: {
        color: colors.textWhite
    },
    clientInput: {
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.background,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        fontSize: typography.fontSize.lg,
        marginBottom: spacing.lg,
        color: colors.textSecondary
    },
    summaryInput: {
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.background,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        minHeight: 150,
        fontSize: typography.fontSize.lg,
        marginBottom: spacing.lg,
        color: colors.textSecondary
    },
    submitButton: {
        backgroundColor: colors.primary,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        marginBottom: spacing.xxl
    },
    submitButtonText: {
        color: colors.textWhite,
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold
    },
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: colors.overlay,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
    },
    statusModal: {
        backgroundColor: colors.background,
        borderRadius: borderRadius.xl,
        padding: spacing.xl,
        width: '85%',
        maxWidth: 400
    },
    modalTitle: {
        fontSize: typography.fontSize.xxl,
        fontWeight: typography.fontWeight.bold,
        marginBottom: spacing.lg,
        textAlign: 'center',
        color: colors.textSecondary
    },
    statusOption: {
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        borderWidth: 2,
        borderColor: colors.border,
        marginBottom: spacing.md,
        alignItems: 'center'
    },
    statusSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary
    },
    statusText: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textMuted
    },
    statusTextSelected: {
        color: colors.textWhite
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: spacing.lg
    },
    modalCancelButton: {
        flex: 1,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        backgroundColor: colors.border,
        marginRight: spacing.sm
    },
    modalCancelText: {
        textAlign: 'center',
        fontWeight: typography.fontWeight.bold,
        color: colors.textSecondary
    },
    modalConfirmButton: {
        flex: 1,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        backgroundColor: colors.primary
    },
    modalConfirmText: {
        textAlign: 'center',
        fontWeight: typography.fontWeight.bold,
        color: colors.textWhite
    }
});

export default NewInteractionScreen;
