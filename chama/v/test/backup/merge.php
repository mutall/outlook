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

class merger {
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
   function __construct(stdClass $Imerge) {
        //
        //Destructure the members
        $this->dbname= $Imerge->dbname;
        $this-> ename= $Imerge->ref;
        $this-> members= $Imerge->members;
        //
        //Set the database property
        $this->dbase = new database($this->dbname);
        //
        //Get the named entity from the database
        $this->ref = $this->dbase->entities[$this->ename];  
    }
    //
    //Categorize the members into a principal and the minors
    public function get_players():mixed/*: {principal,minors}|null*/{
        //
        //Get the reference contributors
        $contributor= $this->get_contributors();
        //
        //Get the principal sql
        $principal = $this->dbase->chk(
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
        //All the members without the principal i.e where the principal is null
        $minors = $this->dbase->chk(
            "select"
                ."member.*"
            ."from ($this->members) as member "
            . "left join ($principal) as principal "
            ."where principal.member is null"
        );
        //
        //
        $result= ['principal'=>$principal,'minor'=>$minors];
        //
        //
        return $this->count_members()<=1 ? null:$result;
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
        $union= implode("union all", $sql);
        //
        //Construct the sql
        $contributors = $this->dbase->chk($union);
        //
        return $contributors;
    }
    //
    //This function returns the count of records in the members sql
    public function count_members():int{
        //
        //
        $sql= $this->dbase->chk(
            "select "
                . "count(member.member)as num "
            . "from ($this->members)as member"
        );
        //
        //Execute the sql to get the count
        $rows= $this->dbase->get_sql_data($sql);
        //
        //The count is a field named num of the only record in the output
        $count= $rows[0]["num"];
        //
        return $count;
    }
    //
    //This function returns the pointer sql which has a structure similar to e.g.
    //select msg.msg as contributor,msg.member as member from msg
    public function get_pointer_sql(pointer $pointer): string {
        //
        //
        return $this->dbase->chk(
            "select "
                . "$pointer as member"
                . "{$pointer->home()->pk()} as contributor "
            . "from "
                . "{$pointer->home()}"
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
        return $all_values;
    }
    //
    //This method returns an sql which if executed would give us data with the
    //the following structure. It comes from the given column
    // Array<{cname:string, value: basic value}>
    private function get_column_query(column $col):string{
        //
        //
        $sql = $this->dbase->chk(
            "select "
                . "$col as value, "
                . "'$col->name' as cname "
            . "from {$this->ref}as ref "
            . "inner join ($this->members) as member on member.member= {$this->ref->pk()}"
            . "where not($col is null)"
        );
        //
        return $sql;
    }
    
    //Return consolidates as the data that takes part in conflict
    //resolution. It comprises of both clean and conflicting values
    function get_consolidation():stdClass/*:{clean:interventions, dirty:conflicts}*/{
        //
        //Formulate the dispute support sql
        $dispute= function(string $comparator): string{
            //
            //Obtain the records that are suspected to have conflicts 
            $sql= $this->dbase->chk(
                "select "
                    . "values.cname, "
                    . "count(values.value) as freq "
                . "from {$this->get_values()} as values "
                . "group by values.cname "
                . "having count(values.value)$comparator"
            );
            //
            return $sql;
        };
        //Get all the values
        $all_values = get_values();
        //
        //Get the clean values
        //
        // Get the clean values have one value per column
        $clean_sql = $dispute("=1");
        //
        //Formulate the clean values
        $clean_data= $this->dbase->chk(
            "select "
                . "values.cname, "
                . "values.value "
            . "from ($all_values) as values "
            . "inner join ($clean_sql) as clean on clean.cname = values.cname"
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
                . "values.cname, "
                . "values.value, "
                . "JSON_ARRAYAGG(values.value) as values "
            ."from ($all_values) as values "
            . "inner join ($conflicts_sql) as conflicts on conflicts.cname = values.cname "
            . "group by values.cname"
        );
        //  Execute the conflicts sql
        $conflicts = $this->dbase->get_sql_data($conflicts_summary);
        //
        $consolidates = new stdClass();
        //
        $consolidates->clean = $clean;
        $consolidates->dirty = $conflicts;
    }
    
    //
    //This function deletes the minor contributors and returns a 'ok' if 
    //the deletion was successful. If there was an integrity violation error
    //then an an array of pointers is returned in preparation for the 
    //redirection of all minor pointers to the principlal
    public function delete_minors():mixed/*:<Array<pointer>|'ok;*/{
        //
        //Formulate a query to delete the minors
        $query= $this->dbase->chk(
            "delete "
                . "$this->ref.* "
            . "from $this->ref "
            . "inner join ($this->minors) as minors on minors.member= $this->ref"
        );
        //
        //Execute the query and return the output
        try{
            $this->dbase->query($query);
            //
            //The deletion was successful
            return 'ok';
        }
        catch(Exception $ex){
            //
            //The deletion failed for some reason. If the reason was due 
            //to integrity error, we return pointers that help in resolving the
            //error; otherwise we don't handle the exception
            if($ex->getCode()== 23000){return $this->get_pointers();}
            else{throw $ex;}
        }
    }
    //
    //Return pointers of to the referenced entity as an array of:-
    //type pointer = {dbname, ename, cname, cross_member:boolean}.
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
        $texts= array_map(fn($consolidation)=>"
            `$consolidation->cname`='$consolidation->value'
            ",$consolidations);
        //
        //Join the consolidation texts with a comma separator
        $set= join(",", $texts);
        //
        //Formulate  update query
        $update= $this->dbase->chk(
            "update "
                . "$this->ref "
            //
            //The inner join implements a where clause
            . "inner join ($this->principal) as principal on principal.member= {$this->ref->pk()}"
            . "set $set" 
        ); 
        //
        //Execute the query. If the update fails, the system will crash
            $this->dbase->query($update);
    }
    //
    //This function redirects the contributors to the principlal. If success it
    //returns 'ok'; if not (because o integrity violation) it returns the
    //imerge structure that allows us to merge the contributors. The Imerge 
    //struuctire has the type {dbname, ename, members:sql}
    public function redirect_pointer(stdClass /*pointer*/$pointer)/*:lib.Imerge|'ok'*/{
        //
        //Get the contributing entity
        $contributor = $pointer->away();
        //
        //Formulate the redirection query for the contributors, based on the 
        //given pointer
        $sql = "Update "
            //
            //The table to update is derived from the pointer    
            . "$contributor "
            //
            //Filter contributors using the minors
            . "inner join ($this->minors) as minor on minor.member=$pointer "
            //
            //You need the principal; hopefully, it yields only one record, so 
            //its a product join    
             . "join ($this->prncipal) as principal "
            //
            //Its the pointer we are redirecting to the principal    
            . "set $pointer=principal.member";
        //
        //Execute the query. If successful, return ok.
        //Otherwise formulate and return the Imerge structure to support
        //merging of the contributors
        try{
            $this->dbase->query($sql); 
            //
            //The redirection was successful
            return 'ok';
        } catch (Exception $ex) {
            //
            //The redirection faled for some reason. 
            //
            //If the reason was not integrity violation rethrow the Exception
            if ($ex->getCode()==23000) throw $ex;
            //
            //The reason for failure was integrity violation. Continue
            //with the rest of the code
            //
            //Formualate and return the Imerge structure 
            //
            $result = new stdClass();
            //
            $result->dbname = $contributor->dbname;
            $result->ename = $contributor->name;
            $result->members = $this->get_member_sql($pointer);
            //
            return $result;
        }
    }
    
    //Given a pointer to a referenced entity return the sql that is
    //required for isolatng the members to be merged. These are members
    //that cause the integrity violation when we attempted the merge -- so they 
    //must have result in duplicate values in a unique index 
    private function get_member_sql(pointer $pointer):string/*sq;*/{
        //
        //Get the contributor table; it has the uniqque indices we require
        //
        //Collect all the columns from all the unique indices of the contributor
        //that references the pointer column 
        //
        //Extract he pointer column to get the shared ones
        //
        return $this->dbase->chk(
            "Select "
                //The shared columns i,e, (all index minus pointer)
                . ""
                //
                //The principal column (to which the pointer is redirected)  
                //        
                //The contributor primary key (to be counted)
            //
            //The members to merge come from the contributor table
            . "from "
                . "$contributor "
                //
                //Limit the cases to those pointing to the minors    
                . "inner join ($this->minors) as minor on minor.member=$pointer "
                //
                //You need the principal; hopefully, it yields only one record, so 
                //its a product join    
                 . "join ($this->prncipal) as principal "
            
        );
    }
}   