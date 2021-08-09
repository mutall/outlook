<?php
//
// Write the data into the database and return an array of error messages.
// 
//1. Create the "user" class 
include 'user.php';
//
//2. Create an instance of a user
$user= new user();
//
//
$method=$_REQUEST['method'];
//
//3.Execute the "export" data method to return an "array of errors" if any
$result= $user->$method();
//
//4. Send the errors back to the client 
echo json_encode($result);





