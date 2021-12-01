<?php
//namespace chama;
//
//Catch all errors, including warnings.
\set_error_handler(function($errno, $errstr, $errfile, $errline /*, $errcontext*/) {
    throw new \ErrorException($errstr, 0, $errno, $errfile, $errline);
});
//To resolve reference to the mutall class
include_once $_SERVER['DOCUMENT_ROOT'].'/library/v/code/schema.php';
//
include_once $_SERVER['DOCUMENT_ROOT'].'/library/v/code/sql.php';
class php {
    //
    //The datanase holding the records to merge
    public database $dbase;
    //
    //The entity class to which the members belong
    public entity $ref;
    //
    //An array of all members members taking part in a merge
    public array $members;
    //
    //The member that to which minor members will be merged
    public int  $principal;
    //
    //n array of members (as a string) that will be redirected to point to the 
    //principal, e.g., "1,4,5,7"
    public string $minors;
   /**
    * @param string $dbname
    * @param string $ename
    * @param array $members
    */ 
   function __construct(string $dbname, string $ename, array $members) {
        //
        //Set the database property
        $this->dbase = new database($dbname);
        //
        //Get the named entity from the database
        $this->entity = $this->dbase->entities[$ename];
        //
        //Save the members
        $this->members = $members;
        
        //2. Get the merger primary key
        $this->principal= get_principal();
        //
        //Get the minors an an array of comma separated members
        $this->minors= implode(
            ",", 
            array_diff($members, [$this->principal])
        );     
    }
    //
    //
    public function get_players($members/*: Imerge*/)/*: [principal,minors]|null*/{
    //
    //Get the members
    }
    public function get_values($members/*: Imerge*/)/*: sql;*/{
         
    }   
    //
    public function get_conflicts($cd /*:sql*/)/*:{clean: sql, conflicts: sql}*/{
        
    }
    //
    //
    public function conflicts_exist($conflicts/*: sql*/)/*: boolean*/{
        
    }
    //
    //
    public function resolve_conflicts(
        $conflicts/*:sql*/
    )/*: Array<{cname:string, value:string}>*/{
        
    }
    //
   public function compile_result(
        $clean/*:sql*/, 
        $interventions/*:Array<{cname:string, value:string}>*/
    )/*:Array<{cname:string, value:string}>*/{
        
    }
    //
    public function delete_minors($minors/*:sql*/)/*: error1451|null*/{}
    //
    public function get_contributors($error/*:error1451*/, $minors/*:sql*/)/*:sql*/{}
    //
    public function redirect_contributors($principal/*:sql*/, $contributors/*:sql*/)/*: error1062|null;*/{    
    }
    //
    //
    public function update_principal(
        $principal/*:sql*/, 
        $consolidations/*: Array<{cname:string,value:string}>*/
    )/*: void*/{}
    //
    //
    public function get_contributing_members(
        $error/*:error1062*/,
        $contributors/*: sql*/
    )/*:Array<Imerge>;*/{}
    
}
