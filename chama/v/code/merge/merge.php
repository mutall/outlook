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
    public function get_players()/*: [principal,minors]|null*/{
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
        $result= [$principal,$minors];
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
    //
    //This function returns two queries, one for data that is clean and
    //the other for data that needs intervention
    public function get_conflicts(): stdClass/*:{clean: sql, conflicts: sql}*/{
        //
        //This function separates clean data from the conflicts
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
        $result= new stdClass();
        //
        //Set the clean sql of that standard class
        $result->clean = $dispute("=1");
        //
        //Set the conflicts of the standard  class
        $result->conflict= $dispute(">1");
        //
        return $result;
    }
    //
    /**
     * This function takes an sql statement, runs it, and tells us if there were
     *  any conflicts or not.
     * If the conflicts query was executed, it will return data that has the
     *  following structure:-
     * Array<{cname: string, freq: number}>
     * 
     * @param string $conflicts. This is an sql that identifies the column 
     * values that need user intervention
     * @return bool
     */
    public function conflicts_exist(string/*sql*/ $conflicts): bool{
        //
        //1. Formulate the query for counting conflicts
        $query= $this->dbase->chk(
          "select "
            . "count(conflicts.cname) as count "
        . "from ($conflicts) as conflicts "
        );
        //
        //2. Run the query and get the results
        $results= $this->dbase->get_sql_data($query);
        //
        //3. Use the results to find out how many conflicts there are
        $count= $results[0]["count"];
        //
        //4. Return true,if there is atleast one conflict,otherwise return false.
        return $count>0;
    }
    //
    //
    /**
     * 
     * @param string $all_values. This is an sql, that consists of both
     * @param string $conflicts
     * @return stdClass
     */
    public function get_conflicting_values(
        string $all_values /*sql={cname:string, value:basic_value}[]*/, 
        string $conflicts/*sql= {cname:string, freq:number}[]*/
    ):array /*Array<{cname:string, values:string[]}>*/{
        //
        //1. Formulate the query to returnn the raw conflicting values as an array
        $conflicting=  $this->dbase->chk(
            "select "
                . "values.cname, "
                . "values.value, "
                . "JSON_ARRAYAGG(values.value) as values "
            ."from ($all_values) as values "
            . "inner join ($conflicts) as conflicts on conflicts.freq = values. value "
            . "group by values.cname"
        );
        //
        //3. Execute the aggregated values to return the result
        return $this->dbase->get_sql_data($conflicting);
    }
    //
    //Seperate all values from the conflicts to obtain the clean values
    public function get_clean_values(
        string $all_values /*sql={cname:string, value:basic_value}[]*/,
        string $clean /*:sql*/
        ): array/*Array<{cname:string, value:string}*/{
        //
        //1. Formulate a query to return the clean values
        $cleaned= $this->dbase->chk(
            "select "
                . "values.cname, "
                . "values.value "
            . "from ($all_values) as values "
            . "inner join ($clean) as cleam on clean.freq = values.value"
        );
        //
        //Execute and get the clean records
        return $this->dbase->get_sql_data($cleaned);
    }
     //
    //This function deletes the minor contributors and returns a true if 
    //the deletion was successful and false if there was an integrity error
    public function delete_minors(): bool{
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
            //The deletion was successful
            return true;
        }
        catch(Exception $ex){
            //
            //The deletion failed for some reason. If the reason was due 
            //to integrity error, we return a false, 
            //otherwise we don't handle the exception
            if($ex->getCode()== 23000){return false;}else{throw $ex;}
        }
    }
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
    //This function redirects the contributors(descendants). 
    //It is performed after the deletion is unsucessful and the 
    //integroty violation error thrown
    public function redirect_contributors(string $contributors/*:sql*/): string/*Promise<error1062|null>*/{
        //
        //
    }
}  