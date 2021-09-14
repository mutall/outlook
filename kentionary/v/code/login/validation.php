<?php
//
//Kick off the session storage.
session_start();
//
//Establish connection to the database.
$link = mysqli_connect('localhost','hallelujah','Godwins+$');
//
//Select database to use.
mysqli_select_db($link, 'kentionary');
//
//Get user inputs that are submitted through a form.
$email = $_REQUEST['email'];
$pwd = $_REQUEST['pwd'];
//
//Query to be sent to the database.
$sql_check = "select * from user where email='$email' and password = '$pwd'";
//
//Get the response from the database.
$result = mysqli_query($link, $sql_check);
//
//Check how many rows are in the result.
$num = mysqli_num_rows($result);
echo $num;
//
//
if($num == 1){
    //
    $_SESSION['Email'] = $email;
    //
    header('Location: http://127.0.0.1/new_word/index.php');
}
else{
    //
    //
    header('location:login.php');
}