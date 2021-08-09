<?php
//
//
//include the schema where the database model is defined 
include_once  $_SERVER['DOCUMENT_ROOT'].'/library/v/code/schema.php';
//
//This class models a container for saving data to the server
class record extends schema{
    //
    //Modelling milk in a sachet. A empty sachet is acceptable. This is 
    //important for those extending a record. See the case of a table.
    //The datatype of this sachet varies depending on the format of this data 
    //its an array if the format is lable or 4d and an stdclass if the format is 
    //tabular.
    protected  /*expression[ename][$alias][cname]*/ $sachet;
    //
    //Modelling milk in pot (ready for boiling)
    public array/*expression[ename][alias][cname]*/ $pot=[];
    //
    //To allow milk in the pot to be accesible globally
    static array/*exp[dbname][ename][alias][cname]*/ $current;
    //
    //Keeps a record of the visited entities in the record 
    //This is essential for entities saving to avoid re-occurence 
    //of the process.
    static \Ds\Map /*<[dbname,ename,alias],expression>*/$booked;
    //
    //Saves the position data assiociates with the curent record
    static \Ds\Map $positions;
    //
    //Map for holding the friendly data component associated with the 
    //the saved foreign key and the primary keys 
    static \Ds\Map $friendlies;
    //
    //Flag to indicate whether we require to return the friendly names
    //for valid primary keys or not.
    public bool $friendly=false;
    //
    function __construct(
        //
        //
        $sachet=null, 
        //
        //
        string $format=format::fourd
    ) {
        //
        $this->sachet = $sachet;
        $this->format = $format;
        //
        //Initialize the mutall system. We have no speciala way of identoifyimg a 
        //record
        parent::__construct("unnamed");
        //
        //Initialize the static maps
        self::$booked=new \Ds\Map();
        self::$friendlies= new \Ds\Map();
        self::$positions= new \Ds\Map();
    }
    //
    //Save the sachet milk into the database by 
    //1. loading the milk into the pot
    //2. Test for syntax errors
    //3. Script the milk into the database
    //4. Return the result as list of syntax or runtime errors 
    function write(array $alias=[]):expression{
        //
        //We dont expect an allias for a record.
        if (count($alias)!==0){throw new \Exception('We dont expect an alias for a record');}
        //
        //1. Load the sachet into the pot
        //
        //Transfer the sachet content (milk) to the boiling pot, collecting the indexing 
        //entity names as you go along for later use
        $this->load();
        //
        //Allow the pot (of milk) to be accessible globally
        record::$current = $this->pot;
        //
        //2. Test for syntax errors
        //
        //Clean the pot to report any syntax errors i.e a syntax error is obtained 
        //when an entity name cannot be resolved to an entity of the current 
        //database or a column name cannot be resolved to a column 
        $syntax_errors= $this->get_syntax_errors();
        //
        //
        //If there are syntax errors...
        if(count($syntax_errors)>0){
            //
            //..stop the saving and return them 
            return new collection($syntax_errors,"syntax");
        }
        //There are no syntax errors
        //
        //3.Now do the actual writing, i.e., script of the milk into 
        //the database
        $runtime_errors=$this->script();
        //
        //Compile output expression as an array of type "runtime_errors".
        return new collection($runtime_errors, "runtime_error");
    }
    
    //returns an array of the syntax error found in the sachet inorder to report them 
    //first before any saving can be done 
    private function get_syntax_errors():array/*errors*/{
        //
        //Begin with an empty array to store the errors
        $syntax_errors=[];
         //
         //loop through the error generator saving all the yielded errors into 
         //an array 
         foreach ($this->collect_syntax_errors() as $error){
             $syntax_errors[]=$error;
         } 
        //
        //
        return $syntax_errors;
    }
    
    //Check this record for syntax errors and yields each one of them. A syntax 
    //error occurs when you cannot match:-
    //a)Match teh name of a datbaase to an actaul one
    // a)the name of an entity to an actual one in the current databsean 
    // b) the mame of a column to an actual one the same databse
    //The return value is te error generator.
    private function collect_syntax_errors(): \Generator{
        //
        //Loop through all the entity keys of this record and check each key
        //value for syntax errors
        foreach(/*[dbname][ename][alias][cname]*/$this->pot as $dbname=>$values0){
            //
            //Trap the opening of the database to see if it exists
            try {
                //
                //At this point, we check whether teh dataase exosts as well
                $dbase= $this->open_dbase($dbname);
            }catch(\Exception $ex){
                //6
                //The dayabnase opening has failed for some reason one of them 
                //being database does not exist.
                yield new myerror($ex->getMessage());
                //
                //Do not bother wth the rest of the tests
                continue;
            }    
            //
            foreach (/*[ename][alias][cname]*/$values0 as $ename=>$values1){
                //
                //1. Prepare to yield ename syntax error
                //
                //Yield the syntax error and move on to the next entity key
                if (!isset($dbase->entities[$ename])){
                      yield new myerror("Entity $ename does not exist in database $dbname"); 
                      //
                      //Do not bother with column tests
                      continue;
                }
                //
                //Get the entity 
                $entity=$dbase->entities[$ename];
                //
                //2. Prepare to yield cname syntax error.
                //
                //Loop troufg the column names of the the entity key value and check
                //for syntax error
                foreach(/*[alias][cname]*/$values1 as $values2){
                    //
                    foreach (array_keys($values2) as $cname){
                        //
                        //Yield the column syntax error
                       if (!isset($entity->columns[$cname])){
                            yield new myerror("Column $ename.$cname does not exist in dataabse $dbname"); 
                       }
                    }
                }
            }
        }
    }
    
    //Writes the milk in the pot to the database by looping through the milk 
    //evoking the save methods of the constituent entities. 
    private function script(): array/*runtime errors*/{
        //
        //Define the list of runtime errors starting with nothing
        /*Array<myerror>*/ $errors=[];
        //
        //Loop through the entity names to save the data referenced by each one 
        //of theme based on the alias/*1,1,2*/
        foreach(/*atom[dbname][ename][alias][cname]*/$this->pot as
                $dbname=>$values0){
            //
            //By this time, the given database mus be among the current. It was
            //placed there during syntax error checking
            $dbase = database::$current[$dbname];
            //
            foreach (/*atom[ename][alias][cname]*/$values0 as $ename=>$values1){
                //
                //Get the name entity (from current database).
                $entity = $dbase->entities[$ename];
                //
                foreach(/*atom[alias][cname]*/$values1->keys() as $alias){
                    //
                    //Write this records's data asosciated with this entity to the 
                    //current database and ignore the result. 
                    $result= $entity->save($alias);
                    //
                    //Collect any runtime error
                    if($result instanceof myerror){
                        $errors[]=$result;
                    }
                }
            }
        }
        //Return the runtime errors
        return $errors;
    }
    
    //Transfer the sachet content (milk) to the boiling pot, collecting
    // the indexing entity names as you go along for later use.
    function load(){
        //
        //The pot is already loaded, return
        if (count($this->pot)!==0){return; }
        //
        //There is no sachet and the pot is empty. This is unusual
        if (is_null($this->sachet) && count($this->pot)===0){
          throw new  \Exception( 'The sachet is empty!');
        }
        //
        //The sachet is filled. 
        //
        //The data does not have any syntax errors
        //Clear the boilng pot
        $this->pot=[];
        //
        //Use the current format to pack the pot
        switch($this->format){
            //
            case format::fourd:
                $this->load_4d();
                 break;
            case format::label:
                foreach($this->sachet as [$dbname, $ename, $alias, $cname, $Iatom]){
                    //
                    //The value of this label can either  be an atom or a 
                    //a basic value 
                    //
                    //it is an atom if it is an array 
                    if(is_array($Iatom)){
                        //
                        //The first element of an atom is a basic value.
                        $value = $Iatom[0];
                        //
                        //Convert our basic value, in the atom, to an expression.
                        //Null values are treated specialy from literals.
                        $exp = is_null($value) ? new null_(): new literal($value);
                        //
                        //Save the position if it is provided 
                        if(isset($Iatom[1])){
                           record::$positions->put([$dbname,$ename,$alias,$cname],
                                $Iatom[1]); 
                        }
                        
                    }else{
                        //
                        //Convert our basic value, in the atom, to an expression.
                        //Null values are treated specialy from literals.
                        $exp = is_null($Iatom) ? new null_(): new literal($Iatom);
                    }
                    //
                    //Store the literal in the pot.
                    $this->pack($exp, $cname, $ename, $alias, $dbname);
                } 
            break;
            case format::tabular:
                $this->load_tabular();    
                break;
            default:
                throw new \Exception("Format $this->format is not known");
        }
    }
    
    //
    //Every expression has the ability to populate inself in a pot i.e 
    //Given a pot an expression can populate its self 
    function pack(expression $exp, string $cname, string $ename, array $alias = [], string $dbname = null): void {
        //
        //A database must be available
        if (is_null($dbname) & !isset(database::$default->name)) {
            throw new \Exception("Database name is not specified");
        }
        //
        //Set the dbname dimension if not set 
        if (!isset($this->pot[$dbname])) {
            $this->pot[$dbname] = [];
        }
        //
        //Set the ename dimention if not set 
        if (!isset($this->pot[$dbname][$ename])) {
            $this->pot[$dbname][$ename] = new \Ds\Map();
        }
        //
        //Set the alias dimension if it is  not set 
        if (!isset($this->pot[$dbname][$ename][$alias])) {
            $this->pot[$dbname][$ename][$alias] = [];
        }
        //
        //Test if this column is set 
        //
        //Column is set report a deblicate entry by setting its status to an error 
        if (isset($this->pot[$dbname][$ename][$alias][$cname])) {
            //
            //Convert the alias to a string.
            $alias_str= "[".implode(",", $alias)."]";
            //
            //There is a problem!!!!!!!!Yiou are overwriting data
            throw new \Exception('You may be overwriting exsitng data'
                    . "indexed by [$dbname,$ename,$alias_str,$cname]");
        }
        //
        //Set the complete three dimentional pot [ename][alias][cname]
        $this->pot[$dbname][$ename][$alias][$cname] = $exp;
    }

  
    //
    //Loads this pot from the sachet by looping through the 4d sachet[dbname][ename]
    //[alias][cname]
    private function load_4d() {
        //
        foreach(/*exp[dbname][ename][alias][cname]*/$this->sachet as $dbname=>$values0){
            //
            foreach(/*exp[ename][alias][cname]*/$values0 as $ename=>/*[alias][cname]*/$svalues1){
                //
                foreach(/*[alias][cname]*/ $svalues1 as $salias=>/*[cname]*/$svalues2){
                    //
                    $alias = explode(",", $salias);
                    //
                    foreach($svalues2 as $cname=>$expression){
                        //
                        //Pack the given expression the current pot
                        $this->pack($expression, $cname, $ename, $alias, $dbname);
                    }
                }
            }
        }

    }
    //Do a double loop for loading table rows and columns. At each intercetion 
    //of a row and column, pack the matchimng expression
    private function load_tabular(){
            //
        //Get the header
        $head = $this->sachet->header;
        //
        //Get the body
        $body = $this->sachet->body;
        //
        //
        foreach($body as $r=>$row){
            foreach($head as [$dbname, $ename, $alias, $cname, $position]){
                //
                //Generate the position counter
                for($c=0;$c<count($row);$c++){
                    //
                    //
                    
                    if($c===$position){
                        //
                        //Compile a new alias for saving this data this is 
                        //to avoid duplication by including the row number in 
                        //alias
                        $new_alias=array_merge([$r],$alias);
                        //
                        //create the expression
                        //
                        //Get the value at the row column intersection
                        $value=$row[$c];
                        
                        //
                        //Convert it into a literal expression.
                        $exp= is_null($value)? new null_() : new literal($value);
                        //
                        //pack the expression
                        $this->pack($exp, $cname, $ename, $new_alias, $dbname);
                    }
                }
            }
        } 
    }
        
    //
    //Exports the data from the record to the database by
    //1. Save the dafault database 
    //2. Start the log(open the log)
    //3. Save the record 
    //4. Close the log
    //5.Report the results
    function export(
        //
        //The milk parameter represents the input data as either an array
        // of labels or a table object, depending on the format. 
        $milk,
        //
        //The format of our milk 
        string $format= format::label,
        //
        //We require to save the writing processs in to an external xml file
        //for debuging purposes.
        bool $keep_log=true,
        //
        //We don't require the partialy saved data on fatal errors.
        bool $roll_back_on_fatal_error=false,
        //
        //We don't require to return the friendly names for valid 
        //primary keys
        bool $friendly=false
    ):mala{
        //
        //Save the export parameters.
        //
        //Put the milk, i.e., input data into a record's sachet
        $this->sachet =$milk;        
        //
        //Set the milk's format.
        $this->format=$format;
        //
        //bind the keep log 
        $this->keep_log=$keep_log;
        //
        //bind the rollback option 
        $this->role_back_on_fatal_errors=$roll_back_on_fatal_error;
        //
        //
        $this->friendly=$friendly;
        //
        //Set the progress logging sysyetm.
        log::$execute=$keep_log;
        //
        //Allow rolling back to be accessed globally
        schema::$roll_back_on_fatal_error=$roll_back_on_fatal_error;
        //
        //2. Start the log(open the log)
        //create log file in the root directory that is to do the logging
        $log = new log('log.xml');
        //
        //Begin the logging logging
        log::$current = $log;
        //
        //3. Save the record 
        //
        //Begin transaction
        $this->begin_transaction();
        //
        //Start the saving of the structural columns
        // for all the entities
        $save = $log->open_tag('save.structurals');
        //
        //Save the non-cross member columns to return a collection 
        //of syntax or runtime errors.
        $collection = $this->save();
        //
        //Prepare to dump the syntax and runtime errors 
        $result =$log->open_tag("show.errors");
        //
        //Show the number of errors about be dumped
        $error_no= count($collection->members);
        //
        //Update the log with the number of errors result.
        $log->add_attr('number_of_errors', "$error_no",$result);
        //
        //
        //Dump the collection as a serries of  nodes as errors tags 
        //with the error message as the text content 
        foreach ($collection->members as $error){
            //
            //open an error tag
            $error_tag =$log->open_tag("error");
            //
            //The error message is the text content
            //Create a text node 
            $text= log::$current->createTextNode($error->to_str());
            $error_tag->appendChild($text);
            //
            //
            $log->close_tag($error_tag);
        }  
        //  
        //
        //Close the result tag 
        $log->close_tag($result);
        //
        //Close the save tag
        $log->close_tag($save);
        //
        //Updating the cross members for suporting structural columns.
        //
        //Update can only happen if there are no syntax errors.
        if($collection->type==="syntax"){
            //
            //Report the syntax errors 
            //
            //Stringify the errors.
            $errors= array_map(fn($error)=>$error->to_str()
                ,$collection->members);
            //
            //The structure of the expected syntax imala is
            //{class_name:"syntax", errors:Array<msg>}
            return new mala("syntax",null, $errors);
        }
        //
        //Start the update of the cross member columns 
        $update = $log->open_tag('update.cross_members');
        //
        //Update the optional foreign keys.
        $this->update_cross_members();
        //
        //Close the update tag
        $log->close_tag($update);
        //
        $this->close_transaction($collection);
        //
        //4. close the log to save the results to an externl file.
        $log->close($this);
        //
        //5. Report the result
        //Convert the fourD matrix of atoms into a reportable structure, 
        //i.e., runtime mala.
        $runtime_mala= $this->report_runtime($collection);
        //
        //Return the runtime mala.
        return $runtime_mala;
    }
    //
    //Extract the primary key expressions from the packed array(record::current)
    //and use them to compile the runtime Mala format.
    //The Mala has the following structure:-
    //{class_name:"runtime", result:Array<[iexp,position]>} where 
    //iexp = {type:"error"|"pk", value:basic_value, friend?:string}
    function report_runtime(collection $result):mala{
        //
        //Decide whether we are going to compute the friendlies or not 
        $is_friendly = schema::$roll_back_on_fatal_error 
            && $result->has_fatal_errors();    
        //
        //Prepare to build the array of runtime expressions starting with
        //an empty list.
        $result=[];
        //
        //Unpack the current pot, i.e., record::current use it to
        //construct the mala
        foreach (record::$current as $dbname => $dbase) {
            foreach ($dbase as $ename => $aliased_entity) {
                //
                //Access the alias key and ignore the column data
                foreach ($aliased_entity as $alias => $columns) {
                    //
                    //Get the primary key expression.
                    $exp= record::$current[$dbname][$ename][$alias][$ename];
                    //
                    //Retrieve the position if it is available
                    $position= record::$positions->hasKey([$dbname,$ename,$alias,$ename])
                        ? record::$positions->get([$dbname,$ename,$alias,$ename])
                        : null;
                    //
                    //Compile the simplified expression interface 
                    $Iexp= new stdClass(); 
                    //
                    //The value of this expression is the same as the string 
                    //equivalent
                    $Iexp->value=$exp->to_str();                    
                    //
                    //
                    if($exp instanceof myerror){
                        //
                        //Set the error type 
                        $Iexp->type="error";          
                    //
                    // 
                    }elseif ($exp instanceof literal) {
                        //
                        //Set the primary key type... 
                        $Iexp->type="pk";
                        //
                        //...and the friendly component only if needed.
                        if(!$is_friendly){
                            //
                            //Get the entity to retrive the friendly.
                            $entity = database::$current[$dbname]->entities[$ename];
                            //
                            //Set the friendly part
                            //$Iexp->friend=$entity->get_friend($exp->value);
                        }
                    }else{
                        //
                        throw new myerror("The expression of type
                          $exp->class_name is not expected");
                    }
                    // 
                    //Collect the runtime result.
                    $result[]=[$Iexp,$position];

                }                
            }
        }
        return new mala("runtime", $result);
    }
    //
    //Update the cross members. These are optional foreign columns of the saved 
    //entities
    function update_cross_members(){
        //
        //Run the updates using the booked casses because we know
        //these are the ones for which cross members were not considered
        //for insert.
        foreach(record::$booked->keys() as $key){
            //
            //Destructure the key.
            list ($dbname, $ename, $alias)=$key;
            //
            //Get the expression 
            $exp= record::$booked->get($key);
            //
            //The updating can only be done if the entity was saved successfully
            if($exp instanceof myerror){continue;}
            //
            //Get the affectes entity for the update
            $entity=$this->open_dbase($dbname)->entities[$ename];
            //
            //Log this process
            log::$current->open_tag("$dbname.$ename");
            //
            //Add the alias attribute to the element.
            log::$current->add_attr('alias', json_encode($alias));
            //
            //Update the cross members
            $result = $entity->update_cross_members($exp,$alias,true);
            //
            //Log the update results
            log::$current->add_attr('result', "$result");
            //
            log::$current->close_tag();
        }
    } 


    //Set the pdo's of the current databases to begin transactions
    private function begin_transaction(): void{
        //
        //Commitment or rolling back is  needed only if it is requested
        if (!schema::$roll_back_on_fatal_error) {return;}
        //
        //Begin transactins of all the current databasaes
        foreach(database::$current as $dbase){
            $dbase->beginTransaction();
        }
    }
    
    //Commit or roll back transactions depending on whether:-
    //a) the rolling back is necessary or not
    //b) we have fatal errors in the collection or not.
    private function close_transaction(collection $result){
        //
        //Rolling back is  needed only if it is requested
        //
        //Commitment or rolling back is  needed only if it is requested
        if (!schema::$roll_back_on_fatal_error) {return;}
        //
        if ($result->has_fatal_errors()){
            //
            //Roll back all the changes to the databases
            foreach(database::$current as $dbase){
                $dbase->rollBack();
            }
        }else{
            //
            //Commit all the changes to the databases
            foreach(database::$current as $dbase){
                $dbase->commit();
                
            }
        }
        
    }
    
}
//Managing formats for data export
class format{
    //
    //Data export layouts
    const fourd = 'fourd';
    const label = 'label';
    const tabular = 'tabular';
}
//
//This expression represents situation where we need to return an expression 
//as an array of (other) expressions. Effectively,
//it models an array as an expression 
class collection extends mutall implements expression{
    //
    //The array collection of the expressions 
    public array $members;
    //
    //Extra description of what the array type might be. For instance, if the arrey
    //being modeled is described as Array<string> then its tye os stringa 
    public string $type;
    //
    //
    function __construct(array $exps, string $type){
        parent::__construct();
        //
        //
        $this->members=$exps;
        $this->type=$type;
    } 
    //
    //This type of expresion was not designed to be stringified as it it does
    //not feature in an sql statement. So, any attempt to do so should be 
    //flagged as an error
    function to_str(): string {
        throw  new myerror("Class collection does not have a string "
                . "equivalent");
    }
    //
    //The current development of this class does not utlize this method 
    function yield_entity(): \Generator {
       throw  new myerror("Class collection cannot yield an entity "); 
    }
    function yield_attribute(): \Generator {
       throw  new myerror("Class collection cannot yield an entity "); 
    }
    //
    //Convert an array expression as to a string
    function __toString(){
        //
        //Convert the members to comma separated strings
        $exps = implode(", ", array_map(fn($exp)=>$exp->__toString(), $this->members));
        //
        return "$this->type[$exps]";
    }
    //
    //A collection has fatal errors if it consists of runtime expressions where
    //atleast one of them is erroneous.
    function  has_fatal_errors():bool{
        //
        //The collection must be of runtime expressions.
        if($this->type !=="runtime"){return false;}
        // 
        //This is a runtime collection.
        //
        //Check whether atleast one of the members is errpneous
        $errors = array_filter($this->members, fn($exp) => $exp instanceof myerror); 
        // 
        //Return true if there atleast one error.
        return count($errors)>0;
    }
    
}
//
//This simple class is used for modeling the syntax or runtime results 
//from capture process.
class mala {
    // 
    //The classname is either syntax or runtime
    public  string $class_name;
    //
    //Array of error 
    public  ?array /*<string>*/  $errors;
    //
    //Array of runtime results 
    public  ?array/*<Iexp>*/ $result;
    //
    public function __construct(
        string $class_name, 
        array $result=null,
        array $errors =null
    ) {
        $this->class_name=$class_name;
        $this->result=$result;
        $this->errors=$errors;
    }   
            
}

