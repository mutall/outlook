<?php
//
//Get firebase credentials to run firebase authentication.
include 'firebase.php';
//
//Get the chama library.
include "./chama.php";
//
//Get the groups from the database.
$chamas = new chamas();

?>
<html>
    <head>
        <title>Groups</title>
        <link rel="stylesheet" href="Stylesheets/chama.css">
        <link rel="stylesheet" href="Stylesheets/signup.css">
        <link rel="stylesheet" href="Stylesheets/services.css">
        <link rel="stylesheet"
              href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
        
        <script src="signup.js"></script>
        <script type="module">
            import {check_dbase} from "./login/login.js";
            window.check_dbase = check_dbase;
            
        </script>
    </head>
    <body class="chamas">
        <div class="header" id="section1">
            <img src="img/chama_logo.2.jpg"><h1>Unify Chama</h1>
            <div class="buttons">
                <div><p id="tag"></p></div>
                <button id="login" >Log In</button>
                <button id="logout">Log Out</button>
            </div>
        </div>
        <div class="access" id="section3">
            <span id="closed" aria-hidden="true">&times;</span>
            <button id="gmail_access">Gmail Login</button>
            <form id="showform">
                <!--Create place holders for logging purpose-->
                <input id="emailtxt" type="email" placeholder="Email" required>
                <i class="fa fa-check-circle" aria-hidden="true"></i>
                <i class="fa fa-exclamation-circle"></i>
                <small class="small">Error Message</small>
                <input id="passtxt" type="password" placeholder="Password" required>
            </form>
            <button id="btn">Ok</button>
        </div> 
        <div class="about"> 
            <div class="intro">
                <p><b>Welcome All</b></p>
                <p>What`s better than financial security?
                    Join ChamaBora and invest in your social circles</p>
            </div>
            <div class="why">
                <p><b>Why join a chama</b></p>
                <ol>
                    <li>Socialization</li>
                    <li>Financial Support system</li>
                    <li>Lower Investment risks</li>
                </ol>
            </div>
            <div class="benefits">
                <p><b>Benefits</b></p>
                <ol>
                    <li>Financial security</li>
                    <li>Savings</li>
                    <li>Investments</li>
                </ol>
            </div>
            <div>
                <p><b>Why choose Us</b></p>
                <ol>
                    <li>Totally free</li>
                    <li>Chama centered</li>
                    <li>Everything is automated</li>
                </ol>
            </div>
            <button id="register" onclick="group.register()"> Register with Us. </button>
        </div>
        <div class="groups" id="groups_div">
            <?php
            //
            //Display groups.
            $chamas->show();
            ?>
        </div>
        <div class="Services">
                <p><b>Services</b></p>
                <ol>
                    <li>Contribution Management</li>
                    <li>Messaging</li>
                    <li>Event handling</li>
                </ol>
        </div>
        
        <div class="footer">
            <p>Powered by: <a href="https://mutall.co.ke/mutall_data">Mutall Data Managers</a></p> <br> <hr>
            <p>Created by: <a href="php_files/About.php">Peter Kamau</a></p>
            <img src="img/mutall/Peter Kamau.jpg">
        </div>
        <script>
            new section1();
        </script>
    </body>
</html>      
