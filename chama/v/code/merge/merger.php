<?php
//namespace chama;
//
//Catch all errors, including warnings.
\set_error_handler(function($errno, $errstr, $errfile, $errline /*, $errcontext*/) {
    throw new \ErrorException($errstr, $errno, E_ALL, $errfile, $errline);
});
//To resolve reference to the mutall class
include_once $_SERVER['DOCUMENT_ROOT'].'/library/v/code/schema.php';
//
include_once $_SERVER['DOCUMENT_ROOT'].'/library/v/code/sql.php';

class merger {
    //
    //The datanase holding the records to merge
    public database $dbase;
    //
    //The entity class to which the members belong
    public entity $ref;
    //
    //An all members members taking part in a merge, as an sql statement
    public string $members;
    //
    //The member into which minor members will be merged, as a
    //primary key
    public int  $principal;
    //
    //The members (as an sql string) that will be redirected to point to the 
    //principal
    public string $minors;
   // 
   function __construct(stdClass $Imerge) {
        //
        //Destructure the members
        $this->dbname= $Imerge->dbname;
        $this-> ename= $Imerge->ename;
        $this-> members= $Imerge->members;
        //
        //Principal and minors are conditional
        if (isset($Imerge->principal)) $this->principal = $Imerge->principal;
        if (isset($Imerge->minors)) $this->minors = $Imerge->minors;
        //
        //Set the database property
        $this->dbase = new database($this->dbname);
        //
        //Get the named entity from the database
        $this->ref = $this->dbase->entities[$this->ename];  
    }
    //
    //Categorize the members into a principal and the minors
    public function get_players()/*: {principal:int,minors:sql}|null*/{
        //
        //Get the reference contributors (as a union)
        $contributor= $this->get_contributors();
        //
        //Get the principal sql
        $principal_sql = $this->dbase->chk(
            "select "
                . "member.member, "
                . "count(contributor.contributor) as value "
            . "from ($this->members) as member "
                . "inner join ($contributor) as contributor on contributor.member= member.member "
            //
            //Summarise the ccontributions of each member
            . "group by member.member "
            //
            //Ensure that the highest contibutor is at the top
            . "order by count(contributor.contributor) desc "
            //
            //Pick the first in the list    
           . "limit 1 offset 0"
        );
        //
        //Run the pincipal sql to get the only member
        $result = $this->dbase->get_sql_data($principal_sql);
        //
        //If the results is empty, then return a null
        if (count($result) ==0) return null;
        //
        //Retrieve the principal
        $this->principal = $result[0]['member'];
        //
        //All the members without the principal, i.e., where the principal is null
        $minors = $this->dbase->chk(
            "select "
                ."member "
            ."from ($this->members) as member "
            ."where not (member =$this->principal)"
        );
        //
        //Compile and return th results
        return ['principal'=>$this->principal,'minors'=>$minors];
    }
    
    //
    //A query formed from the union of all the queries that are based on the 
    //pointers of the referenced entity
    public function get_contributors():string{
        //
        //Get the reference entity
        $entity= $this->ref;
        //
        //Get all the pointers to the reference entity
        $pointers= iterator_to_array($entity->pointers());
        //
        //Map the pointers to their corresponding sql statements
        $sql= array_map(fn($pointer)=> $this->get_pointer_sql($pointer), $pointers);
        //
        //Formulate a union of all the sql's
        $union= implode("union all ", $sql);
        //
        //Construct the sql
        $contributors = $this->dbase->chk($union);
        //
        return $contributors;
    }
    //
    //This function returns the pointer sql which has a structure similar to e.g.
    //select msg.msg as contributor,msg.member as member from msg
    public function get_pointer_sql(pointer $pointer): string {
        //
        //
        return $this->dbase->chk(
            "select "
                . "$pointer as member, "
                . "{$pointer->away()->pk()} as contributor "
            . "from "
                . $pointer->away()
        );
    }
    //
    //Obtain the values for the consolidation process.
    //This method returns an sql which if executed would give us data with the
    //the following structure. It comes from the union of individual based columns
    // Array<{cname:string, value: basic value}>
    public function get_values(): string{
        //
        //Get the columns of the referenced entity
        $all_columns = $this->ref->columns;
        //
        //Remove the primary key, to remain with data columns
        $data_columns = array_filter($all_columns, fn($col)=>!$col instanceof primary);
        //
        //Use the remaining columns to formulate the queries for retrieving
        //values for each data column of the referenced entity.
        $queries = array_map(fn($col)=> $this->get_column_query($col), $data_columns);
        //
        //Do a union of all the queries
        $all_values = implode("\nunion all ", $queries);
        //
        //The all values sql generates output that looks like:
        //Array<{cname:strng, value:string} in which the wors are
        //not unique. Modify the output so that only unique values are
        //returned
        //
        $unique_values = $this->dbase->chk(
           "select distinct cname, value from ($all_values) as all_values "
        );        
        //
        return $unique_values;
    }
    //
    //This method returns an sql which if executed would give us data with the
    //the following structure. It comes from the given column
    // Array<{cname:string, value: basic_value}>
    private function get_column_query(column $col):string{
        //
        //
        $sql = $this->dbase->chk(
            "select "
                . "'$col->name' as cname, "
                . "ref.value "
            . "from "
                //
                //Use the reference table
                . "("
                    . "select "
                        . "`$col->name` as value, "
                        . "{$this->ref->pk()} as member "
                    . "from ($this->ref) "
                . ") as ref "
                //
                //Filter by members
                . "inner join ($this->members) as member on member.member= ref.member "
               //
               //Aand consider only thoses values that are not empty
            . "where not(ref.value is null)"
        );
        //
        return $sql;
    }
    
    //Return consolidates as the data that takes part in conflict
    //resolution. It comprises of both clean and conflicting values
    function get_consolidation():stdClass/*:{clean:interventions, dirty:conflicts}*/{
        //
        //Get all the values (sql)
        $all_values = $this->get_values();
        //
        //Formulate the dispute support sql
        $dispute= function(string $comparator) use ($all_values): string {
            //
            //Obtain the records that are suspected to have conflicts 
            $sql= $this->dbase->chk(
                "select "
                    . "all_values.cname, "
                    . "count(all_values.value) as freq "
                . "from ($all_values) as all_values "
                . "group by all_values.cname "
                . "having count(all_values.value)$comparator"
            );
            //
            return $sql;
        };
        //
        //Get the clean values
        //
        // Get the clean values have one value per column
        $clean_sql = $dispute("=1");
        //
        //Formulate the clean values
        $clean_data= $this->dbase->chk(
            "select "
                . "all_values.cname, "
                . "all_values.value "
            . "from ($all_values) as all_values "
            . "inner join ($clean_sql) as clean on clean.cname = all_values.cname"
        );
        //        
        //  Execute the clean values sql
        $clean = $this->dbase->get_sql_data($clean_data);
        //
        //Get the conflicting values
        //
        //Conclicting data have more than one value per column
        $conflicts_sql = $dispute(">1");
        //
        //Summarise the conflicts
        $conflicts_summary=  $this->dbase->chk(
            "select "
                . "all_values.cname, "
                . "JSON_ARRAYAGG(all_values.value) as `values` "
            ."from "
                . "($all_values) as all_values "
                . "inner join ($conflicts_sql) as conflicts on conflicts.cname = all_values.cname "
            . "group by all_values.cname"
        );
        //  Execute the conflicts sql
        $conflicts1 = $this->dbase->get_sql_data($conflicts_summary);
        //
        //Map the raw conflicts to the expected type
        $conflicts = array_map(function($raw_conflict){
            //
            //NB. The raw conflict is an indexed array that has the 
            //has the following structure
            //[cname:string, values:string] = c;
            //
            //Access the values component from the raw conflict.
            $values_str = $raw_conflict['values'];
            //
            //Json-decode the values (string) to an array
            $values_array = json_decode($values_str, JSON_THROW_ON_ERROR);
            //
            //Recompile the desired conflict replacing the values string with 
            //the array version, so that the result should be looking 
            //like this:
            //{cname:string, values:Array<string>} 
            $desired_conflict = new stdClass();
            $desired_conflict->cname = $raw_conflict['cname'];
            $desired_conflict->values = $values_array;
            //
            //
            //Return the desired result
            return $desired_conflict;
        },$conflicts1);
        //
        $consolidates = new stdClass();
        //
        $consolidates->clean = $clean;
        $consolidates->dirty = $conflicts;
        //
        return $consolidates;
    }
    
    //
    //This function deletes the minor contributors and returns a 'ok' if 
    //the deletion was successful. If there was an integrity violation error
    //then an an array of pointers is returned in preparation for the 
    //redirection of all minor pointers to the principlal
    public function delete_minors()/*:<Array<pointer>|'ok';*/{
        //
        //Formulate a query to delete the minors
        $query = 
            "delete "
                . "$this->ref.* "
            . "from $this->ref "
            . "inner join ($this->minors) as minors "
                . "on minors.member = {$this->ref->pk()}";
                
        //Execute the query and return the output
        try{
            $this->dbase->query($query);
            //
            //The deletion was successful
            return 'ok';
        }
        catch(PDOException $ex){
            //
            $ecode = $ex->getCode(); 
            //
            //The deletion failed for some reason. If the reason was due 
            //to integrity error, we return pointers that help in resolving the
            //error; otherwise we don't handle the exception
            if($ecode== "23000"){return $this->get_pointers();}
            else{throw $ex;}
        }
    }
    //
    //Returns a pointer; it has teh following shape:-
    /*
    {
        column: {
            dbname: lib.dbname,
            ename:lib.ename,
            cname:lib.cname,
        },
        is_cross_member:boolean, 
        indices:Array<{
            name:string, 
            signatures:Array<{
                //
                //Generates the signature is
                id:lib.sql, 
                //
                //Constrain the members using the siganture id
                members:lib.sql
            }>
        }>
    }
    */
    private function get_pointers(): array /*<pointer>*/{
        //
        $pointers = iterator_to_array($this->ref->pointers());
        //
        //Map tthe pointers to the desired type
        return array_map(function($pointer){
            //
            //Create the output result
            $result = new stdClass();
            //
            //Get the pointer away entity a.k.a., contributor;
            $contributor = $pointer->away();
            //
            //Compile the result
            $result->dbname = $contributor->dbname;
            $result->ename = $contributor->name;
            $result->cname = $pointer->name;
            $result->cross_member = $pointer->is_cross_member();
            //
            return $result;
        }, $pointers);
    }
    //
    //
    //This function fetches the consolidations as an array, and merges them to the
    //principal resolving the numerous duplicates during execution.
    //e.g update `member`
    //      set `member`.`name`='Cyprian Kanake',`memeber`.`age`=42,...
    //           
    public function update_principal(
            array $consolidations /*: Array<{cname:string,value:string}>*/
    ): void{
        //
        //Map the consolidations array into an array of consolidation text
        $texts= array_map(fn($consolidation)=>
            "`$consolidation->cname`='$consolidation->value'",
            $consolidations);
        //
        //Join the consolidation texts with a comma separator
        $set= join(",", $texts);
        //
        //Formulate  update query
        $update= $this->dbase->chk(
            "update "
                . "$this->ref "
            . "set $set "
            . "where {$this->ref->pk()}=$this->principal" 
        ); 
        //
        //Execute the query. If the update fails, the system will crash
            $this->dbase->query($update);
    }
    //
    //This function redirects a pointer to the principlal. The shape of a 
    //pointer is {dbname, ename, cname, is_cros_member:boolean}
    //If successful the function returns 'ok'; if not (because of integrity 
    //violation) it returns the structure (Imerge) that allows us to merge pointer 
    //members. The Imerge structure has the shape {
    //dbname:string, ename:string, members:sql, principal:pk, minors:sql}
    public function redirect_pointer(stdClass /*pointer*/$pointer)/*:lib.Imerge|'ok'*/{
        //
        //Formulate the redirection query for the contributors, based on the 
        //given pointer
        $sql = "Update "
            //
            //The table to update is derived from the pointer    
            . "`$pointer->dbname`.`$pointer->ename` "
            //
            //Filter contributors using the minors
            . "inner join ($this->minors) as minor "
                . "on minor.member=`$pointer->ename`.`$pointer->cname` "
            //
            //Its the pointer we are redirecting to the principal    
            . "set $pointer=$this->principal ";
        //
        //Execute the query. If successful, return ok; otherwise formulate and 
        //return the Imerge structure to support merging of the pointee members
        try{
            $this->dbase->query($sql); 
            //
            //The redirection was successful
            return 'ok';
        } catch (Exception $ex) {
            //
            //The redirection failed for some reason. 
            //
            //If the reason was not integrity violation re-throw the Exception
            if ($ex->getCode()=="23000") throw $ex;
            //
            //The reason for failure was integrity violation. Compile and 
            //return the Imerge structure
            //
            $result = new stdClass();
            //
            $result->dbname = $pointer->dbname;
            $result->ename = $pointer->name;
            $result->members = $this->get_member_sql($pointer);
            //
            return $result;
        }
    }
    
    //Given a pointer to a referenced entity return the sql that is
    //required for isolatng the members to be merged. These are members
    //that cause the integrity violation when we attempted the merge -- so they 
    //must have result in duplicate values in a unique index 
    private function get_member_sql(stdClass $pointer):string/*sq;*/{
        //
        //Get the pointer table; it has the unique indices we require
        //
        //Collect all the columns from all the unique indices of the contributor
        //that references the pointer column 
        //
        //Extract the pointer column (from all the collected ones) to get the 
        //shared ones
        //
        //Get the (raw) pointer members being re-directed
        $redirects = $this->dbase->chk(
            "Select "
                //The shared columns i.e., all index minus pointer plus 
                //the principal to which the pointers are redirected
                . "$shareds, "
                //        
                //The pinter member to be counted
                ."`$pointer->ename`.`$pointer->ename` as pk "
            //
            //The members to merge come from the pointer table
            . "from "
                . "`$pointer->dbname`.`$pointer->ename` "
                //
                //Limit the cases to those pointing to the minors    
                . "inner join ($this->minors) as minor "
                    . "on minor.member=`$pointer->ename`.`$pointer->cname` "
        );
        //
        //Summarise the re-directs to get the members to be merged. They have 
        //the following shape:
        //Array<{signature?:Array<value>, members:Array<pk>}> 
        //where value is that of a shared column. The set of shared clumns 
        //define the identity of members to merge to a joint principal. It is a
        //signature
        return $this->dbase->chk(
            "Select "
                //The shared columns i.e., all index minus pointer
                . "JSON_ARRAY($shareds) as signature, "
                //        
                //The count of all the primary keys of the pointer members to 
                //to be redirected
                . "JSON_ARRAY_AGGREG(pk) as members "
            //
            //The members to merge come from the pointer table
            . "from "
                . "($redirects) as redirect "
            . "group by "
                . "JSON_ARRAY($shareds)"
            ."having count(pk)>1"
        );
    }
}   