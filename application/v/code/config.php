<?php
//
//This has to be the first statement in a file
namespace /*change this to the name of the application here,e.g., tracker*/ tracker;
//
//Resolve class \config using the library
include_once "../../../schema/v/code/config.php"/*Dont change this*/;
//
//The local config file extends the one in the libary
class config extends \config{
    //
    //Title appearing on navigation tab should match the current namespace
    public string $id =__NAMESPACE__;/*****dont change this*/
    // 
    // The title of the application
    /*****Change this to the title of your application*/
    public string $title="Unify Group";
    //
    //The name of the application's database.
    /*****Change this to the database name in MySQL*/
    public string $app_db = "mutall_broker"; 
    //
    //Subject comprises of the entity name to show in the home page
    //plus the database it comes from.
    /*****This is the table to be displayed, once you load your application*/
    public string $subject_ename="group";
    public array $subject;
    //
    //This is the logo's filename in the images folder at chamav/v/images
    /****The name of the image or svg file for the application (.jpg,.jpeg,.svg)*/
    public string $logo= "broker.jpg";
    //
    //The full trademark name of the application
    /****The trademark to your application*/
    public string $trade = "UNIFY CHAMA";
    //
    //For advertising purposes
    /****The tagline to your application that describes what your application 
     * is all about*/
    public string $tagline= "Bringing together all chama needs";
    //
    //The Image of the developer
    /**
     * The image of the developer, namely your name e.g., elias.jpg
     */
    public string $image= "Francis Ndichu.jpg";
    //
    //Name of the application developer
    /**
     * 
     * Your name as a developer goes here.
     */
    public string $developer = "James Kamau";
    /**
     * Don't change anything else from here going down.
     */
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
