import * as firebase from 'firebase';
require('@firebase/firestore');
var firebaseConfig = {
    apiKey: "AIzaSyByoeb6O9sJutRriAYcet8rEz1o61pL_dw",
    authDomain: "wily-d2781.firebaseapp.com",
    databaseURL: "https://wily-d2781.firebaseio.com",
    projectId: "wily-d2781",
    storageBucket: "wily-d2781.appspot.com",
    messagingSenderId: "298879864061",
    appId: "1:298879864061:web:f5fb35c57911bdb1be0294"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  export default firebase.firestore();