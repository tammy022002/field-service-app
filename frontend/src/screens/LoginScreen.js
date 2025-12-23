import React, { useState, useContext } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, StatusBar, SafeAreaView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { AuthContext } from '../AuthContext';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [role, setRole] = useState('engineer');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { login } = useContext(AuthContext);

    const handleAuth = async () => {
        try {
            if (isLogin) {
                const response = await axios.post(`${API_BASE_URL}/login`, {
                    email,
                    password
                });
                if (response.data.access_token) {
                    login(response.data.access_token, response.data.role, response.data.user_id);
                } else {
                    Alert.alert('Login Failed', 'Invalid response');
                }
            } else {
                if (password !== confirmPassword) {
                    Alert.alert('Error', 'Passwords do not match');
                    return;
                }
                await axios.post(`${API_BASE_URL}/register`, {
                    email,
                    password,
                    role
                });
                Alert.alert('Success', 'Account created! Please login.');
                setIsLogin(true);
                setPassword('');
                setConfirmPassword('');
                setFullName('');
            }
        } catch (error) {
            console.log(error);
            const msg = error.response?.data?.msg || 'Check credentials or network';
            Alert.alert(isLogin ? 'Login Failed' : 'Registration Failed', msg);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor={colors.primary} translucent={false} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <LinearGradient
                    colors={['#7FE5F0', '#40C4D3', '#0891A8', '#066B7D']}
                    style={styles.gradient}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Logo Section */}
                        <View style={styles.logoContainer}>
                            <Image
                                source={require('../../assets/concept-logo.png')}
                                style={styles.logoImage}
                                resizeMode="contain"
                            />
                        </View>

                        {/* Welcome Text - Centered */}
                        <Text style={styles.welcomeText}>
                            {isLogin ? 'Hello\nSign in!' : 'Create Your\nAccount'}
                        </Text>

                        {/* Form Card - Larger & More Aesthetic */}
                        <View style={styles.formCard}>
                            {!isLogin && (
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Full Name"
                                        placeholderTextColor={colors.textLight}
                                        value={fullName}
                                        onChangeText={setFullName}
                                    />
                                </View>
                            )}

                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder={isLogin ? "Email" : "Email or Gmail"}
                                    placeholderTextColor={colors.textLight}
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        placeholder="Password"
                                        placeholderTextColor={colors.textLight}
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPassword}
                                    />
                                    <TouchableOpacity
                                        style={styles.eyeButton}
                                        onPress={() => setShowPassword(!showPassword)}
                                    >
                                        <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {!isLogin && (
                                <View style={styles.inputContainer}>
                                    <View style={styles.passwordContainer}>
                                        <TextInput
                                            style={styles.passwordInput}
                                            placeholder="Confirm Password"
                                            placeholderTextColor={colors.textLight}
                                            value={confirmPassword}
                                            onChangeText={setConfirmPassword}
                                            secureTextEntry={!showConfirmPassword}
                                        />
                                        <TouchableOpacity
                                            style={styles.eyeButton}
                                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            <Text style={styles.eyeIcon}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}

                            {isLogin && (
                                <TouchableOpacity style={styles.forgotPassword}>
                                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                                </TouchableOpacity>
                            )}

                            {/* Role Selection for Signup */}
                            {!isLogin && (
                                <View style={styles.roleContainer}>
                                    <Text style={styles.roleLabel}>Select Role:</Text>
                                    <View style={styles.roleButtons}>
                                        <TouchableOpacity
                                            style={[styles.roleButton, role === 'engineer' && styles.roleButtonSelected]}
                                            onPress={() => setRole('engineer')}
                                        >
                                            <Text style={[styles.roleButtonText, role === 'engineer' && styles.roleButtonTextSelected]}>
                                                Engineer
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.roleButton, role === 'admin' && styles.roleButtonSelected]}
                                            onPress={() => setRole('admin')}
                                        >
                                            <Text style={[styles.roleButtonText, role === 'admin' && styles.roleButtonTextSelected]}>
                                                Admin
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}

                            <TouchableOpacity style={styles.authButton} onPress={handleAuth}>
                                <Text style={styles.authButtonText}>
                                    {isLogin ? 'SIGN IN' : 'SIGN UP'}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.switchMode}
                                onPress={() => {
                                    setIsLogin(!isLogin);
                                    setPassword('');
                                    setConfirmPassword('');
                                    setFullName('');
                                    setShowPassword(false);
                                    setShowConfirmPassword(false);
                                }}
                            >
                                <Text style={styles.switchModeText}>
                                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                                    <Text style={styles.switchModeLink}>
                                        {isLogin ? "Sign Up" : "Sign In"}
                                    </Text>
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </LinearGradient>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.primary,
    },
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xxxl,
        paddingBottom: spacing.xxxl,
        justifyContent: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    logoImage: {
        width: 260,
        height: 110,
        tintColor: '#FFFFFF',
    },
    welcomeText: {
        fontSize: 32,
        fontWeight: typography.fontWeight.bold,
        color: colors.textWhite,
        marginBottom: spacing.xxl,
        lineHeight: 42,
        textAlign: 'center',
    },
    formCard: {
        backgroundColor: colors.background,
        borderRadius: 28,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.xxxl,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 12,
    },
    inputContainer: {
        marginBottom: spacing.lg,
    },
    input: {
        borderWidth: 1.5,
        borderColor: colors.border,
        borderRadius: 16,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md + 2,
        fontSize: typography.fontSize.lg,
        color: colors.textSecondary,
        backgroundColor: colors.backgroundLight,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: colors.border,
        borderRadius: 16,
        backgroundColor: colors.backgroundLight,
    },
    passwordInput: {
        flex: 1,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md + 2,
        fontSize: typography.fontSize.lg,
        color: colors.textSecondary,
    },
    eyeButton: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
    },
    eyeIcon: {
        fontSize: 20,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: spacing.xl,
    },
    forgotPasswordText: {
        color: colors.accent,
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.medium,
    },
    roleContainer: {
        marginBottom: spacing.xl,
    },
    roleLabel: {
        fontSize: typography.fontSize.md,
        color: colors.textMuted,
        marginBottom: spacing.sm,
        fontWeight: typography.fontWeight.medium,
    },
    roleButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: spacing.sm,
    },
    roleButton: {
        flex: 1,
        paddingVertical: spacing.md,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: colors.border,
        alignItems: 'center',
        backgroundColor: colors.backgroundLight,
    },
    roleButtonSelected: {
        backgroundColor: colors.accent,
        borderColor: colors.accent,
    },
    roleButtonText: {
        fontSize: typography.fontSize.md,
        color: colors.textMuted,
        fontWeight: typography.fontWeight.medium,
    },
    roleButtonTextSelected: {
        color: colors.textWhite,
        fontWeight: typography.fontWeight.semibold,
    },
    authButton: {
        backgroundColor: colors.primary,
        borderRadius: 16,
        paddingVertical: spacing.md + 4,
        alignItems: 'center',
        shadowColor: colors.accent,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 8,
    },
    authButtonText: {
        color: colors.textWhite,
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        letterSpacing: 1.5,
    },
    switchMode: {
        marginTop: spacing.xl,
        alignItems: 'center',
    },
    switchModeText: {
        color: colors.textMuted,
        fontSize: typography.fontSize.md,
    },
    switchModeLink: {
        color: colors.accent,
        fontWeight: typography.fontWeight.semibold,
    },
});

export default LoginScreen;
