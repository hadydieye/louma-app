import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { useAuth } from './AuthContext';
import { supabase } from './supabase';

// We use require for expo-notifications to avoid a hard crash at import time in Expo Go SDK 53+
let Notifications: any;
try {
    Notifications = require('expo-notifications');
} catch (e) {
    console.warn('expo-notifications module not found or not supported in this environment');
}

// Configurer le comportement des notifications quand l'app est ouverte
try {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
            shouldShowBanner: true,
            shouldShowList: true,
        }),
    });
} catch (error) {
    console.warn('Notifications handler could not be set:', error);
}

interface NotificationContextType {
    expoPushToken: string | undefined;
    notification: any | undefined;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [expoPushToken, setExpoPushToken] = useState<string>();
    const [notification, setNotification] = useState<any>();
    const notificationListener = useRef<any>(null);
    const responseListener = useRef<any>(null);
    const { isAuthenticated, user } = useAuth();

    useEffect(() => {
        const setupNotifications = async () => {
            try {
                const token = await registerForPushNotificationsAsync();
                if (token) {
                    setExpoPushToken(token);
                    if (isAuthenticated) {
                        sendTokenToBackend(token);
                    }
                }

                notificationListener.current = Notifications.addNotificationReceivedListener((notification: any) => {
                    setNotification(notification);
                });

                responseListener.current = Notifications.addNotificationResponseReceivedListener((response: any) => {
                    console.log('Notification interaction:', response);
                });
            } catch (error) {
                console.warn('Error setting up notification listeners:', error);
            }
        };

        setupNotifications();

        return () => {
            if (notificationListener.current) {
                notificationListener.current.remove();
            }
            if (responseListener.current) {
                responseListener.current.remove();
            }
        };
    }, [isAuthenticated]);

    const sendTokenToBackend = async (token: string) => {
        try {
            const { error } = await supabase
                .from('users')
                .update({ push_token: token })
                .eq('id', user?.id);

            if (error) throw error;
            console.log('Push token synced to Supabase');
        } catch (error) {
            console.error('Error syncing push token:', error);
        }
    };

    return (
        <NotificationContext.Provider value={{ expoPushToken, notification }}>
            {children}
        </NotificationContext.Provider>
    );
};

async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            console.warn('Failed to get push token for push notification!');
            return;
        }

        try {
            // Project ID is required for Expo Push Notifications
            const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
            if (!projectId) {
                console.warn('No EAS project ID found. Push notifications are disabled in this environment.');
            } else {
                token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
                console.log('Expo Push Token:', token);
            }
        } catch (error) {
            console.log('Push notifications not available in this environment (likely Expo Go SDK 53+):', error);
        }
    } else {
        console.warn('Must use physical device for Push Notifications');
    }

    return token;
}
