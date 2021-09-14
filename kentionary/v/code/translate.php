<?php
//
//Get the select1 passed from javascript.
$select1 = $_REQUEST['select1'];
//$select1 = 'english';
//
//Get the select2 passed from javascript.
$select2 = $_REQUEST['select2'];
//$select2 = 'kikuyu';
//
//Get the select1 passed from javascript.
$input = $_REQUEST['input'];
//$input = 'God';
//
//Establish connection to the database.
$link =  mysqli_connect("localhost","hallelujah","Godwins+$","kentionary");
//
//Check if the connection is successful.
if ($link == true) {
    //
    //Query to get the list of languages.
    $sql_translation = "select to_translation.name 
        from word
            inner join translation as from_translation on from_translation.word = word.word
            inner join language as from_language on from_translation.language = from_language.language
            inner join translation as to_translation on to_translation.word = word.word
            inner join language as to_language on to_translation.language = to_language.language
        where
            from_translation.name = '$input'
        and
            from_language.name = '$select1'
        and
            to_language.name = '$select2'";
    //
    //Execute the query in the database and return a result.
    $result_translation = mysqli_query($link, $sql_translation);
    $response = [];
    //
    //
    while($row = $result_translation->fetch_assoc()){
        $response[] = $row['name'];
        
    }
    //
    //Convert the associative array into json format.
    echo json_encode($response[0]);
}
//
//Display a message incase there's no connection to the database.
else{
    echo  mysqli_connect_error();
}