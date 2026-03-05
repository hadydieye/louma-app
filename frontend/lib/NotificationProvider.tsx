import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useAuth } from './AuthContext';
import { apiRequest } from './api';

// Configurer le comportement des notifications quand l'app est ouverte
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

interface NotificationContextType {
    expoPushToken: string | undefined;
    notification: Notifications.Notification | undefined;
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
    const [notification, setNotification] = useState<Notifications.Notification>();
    const notificationListener = useRef<Notifications.Subscription>();
    const responseListener = useRef<Notifications.Subscription>();
    const { isAuthenticated, user } = useAuth();

    useEffect(() => {
        registerForPushNotificationsAsync().then(token => {
            setExpoPushToken(token);
            if (token && isAuthenticated) {
                sendTokenToBackend(token);
            }
        });

        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            setNotification(notification);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log('Notification interaction:', response);
        });

        return () => {
            if (notificationListener.current) {
                Notifications.removeNotificationSubscription(notificationListener.current);
            }
            if (responseListener.current) {
                Notifications.removeNotificationSubscription(responseListener.current);
            }
        };
    }, [isAuthenticated]);

    const sendTokenToBackend = async (token: string) => {
        try {
            await apiRequest('/api/auth/push-token', {
                method: 'PATCH',
                body: JSON.stringify({ pushToken: token }),
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            console.log('Push token sent to backend');
        } catch (error) {
            console.error('Error sending push token to backend:', error);
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

        // Project ID is required for Expo Push Notifications
        const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

        token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        console.log('Expo Push Token:', token);
    } else {
        console.warn('Must use physical device for Push Notifications');
    }

    return token;
}
