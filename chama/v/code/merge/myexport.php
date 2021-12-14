<?php
//To resolve reference to the mutall class
include_once $_SERVER['DOCUMENT_ROOT'].'/library/v/code/schema.php';
//
//Set the requests global varaibles
mutall::set_requests($_SERVER['DOCUMENT_ROOT'].'/chama/v/code/merge/post.json');
//
//Run the last request (from Js)
include_once($_SERVER['DOCUMENT_ROOT'].'/library/v/code/export.php');
