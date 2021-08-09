  <!-- Insert these scripts at the bottom of the HTML, but before you use any Firebase services -->
        <!-- Firebase App (the core Firebase SDK) is always required and must be listed first -->
        <script src="https://www.gstatic.com/firebasejs/7.13.2/firebase-app.js"></script>
        <!-- If you enabled Analytics in your project, add the Firebase SDK for Analytics -->
        <script src="https://www.gstatic.com/firebasejs/7.13.2/firebase-analytics.js"></script>

        <!-- Add Firebase products that you want to use -->
        <script src="https://www.gstatic.com/firebasejs/7.13.2/firebase-auth.js"></script>
        <script src="https://www.gstatic.com/firebasejs/7.13.2/firebase-firestore.js"></script>
        <script>
          // Your web app's Firebase configuration
          var firebaseConfig = {
            apiKey: "AIzaSyBDr7JscodZx3fsygL59nxVpo1cUBIpUxM",
            authDomain: "unifychama.firebaseapp.com",
            databaseURL: "https://unifychama.firebaseio.com",
            projectId: "unifychama",
            storageBucket: "unifychama.appspot.com",
            messagingSenderId: "1053777755315",
            appId: "1:1053777755315:web:a43cc5ef8f1871d2a144c6",
            measurementId: "G-Z902HH5SYS"
          };
          // Initialize Firebase
          firebase.initializeApp(firebaseConfig);
          firebase.analytics();
        </script>

