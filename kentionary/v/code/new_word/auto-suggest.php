<?php
//
//
//$language = $_REQUEST['language'];
$language = 'english';
//
//Text from input field to help in auto-suggesting.
$input = $_REQUEST['input'];
//$input = 'y';
//
//Establish connection to the database.
$connection =  mysqli_connect("localhost","hallelujah","Godwins+$","kentionary");
//
//Check if the connection is successful.
if ($connection == true) {
    //
    //Query to get the list of languages.
    $sql_complete = "select translation.name from translation 
        inner join language on translation.language =language.language
        where language.name = '$language' and translation.name like '$input%' LIMIT 5";
    //
    //Execute the query in the database.
    $result = mysqli_query($connection, $sql_complete);
    //
    //Get the data and it as an associative array.
    $result_complete = mysqli_fetch_all($result, MYSQLI_ASSOC);
    //
    //Convert the associative array into json format.
    echo json_encode($result_complete);
}
//
//Display a message incase there's no connection to the database.
else{
    echo "Unsuccessful connection";
}
