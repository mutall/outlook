<?php
//
//Catch all errors, including warnings.
\set_error_handler(function ($errno, $errstr, $errfile, $errline /* , $errcontext */) {
    throw new \ErrorException($errstr, 0, $errno, $errfile, $errline);
});
//To resolve reference to the mutall class
include_once $_SERVER['DOCUMENT_ROOT'] . '/library/v/code/schema.php';
//
include_once $_SERVER['DOCUMENT_ROOT'] . '/library/v/code/sql.php';

//Open the database
$dbase = new database("kentionary3");

//
//Get the html forpaining words as slectable radio buttons
function get_words(): string {
    //
    global $dbase;
    //
    //Formulate the query for untranslated kikuyu words
    $query = get_query();

    //Execute the query to get results
    $rows = $dbase->get_sql_data($query);

    //Format the results to a sitable html
    $html = implode(
            "</br> ",
            array_map(
                    fn($row) => "<label><input type='radio' value=\"{$row['name']}\"/>{$row['name']}</label>",
                    $rows
            )
    );
    //
    //Return the html
    return $html;
}

//Query for unltranslated kikutu words
function get_query():string{
    //
    global $dbase;
    //
    //1. Clean the messages
    $msg = $dbase->chk(
        "select "
            . "* "
        ."from msg "
        //
        //Filter out those messages related to media
        //and those that are hyperlinks     
        ."where "
            . "not( "
                ."text Like '<Media%' "
                ."Or text Like  'http%' "
            . ")"
    );
            
    //3. Count the number of English words in the cleaned message.
    $english = $dbase->chk(
       "SELECT "
            ."msg.msg, "
            . "count(word.word) as english "
        ."FROM "
            ."($msg) as msg "
            ."inner join source on source.msg = msg.msg "  
            ."inner join word on source.word = word.word "
            ."inner join synonym on synonym.word = word.word "
            ."inner join translation on synonym.translation = translation.translation "
            ."inner join language on translation.language = language.language "
        ."WHERE "
            ."language.name = 'English' "
        ."GROUP BY "
            ."msg.msg "     
    );        
    //
    //4. Count the number of Kikuyu words in the cleaned message.
    $kikuyu = $dbase->chk(
        "SELECT "
            . "msg.msg, "
            . "count(word.word) as kikuyu "
        . "FROM ($msg) as msg "
            ."inner join source on source.msg = msg.msg "  
            ."inner join word on source.word = word.word "
            ."inner join synonym on synonym.word = word.word "
            ."inner join translation on synonym.translation = translation.translation "
            ."inner join language on translation.language = language.language "
        . "WHERE "
                . "language.name='kikuyu' or language.name='Gikuyu' "
        . "GROUP BY "
                . "msg.msg"
    );
    //
    //5.Determine if a message is in English or Kikuyu 
    $language = $dbase->chk(
        "SELECT "
            . "msg.msg, "
            . "if(kikuyu>english, 'kikuyu', if(english>kikuyu, 'english', null)) as language "
          ."FROM "
            . "($msg) as msg "
            . "left join ($english) as eng on eng.msg=msg.msg "
            . "left join ($kikuyu) as kik on kik.msg = msg.msg "
    );
    //
    //6. Select all untranslated kikuyu words, with relative mportance
    $untranslated = $dbase->chk(
            "SELECT "
                ."word.word, "
                . "word.name,"
                . "count(msg.msg) as importance "
            . "FROM "
                   ."($language) as lang "
                ."inner join msg on lang.msg = msg.msg "
                . "inner join source on source.msg = msg.msg "
                . "inner join word on source.word = word.word " 
            . "WHERE "
                . "lang.language = 'kikuyu' "
            ."GROUP BY "
                . "word.word, word.name "
            . "ORDER BY count(msg.msg) DESC "
    );
    return $untranslated;
}
//
?>
<html>
    <head>
        <!-- 
        The tile of your project -->
        <title>Kentionary | Contribute</title>
        <!-- 
        Styling the index page in terms of grids -->
        <link rel="stylesheet" href="translator.css"/>
        <!--
        Javascript file.-->
        <script type="module">
            //
            import {translator} from "../translate.js";
            //
            //
            window.onload = () => {
                //
                const t = new translator();
                t.execute();
            };
            //
            //Make the translator class visible to the current window.
            window.translator = translator;
            //
        </script>
    </head>

    <body>
        <div id="header">
            <div id="company">
                Provide a New Translation
            </div>
        </div>
        <!--
        Steps. -->
        <div id="steps_title">
            Steps
        </div>
        <div id="steps">
            <ol>
                <li>Select a word to translate</li>
                <li>Provide more details of the selected word</li>
                <li>Select a term</li>
                <li>Enrich the word</li>
            </ol>
        </div>
        <!-- 
        Words. -->
        <div id="words_title">
            Steps
        </div>
        <div id="words">
            <?php echo get_words(); ?>
        </div>
        <!--
        Terms. -->
        <div id="terms_title">
            Terms
        </div>
        <div id="terms">
        </div>
        <!--
        Messages. -->
        <div id="messages_title">
            Messages
        </div>
        <div id="messages">
        </div>
        <!--
        Status update of the translation process. -->
        <div id="status_title">
            Status
        </div>
        <div id="status">
            
        </div>
        <!--
        User inputs. -->
        <div id="ui_title">
            User Inputs
        </div>
        <div id="interactions">

        </div>
        <div id="buttons btns">
            <input 
                type="button" 
                id="previous"
                value="Previous" 
                />
            <input 
                type="button" 
                id="next" 
                value="Next" 
                />
            <input type="button" id="finish" value="Finish"/>
            <input type="button" id="cancel" value="Cancel" />

        </div>
    </body>
</html>
