// app/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import AuthScreen from './AuthScreen';
import MainLayout from './MainLayout';
import { ActivityIndicator, View } from 'react-native';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    const { isLoggedIn, loading } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#4c00b0" testID="loading-indicator"  />
            </View>
        );
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!isLoggedIn ? (
                <Stack.Screen name="Auth" component={AuthScreen} />
            ) : (
                <Stack.Screen name="Main" component={MainLayout} />
            )}
        </Stack.Navigator>
    );
}