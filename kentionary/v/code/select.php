<?php
//
//Establish connection to the database.
$connection =  mysqli_connect("localhost","hallelujah","Godwins+$","kentionary");
//
//Check if the connection is successful.
if ($connection == true) {
    //
    //Query to get the list of languages.
    $sql_language = "select language.name from language";
    //
    //Execute the query in the database.
    $result = mysqli_query($connection, $sql_language);
    //
    //Get the data and it as an associative array.
    $result_language = mysqli_fetch_all($result, MYSQLI_ASSOC);
    //
    //Convert the associative array into json format.
    echo json_encode($result_language);
}
//
//Display a message incase there's no connection to the database.
else{
    echo "Unsuccessful connection";
}
