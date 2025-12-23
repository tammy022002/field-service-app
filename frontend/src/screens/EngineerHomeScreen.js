import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ActivityIndicator, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { AuthContext } from '../AuthContext';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

const EngineerHomeScreen = ({ navigation }) => {
    const { userToken, logout } = useContext(AuthContext);
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission to access location was denied');
                return;
            }

            let loc = await Location.getCurrentPositionAsync({});
            setLocation(loc.coords);

            fetchClients();
        })();
    }, []);

    const fetchClients = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/clients`);
            setClients(response.data);
            if (response.data.length > 0) setSelectedClient(response.data[0].id);
            setLoading(false);
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch clients');
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!location) {
            // Retry location
            let loc = await Location.getCurrentPositionAsync({});
            setLocation(loc.coords);
            if (!loc) {
                Alert.alert('Error', 'Location not available');
                return;
            }
        }

        try {
            await axios.post(
                `${API_BASE_URL}/log`,
                {
                    client_id: selectedClient,
                    description,
                    lat: location.latitude,
                    long: location.longitude
                },
                { headers: { Authorization: `Bearer ${userToken}` } }
            );
            Alert.alert('Success', 'Log submitted successfully');
            setDescription('');
        } catch (error) {
            console.log('Submit Log Error:', error);
            const msg = error.response?.data?.msg || error.message || 'Unknown error';
            Alert.alert('Error', `Failed to submit log: ${msg}`);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.accent} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor={colors.primary} translucent={false} />
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Engineer Home</Text>
                </View>

                <View style={styles.content}>
                    <Text style={styles.sectionTitle}>Select Client (ID):</Text>
                    <View style={styles.pickerContainer}>
                        {clients.map(c => (
                            <TouchableOpacity
                                key={c.id}
                                onPress={() => setSelectedClient(c.id)}
                                style={[styles.clientItem, selectedClient === c.id && styles.selected]}
                            >
                                <Text style={[styles.clientItemText, selectedClient === c.id && styles.selectedText]}>
                                    {c.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <Text style={styles.selectedInfo}>Selected Client ID: {selectedClient}</Text>

                    <Text style={styles.sectionTitle}>Description:</Text>
                    <TextInput
                        style={styles.input}
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        placeholder="Enter description..."
                        placeholderTextColor={colors.textLight}
                    />

                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={() => navigation.navigate('NewInteraction')}
                    >
                        <Text style={styles.buttonText}>New Interaction</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.secondaryButton} onPress={handleSubmit}>
                        <Text style={styles.buttonText}>Submit Log</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                        <Text style={styles.buttonText}>Logout</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.primary
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.backgroundLight
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
    content: {
        flex: 1,
        padding: spacing.lg
    },
    sectionTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
        marginTop: spacing.sm,
        marginBottom: spacing.sm,
        color: colors.textSecondary
    },
    pickerContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: spacing.sm
    },
    clientItem: {
        padding: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        margin: spacing.xs,
        backgroundColor: colors.background
    },
    clientItemText: {
        color: colors.textSecondary,
        fontSize: typography.fontSize.md
    },
    selected: {
        backgroundColor: colors.accent,
        borderColor: colors.accent
    },
    selectedText: {
        color: colors.textWhite,
        fontWeight: typography.fontWeight.semibold
    },
    selectedInfo: {
        fontSize: typography.fontSize.md,
        color: colors.textMuted,
        marginBottom: spacing.md
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginVertical: spacing.sm,
        height: 100,
        textAlignVertical: 'top',
        backgroundColor: colors.background,
        fontSize: typography.fontSize.lg,
        color: colors.textSecondary
    },
    primaryButton: {
        backgroundColor: colors.accent,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        marginTop: spacing.md
    },
    secondaryButton: {
        backgroundColor: colors.primary,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        marginTop: spacing.sm
    },
    logoutButton: {
        backgroundColor: colors.danger,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        marginTop: spacing.sm
    },
    buttonText: {
        color: colors.textWhite,
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold
    }
});

export default EngineerHomeScreen;
