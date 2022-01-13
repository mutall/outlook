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

class merger{
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
   /**
    *Executes the merge operation given members, as primary keys, to a single one
    * @param array $members Primary keys to merge
    * @param string $ename Entity to which the keys belong
    */
   function execute(string $ename):void{
        //
        //3. Redirection all the pointers to the merger
        foreach($this->ref->pointers() as $contributor){
            //
            //Carry out the merge operation
            redirect_pointer(
                $this->members, 
                $ename, 
                $contributor, 
                $this->principal
            );
        }
        //
        //4. Consolidate attributes from mergees to the merger
        consolidate_members($this->entity, $this->principal, $this->mergees);
        //
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
     * Get the principal, i.e., best member to be the subject of the merge operation
     * @param members List of members (primary keys) to merge (including the merger)
     * @ename Name of the entity to which these members belong
     * @pointer Name of the entity that should be redirected to point 
     * to the merger
     * @return Primary key value of the merger
     */
    function get_principal(pointer $contributor, string $ename):int{
        //
        //Formulate the merger sql
        $merger_sql = $this->dbase->chk(
            "select "
                . "$ename.$ename as member, "
                . "count($contributor.$contributor) as value "
            . "from $ename "
                . "inner join $contributor on $ename.$ename= $contributor.$ename "
            . "where "
                . "$ename.$ename in (".implode(",", $this->members).") "
            //
            //Summarise the ccontributions of each member
            . "group by $ename.$ename "
            //
            //Ensure that the highest contibutor is at the top
            . "order by count($contributor.$contributor) desc "
            //
            //Pick the first in the list    
           . "limit 1 offset 0"
        );

        //
        //Run the last query to get the result
        $rows = $this->dbase->get_sql_data($merger_sql);
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
        private function cost(pointer $contributor):string{
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
    function redirect_pointer(pointer $pointer){
        //
        //1. Update the pointers.
        //
        //Formulate and execute the sql for updating the pointer records
        //so that they are re-directed to the merger
        $update_sql = $this->dbase->chk(
            "update {$pointer->away()} "
            . "set $pointer = $this->principal "
            . "where $pointer in ($this->minors)"
        );
        //
        //Prepare to catch the update process in case it it fails
        try{
            $this->dbase->query($update_sql);
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
            $members2 = get_pointer_members($pointer, $ex);
            //
            //Continue to merge the new members
            $merger = new merge($this->dbase, $members2, $ename2);
            $merger->execute();
        }    
    }
    
    /**
     * Get all the primary keys (of the pointer) that should be be merged to
     * resolve the integrity violation problem.
     * @param pointer contributor The contributor of the descendant members to b
     * merged
     * @param Exception $ex Source of the index that raised the Exception
     * @return array members Contributor members/descendants
     */
    private function get_pointer_members(pointer $contributor, Exception $ex):array{
        //
        //Get the name contributor-base index whose unique constraint was 
        //violated
        $index = $this->get_index($ex, $contributor);
        //
        //Get he columns of the index that should be considerd for sharing.
        //These are all the columns of the index, except the one matching this 
        //pointer
        $shareds = array_diff($index->columns, [$contributor->name]);
        //
        //Formulate the pointer-based sql that constrains the records to those 
        //pointing the reference members
        $constrains = $this->dbase->chk(
            "select "
                . implode(", ", $shareds)
                .", $contributor as contributor"
            ."from $contributor "
            ."where $contributor in (".implode(", ", $this->members).")"    
        );
        //
        //Summarise the constrained pointers to isolate those cases that have 
        //more than one instance of the shared columns
        $multiples = $this->dbase->chk(
           "select "
                . implode(", ", $shareds)
                .", ".count(contributor)
            ." from ($constrains) as constrains "
            . "group by " . implode(", ", $shareds)
            ."having ".count(contributor).">1"    
        );
        //
        //Drive the assignets for the join
        $assigns = array_map(
            fn($cname)=>"constrains.$cname=multiples.$cname", 
            $shareds
        );
        //
        //Formmulate the decendant (members) as thos pointers that share colums
        $descendants = $this->dbase->chk(
            "select "
                ."constrains.contributor "
            . "from ($constrains) as constrains "
            . "inner join ($multiples) as multiples on ".implode(" and ", $assigns)    
        );
        //
        //Execute the decendants query
        $rows = $this->dbase->get_sql_data($descendants);
        //
        return array_map(fn($row)=>row['contributor'], $rows);
    }
    
    //
    //Return the list of columns that comprise the index that violated the
    //unique key constraint
    private function get_index(Exception $ex, pointer $contributor){
        //
        //Match the integrity violation error
        $pattern =
            "/SQLSTATE\[(\d*)]: Integrity constraint violation: 1062 Duplicate entry '([^']*)' for key '([^']*)'/";
        //
        //Formulate the pointer update query that throws the integrity violation
        // error when it fails to update the pointer
        $updates= $this->dbase->chk(
            "update $contributor "
            . "set $contributor = $this->principal "
            . "where $contributor in ($this->minors)"
        );
        //
        //Execute the query and if it fails, obtain the output as a warning
        try{
           $this->dbase->query($updates);
        } 
        catch (Exception $ex) {
            //
            //Get the exception message...
            $msg= $ex->getMessage();
            //
            //... and place the expection message in  an array
            $matches=[];
            //
            //Match the sql error with the defined pattern
            $ok = preg_match($pattern, $msg, $matches);
            //
            //Capture the SQL code in the error message
            $code= $matches[1];
            //
            //Capture the violating index in the error
            $index = $matches[3];
            //
            //Capture the violating index as per the SQL error code....
            if($code == 23000){
                return $index;
            }
            //...otherwise return the exception
            else{
                throw $ex;
            }  
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
            ." where $ename = $this->principal";
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
    //
    //
    private function get_column_query( column $col, string $ename):string{
        //
        //Get the name of the column
        $cname = $col->name;
        //
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
//
//Test the merge operation
$merger = new merger("mutall_chama","member", [82,1160,1189,1200,1233]);
$merger->execute();