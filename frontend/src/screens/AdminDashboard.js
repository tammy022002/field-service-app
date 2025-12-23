import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useContext } from 'react';
import { AuthContext } from '../AuthContext';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

const AdminDashboard = ({ navigation }) => {
    const [engineers, setEngineers] = useState([]);
    const { logout, userToken } = useContext(AuthContext);

    useEffect(() => {
        fetchEngineers();
    }, []);

    const fetchEngineers = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/engineers`, {
                headers: { Authorization: `Bearer ${userToken}` }
            });
            setEngineers(response.data);
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch engineers');
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.engineerCard}
            onPress={() => navigation.navigate('EngineerDetail', { engineerId: item.id, engineerName: item.email })}
        >
            <View style={styles.cardContent}>
                <Text style={styles.engineerName}>{item.email}</Text>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.interaction_count} interactions</Text>
                </View>
            </View>
            <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor={colors.primary} translucent={false} />
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Engineers</Text>
                </View>

                <TouchableOpacity style={styles.refreshButton} onPress={fetchEngineers}>
                    <Text style={styles.refreshButtonText}>↻ Refresh</Text>
                </TouchableOpacity>

                <FlatList
                    data={engineers}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                />

                <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>
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
        alignItems: 'center'
    },
    headerTitle: {
        fontSize: typography.fontSize.xxxl,
        fontWeight: typography.fontWeight.bold,
        color: colors.textWhite
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
    engineerCard: {
        backgroundColor: colors.background,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        ...shadows.sm
    },
    cardContent: {
        flex: 1
    },
    engineerName: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.semibold,
        marginBottom: spacing.sm,
        color: colors.textPrimary
    },
    badge: {
        backgroundColor: colors.accent,
        paddingHorizontal: spacing.md,
        paddingVertical: 6,
        borderRadius: borderRadius.lg,
        alignSelf: 'flex-start'
    },
    badgeText: {
        color: colors.textWhite,
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold
    },
    arrow: {
        fontSize: 30,
        color: colors.border,
        marginLeft: spacing.sm
    },
    logoutButton: {
        backgroundColor: colors.danger,
        margin: spacing.lg,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center'
    },
    logoutButtonText: {
        color: colors.textWhite,
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold
    }
});

export default AdminDashboard;
