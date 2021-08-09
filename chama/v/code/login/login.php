<?php
include '../config.php';
//
//Get post data sent from javascript.
$user_input = file_get_contents('php://input');
//
//Get the connection.
$db = new dbase();
echo $user_input;
//
//Query the connection to get records.
//$sql = "SELECT user.email FROM `mutallde_login`.`user` where user.email = $user_input";
////
//$result = $db->connection->query($sql);
////
////Get the records.
//$records = $result->fetch(PDO::FETCH_OBJ);
//
//echo json_encode($records);

