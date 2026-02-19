import React, { useState, useEffect } from 'react';
import { requestNotificationPermission, onMessageListener } from '../lib/firebaseMessaging';
import { Globe, Bell } from 'lucide-react';

const NotificationPermission = () => {
    useEffect(() => {
        // Trigger the browser prompt immediately on load
        requestNotificationPermission();

        // Listen for foreground messages
        onMessageListener().then((payload) => {
            console.log('Foreground notification received:', payload);
        }).catch((err) => console.log('failed: ', err));
    }, []);

    // Invisible component, logic only
    return null;
};

export default NotificationPermission;
