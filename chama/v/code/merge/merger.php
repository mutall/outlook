<?php
namespace chama;
class merger{
    //
    //The datanase holding the records to merge
    public string $dbname;
    protected database $dbase;
    //
    //The entity class to which the members belong
    public string $ename;
    protected entity $ref;
    //
    //An array of all members members taking part in a merge
    public string $members;
    //
    //The member that to which minor members will be merged
    public int  $principal;
    //
    //n array of members (as a string) that will be redirected to point to the 
    //principal, e.g., "1,4,5,7"
    public string $minors;
    
   /**
    * 
    * @param string $dbname
    * @param string $ename
    * @param string $members: Sql statement that generates the members to merge
    */ 
   function __construct(string $dbname, string $ename, string/*sql*/ $members) {
        //
        $this->dbname = $dbname;
        $this->ref = $ename; 
        //
        //Set the database peiperty
        $this->dbase = new database($dbname);
        //
        //Get the named entity from the database use as the reference 
        //for the merging process
        $this->ref = $this->dbase->entities[$ename];
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
     This is the re-direct phase of the merge process
    * 
    * @return array interventions
    */ 
    function execution():\Generator /*intervention*/{
         //
        //Redirection all the pointers to the principal
        foreach($entity->pointers() as $pointer) 
            yield from redirect_pointer($pointer);
        //
        //Consolidate attributes from minors to the principal
        yield from consolidate_members();
    }
   
    
    /**
     This is the consolidate phase of the merge process the merge operation
    * 
    * @param type $intervIn
    * @return array
    */ 
    static function intervene(array /*<intervention>*/ $intervIn):bool{
        //
        
        //
        //3. Redirection all the pointers to the merger
        foreach($entity->pointers() as $pointer){
            //
            //Carry out the merge operation
            redirect_pointer(
                $this->members, 
                $ename, 
                $pointer, 
                $this->principal
            );
        }
        //
        //4. Consolidate attributes from mergees to the merger
        $intervOut = consolidate_members($this->entity, $this->principal, $this->mergees, $IntervIn);

        //5.Return the interventons
        return $intervOut;
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
    function get_principal():int{
        //
        //Forumate the merger sql
        $merger_sql = $this->dbase->chk(
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
    function redirect_pointer(pointer $pointer):\Generator{
         //
        //1. Update the pointers.
        //
        //Formulate the sql for updating the pointer records
        //so that they are re-directed to the merger
        $update_sql = $this->dbase->chk(
            "update {$pointer->away()} "
            . "set $pointer = $this->principal "
            . "where $pointer in ($this->minors)"
        );
        //
        //
        //Prepare to catch update Exceptions
        try{
            $this->dbase->query($update_sql);
            //
            //The update was successful
        }catch(Exception $ex){
            //
            //The update failed for some reason
            //
            //Prepare to receive the index name incase this is
            //from the unique key violation issue
            $index = null;
            //
            //Test if the failure is due to unique key violations
            if (!$this->integrity_error($index)) throw $ex;
            //
            //This is a unique key violation, so, we need whoud merge the 
            //conncerded pointers, i.e, descendants
            //
            //The new ename is the same as the pointer
            $ename2 = $pointer->ename;
            //
            //Get the new (pointer) members, i.e., descendants
            $members2 = get_pointer_members($pointer);
            //
            //Create a new merger process
            $merger = new merge($this->dbase, $members2, $ename2);
            //
            yield from $merger->execute();
        }    
    }
    
    //This method return true if the given exception was raised by a unique
    //key violation. When this is the case, the reference input is set to the 
    //name of the violated index
    private function integrity_error(Exception $ex, string &$index):bool{
        //
        //The pattern for the integrity violation error
        $pattern =
            "/SQLSTATE\[(\d*)]: Integrity constraint violation: 1062 Duplicate entry '([^']*)' for key '([^']*)'/";
        //
        //Get the exception message...
        $msg= $ex->getMessage();
        //
        ///... and prepare to receive the 3 group matches.
        $matches=[];
        //
        //Match the sql error with the defined pattern
        $ok = preg_match($pattern, $msg, $matches);
        //
        //Contnue ony if ths is teh relevant exception
        if (!$ok) return false;
        //
        //Capture the SQL code in the error message
        $code= $matches[1];
        //
        //Capture the violating index in the error message
        $index = $matches[3];
        //
        //verify that indeed this is an integrity violation error
        if($code == 23000){
            return true;
        }
        //...otherwise return false
        else{
            return false;
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
    //Consolidate attributes from mergees to the principal, i.e the one to merge
    //into
    function consolidate_members():\Generator/*<interventions>*/{
        
        //
        //1.5. Formulate a require merge query
        $manual_sql = "select cname "
                . "from ($all_values_sql) as values "
                . "group by cname "
                . "having count(value)>1";
        //
        //1.6. Get its data
        $manual_columns = $dbase->get_sql_data($manual_sql);
        //
        //1.7. If there is more than one row of data then manual merging is necessar
        //
        $selected_manual_values = [];
        if (count($manual_columns)>1){ 
            //
            //Yes, we do need user intervention
            //
            //Get the actual columns snd thoir values
            $manual_values_sql = $dbase->chk(" select "
               . "values.cname, values.value, '' as select "
               . "from ($all_values) as values "
               . "inner join ($manual_columns) as columns on columns.cname = values.cname");
            //
            $all_manual_values = $dbase->get_sql_data($manual_values_sql);
            //
            //Compile the data to be used for interventions
            $intervention = [
                'merger'=>$this, 
                'values'=>$all_manual_values
            ];
            yield $intervention;
        }else{
            //
            //No manual intervetion
            //
            //2.
            //
            //2.1 Get the auto values, i.e., thse columns value frequency is only 1
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
        //Get the actual column and other values
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
    
 
}
