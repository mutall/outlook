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

//Open the chama database
$dbase = new database("mutall_chama");
//
//Test the merge operation
merge();

//Returns a column based query for listing the unique values
function query(
    column $col,
    string $ename,
    array $members    
):string
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
//
//The user's intervention is about suggesting which of the multiple valuees of a 
//column should be considered for update. The result is of the form:
//Array<[cname, value]>
function get_manual_values(
    array $members,
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
function get_auto_values(string $all_values):array/*<[cname, value]>*/{
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

/**
 * Get the merger, i.e., best member to be the subject of the merge operation
 * @param members List of members (primary keys) to merge (including the merger)
 * @ename Name of the entity to which these members belong
 * @pointer Name of the entity that should be redirected to point 
 * to the merger
 * @return Primary key value of the merger
 */
function get_merger(array $members, string $ename, string $pointer):int{
    //
    //Use the global database 
    global $dbase;
    //
    //Formumate the merger sql
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
//
//
function merge(
    array $members=[82,1160,1189,1200,1233], 
    string $ename="member", 
    string $pointer="contribution")
{
    global $dbase;
    //
    //Get the $merger primary key. For now wire it manually
    $merger = get_merger($members, $ename, $pointer);
    //
    //Get the records to merge as an array, a.k.a., $mergees
    $mergees = array_diff($members, [$merger]);
    //
    //Get the records to merge as a comma sepated string
    $mergees_str = implode(",", $mergees);
    //
    //1. Update the pointers. 
    //
    //Formulate and exceute the sql for updating the given pointer records
    //so that they are re-directed to the merger
    $update_sql = $dbase->chk(
        "update $pointer "
        . "set $pointer.$ename = $merger "
        . "where $pointer.$ename in ($mergees_str)"
    );
    //
    //
    //Prepare to catch the update process incase it it fails
    try{
        $dbase->query($update_sql);
    }catch(Exception $ex){
        //
        //Asuumimg the failure is due to integrity violations...
        //
        //It means the we whoud merge the pointers
        /*merge($members2, $pointer, ???)*/
    }    
    //
    //2.Check if there are cases that need user intervention
    //
    //a. Get the named entity from the dtabase
    $entity = $dbase->entities[$ename];
    //
    //b. Get the columns of the entity
    $all_columns = $entity->columns;
    //
    //c.Remove the primary key column, to remain with data columns
    $data_columns = array_filter($all_columns, fn($col)=>!$col instanceof primary);
    //
    //d. Use the remaining columns to formulate the queries for retrieving
    //values for each data column of the entity.
    $queries = array_map(fn($col)=>query($col, $ename, $members), $data_columns);
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
        ." where $ename = $merger";
    //b. Execute the update sql
    //$dbase->query($merger_update);
    //
    //4.Delete all the mergees
    $delete_mergees = "delete from "
        . "$ename "
        . "where $ename in ($mergees_str)";
    //$dbase->query($delete_mergees);
    
    //5.Show the results
    echo "Ok";
}
