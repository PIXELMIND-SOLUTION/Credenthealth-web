// Use compat imports for better compatibility
import firebase from 'firebase/compat/app';
import 'firebase/compat/messaging';

// Your existing Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyD-PF4YTTP-RhXMy4wsMsS2wWnjQZhqErQ",
  authDomain: "credenthealth-b7477.firebaseapp.com",
  projectId: "credenthealth-b7477",
  storageBucket: "credenthealth-b7477.firebasestorage.app",
  messagingSenderId: "267796339584",
  appId: "1:267796339584:web:68f803765fd2c914c7ff65",
  measurementId: "G-MQ81WQXK7Z"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
export const messaging = firebase.messaging();

// FCM token generate karne ka function
export const generateFcmToken = async (staffId) => {
  try {
    // Notification permission request karo
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      
      // FCM token generate karo with VAPID key - COMPAT VERSION
      const currentToken = await messaging.getToken({ 
        vapidKey: 'BNrqgd14ukA9jo3l_7yHNKk8fcPpTevIXcJzEbLla5JX-RrcYoGWoxvpxssYr_7s9qDsjk5xLQEHRkt_QyOX2VY'
      });
      
      if (currentToken) {
        console.log('FCM Token:', currentToken);
        
        // Token backend pe save karo
        await saveFcmTokenToBackend(staffId, currentToken);
        return currentToken;
      } else {
        console.log('No registration token available.');
        return null;
      }
    } else {
      console.log('Unable to get permission to notify.');
      return null;
    }
  } catch (error) {
    console.error('An error occurred while retrieving token:', error);
    return null;
  }
};

// Token backend pe save karne ka function
const saveFcmTokenToBackend = async (staffId, fcmToken) => {
  try {
    const response = await fetch('https://api.credenthealth.com/api/staff/save-fcm-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        staffId: staffId,
        fcmToken: fcmToken
      })
    });
    
    const data = await response.json();
    console.log('FCM token saved successfully:', data);
    return data;
  } catch (error) {
    console.error('Error saving FCM token:', error);
    throw error;
  }
};