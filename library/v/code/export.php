<?php
//
//INclude application specific file to support
//extension of outlook with user defined classes 
//e.g include_once '/tracker/v/code/tracker.php'
//function add_udf_files(){
//    // 
//    //Get the website $path(PK) 
//    //keywords HTTP server 
//    //
//    //1. Create a variable string on which to a
//    $path = "";
//    //
//    //2. First check if the protocol used is https or http.
//    if(isset($_SERVER['HTTPS']) && $SERVER['HTTPS'] === 'ON'){
//        //
//        //3. Append the https protocol.
//        $path = "https";
//    }
//    else{
//        //
//        //3. Append the http protocol.
//        $path = "http";
//    }
//    //
//    //5. Append the regular symbol "://" to the $path string.
//    $path .= "://";
//    //
//    //6. Append the HTTP_HOST(e.g., www.domain.com).
//    //$path .= $SERVER['HTTP_HOST'];
//    //
//    //7. Then append the REQUEST_URI(e.g., /index.php)
//    // 
//    //Get the php $files in the website path(DK) 
//    //keywords{dir/glob/is_file()}
//    $files = array_filter(glob('*.php'), 'is_file');
//    //
//    //Loop through all the php files and include every one of them
//    foreach ($files as $file) {
//        //
//        //Formulate the $full path of this file(D&P k) 
//        $full = pathinfo();
//        //
//        //INclude this fully named file
//        include_once $full;
//        
//    }
//    
//}
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
    include_once $_SERVER['DOCUMENT_ROOT'].'/outlook/v/code/app.php';
    //
    //INclude application specific file to support
    //extension of outlook with user defined classes 
    //e.g include_once '/tracker/v/code/tracker.php'
    //add_udf_files();
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