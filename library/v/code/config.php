<?php
//The config class contains all the factor of the project that change with time 
//the include 
//1. The database credentials (username, password and the dbname)
//1. The referenced files both for javascript and the php
class config{
    const username = "root";
    const password = "";
    //
    //Save the location of this file as an adress this inorder to include it in any file 
    //that may require it as it is derived from the session since this config is saved in the session 
    //it should have a way of locating its self 
    public $address= '/metavisuo/v/config.php';
    //
    //Set the various file absolute addressess as includes array which  is a public 
    //property 
    //the includes for the chama are the metavisuo library, exports library,
    //and the metavisuo sql library;
    //Note and add any other includes  from here
    public $include =[
        'root'=>'schema.php',
        'sql'=>'sql.php',
        'capture'=> 'capture.php' 
     ];
    //
    //The javascript import absolute paths are as an array of js
    public $import =[
        'root'=>"schema.js",
    ];
    //
    //
    function __construct() {
        //
        //The 
    }
    //
    //Enabling the creation of the config object .........
    //
    //Return the root metaviuo library php version as a complete absolute path 
    function root(){
        return  $_SERVER['DOCUMENT_ROOT']. $this->include['root'];
    }
    //
    //Return the root metaviuo sql_library url version as a complete absolute path 
    function sql(){
        return $_SERVER['DOCUMENT_ROOT']. $this->include['sql'];
    }
    //
    //
    function capture(){
        return $_SERVER['DOCUMENT_ROOT']. $this->include['capture'];
    }
    
}