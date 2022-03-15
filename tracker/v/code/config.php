<?php
//
//This has to be the first statement in a file
namespace tracker;
//
//Resolve class \config using the library
include_once "../../../schema/v/code/config.php";
//
//The local config file extends the one in the libary
class config extends \config{
    //
    //Title appearing on navigation tab should match the current namespace
    public string $id =__NAMESPACE__;
    // 
    //The name of the application's database.
    public string $app_db = "mutall_tracker"; 
    //
    //Subject comprises of the entity name to show in the home page
    //plus the database it comes from.
    public string $subject_ename="developer";
    public array $subject;
    //
    //The full trademark name of the application
    public string $trade = "TRACKER";
    //
    //For advertising purposes
    public string $tagline= "Helping us run our day to day activities";
    //
    //Name of the application developer
    public string $developer = "Daniel Kaniu";
    //
    //The path from where this application was loaded
    public string $path=__DIR__;
    //
    function __construct(){
        //
        parent::__construct();
        //
        //Subject comprises of the entity name to show in the home page
        //plus the database it comes from.
        $this->subject= [$this->subject_ename, $this->app_db];
    }
}
