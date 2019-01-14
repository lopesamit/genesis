import firebase from 'firebase/app';
require('firebase/storage');
require('dotenv').config()

const config = {
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain:  process.env.REACT_APP_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_DATABASE_URL,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
};

if (!firebase.apps.length) {
    firebase.initializeApp(config);
}

export default firebase