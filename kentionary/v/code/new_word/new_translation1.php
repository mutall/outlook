<?php
//
//Get language 1.
//$select1 = $_REQUEST['select1'];
$select1 = 'swahili';
//
//Get the word for which to add translation.
//$input = $_REQUEST['input'];
$input = 'gari';
//
//Get language 2.
//$select2 = $_REQUEST['select2'];
$select2 = 'english';
//
//Get the new translation.
//$input_new = $_REQUEST['input_new'];
$input_new = 'auto-mobile';
//
//Get the meaning of the new translation.
//$meaning = $_REQUEST['meaning'];
//
//Establish a connection to the database.
$link = mysqli_connect("localhost", "hallelujah", "Godwins+$", "kentionary");
//
//Check if the connection is successful.
if ($link == true) {
    //
    //Query to get the list of languages.
    $sql_word = "select translation.word as pk 
                    from translation 
                    inner join language on translation.language = language.language 
                    inner join word on translation.word = word.word 
                    where translation.name = '$input' and language.name  = '$select1'
                union
                select language.language as pk from language
                    where language.name  = '$select2'";
    //
    //Execute the query in the database and return a result.
    $result_word = mysqli_query($link, $sql_word);
    //
    //Create an epmty array in which to populate with foreign keys.
    $response = [];
    //
    //
    while ($row = $result_word->fetch_assoc()) {
        //
        //Push the values of the result to an array in order to be able to get 
        //its values for further processing.
        $response[] = $row['pk'];
        var_dump($response);
    }
    //
    //Check the count of values in the response array to determine if the 
    //word code exists.
    if (count($response) === 1) {
        //
        //Query to send to the database.
        $sql_select_code = "insert into word (name) values ('$input');
                     select word.word from word where word.name = '$input';";
        //
        //Execute the query in the database.
        $result_select_code = $link->multi_query($sql_select_code);
        //
        //
        if ($result_select_code) {
            do {
                //
                // Store first result set
                if ($result = mysqli_store_result($link)) {
                    //
                    while ($row = mysqli_fetch_row($result)) {
                        //
                        //Display the result.
                        $result_select = $row[0];
                        var_dump($result_select);
                    }
                    mysqli_free_result($result);
                }
                //Prepare next result set
            } while (mysqli_next_result($link));
        }
        //
        //
        echo 'inserted code!';
    } else {
        //
        //Upon getting the array value, use them to insert a new translation which 
        //already has a code.
        $sql_new = "insert into translation (name, meaning, word, language)
                values ('$input_new', '', '$response[0]', '$response[1]')";
        //
        //Insert the new translation.
        $result_new = mysqli_query($link, $sql_new);
        echo '<br>' . '2 values';
    }
}
//
//Display a message incase there's no connection to the database.
else {
    echo mysqli_connect_error();
}    