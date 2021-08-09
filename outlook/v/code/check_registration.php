<?php
//Check whether user is registered with outlook returning true
//otherwise false.
//
//1. Create the "user" class
include 'user.php';
//
//2. Create an instance of a "user"
$user=new user();
//
//
$method= $_REQUEST['method'];
//
//3. Execute the registration method and return true if successful
$result=$user->$method();
//
//4. Send the results back to the client
echo  json_encode($result);


