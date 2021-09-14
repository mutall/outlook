<?php
//
//Kick off the session storage.
session_start();
//
//Destroy the session.
session_destroy();
//
//Upon logging out, switch to the login page.
header('location:http://127.0.0.1/login/login.php');