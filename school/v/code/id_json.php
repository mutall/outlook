<?php
// 
//Include the id select query
require './query.php';
// 
//
$id= new composite("english");
// 
$id->populate_children();
// 
$score= new total($id);
// 
echo $score->stmt();

