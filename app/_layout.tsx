// app/_layout.tsx
import { useFonts } from "expo-font";
import * as Notifications from 'expo-notifications';
import { SplashScreen, Stack } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, Platform } from "react-native";
import GlobalProvider from '../context/GlobalProvider.js';
import "../global.css";

// Set the notification handler to show alerts even when the app is foregrounded
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});

const RootLayout = () => {
    const [fontsLoaded, error] = useFonts({
        Poppins: require('../assets/fonts/Poppins-Regular.ttf'),
        "Poppins-Bold": require('../assets/fonts/Poppins-Bold.ttf'),
        "Poppins-SemiBold": require('../assets/fonts/Poppins-SemiBold.ttf'),
        "Poppins-Medium": require('../assets/fonts/Poppins-Medium.ttf'),
        Quicksand: require('../assets/fonts/Quicksand-static/Quicksand-Regular.ttf'),
        Raleway: require('../assets/fonts/Raleway-Regular.ttf'),
        Sintony: require('../assets/fonts/Sintony-Regular.ttf'),
        "Sintony-Bold": require('../assets/fonts/Sintony-Bold.ttf'),
    });

    const [expoPushToken, setExpoPushToken] = useState('');
    const notificationListener = useRef<any>();
    const responseListener = useRef<any>();

    // Register for notifications when the app loads
    useEffect(() => {
        const registerForPushNotificationsAsync = async () => {
            let token;
            if (Platform.OS === 'android' || Platform.OS === 'ios') {
                const { status: existingStatus } = await Notifications.getPermissionsAsync();
                let finalStatus = existingStatus;
                if (existingStatus !== 'granted') {
                    const { status } = await Notifications.requestPermissionsAsync();
                    finalStatus = status;
                }
                if (finalStatus !== 'granted') {
                    Alert.alert('Error', 'Failed to get push token for notifications!');
                    return;
                }
                token = (await Notifications.getExpoPushTokenAsync()).data;
                console.log('Expo Push Token:', token);
                setExpoPushToken(token);
            } else {
                Alert.alert('Notification Error', 'Push notifications require a physical device or proper simulator configuration.');
            }

            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('default', {
                    name: 'default',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#FF231F7C',
                });
            }
        };

        registerForPushNotificationsAsync();

        // Listener for foreground notifications
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            console.log('Notification Received:', notification);
        });

        // Listener for responses when a notification is tapped
        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log('Notification Response:', response);
        });

        return () => {
            if (notificationListener.current) {
                Notifications.removeNotificationSubscription(notificationListener.current);
            }
            if (responseListener.current) {
                Notifications.removeNotificationSubscription(responseListener.current);
            }
        };
    }, []);

    useEffect(() => {
        if (fontsLoaded || error) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded, error]);

    if (!fontsLoaded && !error) {
        console.log(error);
        return null;
    }

    return (
        <GlobalProvider>
            <Stack screenOptions={{ headerShown: false }} />
        </GlobalProvider>
    );
};

export default RootLayout;
