<?php
//
//This file supports the link between the server and client sub-systems
//
//Start the buffering as early as possible. All html outputs will be 
//bufferred 
ob_start();
        
//The output strcure has teh format: {ok, result, html} where:-
//ok is true if the returned resut is valid and false not. If not the result 
//  has the error message.
//result is the user specified request
//html is the buffered html output 
//error 
$output = new stdClass();
//
//Catch all errors, including warnings.
set_error_handler(function($errno, $errstr, $errfile, $errline /*, $errcontext*/) {
    throw new ErrorException($errstr, 0, $errno, $errfile, $errline);
});
//
//Catch any error that may arise.
try{
    $path=$_SERVER['DOCUMENT_ROOT'].'/library/v/code/';
    //
    //Include the library libray where the mutall class is defined. (This will
    //throw a warning only which is not trapped. Avoid requre. Its fatal!
    include_once  $path.'schema.php';
    include_once  $path.'sql.php';
    include_once  $path.'capture.php';
    include_once $path.'app.php';
    //
    //Register the class autoloader "why is the callback written as a string?"
    spl_autoload_register('mutall::search_class');
    //
    //Run the requested method an a requested class
    if(isset($_GET["post_file"])){
        //
        $output->result= mutall::post_file();        
    }
    else {
        //
        $output->result = mutall::fetch($output);
    }
    //
    //The process is successful; register that fact
    $output->ok=true;
}
//
//The user request failed
catch(Exception $ex){
    //
    //Register the failure fact.
    $output->ok=false;
    //
    //Compile the full message, including the trace
     //
    //Replace the hash with a line break in teh terace message
    $trace = str_replace("#", "<br/>", $ex->getTraceAsString());
    //
    //Record the error message in a friendly way
    $output->result = $ex->getMessage() . "<br/>$trace";
}
finally{
     //
     //Empty the output buffer
     $output->html = ob_end_clean();
     //
    $encode = json_encode($output, JSON_THROW_ON_ERROR);
    echo $encode;
}