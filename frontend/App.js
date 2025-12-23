import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, AuthContext } from './src/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import EngineerDashboard from './src/screens/EngineerDashboard';
import AdminDashboard from './src/screens/AdminDashboard';
import EngineerDetailScreen from './src/screens/EngineerDetailScreen';
import NewInteractionScreen from './src/screens/NewInteractionScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import TeamHistoryScreen from './src/screens/TeamHistoryScreen';
import InteractionDetailScreen from './src/screens/InteractionDetailScreen';
import { View, ActivityIndicator } from 'react-native';
import { colors } from './src/theme';

const Stack = createNativeStackNavigator();

const AppNav = () => {
  const { userToken, userRole, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.backgroundLight }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: colors.textWhite,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {userToken === null ? (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        ) : userRole === 'admin' ? (
          <>
            <Stack.Screen name="AdminDashboard" component={AdminDashboard} options={{ headerShown: false }} />
            <Stack.Screen name="EngineerDetail" component={EngineerDetailScreen} options={{ headerShown: false }} />
          </>
        ) : (
          <>
            <Stack.Screen
              name="EngineerDashboard"
              component={EngineerDashboard}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="NewInteraction"
              component={NewInteractionScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="TeamHistory"
              component={TeamHistoryScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="InteractionDetail"
              component={InteractionDetailScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppNav />
    </AuthProvider>
  );
}

