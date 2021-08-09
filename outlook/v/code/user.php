<?php
//Include the required server libraries.
include '../../schema/v/schema.php';
include '../../schema/v/view.php';
include '../../schema/v/sql.php';
include '../../capture/v/capture.php';
//
//Include the shared constants 
include 'config_outlook.php';
//
//Defining the user class 
class user{
    //
    //
    function __construct(){}
    //
    //function export_data($data/*:level1_registration*/):array/*Array<error>*/{
    function  export_data(array $data): stdClass{
        //
        //4. Get the input data that was sent  by the client through the "post" method 
        if(is_null($data)){
            $inputs= $_REQUEST['inputs'];
            //
            //Convert the inputs text into a php structure 
            //const data = JSON.Parse(inputs);
            //let data:Array<[cname, ename , simple, alias?]>
            $data= json_decode($inputs);
        }
        //
        //Now do the data export
        $record = new record($data, format::label);
        //
        //Start buffering 
        ob_start();
        //
        //Create the object to save the html text 
        $output= new stdClass();
        //
        $result=$record->export();
        //
        $result->report(); 
        //
        //Append the buffered result
        $output->html= ob_end_clean();
        return $output;
    }
    //
    //Use the user database to check  Whether the given email is subscribed to 
    // this application.
    function is_registered(string $email, string $app_id):boolean{
        //
        //1. Open the user database: we will need the database name and the login
        //credentials
        $dbname= config::dbname;
        $dsn="mysql:host=localhost;dbname=$dbname";
        $dbase = new PDO($dsn, config::username, config::password);
        //
        //2. Formulate the sql statement to do the job needed 
        //
        //Select from the user database all the subscription for the user 
        //whose email is the given one and the application_id is the given 
        //const roles:Array<role>=mutall.execute(select:Array<exp>,from:ename, where:exp)
        $sql=
            //
            //1. Specify what we want using a "select" clause 
            "SELECT "
                //
                //...everything from the subscription table 
                . "subscription.subscription "
            //
            //2. Specify the "from" clause
            ."FROM "
                . "subscription "
                //
                //These are the joins that trace our route of intrest 
                . "inner join user ON subcription.user= user.user "
                . "inner join player ON subscription.player= player.player"
                . "inner join application ON player.application=application.application"
                
            //
            //3. specify the condition that we want to apply i.e "where" clause
            ."WHERE "
                //
                //Specify the email condition 
                . "user.email='$email' "
                   //
                   //Specify the application condition
                . "AND app.id='$app_id'"; 
            //
            //4. Specify other clauses as needed e.g orderby, limit, groupby,having
        //
        //3. Use the sql to query the database
        $response= $dbase->query($sql); 
        //
        //4. Get the results 
        $array= $response->fetchAll();
        //
        //5. Use the result to formulate the requested output 
        $count = count($array);
        //return $count!==0;
        if($count===0){
            return false;            
        }else{
            return true;            
        }
    }
}
//
//
//Create an instance of the class we came with.
$class = $_REQUEST['class'];
//
$obj = new $class();
//
//Retrieve the method to execute 
$method=$_REQUEST['method'];
//
//Put all the request data into the variable args
$args= json_decode($_REQUEST["args"]);
//
//Execute the "export" data method to return an "array of errors" if any
$result= $obj->$method(...$args);
//
//Send the errors back to the client 
echo json_encode($result);
