import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [userToken, setUserToken] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const login = async (token, role, id) => {
        setIsLoading(true);
        setUserToken(token);
        setUserRole(role);
        setUserId(id);
        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('userRole', role);
        await AsyncStorage.setItem('userId', String(id));
        setIsLoading(false);
    };

    const logout = async () => {
        setIsLoading(true);
        setUserToken(null);
        setUserRole(null);
        setUserId(null);
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userRole');
        await AsyncStorage.removeItem('userId');
        setIsLoading(false);
    };

    const isLoggedIn = async () => {
        try {
            setIsLoading(true);
            // Clear any stored session to always start fresh on the login page
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userRole');
            await AsyncStorage.removeItem('userId');
            setUserToken(null);
            setUserRole(null);
            setUserId(null);
            setIsLoading(false);
        } catch (e) {
            console.log(`isLoggedIn error ${e}`);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        isLoggedIn();
    }, []);

    return (
        <AuthContext.Provider value={{ login, logout, isLoading, userToken, userRole, userId }}>
            {children}
        </AuthContext.Provider>
    );
};
