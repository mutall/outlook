<?php
include 'firebase.php';
?>
<html>
    <head>
        <title>Login or sign up to access our services</title>
        <link rel="stylesheet" href="Stylesheets/services.css">
        <script src="firebase.js"></script>
    </head>
    <body>
        <div id="login_div" class="contain">
            <p>Login to access services</p>
            <div class="main">
                <!--Create place holders for logging purpose-->
                <input id="emailtxt" type="email" placeholder="Email">
                <input id="passtxt" type="password" placeholder="Password">
                <!--Create buttons for login sign up purpose-->
                <div class="mainbtn">
                    <button id="loginbtn" class="btn_login" onclick="login(); return false;">Login</button>
<!--                    <button id="signupbtn" class="btn_signup" onclick="signup()">SignUp</button>-->
                </div>
            </div>
        </div>
        
    </body>
</html>
