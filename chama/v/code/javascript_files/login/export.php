<?php
//The following tow functios are used for intercepting posted data for debugging
//purposes.
//
//1. Save posted data to a file
function save_contents(){
    $json = json_encode($_POST);
    file_put_contents('post.json', $json);
}

//Retrieve posted data to a file
function get_contents(){
    $contents = file_get_contents('post.json');
    $_POST = json_decode($contents, true);
}
//
//For debigging purposes only
save_contents();
 //
//Start the buffering as early as possible. All html outputs will be 
//bufferred 
ob_start();

//The output structure has the format: {ok, result, html} where:-
//ok: true if the returned resut is valid and false if not. If not the result 
//  has the error message.
//result: the returned value by the user request's method 
//html: the buffered html output 
$output = new stdClass();
//
//Catch all errors, including warnings.
set_error_handler(function($errno, $errstr, $errfile, $errline, $errcontext) {
    throw new ErrorException($errstr, 0, $errno, $errfile, $errline);
});
//
//Catch any error that may arise.
try{
    //
    //Include the library libray where the mutall class is defined. (This will
    //throw a warning only which is not trapped. Avoid requre. Its fatal!
    include '../../../capture/capture.php';
    
    //
    //Run the requested method on the requested class; saving the result
    $output->result = \root\mutall::index($output);
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
    //Compile the full message, including the stack trace
     //
    //Replace the hash with a line break in the trace message
    $trace = str_replace("#", "<br/>", $ex->getTraceAsString());
    //
    //Record the error message in a friendly way
    $output->result = $ex->getMessage() . "<br/>$trace";
}
//Whether there was sn eror or not....
finally{
     //
     //Empty the output buffer into the html
     $output->html = ob_get_clean();
     //
     //Echo the output as a json string
     echo json_encode($output);
}