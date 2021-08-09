<?php
namespace sql;
// //
// // require 'library.php';
// // include 'config.php';
// include $_SERVER['DOCUMENT_ROOT'].'/metavisuo/v2.0/library.php';

//models a record in a table with it value 
//A record can be viewed as the horrizontal fieds in a table or sql saved as values 
//pairs with the field name and the value 
//It is from the record we can update, insert or delete the modify sql 
class record {
   //
   //Saves the entity from which this record is derived from due to the fact that 
   //most of my records for now are based on an entity note this may change in the 
   //future
   public  $entity;
   //
   //Saves the values view it as a collection of key value pairs of the following 
   //format [{attribute, value}.....}
   //the attribute has a name of the field involdved
   public $values;
   //
   //Saves the primary value it is required since it unequely identifies 
   public $primary;
   //
   function __construct($dbname, $ename, array $values, $primary=null){
       //
       //Save the aguments
       $this->entity= table::get_entity($ename, $dbname);
       $this->values=$values; 
       $this->primary=$primary; 
   }

   //
   //Inserts a record to the given table 
   function create(){
       //
       //create the insert 
       $insert = new insert($this);
       //
       //Execute the the insert
       $insert->query($this->entity->get_parent());
   }
   
   //
   //edits and updates a record 
   function update($primary){
       $this->primary=$primary;
       //
       //create the update
       $update= new update($this, $primary);
       //
       //Execute the the insert
       $update->query($this->entity->get_parent());
   }
   
   //
   //deletes a record completely from the database
   function delete($primary){
       $this->primary=$primary;
       //
       //create the delete
       $update= new delete($this, $primary);
       //
       //Execute the the insert
       $update->query($this->entity->get_parent());
   }
   
   //
   //Review a new record as a new row with the foreign keys as rows
   function view_new(){
        echo "<tr onclick='record.select(this)' id='{$this->entity->name}'>";
            //
            //loop through the column and out puts its td element.
            foreach ($this->entity->columns as $col){
                //
                //Get the tds for every column
                echo $col->view();
            }
            //
            echo "</tr>";
   }
  
}


//
//This root class is required to fomululate the sql from expression 
//It has an abstract formexp that defines the manner inwhich the from expression is derived 
abstract class root{
    //
    //the sql from expression from this root 
    abstract function fromexp();
}

//
//The table is the sql version of an entity 
//It was created so as not to add more method at the entity without affecting the library 
//It extends a root because it is the source of most of the sql such as 
//the update insert and the delete 
//Since it is an extension of the root it requires the root entity name and the dbname
// from where it derives its source entity 
class table extends root {
    use \mutall;
    //
    //Saves the root entity that was required to create this table 
     public $entity;
    //
    //Requires the entity name and the dbname which are required in the generation
    //of a root entity 
    function __construct($dbname=null, $ename=null) {
        $this->bind_arg("ename", $ename);
        $this->bind_arg("dbname", $dbname);
        //
        //Get the root entity and save it as the property of this table  
        $this->entity= table::get_entity($this->ename, $this->dbname);
    }
    
    //The from expression of an entitiy is its name 
    function fromexp(){return "`{$this->entity->name}`"; }
    
    //
    //Returns the root entity from where derived from the database saved as a 
    //serialised version in the session.
    static function get_entity($ename, $dbname){
        //
        //Create the database
        $dbase = sql::get_dbase($dbname);
        //
        //Throw an expeption incase we do have such a database
        if(is_null($dbase)){
            throw new \Exception("There is no database with such a name");
        }
        //
        //Throw an exception if the entity is null
        if(is_null($dbase->entities[$ename])){
            throw new Exception("The entity named $ename does exist check your spellings or database name");
        }
        //
        //return the entity to be requested 
        return $dbase->entities[$ename];
    }

}

///
//This class models the basic outlook of an sql (not specific to any sql) contains  
//the common aspects of the sqls which are
//1.The root which is used to formulate the from expression
//2.The joins Which are the conection of the various fields suplied 
//3. wheres, the criteria that is required for the data  
//4.allias 
 class sql extends root{
     use \mutall;
    //
    //the criteria of extracting information from an entity is null since currently 
    //we are retrieving everything from an entity
    public $wheres;
    public $orderby;
    //
    //Get the joins required for this sql for now return a null since the joins 
    //are not yet developed 
    public $joins;
    //
    //The root of an sql can eiter be another sql or a table 
    public $root;
    //
    //the elias of this sql
    public  $alias;
    //
    //the records saved during the get data 
    public $records= [];
    //
    static public $dbase=[];
    //
    //Setting the components of the sql
   function __construct($root,  array $joins,array $wheres, $alias=null ){
        //
       //Saving the arguments as properties of this class
        $this->root= $root;
        $this->joins= new joins($joins);
        $this->wheres= new wheres($wheres);
        $this->alias= $alias;
    }
    //
    //returns the root of this function as a string that can be places in an sql query 
    function fromexp(){
        //
        //Throw an expection if the alias is not set
        if(is_null($this->alias)){
            throw new Exception("Your root sql does not have an alias");
        }
        return 
        "({$this->to_str()})as {$this->elias}";
    }
    //
    //Executes the sql
    function get_sql_data($dbname){
        //
        //Get the affected database
        $dbase=sql::get_dbase($dbname);
        //
        //Get the sql string 
        $sql=$this->to_str();
        //
        // Execute the $sql on columns to get the $result in an array 
        $array = $dbase->get_sql_data($sql);
        //
        //Set the records 
        $this->set_records($array);
        //
        //Return the array 
        return $array;
    }
    
    //
    //Sets the records of this sql in this structure 
    //[{attribute->name=cname, attribute->value= value}.....]
    //similar to the javascript output
    function set_records($array){
        //
        //create the records out of each row in
        foreach ($array as $rows){
            //
            //Begin with an array of attributes to store the various std class
            //attribute
            $attributes=[];
            foreach ($rows as $name=>$value){
                //
                //Set every entry as a std class to match the version obtained form 
                //javascript[ {obj},....]
                $attribute=new \stdClass();
                $attribute->name=$name;
                $attribute->value= $value;
                //
                //push the array 
                array_push($attributes, $attribute);
            }
          //
          //Get the entity 
          $entity= $this->root->entity;
          //
          //Get the primary value 
          $pri=$rows[$entity->name];
          //
          //Create a record
          $db=$entity->get_parent();
          $record= new record($db->name, $entity->name, $attributes);
          //
          //Create a recocord indexed by name as the entity_pri eg agreement_1
          $a=array("{$entity->name}_$pri"=>$record);
          //
          //Add this record to the records 
          array_push($this->records, $a);
        }
    }
    
    //
    //Executes the sql with no data expected back
    function query(\database $dbase){
        //
        //Get the sql string 
        $sql=$this->to_str();
        //
        // Execute the $sql on columns to get the $result
        $dbase->query($sql);
        
    }
    
    //
    //Returns the current databse is needed to execute the a query
    static function get_dbase($dbname){
        //
        //Test if there are databases already created so as to check if the requested 
        //database is among them 
        if(\count(sql::$dbase)>0){
            //
            //Check if we have a ready dbase
            foreach (sql::$dbase as $key=>$value){
                //
                //
                if ($dbname===$key){
                    //
                    //We do, return it.    
                    return sql::$dbase[$dbname];
                }
            } 
        }
        //
       //Failed to find a ready database. Check if we have serialized version
       if(is_null($_SESSION[$dbname])){
           //
            //Retrieve the serilaized entitries
            $entities_=$_SESSION[$dbname];
            //
            //Create a ffresh database
            sql::$dbase[$dbname] = new \database($dbname);
            //
            //Activate the serialized entities
            sql::$dbase[$dbname]->entities = unserialize($entities_);
            //
            //Set this dbase as a static property
            return sql::$dbase[$dbname];
        }
        //
        //create the database from first principle ie from the information schema 
        sql::$dbase[$dbname] = new \database($dbname);
        //
        //popilate the database with the entites
        sql::$dbase[$dbname]->export_structure();
        //
        //Set the dbase
        return sql::$dbase[$dbname];
    }
     
    //
    //Returns the query results in a tabular format
    function show($dbname=null, $type=null){
        //
        $this->bind_arg('dbname', $dbname);
        $this->try_bind_arg("type", $type);
        //
        //Get the involved database
        sql::get_dbase($dbname);
        //
        //Get the fields 
        $fields= $this->fields->get_array();
        //
        //Execute this sql 
        $array= $this->get_sql_data($dbname);
        //
        //Ouptut a table
        echo "<table name='{$this->entity->name}'>";
        echo $this->header();
        //
        //Loop through the array and display the results in a table 
        foreach ($array as $row) {
            //
            //The id should be the primary value 
            $id=$this->entity->name;
            //
            echo "<tr onclick='record.select(this)' id='$row[$id]'>";
            //
            //Step through the columns
            foreach($fields as $field){
                //
                //Get the indexes of the field
                $name= is_null($field->alias) ? $field->column->name:$field->alias;
                //
                //Get the field value
                $value = $row[$name];
                
                echo $field->show($value);
                
            }
            
            echo "</tr>";
        }
        echo "</table>";
        
        
    }
    
    //
    //Returns the query results in a label format
    function label($array){
         //
        //Get the fields 
        $fields= $this->fields->get_array();
        //
        //Ouptut a table
        echo "<div name='{$this->entity->name}'>";
        echo $this->header();
        //
        //Loop through the array and display the results in a table 
        foreach ($array as $row) {
            //
            //Step through the columns
            foreach($fields as $field){
                //
                //Get the indexes of the field
                $name= is_null($field->alias) ? $field->column->name:$field->alias;
                //
                //Get the field value
                $value = $row[$name];
                
                echo "<span> $name :<span>$value></span>";  
            }
        }
        echo "</div>"; 
    }
    
    //
    //returns the title heads of the various fields 
    function header() {
        //
        //Get the fields in this sql 
        $cols= $this->fields->get_array();
        //
        //Loop through the fields and display the <tds>
        foreach ($cols as $col) {
            //
             $name= is_null($col->alias) ? $col->to_str():$col->alias;
            echo "<th>$name</th>";  
        }
    }
    
    //
    //This is the sql string statement that executes this sql 
    //this methord should be abstract but that would mean the entire sql class 
    //should be abstract hence written to be overwriten by any child 
    function to_str(){
        //
        //Incase the users did not overide this method alert them using the ab exeption
        throw new Exception ("Please write the to str version of sql {$this->root->fromexp()}");
    }
}

//
//models the sql of type select it extends an sql 
//it requires an array of fields intented to be retrieved
class select extends sql{
    //
    //An array object with all the fields that are required to be retrieved
    //it requires an array of expressions 
    public $fields;

    //
    //The select uniquely requires an array of the fields 
    function __construct(table $t, array $fields, array $joins, array $wheres, $alias=null) {
        //
        //The fields of this class passed as an array must also be an array object 
        $this->fields = new fields($fields);
        //
        //the parent constructor gieven the root, joins, wheres and the alias 
        parent::__construct($t, $joins, $wheres, $alias);
    }
    
    //overiding the parent sql 
    //Returns the standard string representing the sql statement of a select
    public function to_str() {
        //
        //Construct the sql (select) statement
        $stmt = 
           "select \n"
               //
               //Field selection 
                . "{$this->fields->to_str()} \n"
            . "from \n"
                //
                //For now the root is simply the name of a table or a bracketed 
                //enclose sql         
                . "{$this->root->fromexp()} \n"
                //
                //The joins, if any
                . "{$this->joins->to_str()} \n"
                //
                //The where clause, if necessary    
              ."{$this->wheres->to_str()}";
        return  $stmt;
               
    } 
   
}

//
//This class obtains the resolved constituent attributes as the ids of an entity 
//using the first index as a reference 
//it also includes name, description or title attribute of a particular entity 
class identifier extends select{
    //
    //Saves all the entities that are involed in a join 
    public $join_entities=[];
    //
    //We need the name of this entity as the root of this sql
    //saving the entity for easier access 
    public  $entity;
    //
    //Requires the entity name as $ename, database name as dbname from we derive 
    //the entity involved in the identifier select sql
    function __construct($ename=null, $dbname=null) {
        //
        $this->bind_arg('ename',$ename );
        $this->bind_arg('dbname', $dbname);
        //save the arguments of the of this identifier
        //
        //save the entity
        $this->entity= table::get_entity($this->ename, $this->dbname);
        //
        //Get the fields of this select sql which are the resolved column attributes 
        //used by the first index it also includes any name, title or description 
        $fields = $this->get_fields();
        //
        //Get the joins of this sql
         $joins= $this->joins();
         //
         //The parent select 
        parent::__construct(new table($dbname, $ename), $fields, $joins, []);
    }
    
    //
    //Return the resolved column attributes of an entity that are used for identification 
    //in an array that are reqiured to initialise the parent 
    function get_fields(){
        //
        //Start with an empty array that stores the resolved column attributes 
        $fields=[];
        //        
        //Get the indexed column names
        $index_names = $this->entity->indices;
        //
        //Test if the entity is properly constructed with idices for identification
        $x = \count($index_names);
        //
        //If the entity does not have an index through an exception since we cannot 
        //create an identifier
        if( $x === 0){
            throw new \Exception("Table: {$this->entity->name} does not have indexes check its construction");
        }
        //
        //Get the first index since I are only using the first index  to retrieve 
        //the indexed column names
        $index = array_values($index_names)[0];
        //
        //loop through the indexes and push to the fields if it is an attribute 
        //else resolve it to its constituent column  attributes 
        foreach ($index as $cname){
            //
            //Get the root column that if by the indexed name  
            $col= $this->entity->columns[$cname];
            //
            //Test if the column is an attribute 
            //The column is an attribute it does not need to be resolved 
            if($col instanceof \column_attribute){
                //
                //Push the column it is already resolved 
                array_push($fields, new column($col));
            }
            //
            //The column is a foreign it needs to resolved by first principle
            //steps
            //1. get the referenced table name 
            //2. get the referenced entity
            //3. get resolved indexes of the referenced entity
            else{
                //
                //1. Get the referenced table name 
                $ref= $col->ref_table_name;
                //
                //Test if this entity exists in the join entities list
                //1 if it does not exist push 
                $en= array_search($ref, $this->join_entities);
                if ($en === false){
                    //
                    array_push($this->join_entities, $ref);
                }
                //
                //2. Get the referenced entity 
                $entity1= $this->entity->dbase->entities[$ref];
                //
                //Repeat this process for the referenced entity 
                $cols2= $this->resolve_ref($entity1);
                //
                //loop through the fields of the new identify pushing them to the 
                //fields 
                foreach ( $cols2 as $coll) {
                    //
                    //push the column attribute
                   array_push($fields, $coll);
                }
            }
            
        }
        //
        //Update and include any name, title, description , or id fields
        $fields1=$this->update_fields($fields);
        //
        //return the collection of the resolved columns 
        return  $fields1;
    }
    
    //
    //Resolves the referenced entity to return its constituent column attributes
    function resolve_ref($entity){
        $db=$entity->get_parent();
        //
        //Create a new identifier using this entity 
        $identify = new identifier($entity->name, $db->name);
        //
        //Get the fields from it 
        $cols2= $identify->get_fields();
        //
        //Get the new join entities of the referenced entity
        $enames= $identify->join_entities;
        //
        //Include the joins of the referenced entity
        foreach ( $enames as $ename) {
            $enn= array_search($ename, $this->join_entities);
            //
            if ($enn == false){
              //
               array_push($this->join_entities, $ename);
            } 
        }
        //
        //
        return $cols2;
    }


    //Update the fields to include any nane, title, description or ids that are not 
    //indexed 
    function  update_fields($fields){
        //
        //Get the indexed  columns 
        //
        //loop through all the columns in this entity 
        foreach ($this->entity->columns as $column) {
            //
            //Get the name of the column
            $name= $column->name;
            //
            //if the column is foreign or primary return
            if($column->type==!'primary' || $column->type==!'foreign' ){
                //
                //Test if the column already exist in the fields array
                //first map the columns to get the column names
                $names= array_map(function ($f){return $f->column->name;}, $fields);
                //
                $enn= array_search($name, $names);
                //
                //If the culumn is an indexed column do nothing if false do the following
                if ($enn === false){
                    //
                    //Test if it is called a name 
                    if ($name== 'name'){
                        //
                        array_push($fields, $column);
                    }
                    //
                    //Test if it is called a description 
                    if ($name== 'description'){
                        //
                        array_push($fields, $column);
                    }
                    //
                     //Test if it is called a title 
                    if ($name== 'title'){
                        //
                        array_push($fields, $column);
                    }
                    //
                     //Test if it is called a id 
                    if ($name== 'id'){
                        //
                        array_push($fields, $column);
                    }
                }
            }
        }
        //
        //
        return $fields;
    }

    //
    //Overiding the joins of the entity to create the joins of this edit sql 
    function joins() {
        //
        //begin with an empty array of joins 
        $joins=[];
        //
        //Clean the array to remove any dublicates
        //
        //Sort the array in order of dependency
        $unsorted_entities=[];
        foreach ($this->join_entities as $enames){
            //
            //Get the entities
            $entty= $this->entity->dbase->entities[$enames];
            array_push($unsorted_entities, $entty);
        }
        
        //loop through the sorted array creating a join from each 
        foreach ($unsorted_entities as $entity){
          //
          //get the ands columns
          $foreigns= $this->get_foreigners($entity, $joins);
          //
          //Create a new join 
          array_push($joins, new join($entity, $foreigns, 'INNER JOIN'));
        }
        //
        //Return the collection of the joins in an array 
        return $joins;
    } 
    //
    //
    function show($dbname=null, $type=null){
        //
        $this->try_bind_arg("type", $type);
        //
        $this->bind_arg('dbname', $dbname);
        //
        //Get the involved database
        sql::get_dbase($dbname);
        //
        //Execute this sql 
        $array= $this->get_sql_data($dbname);
        //
        //If type is a label return output 
        if($this->type==='label'){
            return $this->label($array);
        }
        //
        //If type is data return the query array 
        
        //
        //Get the fields 
        $fields= $this->fields->get_array();
        //
        //Ouptut a table
        echo "<table name='{$this->entity->name}'>";
        echo $this->header();
        //
        //Loop through the array and display the results in a table 
        foreach ($array as $row) {
            //
            //This is a one field result
            echo "<tr>";
            //
            //Step through the columns
            foreach($fields as $field){
                //
                //Get the indexes of the field
                $name= is_null($field->alias) ? $field->column->name:$field->alias;
                //
                //Get the field value
                $value = $row[$name];
                
                echo $field->show($value);
            }
            
            echo "</tr>";
        }
        echo "</table>";    
    }
    
    //
    //Returns the foreiners in an array
    function get_foreigners($entity, $joins){
        //
        //let $foreigns be the array of foreigners to be returned 
        $foreigns=[];
        //
        //Get the already existing join entities and store them in an array 
        //$join_entities
        $join_entities=[];
        //
        //Test if there are joins already formulated if none push this entity 
        if(empty($joins)){
           array_push($join_entities, $this->entity);
        }
        //
        //There are joins already existing 
        foreach ($joins as $join){
            //
            //Push all the entities to the join entities
            array_push($join_entities, $this->entity);
            array_push($join_entities, $join->entity);
        }
        //
        //Get the columns that reference the given entity
        foreach ($join_entities as $entity1){
            //
            //Get the first index
            $index1= array_values($entity1->indices)[0];
            //
            //loop through indices to retrieve the column foreigns
            foreach ($index1 as $cname){
                $column= $entity1->columns[$cname];
                //
                //Test if is an instance of column foreign
                if($column instanceof \column_foreign){
                    //
                    //Get the referenced entity 
                    $entity2=$this->entity->dbase->entities[$column->ref_table_name];
                    //
                    //Test if entity2 is similar to the given entity
                    if ($entity2===$entity){
                        //
                        //push the column to the foreigns
                        array_push($foreigns, $column);
                    }
                }
            }          
            //
            //Get the entities being refereced by the given entity
            $index= array_values($entity->indices)[0];
            //
            //loop through indices to retrieve the column foreigns
            foreach ($index as $cname){
                $column= $entity->columns[$cname];
                //
                //Test if is an instance of column foreign
                if($column instanceof column_foreign){
                    //
                    //Get the referenced entity 
                    $entity2=$this->dbase->entities[$column->ref_table_name];
                    //
                    //Test if entity2 is similar any entity referenced
                    if ($entity2===$entity1){
                        //
                        //push the column to the foreigns
                        array_push($foreigns, $column);
                    }
                 }
            }
        }
        return $foreigns;
    }
}

//
//Outputs all the colummns with foreign keys resolved to their friendly
//identifiers. E.g., client=4 is resolved to client=[4,"deekos-Dessoks Bakery Ltd."]
class editor extends identifier { 
    //
    //Saves all the joins that are required for this editor sql
    public $editor_joins=[];
    public $join_entites=[];
    //
    //To create an editor we require the entity name and the database name 
    //THey are null so as to enable calling them from javascript
    function __construct($ename=null, $dbname=null){
        //
        //Set the ename and the dbname as the properties of the class
        $this->bind_arg("ename", $ename);
        $this->bind_arg("dbname", $dbname);
        //
        //Create the parent identifier
        parent::__construct($this->ename, $this->dbname);
        $this->entity= table::get_entity($ename, $dbname); 
        //
        //Collect all the  fields of the editor
        $fields = iterator_to_array($this->yield_fields(), true);
        //
        //Override the feilds property
        $this->fields = new fields($fields);
        //
        //Overide the joins
        $this->editor_joins();
    }
    
    //Yield every field of this editor
    function yield_fields(){
        //
        //Visit each column of the root entity, resolve it.
        foreach($this->entity->columns as $column){
            //
            //Resolve the current column
            //
            //Primary keys and attributes to not need resolving
            if($column instanceof \column_primary){
               yield new primary($this->entity, $column->name); 
            }
            
            else if ($column instanceof \column_attribute){
                yield new column($column, $column->name);
            }
            //
            //A forein key needs resolving from e.g., client=4 to
            //client = [4,"deekos-Deeoks Bakery lt"]. We need to cocaat 5 pieces
            //of data, $ob, $primary, $comma, $dq, $friendly, $dq, $cb
            else{
                //Start with an empty array 
                $args=[];
                //
                //Opening bracket
                $ob= new literal('[');
                array_push($args, $ob);
                //
                //Primary 
                $primary = new column($column);
                array_push($args, $primary);
                //
                //Comma
                $comma= new literal(',');
                array_push($args, $comma);
                //
                //Double quote
                $dq= new literal('"');
                array_push($args, $dq);
                //
                //Yied the fiedly comumn name
                $e2 = $this->entity->dbase->entities[$column->ref_table_name];
                //
                //Take care of the join 
                $en= array_search($e2->name, $this->join_entites);
                if ($en == false){
                    //
                    array_push($this->join_entites, $e2->name);
                    array_push($this->editor_joins, new join($e2, [$column]));
                }
                //
                //To obtain the indexed attributes get the identifier
                $db=$e2->get_parent();
                $identify = new identifier($e2->name,$db->name);
                //
                //The friendly are the fields of the identifier
                $friendly=  $identify->fields;
                //
                //Retrieve any joins also
                $joins_edit= $identify->joins->get_array();
                foreach ($joins_edit as $join){
                    $e= $join->entity->name;
                    $en= array_search($e, $this->join_entites);
                    if ($en === false){
                        //
                        array_push($this->join_entites, $e);
                        array_push($this->editor_joins, $join);
                    }
                }
                //
                //Return an array of the fields 
                $fri_fields= $friendly->get_array();
               
                //Loop through the array and pushing every component 
                foreach ($fri_fields as $field){
                    array_push($args, $field);
                    $d= new literal("/-/");
                    array_push($args, $d);
                }
                array_pop($args);
                //
                //Double quote
                 array_push($args, $dq);
                 //
                $cb= new literal(']');
                array_push($args, $cb);
                //
                yield new concat(new fields($args),$column->name);
               
            }
        }
    }
    //
    //Overides the editor join to remove include the referenced identifiers
    function editor_joins(){
        //
        //begin with an empty collection of joins 
        $joins=[];
        //
        //Push the editor joins also
        foreach ($this->editor_joins as $join){
            array_push($joins, $join);
        }
        //
        //Set the new joins 
        $this->joins=new joins($joins);
    }

    //
    //Present the editor sql to support editing of tabular data
     function show($dbname=null, $type=null){
        $this->bind_arg('dbname', $dbname);
        $this->try_bind_arg("type", $type);
        //
        //Execute this sql 
        $array= $this->get_sql_data($this->dbname);
        //
        //Ouptut a table
        echo "<table id='fields' name='{$this->entity->name}'>";
        echo '<thead>';
        echo $this->header();
        echo '</thead>';
        echo '<tbody id="table-body">';
        //
        //Loop through the array and display each row as a tr  element
        foreach ($array as $row) {
        $id= "{$this->entity->name}";
            //
            echo "<tr onclick='record.select(this)' id='$id'>";
            //
            //loop through the column and out puts its td element.
            foreach ($this->entity->columns as $col){
                //
                //Get the value from the row, remebering that the row is indexed
                //by column name
                $value = $row[$col->name];
                //
                //
                echo $col->show($value);
            }
            //
            echo "</tr>";
        }
        
        echo "</tbody>";
        echo "</table>";
        
        
    }
}

//The class has a special field called concat 
class selector extends identifier{
    //
    function __construct($ename, $dbname) {
        //
        //Initialize the identifier sql
        parent::__construct($ename,$dbname);
        $this->entity= table::get_entity($ename, $dbname);
        //
        $c= $this->entity->columns[$this->entity->name];
        //
        //Create the foreign field of this selector
        $foreign = new foreign($c, $this, $c->name);
        //
        //This literal acts like a separator of this fields to make them the 
        //arguments of the sql function 
        $sep = new literal('-');
        //
        //let the args be field of the parent identifier awaiting separation by 
        //the $sep 
        $args = $this->fields->getArrayCopy();
        //
        //let args2 be the  collection of the the parent fields together with 
        //their respective separator 
        $args2=[];
        //
        //Loop through the args pushing in a separator between them
        foreach($args as $arg){
            array_push($args2, $arg);
            array_push($args2, $sep );
        }
        //
        //Remove the last separator from the list 
        array_pop($args2);
        //
        //Create the concated fields using the function name concat
        $concated = new concat(new fields($args2), "{$this->entity->name}_ids");
        //
        //Create the fields array
        $fields=[];
        array_push($fields, $foreign);
        array_push($fields, $concated);
        //
        $this->fields = new fields($fields);
    }
}


//
//This class models the sqls that modify a database editing or inserting data 
//in a table i.e the update and the insert
abstract class sql_modify extends sql{
    //
    // The record is the complete data set as saved in the the database with the 
    // entity and the values of the fields  in it. the values are of the following format 
    //std->name ----name of the column
    //std->value ----the new value to be updated in the database table or inserted
    public $record;
    
    //
    //To construct the modify we only need a record and the wheres 
    function __construct(record $r, $wheres=null){
        //
        //save the values as an array of key value pairs 
        $this->values= $r->values;
        //Create the parent
        $db=$r->entity->get_parent();
        parent::__construct(new table($db->name,$r->entity->name),[], [$wheres]);
    }

    //
    //This is the sql string statement that executes this sql 
    //this methord should be abstract but that would mean the entire sql class 
    //should be abstract hence written to be overwriten by any child 
    function to_str(){
        //
        //Incase the users did not overide this method alert them using the ab exeption
        throw new Exception ("Please write the to str version of sql {$this->root->fromexp()}");
    }
    //
    //Returns string version of the values 
    function str_values(){
        //
        //map the std objects inthe array to return an array of strings of this 
        //format ['cname=value'......]
        $values_str= array_map(function($obj){
            //
            //Trim the spaces
            $tvalue = trim($obj->value);
            //
            //Replace '' with null
            $value = $tvalue=='' ? 'null': "'$tvalue'";
            //
            return "`$obj->name`=$value";
            
        }, $this->values);
        //
        //retun the imploded version of the array with a , separator
        return implode(",",$values_str);
    }
    
}

//
// Models the sql of type update it requires the record of operation and the 
// primary value 
//NOTE THE PRIMARY IS A VALUE NOT A ROOT COLUMN 
class update extends sql_modify{
    //
    //The primary column required to formulate the criteria  
    public $column_primary;
    //
    //The value of the primary column of the row to be updated expected to be a number 
    //that is according to the standards we have for databases 
    public $primary_value;
    //
    //The entity of operation
    public $entity;
            
    
    function __construct(record $r, $primary){
        //
        //This is the value from which we create a where 
        $this->primary_value=$primary;
        $this->entity= $r->entity;
        //
        //Get the primary column 
        $this->column_primary= $this->get_primary();
        //
        //Get the condition for the update 
        $wheres= new binary($this->column_primary, "=", new literal($primary));
        //
        //Create the parent
        parent::__construct($r, $wheres);
        
    }

    //
    //Retrieves the column name of this entity 
    function get_primary(){
        //
        //filter all the columns of this entity and remain with the primary columnn  
        foreach($this->entity->columns as $col) {
            //
            //return only the primary 
            if ( $col->type=='primary'){
                //
                //return an sql column
                $column= new column($col);  
            }
        }
        return $column;
        
    }
    
    
    //
    //Overriding the parent to str making the string statement an update statemnt 
    //Returns an sql statement  as a string 
    function to_str() {
        //
        //Test if this sql has an elias 
        $alias= is_null($this->alias) ? "":"as `$this->alias`";
        //
        //the update statement 
        $smt=""
              //This is an update statement 
             ."UPDATE \n"
                //
                //Get the root from expression as the source table of this update 
                //statement 
                . "{$this->root->fromexp()} \n"
                    . "SET \n"
                //
                //get the values as key values pairs 
                ."{$this->str_values()} \n"
                //
                //The joins, if any
                . "{$this->joins->to_str()} \n"
                 //
                //the where condition is that the primary value is equal to the 
                //primary column
                ."WHERE {$this->wheres->to_str()} \n"
                 //
                //include an ellias if any 
                ."$alias";
        //
        //Return the sql statement
        return $smt;
    }   
}

//
//This class models the sqls of type insert that are used to insert a new record 
//into a table 
class insert extends sql_modify{
    //
    //The construction requires the record that is to be inserted  
    function __construct(record $r) {
        parent::__construct($r);
    }
    //
    //Get the string version of the sql 
    function to_str() {
        $smt="INSERT   \n"
                //
                //Get the root of the sql 
                . "INTO  {$this->root->fromexp()}\n"
                    //The values
                    . "{$this->str_values()}\n"
                  //
                  //The joins if any because some insert may have sqls as their root
                 ."{$this->joins->to_str()}"    
                  
                                
              ;
        //
        //Return the sql statement that inserts 
        return $smt;
    }
    //
    //Returns string version of the values 
    function str_values(){
        //
        //map the std objects inthe array to return an array of strings of this 
        //format INSERT INTO Customers (CustomerName, ContactName, Address, City, PostalCode, Country)
        //VALUES ('Cardinal', 'Tom B. Erichsen', 'Skagen 21', 'Stavanger', '4006', 'Norway');

        $col_str= array_map(function($obj){
            //
            //Return the full description of the columns
            return "`$obj->name`"; 
        }, $this->values);
        //
        //
        $values_str= array_map(function($obj){
            //
            //Trim the spaces
            $tvalue = trim($obj->value);
            //
            //Replace '' with null
            $value = $tvalue=='' ? 'null': "'$tvalue'";
            //
            return $value;
            
        }, $this->values);
        //
        //retun the imploded version of the array with a , separator
        $values= implode(",",$values_str);
        $cols= implode(",",$col_str);
        return "($cols) VALUES ($values)";
    }
}

//
//Models the modify method of type delete 
class delete extends sql_modify{
    //
    //The primary column required to formulate the criteria  
    public $column_primary;
    //
    //The value of the primary column of the row to be updated expected to be a number 
    //that is according to the standards we have for databases 
    public $primary_value;
    
    //
    //The construction of a delete 
    function __construct(record $r, $primary){
        //
        //Get the primary column 
        $this->column_primary= $this->get_primary();
        //
        //This is the value from which we create a where 
        $this->primary_value=$primary;
        //
        //Get the condition for the update 
        $wheres= new binary($this->column_primary, "=", new literal($primary));
        //
        //Create the parent
        parent::__construct($r, $wheres);
    }

    //
    //Retrieves the column name of this entity 
    function get_primary(){
        //
        //filter all the columns of this entity and remain with the primary columnn  
        foreach($this->entity->columns as $col) {
            //
            //return only the primary 
            if ( $col->type=='primary'){
                //
                //return an sql column
                $column= new column($col);  
            }
        }
        return $column;  
    }
    //
    //The sql of a delete
     function to_str() {
       return 
         //
         //For now we are deleting everything in that record
         "DELETE   {$this->str_values()}"
         //
         //Get the from expression of the root
         . "FROM {$this->root->fromexp()}"
         //
         //the where condition is that the primary value is equal to the 
         //primary column
        ."WHERE {$this->wheres->to_str()} \n";
    }
    
}

//
//The criteria inwhich data affected will be accessed the link to a particular 
//record that returns a boolean value as a true or a false  
class binary{
    //
    //The column involved in the where 
    public $operand1;
    //
    //The va
    public $operand2;
    //
    //the operator eg =, +_ \
    public $operator;
            
    function __construct(expression $operand1, $operator , expression $operand2) {
        //
        //Set the two fields as the properties of the class 
        $this->operand1= $operand1;
        $this->operand2=$operand2;
        $this->operator=$operator;
    }
    //
    //This method stringfys the where to create a valid where clause usable in sql 
    function to_str(){
        //
        $op1 = $this->operand1->to_str();
        $op2 = $this->operand2->to_str();
        
        //return a valid where clause
        return "$op1 $this->operator $op2";
    }
}

//
//stores a collection of wheres requires an array of the where 
class wheres extends \ArrayObject{
    //
    //Requires an array of where objects
    function __construct($wheres) {
        
        parent::__construct($wheres);
    }
    
    function to_str(){
        //
        //Get a copy of this array, so that we can use the standard array methods
        $wheres = $this->getArrayCopy();
        //
        //Test if the array is empty
        //
        //If empty return an empty string 
        if(empty($wheres)){
            //
            //
            return "";
        }
        //Make array unique to remove any dublicates
        $unique_wheres=array_unique($wheres);
        
        //Map each where with its string version 
        $wheres_str=array_map(array($this, 'map_wheres'), $unique_wheres);
        //
        //Join the wheres strings using a AND separator
        return implode("AND" , $wheres_str);
    }
    
    //
    //The callback function returns the string description of the fields 
    function map_wheres($where){
       //
       //return field to str
       return $where->to_str();
    }
}

//
//This is the various data formats that can be represented in an sql string 
//e.g literal, primary and a column
abstract class expression{
    //
    //The friendly name for this expression 
    public $alias;
    //
    function __construct($alias=null){
        //
        //Set the alias
        $this->alias=$alias;
    }
    //
    //An expresiion to string is implemented in various ways depending on what 
    //expression it is that is why it is an abstract method
    abstract function to_str();
    
}

//
//This is the simplest form of an expression it includes simple characters 
//e.g / , .
class literal extends expression{
    //
    //This is the value to be represented as an expression 
    public  $value;
    //
    //We require the value inwhich to express as an expression 
    function __construct($value){
        $this->value = $value;
        //
        parent::__construct();
    }
    //
    //Overiding the parent tostring inorder to represent a literal 
    function to_str(){
        //
        //A string version of a literal is basicaly the literal itself as a string 
        //hence it should be encosed in double quotes incase it is needed to be 
        //converted into json
        return "'$this->value'";
    }
}

//Note this primary could reference an sql it does not have to be an entity 
//
//
//
//This expression represent the sql primary column where its  construction requires 
//the root entity 
class primary extends expression{
    //
    //This is the entity that is the home of the column to be represented as a 
    //primary 
    public $entity;
    //
    //To create this expression we need the root entity 
    function __construct(\entity $e, $alias=null){
        //
        //Get the root entity 
        $this->entity= $e;
        //
        //The parent construction of this this requires an allis but since this 
        //for now there is no allias to this 
        parent::__construct($alias);
    }
    //
    //Override the string of this column by returnining the full version of the 
    //column name e.g for name = `client`.`name`  
    function to_str(){
        
         //Include the alias
        $alias= is_null($this->alias) ? "":"as `$this->alias`";
        return "`{$this->entity->name}`.`{$this->entity->name}`$alias ";
    }
    //
    //Displays the query results of the 
 }
 
 //
 //This represent a simple field in sql or an attribute in the root for its construction 
 //we require the root column
 class column extends expression{
     //
     //This is the root column that is to represented as an expression
     public $column;
     //
     //The construction includes a column and a volumntary allias that can be null
    function __construct(\column $col, $alias=null){
        //
        //Set the column and the alias  
        $this->column= $col;
         //
        parent:: __construct($alias );
        
    }
    
    //
    //Displays the query result of this expression
    function show($value){
        return "<td>"
                    . "$value"
              . "</td>";
    }

    //
    //stringfy the column to a valid sql string for this column in the full description 
    //of a field e.g `client`.`name` instead of name 
    function to_str(){
        //
        //Get the entity name using the magic function get parent since the 
        //parent entity is protected 
        $e = $this->column->get_parent();
        //
        //Include the alias
        $alias= is_null($this->alias) ? "":"as `$this->alias`";
        //
        //compile the complete string version of the  
        return "`{$e->name}`.`{$this->column->name}` $alias";
    }
 }
 
 //
 // A foreign expression is modeled as a foreign key and hence it requires a root 
 //column and a referenced sql name just incase it is not a fk
 class foreign extends expression{
     //
     //This is the referenced sql that this foreign linls to 
     public $ref_sql;
     //
     //this is the column that is used for referencing
     public $column;
     //
     //its constuction needs a root column and an optional ref_sql this is because if 
     //if the column passed is a fk the ref_sql is the ref table name 
    function __construct(\column $c, sql $ref_sql=null, $alias = null) {
        //
        //save the column 
        $this->column= $c;
         //
        //Set the referenced sql
        $this->ref_sql= is_null($ref_sql) ? $c->ref_table_name:$ref_sql->entity->name;
        //
        //Set the alias 
        $this->alias=$alias;
        //
         parent::__construct($alias);
     }
     //
     //overide the parent to str
     public function to_str() {
         //
         //Get the parent of this column using
         $e= $this->column->get_parent();
         //
        //Include the alias
        $alias= is_null($this->alias) ? "":"as `$this->alias`";
         return "`$e->name`.`{$this->column->name}`  $alias";
     }
     //
    //Displays the query result of this expression
    function show($value){
        return   "<td onclick='record.select_td(this,$value)'ref='{$this->ref_sql}' title='$value'>"
                        . "$value"
                . "</td>";
        
    }
 }
 
//This models the sql function which require 
 //1. name e.g concat
 //2. array of arguments 
class function_ extends expression{
    //
    //These are the array of expressions
    public $expressions;
    //
    //This is the name of the function e.g concat 
    public $name;
    //
    function __consruct($name, array $expressions,$sep=null, $alias=null){
        //
        //Save the function name 
        $this->name = $name;
        //
        //Save thesaparator
        $this->sep=$sep;
        //
        //Save the array of expressions 
        $this->expressions = $expressions;
        parent::__construct($alias);
    }
    //
    //Overide the parent to string 
    function to_str(){
        $expressions = $this->expressions;
        //
        //loop through the expressions returns a string for each 
        $strs = array_map(function($exp){
            return $exp->to_str();}
            //
            //Array that contains the expressions
            ,$expressions);
        //
        $sep = is_null($this->sep) ? ",": " as `$this->sep`";
        $args = implode($sep, $strs);
        $alias = is_null($this->alias) ? "": " as `$this->alias`";
        //
        return "$this->name($args)$alias";
    }
    
    //
    //Displays the query result of this expression
    function show($value){
        return "<td>"
                    . "$value"
              . "</td>";
    }
   
}

//
//This models the concat expression that will be overridden by the class function
 class concat extends expression{
     
     function __construct(fields $f, $name=null){
         $this->fields= $f;
         
         parent::__construct($name);
     }
     
     function to_str(){
         //Include the alias
        $alias= is_null($this->alias) ? "":"as `$this->alias`";
        //
         return "concat ({$this->fields->to_str()}) $alias";
     }
     //
     //Displays the query result
     function show($value){
        return "<td>"
                   . "$value"
               . "</td>";
    }
 }

//
//This class class requires a preliminary knowledge of the following 
//1. The type of the join which is a string eg "OUTER JOIN", "iNNER JOIN" .....
//2. An array  of foreigns that are required to formulate the on clauses 
//3. The name of the sql or entity to be joined it should be as a complete string
//version such as select * from root inner join given_ename
class join{
    //
    //To create a join we need three things 
    //1.) the type of join as $type
    //2.) an array of the forigners as $foreigns 
    //3.) the Entity to joined as $given_ename
     function __construct(\entity $e, array $foreigns,  $type='INNER JOIN'){
         //
         //Every join must have a type which is a string i.e inner join 
         //outer join etc
         $this->type=$type;
         //
         //Get the join 
         $this->entity= $e;
         //
         $this->foreigns=$foreigns;
         //
         //Formulate the on clauses 
         $this->ons= $this->get_ons();
     }
     
     //
     //Maps the foreign array and a string return on statements required to 
     //formulate the join 
     //NOTE: this is for default if the foreigns are an array of columns if not 
     //column consider overriding this method 
     function get_ons(){
         //
         //Map for each and return an on clause 
        $col_str=array_map(array($this, 'map'), $this->foreigns);         //
         //
         //Return on joined on 
         return implode("AND \t",$col_str);
     }
     //The call back function
    function map($column){
        //
        //Get the entity name
        $entity=$column->get_parent();
        $ename=$entity->name;
        //
        //Get the cname
        $cname=$column->name;
        //
        //Get the referenced table name 
        $ref=$column->ref_table_name;
        //
        //Return a string version of the on clause
        return"\t{$ename}.{$cname}={$ref}.{$ref}\t";
    }
     //
     //strignfy to create a valid inner join that can be directly aappended to the
     //sql string  
     function to_str(){
         //
         //Get the name of the entity 
         $ename= $this->entity->name;
         //
         //The  type of the join eg inner join, outer join
         $join_str="$this->type"
         //
         //The on clause
         . "\t `$ename` \tON \t{$this->get_ons()}";
         return $join_str;
     }
    
}

//
//stores a collection of fields 
class fields extends \ArrayObject{
    
    function __construct(array $expressions) {
        
        parent::__construct($expressions);
    }
    
    function to_str($sep=null){
        //
        //Get a copy of this array, so that we can use the standard array methods
        $fields = $this->getArrayCopy();
        //
        //Map each field with its string version 
        $field_str=array_map(array($this, 'map_field'), $fields);
        //
        //
        $this->sep= is_null($sep) ? ",":$sep;
        //
        //Join the fields strings using a coma separator
        $field_sql=implode($this->sep, $field_str);
        return $field_sql;
    }
    //
    //Returns the array of this field
    function get_array(){
        return $this->getArrayCopy();
    }
    //
    //The callback function returns the string description of the fields 
    function map_field($field){
        $str= $field->to_str();
       //
       //return field to str
       return $str;
    }
}

//
//stores a collection of joins 
class joins extends \ArrayObject{
    
    function __construct($joins) {
        
        parent::__construct($joins);
    }
    
    function to_str(){
        //
        //Get a copy of this array, so that we can use the standard array methods
        $joins = $this->getArrayCopy();
        //
        //Test if this array is empty else 
        //If empty the sql since does not require joins
        if(empty($joins)){
            return "";
        }
        //
        //Map each field with its string version 
        $joins_str=array_map(array($this, 'map_joins'), $joins);
        //
        //Join the fields strings using a coma separator
        return implode("\n", $joins_str);
    }
    //
    //The callback function returns the string description of the fields 
    function map_joins($join){
       //
       //return field to str
       return $join->to_str();
    }
    
    //
    //Returns the array of this joins
    function get_array(){
        return $this->getArrayCopy();
    }
}



