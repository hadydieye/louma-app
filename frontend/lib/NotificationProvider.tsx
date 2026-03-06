import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useAuth } from './AuthContext';
import { supabase } from './supabase';

// Configurer le comportement des notifications quand l'app est ouverte
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
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
    const notificationListener = useRef<Notifications.Subscription>(null);
    const responseListener = useRef<Notifications.Subscription>(null);
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

        // Project ID is required for Expo Push Notifications
        const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        if (!projectId) {
            console.warn('No EAS project ID found. Push notifications are disabled in this environment.');
        } else {
            try {
                token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
                console.log('Expo Push Token:', token);
            } catch (error) {
                console.error('Failed to get Expo push token:', error);
            }
        }
    } else {
        console.warn('Must use physical device for Push Notifications');
    }

    return token;
}
