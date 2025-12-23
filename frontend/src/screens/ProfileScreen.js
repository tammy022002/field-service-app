import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Image } from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { AuthContext } from '../AuthContext';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

const ProfileScreen = ({ navigation }) => {
    const { userToken, logout } = useContext(AuthContext);
    const [profile, setProfile] = useState({ name: '', email: '', role: '' });
    const [editingName, setEditingName] = useState(false);
    const [tempName, setTempName] = useState('');
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/profile`, {
                headers: { Authorization: `Bearer ${userToken}` }
            });
            setProfile(response.data);
            setTempName(response.data.name || '');
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch profile');
        }
    };

    const updateName = async () => {
        try {
            await axios.put(
                `${API_BASE_URL}/profile`,
                { name: tempName },
                { headers: { Authorization: `Bearer ${userToken}` } }
            );
            setProfile({ ...profile, name: tempName });
            setEditingName(false);
            Alert.alert('Success', 'Name updated successfully');
        } catch (error) {
            Alert.alert('Error', 'Failed to update name');
        }
    };

    const handleChangePassword = async () => {
        if (!oldPassword || !newPassword) {
            Alert.alert('Error', 'Please enter both passwords');
            return;
        }

        try {
            await axios.put(
                `${API_BASE_URL}/change-password`,
                { old_password: oldPassword, new_password: newPassword },
                { headers: { Authorization: `Bearer ${userToken}` } }
            );
            Alert.alert('Success', 'Password changed successfully');
            setOldPassword('');
            setNewPassword('');
            setShowPasswordModal(false);
        } catch (error) {
            const msg = error.response?.data?.msg || 'Failed to change password';
            Alert.alert('Error', msg);
        }
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            '⚠️ Delete Account',
            'Are you sure you want to permanently delete your account? This action cannot be undone. All your data including interactions and logs will be deleted.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: confirmDeleteAccount
                }
            ]
        );
    };

    const confirmDeleteAccount = async () => {
        try {
            await axios.delete(`${API_BASE_URL}/delete-account`, {
                headers: { Authorization: `Bearer ${userToken}` }
            });
            Alert.alert('Account Deleted', 'Your account has been permanently deleted.', [
                { text: 'OK', onPress: logout }
            ]);
        } catch (error) {
            const msg = error.response?.data?.msg || 'Failed to delete account';
            Alert.alert('Error', msg);
        }
    };

    const getInitial = () => {
        if (profile.name) return profile.name.charAt(0).toUpperCase();
        if (profile.email) return profile.email.charAt(0).toUpperCase();
        return 'U';
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor={colors.primary} translucent={false} />
            <ScrollView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Text style={styles.backText}>← Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Profile</Text>
                </View>

                <View style={styles.avatarSection}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{getInitial()}</Text>
                    </View>
                    <Text style={styles.name}>{profile.name || 'No Name Set'}</Text>
                    <Text style={styles.email}>{profile.email}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account Information</Text>

                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Role</Text>
                        <Text style={styles.value}>{profile.role}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Email</Text>
                        <Text style={styles.value}>{profile.email}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Name</Text>
                        {editingName ? (
                            <View style={styles.editContainer}>
                                <TextInput
                                    style={styles.editInput}
                                    value={tempName}
                                    onChangeText={setTempName}
                                    placeholder="Enter your name"
                                />
                                <TouchableOpacity onPress={updateName} style={styles.saveButton}>
                                    <Text style={styles.saveButtonText}>Save</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity onPress={() => setEditingName(true)}>
                                <Text style={styles.editableValue}>{profile.name || 'Tap to set name'}</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <TouchableOpacity
                        style={styles.changePasswordButton}
                        onPress={() => setShowPasswordModal(true)}
                    >
                        <Text style={styles.changePasswordText}>Change Password</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Organization</Text>
                    <View style={styles.orgCard}>
                        <Image
                            source={require('../../assets/concept-logo.png')}
                            style={styles.orgLogoImage}
                            resizeMode="contain"
                        />
                        <Text style={styles.orgName}>Concept Information Technology</Text>
                        <Text style={styles.orgSubtitle}>Field Service Logger</Text>
                    </View>
                </View>

                {showPasswordModal && (
                    <View style={styles.modalOverlay}>
                        <View style={styles.modal}>
                            <Text style={styles.modalTitle}>Change Password</Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Old Password"
                                secureTextEntry
                                value={oldPassword}
                                onChangeText={setOldPassword}
                            />
                            <TextInput
                                style={styles.modalInput}
                                placeholder="New Password"
                                secureTextEntry
                                value={newPassword}
                                onChangeText={setNewPassword}
                            />
                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={styles.modalCancelButton}
                                    onPress={() => {
                                        setShowPasswordModal(false);
                                        setOldPassword('');
                                        setNewPassword('');
                                    }}
                                >
                                    <Text style={styles.modalCancelText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.modalSaveButton}
                                    onPress={handleChangePassword}
                                >
                                    <Text style={styles.modalSaveText}>Save</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}

                <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>

                {/* Delete Account Section */}
                <View style={styles.dangerZone}>
                    <Text style={styles.dangerZoneTitle}>Danger Zone</Text>
                    <TouchableOpacity style={styles.deleteAccountButton} onPress={handleDeleteAccount}>
                        <Text style={styles.deleteAccountIcon}>🗑️</Text>
                        <Text style={styles.deleteAccountText}>Delete Account</Text>
                    </TouchableOpacity>
                    <Text style={styles.deleteWarning}>This action is permanent and cannot be undone</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.primary },
    container: { flex: 1, backgroundColor: colors.backgroundLight },
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
    avatarSection: {
        alignItems: 'center',
        paddingVertical: spacing.xxl,
        backgroundColor: colors.background
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md
    },
    avatarText: { color: colors.textWhite, fontSize: typography.fontSize.logo, fontWeight: typography.fontWeight.bold },
    name: { fontSize: typography.fontSize.xxxl, fontWeight: typography.fontWeight.bold, marginBottom: spacing.xs, color: colors.textPrimary },
    email: { fontSize: typography.fontSize.lg, color: colors.textMuted },
    section: {
        backgroundColor: colors.background,
        marginTop: spacing.sm,
        padding: spacing.lg
    },
    sectionTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        marginBottom: spacing.md,
        color: colors.textPrimary
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight
    },
    label: { fontSize: typography.fontSize.lg, color: colors.textMuted },
    value: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold, color: colors.textSecondary },
    editableValue: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold, color: colors.primary },
    editContainer: { flexDirection: 'row', alignItems: 'center', flex: 1, marginLeft: spacing.lg },
    editInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.sm,
        padding: spacing.sm,
        marginRight: spacing.sm
    },
    saveButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.sm
    },
    saveButtonText: { color: colors.textWhite, fontWeight: typography.fontWeight.bold },
    changePasswordButton: {
        backgroundColor: colors.primary,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        marginTop: spacing.lg
    },
    changePasswordText: { color: colors.textWhite, fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold },
    orgCard: {
        alignItems: 'center',
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.lg
    },
    orgLogo: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md
    },
    orgLogoText: { color: colors.textWhite, fontSize: 30, fontWeight: typography.fontWeight.bold },
    orgLogoImage: {
        width: 120,
        height: 50,
        marginBottom: spacing.md
    },
    orgName: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, marginBottom: spacing.xs, color: colors.textPrimary },
    orgSubtitle: { fontSize: typography.fontSize.md, color: colors.textMuted },
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
    modal: {
        backgroundColor: colors.background,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        width: '80%'
    },
    modalTitle: {
        fontSize: typography.fontSize.xxl,
        fontWeight: typography.fontWeight.bold,
        marginBottom: spacing.lg,
        textAlign: 'center',
        color: colors.textPrimary
    },
    modalInput: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.sm,
        padding: spacing.md,
        marginBottom: spacing.md
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: spacing.sm
    },
    modalCancelButton: {
        flex: 1,
        padding: spacing.md,
        borderRadius: borderRadius.sm,
        backgroundColor: colors.border,
        marginRight: spacing.sm
    },
    modalCancelText: { textAlign: 'center', fontWeight: typography.fontWeight.bold, color: colors.textSecondary },
    modalSaveButton: {
        flex: 1,
        padding: spacing.md,
        borderRadius: borderRadius.sm,
        backgroundColor: colors.primary
    },
    modalSaveText: { textAlign: 'center', fontWeight: typography.fontWeight.bold, color: colors.textWhite },
    logoutButton: {
        backgroundColor: colors.danger,
        margin: spacing.lg,
        marginBottom: spacing.sm,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center'
    },
    logoutText: { color: colors.textWhite, fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold },

    // Danger Zone Styles
    dangerZone: {
        marginHorizontal: spacing.lg,
        marginBottom: spacing.xxl,
        padding: spacing.md,
        backgroundColor: '#FFF5F5',
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: '#FFCCCC',
        alignItems: 'center'
    },
    dangerZoneTitle: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.bold,
        color: colors.danger,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: spacing.sm
    },
    deleteAccountButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'transparent',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.danger
    },
    deleteAccountIcon: {
        fontSize: 16,
        marginRight: spacing.sm
    },
    deleteAccountText: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        color: colors.danger
    },
    deleteWarning: {
        fontSize: typography.fontSize.xs,
        color: colors.textLight,
        marginTop: spacing.sm,
        textAlign: 'center'
    }
});

export default ProfileScreen;
