<?php
//Create a connection class to the database.
//
class dbase{
    //
    //Define database credentials.
    public $host = 'localhost';
    public $dbname = 'mutall_chama';
    public $username = 'root';
    public $password = '';
    public $connection;
    //    
    //Once this class is instantiated, try creating a connection to the database.
    public function __construct() {
        //
        //Define data source name which contains the server and the database.
        $dsn = "mysql:host=$this->host;dbname=$this->dbname";
        try{
            $this->connection = new PDO($dsn, $this->username, $this->password);
            //
            //Set the errormode incase PDO connection isn`t successful. 
            $this->connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            //
            } catch (PDOException $ex) {
            die('Could not connect..'.$ex->getMessage());
        }
       
    }
}
 