<?php

$link = new mysqli("localhost", "hallelujah", "Godwins+$", "kentionary");

if ($link == true) {
    //
    //Query to send to the database.
    $sql_select_code = "insert into word (name) values ('taby');
                     select word.word from word where word.name = 'taby';";
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
} else {
    //
    echo mysqli_connect_error();
}