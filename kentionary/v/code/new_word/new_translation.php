<?php

//
//Get the code.
//$input_code = $_REQUEST['input_code'];
$input_code = 'car';
//
//Get language 1.
//$select1 = $_REQUEST['select1'];
$select1 = 'swahili';
//
//Get the word for which to add translation.
//$input_new1 = $_REQUEST['input_new1'];
$input_new1 = 'gari';
//
//Get meaning1 of the new translation.
//$meaning1 = $_REQUEST['meaning1'];
$meaning1 = "abra";
//
//Get language 2.
//$select2 = $_REQUEST['select2'];
$select2 = 'english';
//
//Get the new translation.
//$input_new2 = $_REQUEST['input_new2'];
$input_new2 = 'auto-mobile';
//
//Get the meaning of the new translation.
//$meaning2 = $_REQUEST['meaning2'];
$meaning2 = "abra";
//
//Establish a connection to the database.
$link = mysqli_connect("localhost", "hallelujah", "Godwins+$", "kentionary");
//
//
if ($link == true) {
    //
    //
    $sql_check_code = "select * from word where word.name = '$input_code'";
    //
    //
    $result_check_code = mysqli_query($link, $sql_check_code);
    $res = $result_check_code->fetch_assoc();
    //var_dump($res);
    //
    //Select the primary key values of tables word and language.
    $sql_pk = "select word.word as pk from word where word.name = '$input_code'
                union
                select language.language as pk from language where language.name = '$select1'
                union
                select language.language as pk from language where language.name = '$select2'";
    //
    //Execute the query in the database and return a result.
    $result_word = mysqli_query($link, $sql_pk);
    //
    //Create an epmty array in which to populate with foreign keys.
    $response = [];
    //
    //
    while ($row = $result_word->fetch_assoc()) {
        //
        //An array to get the primary key values selected.
        //Push the values of the result to an array in order to be able to get 
        //its values for further processing.
        $response[] = $row['pk'];
//        var_dump($response);
    }
    //
    //
    if ($res) {
        //
        //Multiple sqls concatenated to be executed together simulateneously.
        //
        //This is the 1st entry of the new translation.
        $sql_translation = "insert into translation (name, meaning, word, language)
      values ('$input_new1','$meaning1','$response[0]','$response[1]');";
        //
        //This is the 2nd entry of the new translation.
        $sql_translation .= "insert into translation (name, meaning, word, language)
      values ('$input_new2','$meaning2','$response[0]','$response[2]');";
        //
        //Send the query to the database.
        $result_translation = mysqli_multi_query($link, $sql_translation);
        //
        //
        if ($result_translation) {
            do {
                //
                // Store first result set.
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
        echo '<br>' . 'yes value';
    } else {
        //
        //
        $sql_new_code = "insert into word (name) values ('$input_code')";
        //
        //
        $sql_new_code .= "insert into translation (name, meaning, word, language)
                 values ('$input_new1,'$meaning1','$response[0]','$response[1]')";
        //
        //
        $sql_new_code .= "insert into translation (name, meaning, word, language)
                 values ('$input_new2,'$meaning2','$response[0]','$response[2]')";
        //
        //Send the query to the database.
        $result_new_code = mysqli_multi_query($link, $sql_new_code);
        //
        //
        if ($result_new_code) {
            do {
                //
                // Store first result set.
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
        echo 'new code';
    }
} else {
    //
    //
    echo mysqli_connect_error();
}