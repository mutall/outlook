<?php
//
//Catch all errors, including warnings.
\set_error_handler(function($errno, $errstr, $errfile, $errline /*, $errcontext*/) {
   throw new \ErrorException($errstr, 0, $errno, $errfile, $errline);
});
//To resolve reference to the mutall class
include_once $_SERVER['DOCUMENT_ROOT'].'/library/v/code/schema.php';
//
include_once $_SERVER['DOCUMENT_ROOT'].'/library/v/code/sql.php';
//
//'PDO::query(): SQLSTATE[23000]: Integrity constraint violation: 1062 Duplicate entry '1199-4' for key 'contribution.id1''
//
$pattern="/SQLSTATE\[(\d*)]: Integrity constraint violation: 1062 Duplicate entry '([^']*)' for key '([^']*)'/";
//

//


$sql= "update `contribution`
	set `contribution`.`member`=1199
where `contribution`.`member` in (1138,1186)";
//
$dbase= new database("chama");
try{
    $ans= $dbase->query($sql);
} catch (Exception $ex) {
    //
    $msg= $ex->getMessage();
    //
    $matches= [];
    //
    $ok= preg_match($pattern, $msg,$matches);
    //
    if(!$ok)throw $ex;
    //
    $code= $matches[1] ;
    //
    $index=$matches[3];
    //
    if($code == 23000){
        echo $index;
    }
    else{
        throw $ex;
    }
}
die();

//

class merger{
    
    public database $dbase;
    public entity $entity;
    public array $members;
    public int  $principal;
    public string $mergees;
   /**
    * 
    * @param string $dbname
    * @param string $ename
    * @param array $members
    */ 
   function __construct(string $dbname, string $ename, array $members) {
       $this->dbase = new database($dbname);
       $this->entity = $this->dbase[$ename];
       $this->members = $members;
   }
   
   /**
    *Executes the merge operation given members, as primary keys, to a single one
    * @param array $members Primary keys to merge
    * @param string $ename Entity to which the keys belong
    */
   function execute():void{
        //
        //1. Get all the pointers of the member entity
        //
        //Get the named entity from the database
        $entity = $dbase->entities[$this-> ename];
        //
        //
        //2. Get the merger primary key
        $merger = get_merger($this->members, $ename);
        //
        //3. Redirection all the pointers to the merger
        foreach($entity->pointers() as $pointer){
            //
            //Get the name of the pointer entity
            $pointer_ename = $pointer->away()->name;
            //
            //Carry out the merge operation
            redirect_pointer(
                $this->members, $ename, $pointer_ename, $this->principal);
        }
        //
        //4. Consolidate attributes from mergees to the merger
        consolidate_members($this->entity, $this->principal, $this->mergees);

        //5.Show the results
        echo "Ok";
    }
    /**
    *Returns a column based query for listing the unique values
    * 
    * @param column $col The columns being considered
    * @param string $ename The columns entity
    * @param array $members 
    * @return string The sql statement
    */  
    
    /**
     * Get the merger, i.e., best member to be the subject of the merge operation
     * @param members List of members (primary keys) to merge (including the merger)
     * @ename Name of the entity to which these members belong
     * @pointer Name of the entity that should be redirected to point 
     * to the merger
     * @return Primary key value of the merger
     */
    function get_merger():int{
        //
        //Forumate the merger sql
        $merger_sql = $dbase->chk(
            "select "
                . "$ename.$ename as member, "
                . "count($pointer.$pointer) as value "
            . "from $ename "
                . "inner join $pointer on $ename.$ename= $pointer.$ename "
            . "where "
                . "$ename.$ename in (".implode(",",$members).") "
            //
            //Summarise the ccontributions of each member
            . "group by $ename.$ename "
            //
            //Ensure that the highest contibutor is at the top
            . "order by count($pointer.$pointer) desc "
            //
            //Pick the first in the list    
           . "limit 1 offset 0"
        );

        //
        //Run the last query to get the result
        $rows = $dbase->get_sql_data($merger_sql);
        //
        //There must be only one -- otherwise something went wrong
        if (($no=count($rows))!=1) 
            throw Exception("One row of result expected. Found $no");
        //
        //Return the only member
        return $rows[0]['member'];
    }
    /**
     * Get the sql that returns the cost of this pointer for the current 
     * merge operation
     * @param pointer $pointer
     * @return string
     * 
     *The cost depends on the number of records pointing to the 
     * principal member.The more the entities he holds, the less the cost
     */
    private function cost(pointer $pointer):string{
        //
        //Get the member entity name
        $member_ename= $this-> entity->name;
        //
        //Get the pointer entity name
        $pointer_name = $this-> pointer->name;
        //
        //Create an sql that obtains the cost of the pointers
    }


    /**
     * 
     * @global db $dbase
     * @param array $members
     * @param string $ename
     * @param string $pointer
     * @param string $merger
     */
    function redirect_pointer(string $pointer){
        //
        //Get the records to merge as an array, a.k.a., $mergees
        $mergees = array_diff($members, [$principal]);
        //
        //Get the records to merge as a comma sepated string
        $mergees_str = implode(",", $mergees);
        //
        //1. Update the pointers. 
        //
        //Formulate and execute the sql for updating the pointer records
        //so that they are re-directed to the merger
        $update_sql = $dbase->chk(
            "update $pointer "
            . "set $pointer.$ename = $principal "
            . "where $pointer.$ename in ($mergees_str)"
        );
        //
        //
        //Prepare to catch the update process in case it it fails
        try{
            $dbase->query($update_sql);
        }catch(Exception $ex){
            //
            //Asumnimg the failure is due to integrity violations...

            //
            //It means the we whoud merge the pointers
            //
            //The new ename is the same as the pointer
            $ename2 = $pointer;
            //
            //Get the new (pointer) members
            $members2 = get_pointer_members();
            //
            //Continue to merge the new members
            merge($members2, $ename2);
        }    

    }
    //
    //Consolidate attributes from mergees to the principal, i.e the one to merge
    //into
    function consolidate_members(){
        //
        //2.Check if there are cases that need user intervention
        //
        //b. Get the columns of the entity
        $all_columns = $entity->columns;
        //
        //c.Remove the primary key column, to remain with data columns
        $data_columns = array_filter($all_columns, fn($col)=>!$col instanceof primary);
        //
        //d. Use the remaining columns to formulate the queries for retrieving
        //values for each data column of the entity.
        $queries = array_map(fn($col)=>get_column_query($col, $ename, $members), $data_columns);
        //
        //e. Do a union of all the series 2 queries
        $all_values_sql = implode("\nunion all ", $queries);
        //
        //f. Formulate a require merge query
        $manual_sql = "select cname "
                . "from ($all_values_sql) as values "
                . "group by cname "
                . "having count(value)>1";
        //
        //g. Get its data
        $manual_columns = $dbase->get_sql_data($manual_sql);
        //
        //f. If there is more than one row of data then manual merging is necessar
        //
        $selected_manual_values = [];
        if (count($manual_columns)>1) 
            get_manual_values($members, $all_values, $manual_columns, $selected_manual_values);
        //
        //Get the auto values, i.e., thse columns value frequency is only 1
        $auto_values = get_auto_values($all_values_sql);
        //
        //Combine both the manual and auto values
        $all_values = array_merge($selected_manual_values, $auto_values); 
        //
        //3. Update the merger with all columns using data from the mergees
        //a. Formulate the update sql
        //
        //Get the colums to set
        $set_columns = array_map(fn($col)=>"{$col[0]}='{$col[1]}'", $all_values);
        //
        $merger_update = "update $ename "
            . "\nset ". implode(",\n", $set_columns)
            ." where $ename = $principal";
        //b. Execute the update sql
        $dbase->query($merger_update);
        //
        //4.Delete all the mergees
        $delete_mergees = "delete from "
            . "$ename "
            . "where $ename in ($mergees_str)";
        $dbase->query($delete_mergees);
    }
    //
    //The user's intervention is about suggesting which of the multiple valuees of a 
    //column should be considered for update. The result is of the form:
    //Array<[cname, value]>
    private function get_manual_values(
        string $all_values,
        string $manual_columns,    
        array/*<cname, value>*/ &$interventions
    ):void{
        //
        //Refer to the global database
        global $dbase;
        //
        //Filename for the user to intervene, i.e., edit
        $filename = "manual.json";
        //
        if (file_exists($filename)){
            //
            //Get the user's intervention from the file
            $intervention_inputs = json_decode(file_get_contents($filename));
            //
            //Check if the members do match
            if ($intervention_inputs->members===$members){
                //
                //Process the inteventions
                        //
                //Filter the selected cases
                $interventions = array_filter($manual_values, fn($col)=>$col[2]=="1");
                //
                return;
            }
        }    
        //
        //Create the intervention input file and exit to allow the user to
        //intervene
        //
        //Get the actual columna snd thoer values
        $manual_values_sql = $dbase->chk(" select "
           . "values.cname, values.value, '' as select "
           . "from ($all_values) as values "
           . "inner join ($manual_columns) as columns on columns.cname = values.cname");
        //
        $all_manual_values = $dbase->get_sql_data($manual_values_sql);
        //
        //Compile the data to be used for interventions
        $intervention_inputs = [
            'members'=>$members, 
            'values'=>$all_manual_values
        ];
        //
        //Make them available for the users to select
        file_put_contents($filename, json_encode($intervention_inputs));
        //
        die("Please use the select column in file $filename to intervene");
    }

    //Return all the column values that do not nrrd resolving by the user
    private function get_auto_values(string $all_values):array/*<[cname, value]>*/{
        //
        global $dbase;
        //
        //Getting the columns with single records
        $single_columns= $dbase->chk("select cname "
            . "from ($all_values) as values"
            . "group by cname "
            . "having count(value)=1");
        //
        //Get the actual columna snd thoer values
        $single_values_sql = $dbase->chk(" select "
           . "values.cname, values.value "
           . "from ($all_values) as values "
           . "inner join ($single_columns) as columns on columns.cname = values.cname");
        //
        $single_values = $dbase->get_sql_data($single_values_sql);
        //
        return $single_values;
    }

    
    
    private function get_column_query(column $col,string $ename):string
    {
        //
        //Get the name of the column
        $cname = $col->name;

        //Convert list of members to a string
        $members_str = implode(",", $members);
        //
        //Formulate the sql
        $sql = 
            "select "
                . "`$cname` as value, "
                . "\"$cname\" as cname "
            . "from `$ename` "
            . "where "
                . "`$ename` in ($members_str) "
                . "and not `$cname` is null "
            . "group by `$cname`, \"$cname\"";
        //
        return $sql;
    }
 
}

//Open the chama database
$dbase = new db("mutall_chama");
//
//Test the merge operation
$dbase->merge("member", [82,1160,1189,1200,1233]);