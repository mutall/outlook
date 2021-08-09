 <?php
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
set_error_handler(function($errno, $errstr, $errfile, $errline, $errcontext) {
    throw new ErrorException($errstr, 0, $errno, $errfile, $errline);
});
//
//Catch any error that may arise.
try{
    //
    //Include the library libray where the mutall class is defined. (This will
    //throw a warning only which is not trapped. Avoid requre. Its fatal!
    require_once 'schema.php';
    require_once '../chama/chama.php';
    
    //
    //Run the requested method an a requested class
    $output->result = mutall::index($output);
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
    //Record the error message in a fireienly way
    $output->result = $ex->getMessage() . "<br/>$trace";
}
finally{
     //
     //Empty the output buffer
     $output->html = ob_end_clean();
     //
    $encode = json_encode($output);
    //
    //Take care of teh fact that the output may not be jsone encodable.
    if ($encode){
        //
        //Echo the output as a json string
        echo $encode;
    }    
     else {
         //Json encoding failed
         $err = json_last_error_msg();
         echo $err;
     }
}