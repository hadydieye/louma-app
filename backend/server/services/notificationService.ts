import { Expo, ExpoPushMessage } from 'expo-server-sdk';

const expo = new Expo();

export interface PushNotification {
    to: string;
    title: string;
    body: string;
    data?: any;
}

class NotificationService {
    async sendPushNotification({ to, title, body, data }: PushNotification) {
        // Check that all your push tokens appear to be valid Expo push tokens
        if (!Expo.isExpoPushToken(to)) {
            console.error(`Push token ${to} is not a valid Expo push token`);
            return;
        }

        const messages: ExpoPushMessage[] = [{
            to,
            sound: 'default',
            title,
            body,
            data,
        }];

        try {
            const chunks = expo.chunkPushNotifications(messages);
            const tickets = [];

            for (const chunk of chunks) {
                const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                tickets.push(...ticketChunk);
            }

            // NOTE: In production, you should handle receipts (expo.getPushNotificationReceiptsAsync)
            // to handle errors like device uninstallation/token invalidation
            console.log('Notification sent successfully:', tickets);
        } catch (error) {
            console.error('Error sending push notification:', error);
        }
    }

    async sendToUser(toPushToken: string | null | undefined, title: string, body: string, data?: any) {
        if (!toPushToken) return;
        await this.sendPushNotification({ to: toPushToken, title, body, data });
    }
}

export const notificationService = new NotificationService();
