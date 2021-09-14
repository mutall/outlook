<?php
//
//Kick off the session storage.
session_start();
//
header('location:login.php');
//
//Establish connection to the database.
$link = mysqli_connect('localhost','hallelujah','Godwins+$');
//
//Select database to use.
mysqli_select_db($link, "kentionary");
//
//
$email = $_REQUEST['email'];
$pwd = $_REQUEST['pwd'];
//
//
$sql_check = "select * from user where email='$email'";
//
//Get the response from the database.
$result = mysqli_query($link, $sql_check);
//
//
$num = mysqli_num_rows($result);
//
//
if($num == 1){
    
    echo "<script>alert('email is already taken');</script>";
}
else{
    //
    //
    $sql_register = "insert into user(email, password) values('$email', '$pwd')";
    //
    //
    mysqli_query($link, $sql_register);
    echo "<script>alert('Registration successful');</script>";
}