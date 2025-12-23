import { LocalNotifications } from '@capacitor/local-notifications';
import { Task } from './types';

// Helper to hash string ID to integer for Android Notification IDs
const hashId = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
};

const HABIT_REMINDER_ID = 10001;
const JOURNAL_REMINDER_ID = 10002;

export const NotificationManager = {
    async init() {
        try {
            const perm = await LocalNotifications.checkPermissions();
            if (perm.display !== 'granted') {
                const req = await LocalNotifications.requestPermissions();
                if (req.display !== 'granted') return false;
            }

            // Create channel for Android
            await LocalNotifications.createChannel({
                id: 'arise_reminders',
                name: 'Arise Reminders',
                description: 'Reminders for Tasks and Journaling',
                importance: 5,
                visibility: 1,
                vibration: true,
            });

            return true;
        } catch (e) {
            console.error('Notification Init Error:', e);
            return false;
        }
    },

    // Fixed IDs for daily summaries
    // 10001: Daily Task Summary (6 PM)
    // 10002: Daily Journal Reminder (9 PM)

    async scheduleDailyTaskSummary() {
        try {
            // Schedule for 6 PM every day
            // If already scheduled, this might overwrite or duplicate depending on ID.
            // Using a fixed ID ensures update/overwrite.
            await LocalNotifications.schedule({
                notifications: [
                    {
                        title: 'Daily Task Review',
                        body: 'You have incomplete tasks. Time to wrap up!',
                        id: 10001,
                        schedule: {
                            on: { hour: 18, minute: 0 },
                            repeats: true
                        },
                        channelId: 'arise_reminders',
                        smallIcon: 'ic_launcher',
                    }
                ]
            });
        } catch (e) {
            console.error('Schedule Daily Task Error:', e);
        }
    },

    async cancelDailyTaskSummary() {
        try {
            await LocalNotifications.cancel({ notifications: [{ id: 10001 }] });
        } catch (e) {
            console.error('Cancel Daily Task Error:', e);
        }
    },

    async scheduleDailyJournalSummary() {
        try {
            await LocalNotifications.schedule({
                notifications: [
                    {
                        title: 'Evening Journal',
                        body: 'How was your day? Take a moment to reflect.',
                        id: 10002,
                        schedule: {
                            on: { hour: 21, minute: 0 },
                            repeats: true
                        },
                        channelId: 'arise_reminders',
                        smallIcon: 'ic_launcher',
                    }
                ]
            });
        } catch (e) {
            console.error('Schedule Daily Journal Error:', e);
        }
    },

    async cancelDailyJournalSummary() {
        try {
            await LocalNotifications.cancel({ notifications: [{ id: 10002 }] });
        } catch (e) {
            console.error('Cancel Daily Journal Error:', e);
        }
    },

    // INDIVIDUAL TASK REMINDERS
    async scheduleTaskReminder(taskId: string, title: string, dueDate: string, reminderTime: string) {
        try {
            const numericId = hashId(taskId);

            // Combine date and time
            const dateParts = dueDate.split('-'); // YYYY-MM-DD
            const timeParts = reminderTime.split(':'); // HH:MM

            const scheduleDate = new Date(
                parseInt(dateParts[0]),
                parseInt(dateParts[1]) - 1,
                parseInt(dateParts[2]),
                parseInt(timeParts[0]),
                parseInt(timeParts[1])
            );

            // If time is in the past, don't schedule
            if (scheduleDate.getTime() < Date.now()) {
                console.log('Skipping past reminder:', title, scheduleDate);
                return;
            }

            await LocalNotifications.schedule({
                notifications: [
                    {
                        title: 'Mission Reminder',
                        body: `Incomplete: ${title}`,
                        id: numericId,
                        schedule: { at: scheduleDate },
                        channelId: 'arise_reminders',
                        smallIcon: 'ic_launcher',
                        extra: { taskId }
                    }
                ]
            });
            console.log('Scheduled reminder for:', title, 'at', scheduleDate);
        } catch (e) {
            console.error('Schedule Item Error:', e);
        }
    },

    async cancelTaskReminder(taskId: string) {
        try {
            const numericId = hashId(taskId);
            await LocalNotifications.cancel({ notifications: [{ id: numericId }] });
            console.log('Cancelled reminder for:', taskId);
        } catch (e) {
            console.error('Cancel Item Error:', e);
        }
    },

    async testNotification() {
        // Dev tool
        await LocalNotifications.schedule({
            notifications: [{
                title: "Test",
                body: "This is a test from Arise",
                id: 99999,
                schedule: { at: new Date(Date.now() + 1000 * 5) }
            }]
        })
    }
};
