<?php

require 'config.php';
//
//The supper class that supports the common methods for all the classes 
//in a mutall project. 
class mutall {

    //
    //Every mutall object is characterised by this property
    public string $class_name;
    //
    //The namespace of this mutall object
    public string $ns;
    //
    public bool $throw_exception;

    //
    function __construct(bool $throw_exception = true) {
        //
        //What do you do if there are any (entity) errors?. That depends on the
        //3rd parameter -- throw_exception. The Default is true
        $this->throw_exception = $throw_exception;
        //
        //
        $reflect = new \ReflectionClass($this);
        //
        $this->class_name = $reflect->getShortName();
        //
        //Add tehnnamespace from which this obet was created
        $this->ns = $reflect->getNamespaceName();
    }

    //The function that supports executon of arbitray methods on arbitrary class
    //objects from Javascript. This method is called from export.php. 
    static function fetch() {
        //
        //Save the server postings to post.json for debugging 
        //purposes
        //mutall::save_contents();
        //
        //
        //The class name must be set 
        if (!isset($_REQUEST['class'])) {
            throw new Exception('Classname not found');
        }
        // 
        //Get the requested class name 
        $class = $_REQUEST['class'];
        //
        //The method must be set
        if (!isset($_REQUEST['method'])) {
            throw new Exception('The method of the class to execute must be set');
        }
        //
        //Retrieve and set the method from the global request 
        $method = $_REQUEST['method'];
        //
        //Get the method parameters 
        if (!isset($_REQUEST['margs'])) {
            throw new Exception("Method parameters not found");
        }
        $margs = json_decode($_REQUEST['margs'], JSON_THROW_ON_ERROR);
        //
        //This method is executable at an object state or static state
        //controlled by the is_static property at the request
        $is_static = isset($_REQUEST['is_static']) && $_REQUEST['is_static'];
        //
        //If this is an object method...
        if (!$is_static) {
            //
            //Create an object of the class to execute
            //
            //Get the class contructor arguments
            if (!isset($_REQUEST['cargs'])) {
                throw new Exception("Class constructor parameters not found");
            }
            $cargs = json_decode($_REQUEST['cargs'], JSON_THROW_ON_ERROR);
            $obj = new $class(...$cargs);
            //
            //Execute on object method
            $result = $obj->$method(...$margs);
        } else {
            //
            //Execute the static method on the class 
            $result = $class::$method(...$margs);
        }

        //
        //This is the Expected result from the calling method
        return $result;
    }

    //
    // illustrate how the image file is moved to the server
    static function post_file(): bool {
        //
        //Get the files to upload...
        $fs_name = $_FILES['file']['name'][0];
        $fs_tmp_name = $_FILES['file']['tmp_name'][0];
        //
        //Get the post Folder to save to
        $folder = $_POST['folder'];
        //
        //Concatinate the flder and file name to get the actula path to save.
        $path = $folder . '/' . $fs_name;
        //
        //
        //The move_uploaded_file() moves an uploaded file to a new location.
        //if the destination file already exists it will be overwritten.
        //requires a file_path: the file to be moed.
        //moved_path: where the file will be moved.
        return move_uploaded_file($fs_tmp_name, $path);
    }

    //Returns true if the named property can be bound to the given value.
    function try_bind_arg(string $name, &$value = null): bool {
        //
        //Check if the value is null
        if (is_null($value)) {
            //
            //The value is empty.
            //
            //Get the named property from the server global variables
            if (isset($_REQUEST[$name])) {
                //
                //Retrieve the name value
                $value = $_REQUEST[$name];
            }
            //
            //Search in the session variables
            elseif (isset($_SESSION[$name])) {
                //
                //Retrieve the name value
                $value = $_SESSION[$name];
            } else {
                return false;
            }
        }
        //
        //Set the named propertey to the argument value
        $this->$name = $value;
        //
        return true;
    }

    //Bind the named propety of this object to the either given value 
    //or the matching global request , whichever is available in that order
    ///If failure try to bind it to the default value, if provided
    function bind_arg(string $name, &$arg, $default): void {
        //
        //Try direct binding to 
        if ($this->try_bind_arg($name, $arg)) {
            return;
        }
        //
        //Try binding to the default value
        if (!is_null($default)) {
            $arg = $default;
            $this->$name = $default;
            return;
        }
        //
        throw new \Exception("Argument $name cannot be bounded");
    }

    //Report exceptions in a more friendly fashion
    static function get_error(Exception $ex): string {
        //
        //Replace the hash with a line break in teh terace message
        $trace = str_replace("#", "<br/>", $ex->getTraceAsString());
        //
        //Retirn the full message
        return $ex->getMessage() . "<br/>$trace";
    }

    //
    //sets the database access credentials as session keys to avoid passing them
    //any time we require the database object 
    static function save_session($username, $password) {
        //
        //save the database credentials as session variables hence we do not have to 
        //overide them anytime we want to acccess the database yet they do not change 
        //Save the username 
        if (!isset($_SESSION['username'])) {
            $_SESSION['username'] = $username;
        }
        //
        //Save the password 
        if (!isset($_SESSION['password'])) {
            $_SESSION['password'] = $password;
        }
    }

    //The following tow functios are used for intercepting posted data for debugging
    //purposes.
    //
    //1. Save posted data to a file
    static function save_contents() {
        $json = json_encode($_POST);
        file_put_contents('post.json', $json);
    }

    //Retrieve posted data to a file
    static function get_contents() {
        $contents = file_get_contents('post.json');
        $_POST = json_decode($contents, true);
    }
    
    //
    //Returns the ith element of the given array. this 
    //is particulay important for the indexed array.
    function get_ith_element(array $elements, int $i){
        //
        //This procedure is valid for none empty array 
        if(count($elements)===0){
            throw new Exception("Empty elements in the given array");
        }
        //
        //Set the index counter to 0 
        $counter = 0;
        //
        //Loop through all the element and return the i'th one
        foreach ($elements as $element) {
            if($counter === $i){
                return $element;
            }
            $counter ++;
        }
        // 
        //
        throw new ErrorException("Index $i is out of range");  
    }

    //Offload the properties from the source to the destination
    static function offload_properties($dest, $src) {
        //
        if (is_null($src)) {
            echo '';
        }
        //
        // throuhg all the proprties of the source and each property to the
        //destination if it does not exist
        foreach ($src as $key => $value) {
            //
            if (!isset($dest->$key)) {
                $dest->$key = $value;
            }
        }
        return $dest;
    }

    //Ignoring the variables that are not used mostly durring destructring 
    //or position based element
    static function ignore() {
        
    }
    //
    //This is a scalled down version of parsing defaults in mysql.
    static function parse_default(string $default):expression{
       //
       //This is a short cut to developing a full fledged parser 
                //
        //
        switch ($default){
            //
            case  'current_timestamp()':
                return new function_('current_timestamp',[]);
                
            case "'9999-12-31'":
                return new literal('9999-12-31');
             
            //
            default : throw new Error("Unable to parse default value for $default");
        }
        
       
    }

}

//Modelling special mutall objects that are associated with a database schema.
//Database, entity, index and column extends this class. Its main charatreistic
//is that it represents a package whose contents can "saved", resulting in 
//a basic expression.
class schema extends mutall {

    //
    //This partial name of a schema objected is its name plus the database 
    //source it needed for formulating xml tags, indexing joints, etc.
    public string $partial_name;
    //
    //The full nam of a schema is needed for for formulating xml tags. It is the
    //schems short name plus the partial name
    public string $full_name;
    //
    //Togle the default auto commit of the trasactions to true of false onorder to 
    //influence a rollback and a commit upon the end of a transaction 
    //The default is a false 
    static bool $roll_back_on_fatal_error = false;
    //
    //A achema object has dual forms. The first one is said to be static; the 
    //second one is activated. When a schema object is activated, the resulting 
    //errors are manaed by ths property
    public array /* error[] */$errors = [];

    //
    //Define the full name of a mutall object set the error handling
    function __construct(string $partial_name) {
        //
        //
        $this->partial_name = $partial_name;
        //
        parent::__construct();
        //
        //Formulate the full name
        $this->full_name = "$this->class_name.$partial_name";
    }

    //
    //Saves a schema object to the database by:-
    //-opening the save tag (nameed using teh partial name)
    //-writing the schema object to the database
    //-closing the save tag.
    //The key point about save is that all schema object uses this impleentation
    //AND CANNOT OVVERIDE IT.
    final function save(array $alias = []): expression {
        //
        //Open the log for this save operation
        $element = log::$current->open_tag("save.$this->full_name");
        //
        //Add the alias as an attribute.
        log::$current->add_attr('alias', json_encode($alias), $element);
        //
        //Get the expression returned after a write into the database. Take care 
        //of the fact that the writing may fail with an exception
        $atom = $this->write($alias);
        //
        log::$current->add_attr('result', "$atom", $element);
        //
        //Close the log for this save
        log::$current->close_tag($element);
        //
        //return the basic expresiion 
        return $atom;
    }

    //
    //Every schema object must implement its own way of writing to 
    //the database.When it does, it must return an atom. If it does not 
    //implement a write method then this default one will throw an exception. 
    //
    //This write operation is implemennted for all schema objects.
    protected function write(array $alias = []): expression {
        //
        throw new Exception("We cannot write schema object of type "
                . "$this->class_name to the database");
    }

    //Write the given columns and an alias to the current dataase and
    //return the valid and invalid cases
    //$alias shows the exact entity record to be retrieved
    function write_columns(array $schemas, array $alias): array/* [valid*, invalid*] */ {
        //
        //Save the given schema to the database retutinhing their statuses,
        // ie., error or otherwise
        $statuses = array_map(fn($schema) => $schema->save($alias), $schemas);
        //
        //Filter out the errors from this statuses which invalidate the
        // ability of this index to save the current record
        $errors = array_filter($statuses, fn($status) => $status instanceof myerror);
        //
        $oks = array_filter($statuses, fn($status) => $status instanceof literal);
        //
        //Return the result
        return ['valids' => $oks, 'invalids' => $errors];
    }

    //Returns the named database if it was previously opened; otherwise it creates
    //one from either serialized data or information schema. The former is applied
    //if the user requests it explicity. Typicaly this is the case when we access
    //the same data through multiple page calls fom javascript. This feature was 
    //designed to address the slow response of retrieving metadata from the 
    //information schema.
    function open_dbase(string $dbname, string $dbns = "", bool $use_serialize = false): database {
        //
        //Compile the fully qualified dabasse
        $database = "$dbns\\database";
        //
        //Test if the database requested was previously opened 
        //
        //Test if this database is a fresh one (not from serialization). Note
        //that datase::$current is defiend at to levels: root and capture to 
        //reccognise that we are dealing with 2 different datababases named the
        //same
        if (isset($database::$current[$dbname])) {
            return $database::$current[$dbname];
        }
        //
        //If the serialization is not requested, then simply create a namespace
        //sensitive database.
        if (!$use_serialize) {
            //
            //Create the database (IN TEH CURRENT NAMSEPACE)and make it current
            $dbase = new $database($dbname);
            //
            //Set the namespace-aware current database
            $database::$current[$dbname] = $dbase;
            //
            return $dbase;
        }
        //
        //Serialization can be used
        //
        //Chech whenther there exists a database ti be unseralialized IN THE
        //CURRENT NAMESPACE
        if (isset($_SESSION['databases'][$dbns][$dbname])) {
            //
            //Yes there is ne. Unserializes it and ma it current (in the CURRENT
            //NAMESPACE)
            //
            //return the serializes version
            $dbase = unserialize($_SESSION['databases'][$dbns][$dbname]);
            //
            //Set the namespace-aware current database
            $database::$current[$dbname] = $dbase;
            //
            return $dbase;
        }
        //
        //As a last resort create a database from information schema
        $dbase_fresh = new $database($dbname);
        //
        //Set the namespace-aware current database
        $database::$current[$dbname] = $dbase_fresh;
        //
        //Serlilaise the database and save it IN THE CURRENT NAMESPACE
        $_SESSION['databases'][$dbns][$dbname] = serialize($dbase_fresh);
        //
        //Return a database populated from first principles
        return $dbase_fresh;
    }

    //Add fields (to this schema object) derived from the given comment string 
    //provided as a json 
    function add_comments(string $json): void {
        //
        //Test if the comment is empty, then it has nothig to add
        if (empty($json)) {
            return;
        }
        //
        //Decode the comment json string to a php (stdClass) object, it may 
        //fail. 
        try {
            //
            //Add the comment property to teh entoty
            $comment = json_decode($json, JSON_THROW_ON_ERROR);
            //
            if (!is_array($comment)) {
                $error = new \Error("the comment of $this->partial_name as $json"
                        . " is not a proper json format");
                array_push($this->errors, $error);
                return;
            }
            //
            //Offload the comment fields to this schema object
            mutall::offload_properties($this, $comment);
        } catch (Exception $ex) {
            //
            //Compile the error message
            $msg = "Invalid json string in the comment of $this->class_name";
            //
            //Add the error to those of activating the schema object
            $this->errors[] = new myerror($msg, mutall::get_error($ex));
        }
    }
    //
    //
    function test(string $id){
        echo " start $id";
        //
        $dbase=$this->open_dbase("mutall_users");
        $sql="INSERT 
                INTO  `tracking`.`developer`
                (`email`,`user`)
                VALUES ('camilus@gmail.com','175')
                ";
        //$dbase->beginTransaction();
        $dbase->query($sql);
        $dbase->rollBack();
        throw new Error("OK $id");
    }
}

//
//E.g., 2, 2*amount, etc.
interface expression {

    //
    //Every expression must be expressable as a valid sql string expression.
    //Often, this method returns the same value as the __toString() magic method,
    //but not in all cases. For instance, the __toString() of the id field in 
    //a selector is, e.g., "mutall_login.application.id__" whereas its to_str()
    //value is "concat(mutall_login.application.name,'/')". The __toString() of
    // an the application entity is, e.g., "muutall_login.application"; but that
    // of the aplication expression, to_str() refers to the primary key field
    // "mutall_login.application.application"
    function to_str(): string;

    //Yield the entities that participate in this expression. This is imporatnt 
    //for defining search paths for partial and save_indirect view. This is the 
    //method that makes it posiible to analyse mutall view and do things that
    //are currently woul not be possible without parsing sql statements
    function yield_entity(): \Generator;

    //
    //Yields the primary attributes that are used in fomulating this expression.
    //This is important for determining if a view column is directly editable or 
    //not. It  also makes it possble to expression values by accesing the primary
    //eniies that constitue them up.
    function yield_attribute(): \Generator;
}

//
//An atom is an expression that has an (optional) position associated with it.
class atom extends mutall implements expression {

    //
    //Expression is a result of column save that`s either a 
    //literal or an error
    public expression $expression;
    //
    //Data location on the crud_page, used for reporting back
    //[rowIndex,cellIndex]
    public ?array $position;

    //
    function __construct(expression $exp, array $position = null) {
        parent::__construct();
        $this->expression = $exp;
        $this->position = $position;
    }

    //
    //The string version of the atom is the string version of 
    //the expresion
    public function to_str(): string {
        return $this->expression->to_str();
    }

    //
    //Yield the attributes of this atom means yielding 
    //the attributes of the expression 
    public function yield_attribute(): \Generator {
        yield from $this->expression->yield_attribute();
    }

    //
    //The entity of this atom is the entity of the expression 
    public function yield_entity(): \Generator {
        yield from $this->expression->yield_entity();
    }

    //
    ////Every expression has the ability to populate inself in a pot i.e 
    //Given a pot an expression can populate its self 
    function pack(array &$pot, string $cname, string $ename, array $alias = [], string $dbname = null): void {
        //
        //A database must be available
        if (is_null($dbname) & !isset(database::$default->name)) {
            throw new \Exception("Database name is not specified");
        }
        //
        //Set the dbname dimension if not set 
        if (!isset($pot[$dbname])) {
            $pot[$dbname] = [];
        }
        //
        //Set the ename dimention if not set 
        if (!isset($pot[$dbname][$ename])) {
            $pot[$dbname][$ename] = new \Ds\Map();
        }
        //
        //Set the alias dimension if it is  not set 
        if (!isset($pot[$dbname][$ename][$alias])) {
            $pot[$dbname][$ename][$alias] = [];
        }
        //
        //Test if this column is set 
        //
        //Column is set report a deblicate entry by setting its status to an error 
        if (isset($pot[$dbname][$ename][$alias][$cname])) {
            //
            //There is a problem!!!!!!!!Yiou are overwriting data
            throw new \Exception('You may be overwriting exsitng data');
        }
        //
        //Set the complete three dimentional pot [ename][alias][cname]
        $pot[$dbname][$ename][$alias][$cname] = $this;
    }

}

//Modelling the database as a schema object (so that it too can save data to 
//other databases)
class database extends schema {
    //
    //An array of entties the are the collection of the tables that are required to create a 
    //database 
    public array $entities = [];
    //
    //This is the pdo property that allows us to query and retrieve information from 
    //the database it is a property to avoid this class from extending a pdo
    public \PDO $pdo;
    //Let the user set what should be considered as the default database. This is 
    //the database that is picked if a daabase name is not given explicity. This 
    //is designed to simplify working with a single database.
    static database $default;
    //
    //An aray of ready to use databases (previously descrobed as unserialized). 
    static array/* database[name] */ $current = [];
    //
    //This is where the error report is saved.
    public string $report;

    //
    //The database constructor requires the following parameters 
    //name: name of the database which is mandatory 
    //complete: an optional boolean that indicates whether we desire a database
    //complete with its entities or not. The the default is complete. If not 
    //an empty shell is returned; this may be useful when quering the database
    //directly, i.e., without the need of the object model
    function __construct(
            //
            //The database name.
            string $name,
            //
            //An optional boolean that indicates whether we desire a database
            //complete with its entities or not. The the default is complete.
            // If not  complete an empty shell is returned; this may be useful when 
            //quering the database directly, i.e., without the need of the object model
            bool $complete = true,
            //
            //An optional Throws an error as soon as they are found the  default is 
            //true
            bool $throw_exception = true
    ) {
        //
        //Construct the parent 
        parent::__construct($name);
        //
        $this->name = $name;
        //
        //Set the default value of the optional complete as true
        $this->complete = $complete;
        //
        //What do you do if there are any (entity) errors?. That depends on the
        //3rd parameter -- throw_exception. The Default is true
        $this->throw_exception = $throw_exception;
        //
        //Connect to the database
        $this->connect();
        //
        //Set teh current database, so tthat it can be accessede by all her 
        //dependants during activation.
        database::$current[$name] = $this;
        //
        //Attend to the 'complete' option. You are done if an incomplete database 
        //is required. Don waste time on entities. This is important if all we
        //want is to run a query
        if (!$complete) {
            return;
        }
        //
        //Activate the schema objects (e.g., entities, columns, etc) associated
        //with this database
        $ok = $this->activate_schema();
        //
        //If there any errors, fix them before you carry on
        if (!$ok) {
            $this->report_errors();
            return;
        }
        //
        //Populate the dbase with aliased entities, i.e., aliens using the
        //already populated entities.
        $this->compile_aliens();
        //
        //Set the relational dependency for all the entities and log all the 
        //cyclic conditions as errors.
        //$this->set_entity_depths();
        //
        $this->report_errors();
    }
    
    // 
    //Use this database to test if a user with the given credentials is 
    //found in the user database or not.
    public function authenticate(string $email, string $password):bool{
        // 
        //Create an sql/view to retrieve the password from  user table. 
        //the user with the given email 
        $sql = "select password "
                . "from user "
                . "where email= '$email' ";
        //
        //Execute the query and retrieve the password
        $users= $this->get_sql_data($sql);
        // 
        // Test if there is any user that matches the email if not we return
        //false 
        if(count($users)===0){return false;}
        // 
        //If there is more than one  user we throw an exception
        if(count($users)>1){throw new Exception("More than one email found. "
                . "Check your data model");}
        //If the user exists verify the password.
        return password_verify($password, $users[0]["password"]);
    }
                
    //
    //Create a new account for the given user from first principles 
    //so that we can take charge of error reporting.
    //
    //Create a new account for the given user from first principles 
    //so that we can take charge of error reporting.
    public function register(string $email, string $password):void{
        // 
        //Create an sql/view to retrieve the password from  user table. 
        //the user with the given email 
        $sql = "select password "
                . "from user "
                . "where email= '$email' ";
        //
        //Execute the query and retrieve the password
        $users= $this->get_sql_data($sql);
        //
        //Get the entity on which to do the insert this will aid in string 
        //processing since entities and columns have their string equivalent
        $entity=$this->entities["user"];
        //
        //if no user create the user's instance
        if(count($users)===0){
            // 
            //Formulate the sql to insert from first principle 
            //insert statement 
             $smt = "INSERT \n"
                    //
                    //Get the entity to insert 
                    . "INTO  {$entity} \n"
                    //
                    //Insert the two columns email and password
                    . "("
                            . "{$entity->columns["email"]->to_str()},"
                            . "{$entity->columns["password"]->to_str()} "
                    . ")\n"
                    //
                    //Insert the given values.
                    . "VALUES ("
                         . "'{$email}','" .password_hash($password, PASSWORD_DEFAULT)."'"
                    . ")\n";
            //
            //Execute the insert query
            $this->query($smt);
            //
            //Stop any further execution 
            return;
        }
        //
        //This user exists if there 
        //
        //User exists with a null password. 
        if(is_null($users[0]["password"])){
            $stmt="UPDATE \n"
                    //
                    //Update this entity
                    . "{$entity} \n"
                    . "SET \n"
                    //
                    //Update the password from the null to the hashed version. 
                    . "{$entity->columns["password"]}='"
                        .password_hash($password, PASSWORD_DEFAULT). "'\n"
                    //
                    //Update only the given emailed user.
                    . "WHERE {$entity->columns["email"]}='$email'\n";
            //
            //execute
            $this->query($stmt);
            
            //
            //stop any futher excecution 
            return;
        }
        //
        //We have a user who has a password already 
        throw new Exception("Your email $email already exists have an account with please log in "
                . "with your password");
        
    }
    //
    //For now we do not have a need of saving an entity 
    public function write(array $alias = array()): \atom {
        throw new Exception("You cannot save a database");
    }

    //The user may decide to report the errors in a different way than just 
    //throwing an exception. For instance, if the database initialization was 
    //started from javascript, the reported errors may be input to a better 
    //reportng system than the dumbed output.
    private function report_errors() {
        //
        //Compile the error report.
        //
        //start with an empty report and no_of_errors as 0
        $no_of_errors = 0;
        $report = "";
        //
        $this->get_error_report($no_of_errors, $report);
        //
        //Save teh error report -- incase you ant to access it
        $this->error_report = $report;
        //
        //Depending on the throw_exception setting...
        if ($this->throw_exception) {
            //
            if ($no_of_errors > 0) {
                echo $report;
            }
        }
    }

    //Activate the schema objects (e.g., entities, columns, etc) associated
    //with this database
    private function activate_schema(): bool {
        //
        //Query the information information scheme once for the following data
        //
        //Activate all the entities of this database from the tables of the 
        //information
        $this->activate_entities();
        //
        //Activate all the columns of this database from the columns of the 
        //information schema
        $this->activate_columns();
        //
        //Activate all the identification inices from the statistics of the 
        //information schema
        $this->activate_indices();
        //
        //Check for Mutall model consistency, e.g., 
        //missing indices, missing primary keys, invalid data type for primary
        //keys, invalid relations
        return $this->check_model_integrity();
    }

    //
    //Check for mutall model consistency, e.g., 
    //missing indices, missing primary keys, invalid data type for primary
    //keys, invalid relations
    private function check_model_integrity(): bool {
        //
        //collection of the errors
        $errors = [];
        //
        //loop through all the entities to test the following 
        foreach ($this->entities as $ename => $entity) {
            //
            //1. indices
            if (!isset($entity->indices)) {
                //
                //Set an error message both at the database level and the entity 
                $error = new \Error("Entity $ename is incomplete and lack indexes");
                array_push($this->errors, $error);
                //
                //Ensure that the primary key is noy used for indexing.
                // $this->x();
            }
            //
            //2.missing primary keys
            if (!isset($entity->columns[$entity->name])) {
                //
                //Set an error message both at the database level and the entity 
                $error = new \Error("Entity $ename does not have the primary key");
                array_push($this->errors, $error);
            }
            //
            //Every column should have the proper credentials
            foreach ($entity->columns as $col) {
                //
                $col->verify_integrity();
                $errors += $col->errors;
            }
            //
            $errors += $entity->errors;
        }
        //
        //return true if the count og errors is greater than 0 else it is a false
        return count($errors) === 0;
    }

    //Activate all the entities of this database by querying the information schema.
    //This method needs to be overriden to extend entities, for instance, when 
    //entities in the capture namespace are created from those in the root.
    function activate_entities(): void {
        //
        //Get all the static entities from the information schema's table.
        $tables = $this->get_entities();
        //
        //Now activate the entities, indexing them as you go along
        foreach ($tables as [$dbname, $ename, $comment]) {
            //
            //Create the entity in the root namespace
            $entity = new table($ename, $dbname);
            //
            //Add fields derived from comments
            $entity->add_comments($comment);
            //
            //Push the entity object to the array to be returned
            $this->entities[$ename] = $entity;
        }
    }

    //Retyrn all th tables of this database from the nformation schema
    private function get_entities(): array/* [dbname, ename, comment][] */ {
        //
        //Let $sql be the statement for for retrieving the entities of this
        //database.
        $sql = "select "
                //    
                . "table_schema as dbname, "
                //    
                . "table_name as ename, "
                //    
                . "table_comment as comment "
                . "from "
                . "information_schema.tables "
                . "where "
                //
                //Only tables of the current database are considerd
                . "table_schema = '$this->name' "
                //
                //Exclude the views
                . "and table_type = 'BASE TABLE'";
        //
        //Execute the $sql on the the schema to get the $result
        $result = $this->pdo->query($sql);
        //
        //Retrueve the entires from the $result as an array
        $tables = $result->fetchAll();
        //
        //Return the tables list.
        return $tables;
    }

    //Activate all the columns of all the tables in this database. This can be
    //overriden, so it is public
    function activate_columns(): void {
        //
        //Get the static columns from the information schema
        $columns = $this->get_columns();
        //
        //
        foreach ($columns as [$dbname, $ename, $cname, $data_type, $default, $is_nullable, $comment, $length, $key]) {
            //
            // Return the column as primary if its key is set to PRI
            if (isset($key) && $key == 'PRI') {
                //
                //The column constrcutior variablles are desifgned to a) initialize
                //its capture parent and b) check consistency with Mutall 
                //framework
                $column = new primary($dbname, $ename, $cname, $data_type, $default, $is_nullable, $comment, $length);
            }
            //
            //Create an ordinary column. It will be upgrated to a foreinn key
            //at a later stage, if necessary.
            else {
                $column = new attribute($dbname, $ename, $cname, $data_type, $default, $is_nullable, $comment, $length);
            }
            //
            //Add fields derived from comments, i.e., offload the comment properties
            //to the column.
            $column->add_comments($comment);
            //
            //
            try {
                if(isset($this->entities[$ename])){
                   //
                   //Add the column to the database
                   $this->entities[$ename]->columns[$cname] = $column;
                }
            } catch (Exception $exc) {
                // 
                //Formulate a friendly error message.
                $msg= "Unable to add column '$cname' to table '$ename'";
                // 
                //Rethrow an exception
                throw new Exception($msg);
            
            }

            
        }
        //
        //Activate the foreign key colums
        //
        //Promote attributes to foreign keys where necessary, using the column 
        //usage of the information schema
        $this->activate_foreign_keys();
    }

    //Get all the columns for all the tables in this database
    private function get_columns(): array/**/ {
        //Select the columns of this entity from the database's information schema
        $sql = "select "
                //
                . "table_schema as dbame, "
                //
                //specifying the exact table to get the column from
                . "table_name as ename, "

                //Shorten the column name
                . "column_name as cname, "
                //
                //Specifying the type of data in that column
                . "data_type, "
                //
                //Get the default 
                . "column_default as `default`, "
                //
                //if it is nullable
                . "is_nullable, "
                //
                //Extract any meta data json information in the comments
                . "column_comment as comment, "
                //
                //The size of the collumn
                . "character_maximum_length as length, "
                //
                //The column key so as to identify the primary keys
                . "column_key as `key` "
                . "from "
                //
                //The main driver of this query
                . "information_schema.`columns` "
                . "where "
                //    
                // The table schema is the name of the database
                . "table_schema = '{$this->name}' ";
        //
        //Execute the $sql on the the schema to get the $result
        $result = $this->pdo->query($sql);
        //
        //Retrueve the entitiesfrom the $result as an array
        return $result->fetchAll(PDO::FETCH_NUM);
    }

    //Promote existing columns to foreign keys where necessary, using the column 
    //usage of the information schema
    private function activate_foreign_keys() {
        //
        //Retrieve the static foregn key columns from teh informatuion schema
        $columns = $this->get_foreign_keys();
        //
        //Use each columns to promote the matching attribute to a foreign key.
        foreach ($columns as $column) {
            //
            //Destructure the column usage data to reveal the its properties
            list($dbname, $ename, $cname, $ref_table_name, $ref_db_name, $ref_cname) = $column;
            //
            //Get the matching attribute; it must be set by this time.
            $attr = $this->entities[$ename]->columns[$cname];
            //
            //ignore all the primary columns  in this process since only attributes 
            //can be converted to foreigners
            if ($attr instanceof primary) {
                continue;
            }
            //
            //Compile the reference (database and table names)
            $ref = new \stdClass();
            $ref->table_name = $ref_table_name;
            $ref->db_name = $ref_db_name;
            $ref->cname = $ref_cname;
            //
            //Create a foreign key colum using the same attribute name
            $foreign = new foreign($dbname, $ename, $cname, $attr->data_type,
                    $attr->default, $attr->is_nullable, $attr->comment, $attr->length,
                    $ref);
            //
            //Offload the remaining options to the foreign key as local 
            //properties. (Why is this necesary???)
            mutall::offload_properties($foreign, $attr);
            //Replace the attribute with the forein key
            $this->entities[$ename]->columns[$cname] = $foreign;
        }
    }

    //Update some ordinary columns to foreign columns base on the key column 
    //usage table
    private function get_foreign_keys(): array/* [dbname, ename, cname, ref_table_name, ref_db_name][] */ {
        //
        //Set sql statement for selecting all foreign key columns of this table 
        //and database
        $sql = "select "

                // The table schema is the name of this database
                . "table_schema  as dbname, "
                //
                //specifying the exact table to get the column from
                . "table_name as ename, "
                //
                . "column_name as cname, "
                //
                //Specify the referenced table and her database
                . "referenced_table_name as ref_table_name, "
                //    
                . "referenced_table_schema as ref_db_name,"
                . "referenced_column_name as ref_cname "
                . "from "
                //
                //The main driver of this query
                . "information_schema.key_column_usage "
                . "where "
                //    
                // The table schema is the name of this database
                . "table_schema = '{$this->name}' "
                //
                //The column must be used as a relation (i.e., as a forein key) 
                . "and referenced_table_schema is not null ";
        //
        //Execute the $sql on the the schema to get the $result
        $result = $this->pdo->query($sql);
        //
        //Retrueve the entitiesfrom the $result as an array
        return $result->fetchAll();
    }

    //Activate all the identification indices from the statistics of the 
    //information schema. This can be overriden
    function activate_indices() {
        //
        //Get all the index columns for all the indices for all the entities
        //in this database
        $columns = $this->get_index_columns();
        //
        //Build the indices and thier active columns
        foreach ($columns as [$dbname, $ename, $ixname, $cname]) {
            //
            //Get the named index;
            $index = $this->entities[$ename]->indices[$ixname] ?? null;
            //
            //If it does not exist, create it
            if (is_null($index)) {
                //
                //Create a new index
                $index = new index($dbname, $ename, $ixname);
                //
                //Add the index to the entity
                $this->entities[$ename]->indices[$ixname] = $index;
            }
            //
            //Set the index column; this implies that the columns must be activated
            //before indices
            $index->columns[$cname] = $this->entities[$ename]->columns[$cname];
        }
    }

    //Get all the static index columns for all the incdices for all the entities
    //in this database
    private function get_index_columns(): array/* [][] */ {
        //
        //The sql that obtains the column names
        $sql = "select "
                //    
                . "index_schema as dbname, "
                //
                . "table_name as ename, "
                // 
                . "index_name  as ixname, "
                //  
                . "column_name as cname "
                //
                . "from "
                //
                //The main driver of this query
                . "information_schema.statistics "
                . "where "
                //    
                // Only index rows from this datbase are considerd
                . "index_schema = '{$this->name}' "
                // 
                //Identification fields have patterns like id2, identification3
                . "and index_name like 'id%'";
        //Execute the $sql on the the schema to get the $result
        //
        //
        $result = $this->pdo->query($sql);
        //
        //Retrueve the entitiesfrom the $result as an array
        return $result->fetchAll();
    }

    //Returns an error report and the number of errors it contains
    private function get_error_report(int &$no_of_errors, string &$report): void {
        //
        //Start with an empty report
        $report = "";

        //Report errors at the database level
        $count = count($this->errors);
        //
        //Compile the errors if necessary, at the database level.
        if ($count > 0) {
            //
            $report .= "\n<h2><b><u>There are $count errors in entity $this->name</u></b></h2>";
            //
            $report .= '<ol>';
            foreach ($this->errors as $error) {
                $report .= "\n <li> {$error->getMessage()} </li>";
            }
            $report .= '</ol>';
        }
        //
        //Contintue compiling to include the entity-level errors
        foreach ($this->entities as $entity) {
            //
            $entity->get_error_report($no_of_errors, $report);
        }
    }

    //Set the dependency depths for all the entities as weell as loggin any 
    //cyclic errors
    private function set_entity_depths(): void {
        //
        foreach ($this->entities as $entity) {
            $entity->depth = $entity->get_dependency();
        }
    }

    //Report errrors arising out of the activation process, rather than throw 
    //than error as it occurs
    private function report_activation_errors() {
        //
        //Get teh numbe of errors
        $count = count(self::$errors);
        //
        //There has to be at leason one error for the reporting to be done
        if ($count === 0) {
            return;
        }
        //
        $msg = "There are $count activation errors. They are:-<br/>"
                . implode(".<br/>", database::$errors);
        //
        throw new \Exception($msg);
    }

    //Populates the entities with aliens. An alien is an alised entity. Aliens 
    //were introdcuced to solve the forking problem.
    private function compile_aliens() {
        //
        //Identifying aliens and update the relational data model
        //
        //Aliens occur when an entity is referenced by more than 1 foreign column 
        //that share teh same home entity, i.e., forking
        //
        //Loop through all the entities to retrieve only the foreign columns that
        //share teh same home entity
        foreach ($this->entities as $entity) {
            //
            //Get the foreign key columns 
            $foreigners = array_filter($entity->columns, fn($column) => $column instanceof foreign);
            //
            //Get the foreigns keys that point to an enity that neess aliasing
            $candidates = array_filter($foreigners, fn($foreigner) => $foreigner->is_alien());
            //
            //Step through the candidates and convert their referenecd tables to 
            //aliens
            foreach ($candidates as $candidate) {
                //
                //The name of the alias name
                $alias_name = $candidate->name;
                //
                //Get the referenced table and database names
                $ref_table_name = $candidate->ref->table_name;
                $ref_db_name = $candidate->ref->db_name;
                //
                //Create an alien, i.e., an aliased entity
                $alien = new alien($ref_db_name, $ref_table_name, $alias_name);
                //
                //Re-route the referenced table of the candidate foriegner to the
                //alien's name
                $candidate->ref->table_name = $alias_name;
                //
                //Save the alien, i.e, alias enyoty to the entities collection.
                $this->entities[$alias_name] = $alien;
            }
            //
        }
    }

    //When you serialize a database, exclude the pdo property. Otherwise you
    //get a runtime error.
    function __sleep() {
        return ['name', 'entities'];
    }

    //Set the pdo property when the database is unserialized    
    function __wakeup() {
        $this->connect();
    }

    //
    //Returns data after executing the given sql on this database
    function get_sql_data(string $sql): array {
        //
        //Query the database using the given sql
        $results = $this->pdo->query($sql);
        //
        //Fetch all the data from the database -- indexed by the column name
        $data = $results->fetchAll(\PDO::FETCH_ASSOC);
        //
        //Return the fetched data                
        return $data;
    }
    // 
    //Retrieves the account datails of the specified account
    function accounting(string $accname):array{
    $sql ="SELECT"
            ."`transaction`.`date` as `date` ," 
            ."`transaction`.`ref` as `ref_num` ,"
            ."`je`.`purpose` as `purpose` ,"  
             ."'' as dr ," 
            ."`je`.`amount` as cr "
        ."From `credit` \n"
            ." inner join `je` on `credit`.`je`= `je`.`je`
            inner join `transaction` on `transaction`.`transaction`= `je`.`transaction`
            inner join account on `credit`.account= `account`.account "
        //
        //specify the account under study
        ."WHERE `account`.id ='$accname' "
        //--
        //--join the sqls
        ." union "
        //--
        //--The sql that derives all the debited je 
        ." SELECT"
            ."`transaction`.`date` as `date` , 
           `transaction`.`ref` as `ref_num`,
           `je`.`purpose` as `purpose`,  
           `je`.`amount` as dr,
            '' as cr "
        ." From `debit` "
            ." inner join `je` on `debit`.`je`= `je`.`je`
            inner join `transaction` on `transaction`.`transaction`= `je`.`transaction`
            inner join account on `debit`.account= `account`.account "
        // --
        //--the account under study.
        ."WHERE `account`.id ='$accname'";
    return $this->get_sql_data($sql);
    
    }

    //
    //Returns a complete database structure, .i.e one that is populated with 
    //entities and columns
    //We return an any because we do not wish to check the structure of our data  
    function export_structure(): database {
        return $this;
    }

    //Turns off autocommit mode. Hence changes made to the database via $this->pdo
    //are not committed until you end the transaction by calling $this->commit()
    //or $this->rollBack
    function beginTransaction(): void {
        $this->pdo->beginTransaction();
    }

    //Save the changes made to the database permanently 
    function commit(): void {
        $this->pdo->commit();
    }

    //Roles back the current transaction. i.e avoid commiting it permanently 
    //to the database.Please note this function is only effective if we had begun
    // a transaction
    function rollBack(): void {
        $this->pdo->rollBack();
    }

    //Overrding the query method so that it can be evoked from JS. We use this
    //qiery method for sqls that dont return a result
    function query($sql): int{
        //
        //Execute the sql to get a pdo statement
        $stmt= $this->pdo->query($sql);
        //
        //Return the number of the deleted records 
        return $stmt->rowCount();   
    }

    //Set the PDO property of this database; this links the mutall database 
    //model to the PHP vesrion.
    private function connect() {
        //
        //Formulate the full database name string, as required by MySql. Yes, this
        //assumed this model is for MySql database systems
        $dbname = "mysql:host=localhost;dbname=$this->name";
        //
        //Initialize the PDO property. The server login credentials are maintained
        //in a config file.
        $this->pdo = new PDO($dbname, config::username, config::password);
        //
        //Throw exceptions on database errors, rather thn returning
        //false on querying the dabase -- which can be tedious to handle for the 
        //errors 
        $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        //
        //Prepare variables (e.g., current and userialised) to support the 
        //schema::open_databes() functionality. This is designed to open a database
        //without having to use the information schema which is terribly slow.
        //(Is is slow wor badly written? Revisit the slow issue with fewer 
        //querying of the information schema)
        //Save this database in a ready, i.e., unserialized,  form
        database::$current[$this->name] = $this;
        //
        //Add support for transaction rolling back, if valid. See the 
        //\capture record->export() method
        if (isset(schema::$roll_back_on_fatal_error) && schema::$roll_back_on_fatal_error) {
            $this->pdo->beginTransaction();
        }
    }

    //Returns a json string of this database structure 
    function __toString() {
        //
        //Encode the database structure to a json string, throwing exception if
        //this is not possible
        try {
            $result = json_encode($this, JSON_THROW_ON_ERROR);
        } catch (Expection $ex) {
            $result = mutall::get_error($ex);
        }
        //
        return $result;
    }

    //Returns the primary key value of the last inserted in a database.
    //Remember that pdo is prrotected, and so cannot be accessed directly
    function lastInsertId() {
        return $this->pdo->lastInsertId();
    }

}

//
//Class that represents an entity. An entity is a schema object, which means 
//that it can be saved to a database.
abstract class entity extends schema implements expression {

    //
    //represents a database table
    //designed to be called from javascript
    // The entity constructor requires:- both mandatory
    // a) the entity name 
    // b) the parent database name 
    function __construct(string $name, string $dbname) {
        //
        //The partial name of this entity is 
        $partial_name = $dbname . "_" . $name;

        parent::__construct($partial_name);
        $this->name = $name;
        $this->dbname = $dbname;
    }

    //Returns the columns of this entity
    public function columns(): array/* column[cname] */ {
        $dbase = $this->open_dbase($this->dbname);
        return $dbase->entities[$this->name]->columns;
    }

    
    //
    //This is the string represention of this table 
    public function to_str(): string {
        return "`$this->dbname`.`$this->name`";
    }

    //Returns an error report and the numbet\r of errors it contains
    function get_error_report(int &$no_of_errors, string &$report): void {
        //
        //        
        $count = count($this->errors);
        $no_of_errors += $count;
        //
        //Compile the errors if necessary, at the database level.
        if ($count > 0) {
            //
            $report .= "\n<h2><b><u>There are $count errors in entity $this->partial_name</u></b></h2>";
            //
            $report .= '<ol>';
            foreach ($this->errors as $error) {
                $report .= "\n <li> {$error->getMessage()} </li>";
            }
            $report .= '</ol>';
        }
        //
        //Report column errors
        foreach ($this->columns as $column) {
            //
            $column->get_error_report($no_of_errors, $report);
        }
    }

    //Returns the string version of this entity as an sql object for use in array
    //methods.
    function __toString(): string {
        return $this->to_str();
    }

    //
    //An entity yields iself
    function yield_entity(): \Generator {
        yield $this;
    }

    //The attributes that are associated with an entity are based on its columns:-
    function yield_attribute(): \Generator {
        foreach ($this->columns as $col) {
            if ($col instanceof attribute)
                yield $col;
        }
    }

    //Returns foreign key columns (only) of this entity. Pointers are exccluded 
    //beuase they take time to build and may not always be required at the same
    //time with forein keys. The resulst of theis functi should not be buffred
    //bacsuse with the addition of views in our model, the structure of the 
    //database can change at run time.
    function foreigners(): \Generator/* foreigner[] */ {
        //
        //
        foreach ($this->columns as $col) {
            if ($col instanceof foreign) {
                yield $col;
            }
        }
    }

    //
    //yield only the structural foreigners
    function structural_foreigners(): \Generator/* foreigner[] */ {
        //
        //
        foreach ($this->columns as $col) {
            if ($col instanceof foreign) {
                //
                //
                if ($col->away()->reporting()) {
                    continue;
                }
                yield $col;
            }
        }
    }

    //Returns an array of pointers as all the foreigners that reference this 
    //entity. Simolar to foreigensrs(), output of this function cannot be 
    //buffered, because, with abiliy to add view to the database, the pointers 
    //of an entity can change
    function pointers(): \Generator/* pointers[] */ {
        //
        //The search for pinters will be limited to the currently open
        // databases; otherwise we woulud have to open all the databse on the 
        //server.
        foreach (database::$current as $dbase) {
            foreach ($dbase->entities as $entity) {
                foreach ($entity->foreigners() as $foreigner) {
                    //
                    //A foreigner is a pointer to this entity if its reference match
                    //this entity. The reference match if...
                    if (
                    //...database names must match...
                            $foreigner->ref->db_name === $this->dbname
                            //
                            //...and the table names match
                            && $foreigner->ref->table_name === $this->name
                    ) {
                        //
                        //Create a pointer 
                        yield new pointer($foreigner);
                    }
                }
            }
        }
    }

    //
    //yields only the structural pointers
    function structural_pointers(): \Generator/* pointers[] */ {
        //
        //The search for pinters will be limited to the currently open
        // databases; otherwise we woulud have to open all the databse on the 
        //server.
        foreach (database::$current as $dbase) {
            foreach ($dbase->entities as $entity) {
                //
                //remove all reporting entities
                if ($entity->reporting()) {
                    continue;
                }
                //
                //
                foreach ($entity->structural_foreigners() as $foreigner) {
                    //
                    //remove all the foreigners that reference to the reporting entities
                    if ($foreigner->away()->reporting()) {
                        continue;
                    }
                    if ($foreigner->home()->reporting()) {
                        continue;
                    }
                    //
                    //A foreigner is a pointer to this entity if its reference match
                    //this entity. The reference match if...
                    if (
                    //...database names must match...
                            $foreigner->ref->db_name === $this->dbname
                            //
                            //...and the table names match
                            && $foreigner->ref->table_name === $this->name
                    ) {
                        //
                        //Create a pointer 
                        yield new pointer($foreigner);
                    }
                }
            }
        }
    }

    //returns true if the entity is used for  reporting 
    function reporting() {
        //
        //Check if the purpose is set at the comment
        if (isset($this->purpose)) {
            //
            //Return the repoting status
            return $this->purpose == 'reporting';
            //
            //else return a false 
        }
        return false;
    }

    //
    //Updates the registry both the current record and the logbook
    function update_registry(array $alias, expression $exp) {
        //
        //Update the expressions in the current record.
        record::$current[$this->dbname][$this->name][$alias][$this->name] = $exp;
        //
        //Update the bookings in the logbook.
        record::$booked->put([$this->dbname, $this->name, $alias], $exp);
    }

    //Yield all the parts of a friendly column. Each part is derived from 
    //an identifier attributes.Every entity has its own way of generating 
    //friendly columns
    function get_friendly_part(): \Generator {
        //
        //Loop through all the columns of this entity, yielding its 
        //friendly components i.e., friendly columns, with a slash 
        //separator
        foreach ($this->columns() as $col) {
            //
            //A column is friendly if...
            //
            //1. ... it is an identification attribute or ... 
            if ($col->is_id() && $col instanceof attribute
                    //
                    //Ignore the is_valid column
                    && $col->name !== "is_valid") {
                yield $col;
            }
            //
            //2. ...it is a mandatory column named as: description, name, title or ...
            elseif ($col->is_nullable==="NO" && $col->is_descriptive()) {
                yield $col;
            }
            //
            //3. ...it is a  identification foreign key.
            elseif ($col->is_id() && $col instanceof foreign) {
                yield from $col->away()->get_friendly_part();
            }
        }
    }

    //Returns the mandatory columns of this entity as ids i.e those not nullable 
    //and those used as ids as a record to be saved 
    function get_id_columns(): array {
        //
        //begin with an empty array of the mandatory columns to be inserted
        $ids = [];
        //
        //1. loop through the column of this entity to add all the columns 
        //which are not nullable and those that are used as ids in this 
        foreach ($this->columns as $column) {
            //
            //filter those not nullable
            if ($column->is_nullable === 'NO') {
                $ids[$column->name] = $column;
            }
            //
            //filter the id columns
            if ($column->is_id()) {
                $ids[$column->name] = $column;
            }
        }
        //
        //
        return $ids;
    }

    //
    //Returns a true if the data provided for an update contains all the needed 
    //identification record or an error message indicating the column name of
    //the data that was not provided 
    function is_data_valid()/* a true or error string is returned */ {
        //
        //Get the columns to be inserted 
        $cnames = array_keys(record::$current->getArrayCopy());
        //
        //1. loop through the column of this entity to ensure that all the columns 
        //which are not nullable are included in the cnames else return a error
        //and those that are used as ids 
        foreach ($this->columns as $column) {
            //
            //proceed with the loop if this column name is included 
            if (in_array($column->name, $cnames)) {
                continue;
            }
            //
            //if the column is not nullable throw are exception is not found in 
            //enames 
            if ($column->is_nullable === 'NO') {
                //
                //return the message that this column has to be set 
                return "New record was not saved because The $column->name is a "
                        . "mandatory data and has to be provided for this data to be valid";
            }
        }
        //
        //2.0 loop through the cnames to ensure that all those columns exist 
        foreach ($cnames as $cname) {
            if (!array_key_exists($cname, $this->columns)) {
                return "the column $cname does not exist please check your spellings";
            }
        }
        //
        //
        return true;
    }

    //Returns the source entity taking care 
    function get_source(): string {
        //
        if (isset($this->alias_name)) {
            return "$this->alias_name";
        }
        return "$this->name";
    }

    //returns a valid sql string from expression
    function fromexp(): string {
        //
        if (isset($this->alias_name)) {
            $str = "`$this->alias_name` as";
        } else {
            $str = '';
        }
        return "$str `$this->name`";
    }

    //returns a valid sql column representation of the primary column this method 
    //is overidden because an alien violates the rule that the primary column
    //of an entity has the same name as the entity 
    function get_primary(): string {
        //
        if (isset($this->alias_name)) {
            $str = ".`$this->alias_name`";
        } else {
            $str = '';
        }
        return "`$this->name`$str";
    }

}

//
//The class models an actual table on the database it extends 
//an entity by including the indexes an a dependancy
class table extends entity {

    //
    //The relation depth of this entity. The defeault is 0; 
    public ?int $depth = null;
    //
    //The json user information retrieved from the comment after it was decoded  
    public $comment;
    //
    //Defining the array $induces that is used to store the indexed columns 
    //from the function get_induces 
    public $indices;

    //
    //represents a database table
    //designed to be called from javascript
    // The entity constructor requires:- both mandatory
    // a) the entity name 
    // b) the parent database name 
    function __construct(string $name, string $dbname) {
        parent::__construct($name, $dbname);
    }
    //
    //Writing of an entity into the database is modeled as an interview 
    //for hiring drivers.
    function write(array $alias = []): expression {
        //
        //Indices for the registry 
        $dbname = $this->dbname;
        $ename = $this->name;
        //
        //Old_guards/crudees these are the drivers with a valid 
        //licence that have not been booked by us.
        //A driver is an old guard if...
        if (
        //
        //...he is registered...
                isset(record::$current[$dbname][$ename][$alias][$ename])
                 // 
                //...and legitimately set ...
                && (!record::$current[$dbname][$ename][$alias][$ename] instanceof null_)
                //
                //... and not booked...
                & !record::$booked->hasKey([$dbname, $ename, $alias])
                //
                //... and the licence must be valid
                && ($licence = record::$current[$dbname][$ename][$alias][$ename])
                    instanceof literal
        ) {
            //
            //Update the structural, i.e., non-cross members (hence the false
            //parameter in the follwing update method).
            $new_licence = $this->update_cross_members($licence, $alias,  false);
            //
            //Update both the pot and the logbook
            $this->update_registry($alias, $new_licence);
            //
            return $new_licence;
        }
        //
        //A driver is booked if he exists in the log book
        if (record::$booked->hasKey([$dbname, $ename, $alias])) {
            //
            //Return the booked expression 
            return record::$booked->get([$dbname, $ename, $alias]);
        }
        //
        //Make sure that this table's indices isset otherwis throw an exeception
        if(!isset($this->indices)){
            throw new myerror("Insufficient data to define any index of table '$this->name'");
        }
        //
        //Investigation: 
        //Use the drivers papers to investigate  whether he is competent or 
        //not 
        $results/* Array<exp> */ = array_map(fn($paper) => $paper->save($alias),
                $this->indices);
        //
        //Select the valid papers
        $valids = array_filter($results, fn($result) => $result instanceof literal);
        //
        //Extract the alien driver 
        //A driver is an alien if he has no valid paper
        if (count($valids) === 0) {
            //
            //Compile the error to return 
            $exp = new myerror("No valid index found for table '{$this->name}'"
                . " because one or more identification "
                . "columns is missing or oversized");
            //
            //Update the registry 
            $this->update_registry($alias, $exp);
            //Return the expression
            return $exp;
        }
        //
        //Get and clean the licences
        $dirty_licences = array_map(fn($paper) => $paper->value, $valids);
        //
        //Clean them 
        $licences = array_unique($dirty_licences);
        //
        //Count the clean licences
        $no = count($licences);
        //
        //Fraud:
        //A driver is a fraud if his papers resolve to mutiple licences      
        if ($no > 1) {
            //
            //Compile the inconsistency error (multiple pk error)
            $exp = new myerror("$no Primary key found associated with this entity"
                    . " $this->name consider merging");
            //
            //Update the registry 
            $this->update_registry($alias, $exp);
            //
            //Return the expression
            return $exp;
        }
        //
        //Get the licences obtained  by inserting 
        $inserts = array_filter(
                $valids, fn($licence) => isset($licence->type) && $licence->type === 'insert'
        );
        //
        //Post_graduate 
        //A driver is a post graduate if one of his valid licences is an insert 
        if (count($inserts) > 0) {
            //
            //update the registry
            $this->update_registry($alias, $this->get_ith_element($inserts, 0));
            return $this->get_ith_element($inserts, 0);
        }
        //
        // A driver is an under graduate if there are no inserts 
        if (count($inserts) === 0) {
            //
            //update the driver's structural columns i.e., none cross members
            $exp = $this->update_cross_members($this->get_ith_element($valids, 0), $alias, false);
            //
            //Update the registry with this expression
            $this->update_registry($alias, $exp);
            //
            return $exp;
        }
        //
        //Make peace with the compiller 
        throw new Exception("Unusual entity write situation");
    }


    //
    //This is the string represention of this table 
    public function to_str(): string {
        return "`$this->dbname`.`$this->name`";
    }
    
    //
    //Get the friendly component of the given primary key.
    function get_friend(int $pk): string {
       //
       //Formulate a selector sql based on this table
       $selector = new selector($this->name, $this->dbname);
       //
       //Formulate a view based on the selector and the primary 
       //key criteria
       // 
       //Formulate the criteria 
       $criteria= new binary($this->columns[$this->name], "=",new literal($pk));
       //
       //Compile the view, usng...
       $view = new view(
               //
               //This table as the subject
               $this, 
               //
               //The only column in teh view is the friendly id of the selector
               [$selector->columns["id"]],
               //
               //The join is teh same as that of the selector
               $selector->join, 
               //
               //No need for naming this view
               "noname",
               //
               //Add the email criteria
               $criteria
           );
        // 
        //Execute the view to get the friendly component
        $sql =$view->stmt();
        // 
        //Open a database 
        $dbase = $this->open_dbase($this->dbname);
        // 
        //Retrieve the data. 
        $data= $dbase->get_sql_data($sql);
        // 
        //We expect one row of data unless something went wrong
        if(count($data) !==1){
            throw new Exception("The following sql did not yield one row "
                    . "of data '$sql'");
        }
        // 
        //Extract and return the friendly component; its the id
        //column of the first row.
        //
        return $data[0]["id"];
       
    }


    //
    //Returns the friendly name of the given primary key 
    function get_friendly_name(int $pk): string {
        //
        //Create the selector view
        $selector = new selector($this->name, $this->dbname);
        //
        //Modify the selecctor statement using the given primary key
        //
        //Formulate the query extension
        $where = " where `$this->name`.$this->name`= $pk";
        $sql = $selector->stmt() . $where;
        //
        //Execute the sql statement to get a result 
        $result = $this->open_dbase($this->dbname)->get_sql_data($sql);
        //
        //There should only one record 
        if (count($result) !== 1) {
            $str = json_encode($result);
            throw new Exception("Invalid friendly name result $str");
        }
        //
        //Return the sting friend.
        return result[0]["friend"];
    }

    //
    //Returns the "relational dependency". It is the longest identification path 
    //from this entity. 
    //The dependency is the count of the target involed in the join of this view
    //based on the dependecy network i.e(the path whose join return the highest 
    //number of targets is the join);
    //how to obtain the dependency 
    //1. test if it is already set inorder to trivialise this process
    //2. Create a dependecy network with this entity as its source
    //3. Using the dependency network create a join from it 
    //4. count the number of targets in the join 
    function get_dependency(): ?int {
        //
        //1. Test if the dependecy was set to trivilalize this process
        if (isset($this->depth)) {
            return $this->depth;
        }
        //
        //2. Create a dependecy network with this entity as its source
        //To create this network we need the foreign strategy 
        $dependency = new dependency($this);
        //
        //3.create a join using the dependency network 
        $join = new join();
        $join->import($dependency);
        //
        //Execute the network using the current option for throeing execption
        //to establish the actual paths and join
        $join->execute();
        //
        //Check for an network building erreos, including, cyclic loops
        $this->errors += $dependency->errors;
        //
        //If there are errors return a null
        if (count($dependency->errors) > 0) {
            return null;
        }
        //
        //4. count the number of targets in the join 
        return count($join->targets->keys());
    }

    //
    //
    ///Update this entity given the primary key and the columns 
    //all of which are optional. The points to note are:-
    //1. Any error raised during this process will be reported as a warning.
    //2. The returned expresion is either a literal or a warning
    function update_cross_members(literal $pk, array $alias, bool $is_cross): expression {
        //
        //Prepare to collect warning messages
        $msgs = [];
        //
        //1. Compile the set clause of the update statement
        //
        //Begin with an empty set clause
        $set = [];
        // 
        //A column should not be considered for update if...
        $defaulted=fn($col)=>
           // 
           //...There is no user supplied data associated with it.
           !isset(record::$current[$this->dbname][$this->name][$alias][$col->name])
           //
           //... and it is a attribute 
           && $col instanceof attribute
           //
           //...with a predefined default value.
           &! is_null($col->default);
        
        //
        //Write the members to the database.
        //
        //Get all the columns to take part in this update. They should:-
        $columns = array_filter($this->columns(), fn($col) =>
            //
            //Match the cross input paremeter
            $col->is_cross_member() === $is_cross
            //
            //and should exclude primary keys, as these never get
            //written.
            &! $col instanceof primary
            // 
            //Discard defaulted attributes 
            &! $defaulted($col)
        );
        //
        //Save the update columns; there may be errors hence the dirty 
        //description
        $dirty_exps = array_map(fn($col) => $col->save($alias), $columns);
        //
        //Clean the expressions to remove all the errors
        $exps = array_filter($dirty_exps, fn($exp) => !($exp instanceof myerror));
        //
        //Continue only if valid cases is not empty
        if (count($exps) === 0) {
            return $pk;
        }
        //
        //Loop through the indexed array of exps pairing the cname with its
        // respective value, e.g., name='kamau'
        foreach ($exps as $cname => $literal) {
            array_push($set, "`$cname` = {$literal->to_str()}");
        }
        //
        //implode them with a , separator
        $str_set = implode(',', $set);
        //
        //2. Construct the full update statement
        //3. Execute the update (if it is necessary)
        try {
            //
            //This is an update statement 
            $stmt = "UPDATE \n"
                    //
                    //Update this entity
                    . "`{$this->name}` \n"
                    . "SET \n"
                    //
                    //get the values as key values pairs 
                    . "$str_set \n"
                    //
                    //The joins, if any for now there are no joins 
                    //
                    //the where condition is that the primary value is equal to the 
                    //primary column
                    . "WHERE `{$this->name}`={$pk->to_str()}\n";
            //
            //execute
            $this->open_dbase($this->dbname)->query($stmt);
        }
        //
        catch (Exception $ex) {
            //
            return new myerror($ex->getMessage());
        }
        //
        return $pk;
    }

}

//
//Models an alias of an entity
class alien extends table {

    //
    public $alias_name;

    //
    function __construct(string $dbname, string $ename, string $alias_name) {
        //
        //The alias name is the name of the parent entity 
        $this->alias_name = $ename;
        //
        parent::__construct($alias_name, $dbname);
        //
        //activate the columnns of this alien this is inorder to receate the parent 
        //columns rerouting them to this new alien 
        $this->activate_columns();
        //
        //activate the indices too of the parent to re route them 
        $this->activate_indices();
    }

    //
    //recreates the columns of the parent 
    function activate_columns() {
        //
        //Get the parent entity 
        $dbase = $this->open_dbase($this->dbname);
        $entity = $dbase->entities[$this->alias_name];
        //
        foreach ($entity->columns as $cname => $column) {
            //
            //Depending on a column's class name......
            switch ($column->class_name) {
                case 'attribute':
                    //
                    //Create am attribute column
                    $alien_column = new attribute($this->dbname, $this->name, $column->name, $column->data_type,
                            $column->default, $column->is_nullable, $column->comment, $column->length);
                    break;
                case 'foreign':
                    $alien_column = new foreign($this->dbname, $this->name, $column->name,
                            $column->data_type, $column->default, $column->is_nullable,
                            $column->comment, $column->length, $column->ref);
                    break;
                case 'primary':
                    $alien_column = new primary($this->dbname, $this->name, $column->name,
                            $column->data_type, $column->default, $column->is_nullable,
                            $column->comment, $column->length);
                    break;
                default:
                    throw new \Exception("Column of class $this->class_name is not known");
            }
            //
            //Offload any other root column property to the caputured version
            mutall::offload_properties($alien_column, $column);
            //
            //Place the capured column to its proper home
            $this->columns[$cname] = $alien_column;
        }
    }

    //
    //activate the indices of this alien inorder to reroute them 
    function activate_indices() {
        //
        //Get the parent entity 
        $dbase = $this->open_dbase($this->dbname);
        $entity = $dbase->entities[$this->alias_name];
        //Loop through all the entity indies to access the index columns
        foreach ($entity->indices as $ixname => $root_index) {
            //
            //Create the capture index
            $col_index = new index($this->dbname, $this->name, $ixname);

            //Loop through the root index columns to access the column name
            foreach (array_keys($root_index->columns) as $cname) {
                //
                //Set the index column to match those of this database
                $col_index->columns[$cname] = $this->columns[$cname];
            }
            //
            //Add the captured index to the entity indices
            $this->indices[$ixname] = $col_index;
        }
    }

}

//
//Models the sql of type select which extends an entity, so that it can take part
//in the database model. To resolve the root entity requires the inclusion of a
//config file in the main application.
class view extends entity {

    //
    //Defining the instance of a child class column that feed the entity with more 
    //properties popilated by the function get column()
    public $columns;
    //
    //The criteria of extracting information from the from an entity as a 
    //boolean expression.
    public ?expression $where;
    //
    //The from clause of this view is an entity.  
    public entity $from;
    //
    //Has the connection on the various entities which are involved in this sql
    public ?join $join;
    //
    //Other clasuses of an sql that teh user can provide after a view is creatred
    public ?string $group_by = null;

    //We dont expext to callt this constructor from Js, because the data types 
    //are not simple
    function __construct(
            entity $from,
            //
            //An array of named expressions, i.e., fields    
            array /* <field> */$columns,
            //    
            //The join that this view uses to access/define its data
            join $join,
            //
            //The name of the view    
            string $name,
            expression $where = null,
            //
            //Indicate whether this view should be incorporated in the 
            //data model or not. By default views will be discarded as soon as 
            //we get out of scope
            bool $is_modelled = false
    ) {
        //
        //Properties are saved directly since this class is not callable from 
        //javascript
        $this->from = $from;
        $this->join = $join;
        $this->where = $where;
        //
        //The columnsn of a view are expected to be fields, i.e., named 
        //expresions. We use the name to index the columns.
        $keys = array_map(fn($field) => $field->name, $columns);
        $this->columns = array_combine($keys, $columns);
        //
        //An entity parent requires both the ename and the 
        //dbname.
        parent::__construct($name, $from->dbname);
        //
        //If this view participates in the data model then add it
        if ($is_modelled) {
            $dbase = $this->open_dbase($this->dbname);
            $dbase->entities[$name] = $this;
        }
    }

    //
    //The short form of identifying a view
    function id(): string {
        return "`$this->dbname`.`$this->name`";
    }

    //Yield the trivial entity in this view includes all the target entites involved 
    //in this join
    function yield_entity(): \Generator {
        foreach ($this->join->targets->keys() as $entity) {
            yield $entity;
        }
    }

    //
    //Yields the columns in that are involved in this view useful for editing a none
    //trivial view(sql).
    function yield_attribute(): \Generator {
        //
        //Loop through the columns in this view and yield them all 
        foreach ($this->columns as $column) {
            //
            if ($column instanceof attribute)
                yield $column;
        }
    }

    //Executes the sql to return the data as an double array. At this point, we 
    //assume that all the view constructor variables are set to their desired
    //values. This is clearly not true for extensions like editor and selector. 
    //They must override this method to prepare the variables before calling
    //this method.
    function execute()/* value[][cname] */ {
        //
        //Extend the sql statement Of this view using the given where and order 
        //by clauses.
        //
        //Test if extending the where is necesary or not
        if (isset($this->where_ex)) {
            //
            //It is necessary to extend the where clause (ithe extension is 
            //provided).
            //
            //Test if a where clause already exists for this viewor not.
            if (!is_null($this->where)) {
                //
                //There already exists a where clause.
                //
                //Extend it.
                $where_str = "$this->where AND $this->where_ex";
            } else {
                //
                //There is no where clause in this view.
                //
                //Insert one.
                $where_str = "WHERE $this->where_ex";
            }
        } else {
            //
            //Extending the where clause is not necessary
            //
            //Return an empty string
            $where_str = '';
        }
        if (!isset($this->order_by)) {
            $this->order_by = "";
        }
        //
        //Compile the complete sql.
        $sql = "{$this->stmt()} \n$where_str \n$this->order_by";
        //
        //Get the current database, guided by the database name of the from 
        //clause
//        $dbase= database::$current[$this->from->dbname];
//        //
//        //Execute the $sql to get the $result in an array 
//        $array = $dbase->get_sql_data($sql);
        //
        //Return the array 
        return $sql;
    }

    //Displays the sql results. This useful for running tests in php, i.e., 
    //without having to rely on javsacript to do the viewing
    //The user is responsible for compiling valid clauses for the where and 
    //order by extensions of the this view's sql statement.
    function show(string $where = "", string $order_by = ""): string {
        //
        //Note the extension to avoid overriting the where clasus expression
        $this->where = $where;
        //
        $this->order_by = $order_by;
        //
        //Execute this sql 
        $array = $this->execute();
        //
        //Get the field members 
        $fields = $this->fields->members;
        //
        //Ouptut a table
        $html = "<table name='{$this->entity->name}'>";
        //
        //Echo the header row
        $html .= $this->show_header();
        //
        //Loop through the array and display the results in a table 
        foreach ($array as $row) {
            //
            //This is a one field result
            $html .= "<tr>";
            //
            //Step through the fields
            foreach ($fields as $fname => $field) {
                //
                //Get the field value
                $value = $row[$fname];

                $html .= $field->show($value);
            }
            $html .= "</tr>";
        }
        $html .= "</table>";
        //
        //
        return $html;
    }

    //Returns the standard string representation of a select sql statement
    public function stmt(): string {
        //
        //Ensure that each view constructor argument is set. If not we will 
        //assume the default values.
        //
        //If the fields are not set, then use all of those of the 'from' clauas
        if (is_null($this->columns)) {
            $this->columns = $this->from->columns;
        }
        //
        //Note the real value of the to_str() method. The __toString() will not
        //do!
        $columns_str = implode(",", array_map(fn($col) => $col->to_str(), $this->columns));
        //
        //If the join is not set, then assume none
        $join = is_null($this->join) ? '' : $this->join->stmt();

        //Compile the where clause in such a way that exra conditions can
        //be added at query time. For better performance, the where clause is 
        //ommited all togeher if not required
        $where = is_null($this->where) ? '' : "WHERE {$this->where->to_str()}";
        //
        //The opening and closing brackets of the from clause are required by 
        //view only. Let $b be teh set of brackets
        $b = $this->from instanceof entity ? ['', ''] : ['(', ')'];
        //
        //Geth the from expression
        $fromxp = $this->from instanceof view ?
                $this->from->stmt() : $this->from->to_str();
        //
        //Add the group by if necessary
        $group = is_null($this->group_by) ? '' : "group by $this->group_by";
        //
        //Construct the sql (select) statement. Note use of the alias. It allows 
        //us to formulate a genealised sql that is valid for both primary
        //and secondary entities, i.e, views. For instance, let $x be a primary 
        //entity or view. The generalised sql is:-
        //
        //select * from $x as $x->name
        //
        //If $x is bound to the primary entity say, e.g., 'client', the final 
        //sql would be:-
        //
        //select * from client as client ....(1)
        //
        //Note that this is verbose, because of 'as client',  but correct. 
        //
        //However if $x is bound to a view named, say, test and whose sql is, e.g.,
        //
        // select name from account 
        //
        //the required sql should be:-
        //
        //select * from (select name from payroll) as test.
        //
        //The opening and closing brackets are valid for views only as it is 
        //illegal to say 
        //
        //select * from (client) as client
        //
        //in statement (1) above. Hence thh brackets are conditional.
        $stmt = "SELECT \n"
                //
                //List all the required fields
                . "$columns_str \n"
                . "FROM \n"
                //
                //Use the most general form of the 'from' clause, i.e., one with
                //conditional brackets and a valid AS phrase
                . $b[0] . $fromxp . $b[1] . "\n"
                //
                //Add the joins, if any.
                . "{$join}\n"
                //
                //Add the where clause, if necessary    
                . $where
                //
                //Group by            
                . $group;
        //
        //Return the complete sttaement        
        return $stmt;
    }

    //ITS YOUR RESPINSIBILITY TO MAKE SURER THE SQL STATEMENT YIELDS A SCALAR
    function to_str(): string {
        return "({$this->stmt()}) as `{$this->name}` ";
    }

    //
    //sets the default of fields of this view to be either 
    //1. The fields of a from if the from is another view 
    //2. The columns of the from if the from is a root entity 
    protected function set_default_fields(): void {
        //
        $this->columns = $this->from->columns;
    }

    //Echoes the label format of data
    private function show_label($array) {
        //
        //Get the fields 
        $fields = $this->fields->get_array();
        //
        //Ouptut a table
        echo "<div name='{$this->entity->name}'>";
        echo $this->header();
        //
        //Loop through the array and display the results in a table 
        foreach ($array as $row) {
            //
            //Step through the columns
            foreach ($fields as $field) {
                //
                //Get the indexes of the field
                $name = is_null($field->alias) ? $field->column->name : $field->alias;
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
    private function show_header() {
        //
        //Get the fields in this sql 
        $cols = $this->fields->get_array();
        //
        //Loop through the fields and display the <tds>
        foreach ($cols as $col) {
            //
            $name = is_null($col->alias) ? $col->to_str() : $col->alias;
            echo "<th>$name</th>";
        }
    }

}

//
//Models the index of an entity (needed for unique identification of database 
//entries) as a schema object. That means that it is capable of writing to a 
//database
class index extends schema {

    //
    //Saves the column names obtained by this index name
    public $columns = [];

    //
    //The constructor requires three mandatory parameters 
    //1. dbname the name of the database 
    //2. ename which is the name of the entity this index belongs to 
    //3. The name of the index 
    function __construct(string $dbname, string $ename, string $ixname) {
        //
        //bind the parameters 
        $this->dbname = $dbname;
        $this->ename = $ename;
        $this->ixname = $ixname;
        //
        //construct the parent, using a partial name that includes the entity 
        parent::__construct("$ename.$ixname");
    }

    //Returns the string version of this index ???? 
    function to_str(): string {
        return "`$this->ename`";
    }

    //Returns the ename of this index???????
    function get_ename(): string {
        return "`$this->ename`";
    }

    //Define the entities of this index as a function. This cannot be defined
    //as a propertu because of recurssion during serialization.
    function entity() {
        //
        //Open the database of the this index
        $dbase = $this->open_dbase($this->dbname);
        //
        //Retrive the entity mathing this indx
        $entity = $dbase->entities[$this->ename];
        //
        //Return it.
        return $entity;
    }

    //Save the current record using this index. The alias indicates 
    //which among the multiple records referenced by this entity is 
    //to be saved.
    //
    //This proceeds by saving every column in this index, returning 
    //a status.The status is (an exression that is) either erroneous,
    // insert or update.
    // 
    //If any column is erroneous, this index cannot be used for saving;
    //otherwise we use use the index columns to either insert or update 
    //this record.
    function write(array $alias = []): expression {
        //
        //Save the index columns to the database, i.e., save all the 
        //individual columns of this index.
        $statuses = $this->write_columns($this->columns, $alias);
        //
        //Test if this index is valid to save the current record. An index is
        //invalid if at least one of its columns has an erroneous status 
        if (count($statuses['invalids']) > 0) {
            $col_str = implode(',', array_keys($statuses['invalids']));
            //
            //At least one indding column is erronoeus. The index is unusable.
            return new myerror("Unusable index: at least one of "
                    . "its cloumns is erroneous i.e $col_str");
        }
        //
        //Compile the where clause needed for testing if we need to do an update 
        //or an insert using this index 
        //
        //The where is an array of "anded" conditions based columns of this index.
        //
        //Stating with an empty list of "ands"...
        $condition = [];
        //
        //...build the where conditions.
        foreach ($statuses['valids'] as $cname => $exp) {
            //
            //Create a where clause in the form, e.g., "`ename`.`cname`= '1'";
            $condition = "`$this->ename`.`$cname`={$exp->to_str()}";
            //
            //push the new "where" into the array
            $conditions[] = $condition;
        }
        //
        //Stringify the where array in order to formulate a complete where 
        //clause string 
        $where = implode(' and ', $conditions);
        //
        //Try retrieve the primary key of this record based on this index
        //
        //Get the entity to save, taking care of aliens. It is the "from" clause
        //of a select statement
        $entity = $this->entity();
        $from = $entity->fromexp();
        //
        //Get the primary column of the given entity not known in advance since 
        //the entity can be an alien which is derived diferently from an entity 
        $primary = $entity->get_primary();
        //Formuate tehsql statement to test for existence of abscence of a record
        $smt = "select $primary from $from where $where";
        //
        //Execute the select statement to obtain the key if the record exists (or
        //none if it does not)
        $result = database::$current[$this->dbname]->get_sql_data($smt);
        //
        //If no record was retrieved then we need to insert one
        if (count($result) === 0) {
            //
            //Save the structural columns. The result is either an insert or an 
            //error expression
            log::$current->open_tag("insert");
            $exp = $this->insert_record($alias);
            log::$current->close_tag();
        } else {
            //
            //A record was retrieved; then we need to update it
            //
            //Retrieve the primary key
            $key = $result[0][$entity->get_source()];
            //
            $exp = new literal($key, "update");
        }
        //
        return $exp;
    }

   //Save all the non-cross member columns (excluding primary keys) of 
   //this entity.
    private function insert_record($alias): expression {
        //
        //Collect all the structural columns of this index's entity. These are 
        //the non cross members, i.e., structiral columns excluding primary
        //key
        $columns = array_filter(
                $this->entity()->columns,
                fn($col) => !$col->is_cross_member() &!$col instanceof primary
        );
        //
        //1. Save the structural columns of this entity to the database
        $dirty_exps = array_map(fn($col) => $col->save($alias), $columns);
        $exps = array_filter($dirty_exps, fn($exp) => $exp instanceof literal);
        //
        //The cleaned columns should not be empty
        if (count($exps) === 0) {
            return new myerror("No data to insert");
        }
        // 
        //2. Compile the insert clause, i.e, {Insert into ename (cnmanes,...) values(strings......)}
        //by considering only the vaid cases.
        //
        //Get the involved columns in a string derived from the statuses as a  string 
        //i.e `client`.`client`,......
        //Get the name of the mandatory columns names from the status
        $columns_names = array_keys($exps);
        //
        //map the column names to their complete sql names, e,g., clent.name; 
        //then implode them with a comma separator
        $column_str = implode(',', array_map(fn($cname) => "`$cname`", $columns_names));
        //
        //Collect all the values as a comma separated string
        $values_str = implode(',', array_map(fn($exp) => $exp->to_str(),
                        $exps));
        //
        //3. Compile the sql insert statement
        //
        //sql string statement
        $smt = "INSERT \n"
                //
                //Get the from of the sql 
                . "INTO  {$this->entity()}\n"
                //
                //the column names
                . "({$column_str})\n"
                //
                //The values
                . "VALUES ($values_str)\n";

        //
        //4. Execute the sql
        //
        try {
            
            $dbase = $this->open_dbase("mutall_users");
            $dbase->query($smt);
            //
            //Return the last inserted id
            $primarykey = $dbase->lastInsertId();
            //
            return new literal($primarykey, "insert");
        }
        //
        catch (\Exception $ex) {
            //on an update what should i return
            return new myerror($ex->getMessage());
        }
    }

}

//Modeling the columns of an entity as the smallest package whose 
//contents can be "saved" to a database. It is an expresion
abstract class column extends schema implements expression{
    //
    //Every column should have a name 
    public $name;
    //the three properties that are required to identify a column the name, ename and 
    //the dbname 
    public $ename;
    //
    //The parent of this column protected inorder to enable json encoding
    public $dbname;

    //
    //The class constructor
    function __construct(
            //
            //The name of the database inwhich the column is found
            string $dbname,
            //
            //The entity in which the coumn is located 
            string $ename,
            //
            //The actual name of the column 
            string $name
    ) {
        //
        //bind the arguments
        $this->name = $name;
        $this->ename = $ename;
        $this->dbname = $dbname;
        //
        parent::__construct("$ename.$name");
    }

    // //Returns an error report and the numbet\r of errors it contains
    public function get_error_report(int &$no_of_errors, string &$report): void {
        //        
        //        
        $count = count($this->errors);
        $no_of_errors += $count;
        //
        //Compile the errors if necessary, at the database level.
        if ($count > 0) {
            //
            $report .= "\n<h2><b><u>There are $count errors in entity $this->name</u></b></h2>";
            //
            $report .= '<ol>';
            foreach ($this->errors as $error) {
                $report .= "\n <li> {$error->getMessage()} </li>";
            }
            $report .= '</ol>';
        }
    }
    //
    //Only an attribute column can yield itself; all other columns cannot
    function yield_attribute(): \Generator {}
    
    //Yield the entity of this column
    function yield_entity(): \Generator {
        //
        //This database must be opened by now. I cannot tell when this is not 
        //true
        yield database::$current[$this->dbname]->entities[$this->ename];
    }
 
    //Since i can not acess a protected property
    //(Lawrence, who uses this method? Shoudld it not be named entity() as it is
    //tring to return the entity of this column?)
    function get_parent() {
        //
        //Test first if the entity exists before returninig
        $entity = database::$current->entities[$this->ename] ?? null;
        //
        //If the entity is a null or undefined inform the user to check the 
        //spellings 
        if (is_null($entity) || !isset($entity)) {

            throw new \Exception("The parent entity named $this->ename an database $this->dbname was not found "
                    . "please check your spelling and ensure you have the correct database name");
        }
        return $entity;
    }

    //Returns the non-structural colums of this entity, a.k.a, cross members. 
    //These are optional foreign key columns, i.e., thhose that are nullable.
    //They are important for avoidng cyclic loops during saving of data to database
    function is_cross_member() {
        return 
            $this instanceof foreign 
            && $this->is_nullable === 'YES'
            &! $this->is_id();
    }

    //Returns a true if this column is used by any identification index; 
    //otherwise it returns false. Identification columns are part of what is
    //knwn as structural columns.
    function is_id(): bool {
        //
        //Get the indices of the parent entity 
        $indices = database::$current[$this->dbname]->entities[$this->ename]->indices;
        //
        //test if this column is used as an index 
        foreach ($indices as $index) {
            //
            //Map this index to its column name
            $cnames = array_map(fn($col) => $col->name, $index->columns);
            if (in_array($this->name, $cnames)) {
                return true;
            }
        }
        //
        return false;
    }

    //
    //Returns a true if this column can be used for fomulating a friendly 
    //identifier.
    function is_descriptive(): bool {
        //
        //The descriptive columns are those named, name, title or decription 
        return in_array($this->name, ['name', 'description', 'title', 'id']);
    }

    //Returns the string version of thus column, taking care of multi-database
    //scenarios
    function __toString() {
        return "`$this->dbname`.`$this->ename`.`$this->name` ";
    }

    //
    //The expression string version of a comlumn has the form
    //`$dbname`.`$ename`.`$cname`
    function to_str(): string {
        return "$this";
    }
    //
}
//Modelling primary (as opposed to derived) needed for data capture and storage
//These are columns extracted from the information schema directly (so they need
//to be checked for integrity.
abstract class capture extends column {

    //
    //The construction details of the column includes the following;- 
    //
    //Metadata container for this column is stored as a structure (i.e., it
    //is not offloaded) since we require to access it in its original form
    public ?string $comment;
    //
    //The database default value for this column 
    public ?string $default;
    //
    //The acceptable datatype for this column e.g the text, number, autonumber etc 
    public string $data_type;
    //
    //defined if this column is mandatory or not a string "YES" if not nullable 
    // or a string "NO" if nullable
    public string $is_nullable;
    //
    //The size ofthe column
    public ?int $length;

    //
    //Every capture column for compliance to the Mutall framework
    abstract function verify_integrity();

    //
    function __construct(
            string $dbname,
            string $ename,
            string $name,
            string $data_type,
            ?string $default,
            string $is_nullable,
            string $comment,
            ?int $length
    ) { 
       //
        //save the properties of the capture the default, datatype, is_nullable,
        //comment
        $this->comment = $comment;
        $this->data_type = $data_type;
        $this->default = $default;
        $this->is_nullable = $is_nullable;
        $this->length = $length;
        //
        //Create the parent column that requires the dbname, the ename and the 
        //column name  
        parent::__construct($dbname, $ename, $name);
    }

}

//
//The primary and foreign key column are used for establishing relationhips 
//entities during data capture. It:-
//1. Is named the same as the entity where it is homed,
//2. Has the autonumber datatype 
class primary extends capture {

    //
    function __construct(
            string $dbname,
            string $ename,
            string $name,
            string $data_type,
            ?string $default,
            string $is_nullable,
            string $comment,
            ?int $length
    ) {
        //
        //To construct a column we only need the dbname, ename and the 
        //column name 
        parent::__construct($dbname, $ename, $name, $data_type, $default, $is_nullable, $comment, $length);
    }

    //
    //The conditions of integrity of the primary key are:- 
    //1. It must be an autonumber 
    //2. It must be named the same way as the home entity 
    //3. It must not be nullabe. [This is not important, so no need for testing 
    //it] 
    function verify_integrity() {
        //
        //1. It must be an autonumber 
        if ($this->data_type !== 'int') {
            //
            $error = new \Error("The datatype, $this->data_type for primary key $this should be an int and an autonumber");
            array_push($this->errors, $error);
        }
        //
        //2. It must be named the same way as the home entity. The names are case 
        //sensitive, so 'Application' is different from 'application' -- the reason
        //we empasise sticking to lower case rather than camel case
        if ($this->name !== $this->ename) {
            $error = new \Error("The primary key column $this should be named the same its home entity $this->ename");
            array_push($this->errors, $error);
        }
    }

    //
    //Yield teh attribute of an entity
    function yield_entity(): \Generator {
        //
        //This database must be opened by now. I cannot tell when this is not 
        //true
        yield database::$current[$this->dbname]->entities[$this->ename];
    }

}
//Atributes are special columns in that they have options that describe the data
//that they hold, e.g., the data type, their lengths etc. Such descritions are 
//not by any other column
class attribute extends capture implements expression {

    //
    //create the attributes with is structure components see in in capture above 
    function __construct(
            string $dbname,
            string $ename,
            string $name,
            string $data_type,
            ?string $default,
            string $is_nullable,
            string $comment,
            ?int $length
    ) {
        parent::__construct($dbname, $ename, $name, $data_type, $default, $is_nullable, $comment, $length);
    }

    

    //Yield this attribute
    function yield_attribute(): \Generator {
        yield $this;
    }
    

    //There are no special ntegrity checks associated with an attribute for 
    //compiance to teh mutall framework
    function verify_integrity() {
        
    }

    //
    //Writes the record value of this entity based on an alias which indicates 
    //which record of this entity is being saved 
    //Returns a status can can be either erroneus or literal 
    function write(array $alias = []): expression {
        //
        //Test if the value of this attribute is available in 
        //the current record.
        //
        //If the value is set... 
        if (isset(record::$current[$this->dbname][$this->ename][$alias][$this->name])) {
            //
            //Ensure that the attribute's size for identifiers
            //is less or equal to the size of the column.
            $exp = record::$current[$this->dbname][$this->ename][$alias][$this->name];
            $size= strlen($exp->to_str());
            if($size> $this->length 
               && $this->is_id()
               && $this->data_type=== "varchar"
            ){
                return new myerror("The size of column $this->full_name "
                    . "is $size which is larger than $this->length");
            } 
            //...return the atom
            return $exp; 
        }
        //
        //The attribute's value not set; try the default.
        if($this->default!== 'NULL' &! is_null($this->default)){
            //
            //Parse the defalt value to get an expression.
            $exp = mutall::parse_default($this->default);
            //
            //Save the returned atom to trivialize this process
            record::$current[$this->dbname][$this->ename][$alias][$this->name] = $exp;
            //
            //return the expression
            return $exp;
        } 
        //
        //
        //Create an erroneous atom to be returned 
        $error = new myerror("Attribute $this->ename.$this->name is not found");
        //
        //Save the returned atom to trivialize this process
        record::$current[$this->dbname][$this->ename][$alias][$this->name] = $error;
        //
        //return the erroneous atom
        return $error;
    }

}

//
//Modelling derived columns, i.e., those not read off the information schema. 
//Not all colunms are expressions. For instance, foreign key columns are not 
//expressions. So, field extending a column is not enough to express a field.
class field extends column implements expression {

    //
    //This is the calculated/derived expression that is represented by
    //this field. 
    public expression $exp;

    //
    function __construct(
            string $dbname,
            string $ename,
            string $name,
            expression $exp
    ) {
        //
        $this->exp = $exp;
        //
        parent::__construct($dbname, $ename, $name);
    }

    //Note: the __toString() of a field inherits from that of the column. The 
    //to_str() method is needed for formulating the field in a select statement
    //For example:-
    //
    //Let $f be a variable of type field, so that
    //
    //$f = new field('mutall_login', 'application', 'id__', $exp)
    //
    //If $f was used in a select statement that produced the following: 
    //
    //select CONCAT(....) as id__ from mutall_login 
    //
    //the concat bit is the return value for $f->to_str()
    //
    //In contrast the __toString() function would return 
    //'mutal_login.application.id__'
    function to_str(): string {
        return "{$this->exp->to_str()} as `$this->name`";
    }

    //
    //Override the magic tostring methd to ensure that the name of a 
    //field does not include a dbname
    function __toString() {
        return "`$this->ename`.`$this->name`";
    }

    //Yield the primary *nort derived) attributes of this entity. They are needed
    //to support editing of fields formulated from complex expressions
    function yield_attribute(): \Generator {
        yield from $this->exp->yield_attribute();
    }

    //Yield the primary (not derived) entities of this expression. They are 
    //needed for constructing paths using primary entoties only. A different
    //type iof yeld is required for search maths that include views. This may be
    //imporatant when deriving view from existing views. Hence the primary qualifier
    function yield_entity(bool $primary = true): \Generator {
        //
        yield from $this->exp->yield_entity($primary);
    }

}

//This interface supports foreign key behaviour.
interface iref {

    //
    //The home method returns the entity in which the 
    //foreign key is housed. It is indicated with a chicken foot
    //in our data model.
    function home(): entity;

    //
    //Returns the entity that the foreign key is pointing 
    //at i.e., the referenced entity.
    function away(): entity;
}

//This is the clas of columns whose sole purpose is to establish relationhips
//between entities. It participates in data capture. primary feature is the 
//referenced entity
class foreign extends capture implements iref {

    //
    //The name of the referenced table and database names
    public \stdClass /* {ref_table_name, ref_db_name} */ $ref;

    //
    function __construct(
            string $dbname,
            string $ename,
            string $name,
            string $data_type,
            ?string $default ,
            string $is_nullable,
            string $comment,
            ?int $length,
            stdClass $ref
    ) {
        //
        //save the ref 
        $this->ref = $ref;
        parent::__construct($dbname, $ename, $name, $data_type, $default, $is_nullable, $comment, $length);
    }

    //A foreign must have satisfy the following conditions to be compliant to the
    //Mutall framework
    //1. The datatype of the foreigner must be of int
    //2. The referenced column name must be a primary key
    function verify_integrity() {
        //
        //1. It must of type int
        if ($this->data_type !== 'int') {
            //
            $error = new \Error("The foreign key column $this of data type $this->data_type should be int");
            array_push($this->errors, $error);
        }
        //
        //2. The referenced column name must be a primary key
        //This is because the Mutall framework works with only many-to-one relationships
        //Other types of relationships are not recognized
        if ($this->ref->table_name !== $this->ref->cname) {
            $error = new \Error("The foreign key column $this should reference a table {$this->ref->table_name} using the primary key");
            array_push($this->errors, $error);
        }
    }

    //
    //Returns the entity that the foreign key is pointing 
    //at i.e., the referenced entity.
    public function away(): entity {
        //
        //Get the referenced dbname.
        $dbname = $this->ref->db_name;
        //
        //Get the referenced database.
        $dbase = $this->open_dbase($dbname);
        //
        //Get the referenced ename.
        $ename = $this->ref->table_name;
        //
        //Get the referenced entity.
        $entity = $dbase->entities[$ename];
        //
        return $entity;
    }

    //
    //The home method returns the entity in which the 
    //foreign key is housed. It is indicated with a chicken foot
    //in our data model.
    public function home(): entity {
        //
        //Get the name of the home database
        $dbname = $this->dbname;
        //
        //Get the actual home database.
        $dbase = $this->open_dbase($dbname);
        //
        //Get the home entity name.
        $ename = $this->ename;
        //
        //Get the actual home entity.
        $entity = $dbase->entities[$ename];
        //
        return $entity;
    }

    //Returns true if this foreiger qualifies to be alien. It does if there is
    //more than 1 column (of the home entity) that has the same reference table 
    //name
    function is_alien(): bool {
        // 
        //Get the home entity
        $entity = database::$current[$this->dbname]->entities[$this->ename];
        //
        //Get the reference entity
        $ref = $this->ref;
        //
        //Collect all the columns of the home entity that have this reference table
        $similar = array_filter($entity->columns,
                fn($col) =>
                $col instanceof foreign && $col->ref->table_name === $ref->table_name && $col->ref->db_name === $ref->db_name
        );
        //
        //If the there is more than one case, then true.
        if (count($similar) === 1) {
            return false;
        } else {
            return true;
        }
    }

    //Yield teh attribute of an entity
    function yield_entity(): \Generator {
        //
        //This database must be opened by now. I cannot tell when this is not 
        //true
        yield database::$current[$this->dbname]->entities[$this->ename];
    }

    //returns the name
    function get_ename(): string {
        return "{$this->ename}.$this->name";
    }

    //Tests if a foreihn key is hierarchical or not
    function is_hierarchical(): bool {
        return
                $this->ref->table_name == $this->ename && $this->ref->db_name == $this->dbname;
    }

    //Save this foreign key to the current database. This entails saving the 
    //entity corresponding to the referenced table name.
    //The alias derives the parent record if the referenced table name 
    //is the same as this record. This version of saving a foreign key,
    // takes contextual distances into account.
    function write(array $alias = []): expression{
        //
        //If the foreign key is already set... 
        if (isset(record::$current[$this->dbname][$this->ename][$alias][$this->name])) {
            //
            //...return the atom 
            return record::$current[$this->dbname][$this->ename][$alias][$this->name];
        }
        //
        //Depending on whether we have a hierarchical situation or not,
        // formulate the source alias
        if ($this->ename === $this->away()->name) {
            //
            //We have a hierarchial situation
            //
            //The source alias is the parent of the given one, if valid
            //
            //The aliased enity has no parent
            if (count($alias) === 0) {
                return new myerror("Missing parent of $this->ename");
            }
            //
            //Drop the last array suffix to get the parent alias as the source
            $source_alias = array_slice($alias, 0, count($alias) - 1);
        } else {
            //
            //We have a non-hierarchical case.
            //
            //The source alias is the same as the given one
            $source_alias = $alias;
        }
        //
        $dest_alias = null;
        //
        //Use contextual distancing to get the best alias for the destination
        if (!$this->try_nearest_alias($this->away()->name, $source_alias, $this->ref->db_name, $dest_alias)) {
            //
            //If the distance cnnot be found, then the destination alias is an
            //Error expression. Return it
            return $dest_alias;
        }
        //
        //
        //The alias can be an error!!!. Take care of it.
        //
        //Return an error incase of an ambigous destination alis to stop this 
        //foreign key from saving 
        if ($dest_alias instanceof expression) {
            return new myerror("foreign key $this->partial_name was not saved", $dest_alias);
        }
        //
        //Get the reference entity
        $entity = $this->away();
        //
        //Save it using the best destination alias
        $atom = $entity->save($dest_alias);
        //
        return $atom;
        //
        //Decide if we require to do an indirect save or not. We do if the 
        //result is erroneous
        //return $result->is_error() ? $this->save_indirect($result):$result;
    }

    //Save this foreigner indirectly,i.e, vai a partial select statenmebnt
    private function save_indirect(expression $result, entity $ref) {
        //
        //Saving indirect is allowed when this option is set. By defult it is not
        //set
        if (!record::$save_indirect) {
            return $result;
        }
        //
        //Only entties whose purpose is for administration are considered
        $considered = isset($ref->purpose) && $ref->purpose === 'admin';
        //
        if (!considered) {
            return $result;
        }
        //
        //Create a partial select
        $select = new partial_select($fields, $from, $this->condition());
        //
        $records = $select->execute($this->dbname);
        //
        //Count the no of records
        switch (count($records)) {
            case 0:
                $error2 = new myerror('Indirect indexxing also failed', $result);
                return $error2;
            case 1:
                //
                //Get the primary key and return it
                $primary = $records[0][0];
                return new literal($primary);
            default:
                $error2 = new myerror("Ambiguity error. No of recrods =" . count($records), $result);
                return $error2;
        }
    }

    //Try to return the destinaton alias that is the nearest to the source 
    //alias. It can also be an error
    public function try_nearest_alias($ename, array $source_alias, $dbname, &$result): bool {
        //
        //The home entity must be set by now; otherwise somethng is not right
        if (!isset(record::$current[$dbname][$ename])) {
            $result = new myerror('Unable to evaluate the foreign key as its home entity is not saved yet');
            return false;
        }
        //
        //Collect all the aliases associated wirh the given entity name. They
        //are the keys of the \Ds\Map used for manging aliases
        $aliases = record::$current[$dbname][$ename]->keys();
        //
        //Compute the contextual distances/alias pairs
        $pairs = array_map(
                //
                //Compute the distance of each destination alias from the source
                fn($alias) => ['alias' => $alias, 'distance' => $this->distance($source_alias, $alias)],
                //
                //Turn the aliases to an array from a set.
                $aliases->toArray()
        );
        //
        //Get list of distances, Distance is the 2nd element of the pair. 
        //that arreya re 0 based.
        $distances = array_map(fn($pair) => $pair['distance'], $pairs);
        //
        //
        //Get the least distance. THIS THROWS A RUNTIME ERROR IF THE ARRAY iS 
        //EMPTY. But, IT CANNOT BE EMPTY!
        $least = min($distances);
        //
        //Filter the alias with the least distance
        $filter = array_filter($pairs, fn($pair) => $pair['distance'] === $least);
        //
        //Report ambiguity
        if (count($filter) > 1) {
            $result = new myerror('Ambiguity error', $filter);
            return false;
        }
        //
        //Note: The filtered elements are still indexed by their positions.
        //Index them numerically
        $filtered_values = array_values($filter);
        //
        //Return the only filtered element, as the aliias.
        $result = $filtered_values[0]['alias'];
        return true;
    }
    
    //Returns the contextual distance between two contexts, a.k.a, aliases
    //E.g the distance between [3,8,6,2] and [3,8,4,3] is 4 
    //The shared elements are [3,8].
    private function distance(array $alias_source, array $alias_dest): int {
        //
        //Start with a shared length of 0
        $l=0;
        //
        //Loop throgh the elements of the source context and stop when ...
        for(;$l<count($alias_source);$l++){
           //
           //...the index to the destination alias is not defined...
           if(!isset($alias_dest[$l])){break;}
           // 
           //... or the elements of the indexed source and destination are 
           //different
           if($alias_source[$l] !== $alias_dest[$l]){break;} 
        } 
        //
        //At this point $l represents the number of elements in the shared 
        //array
        //
        //return the distance as the sum of the size of the source (without the 
        //shared elements)and the size of the destination (also without the shared
        //elements)
        return count($alias_source) + count($alias_dest) - 2*$l;
    }

}

//This class models a column in an entity that points to a referenced entity.
// The diference between a pointer and a foreign is that the pointers it not 
//homed at the entity it found
class pointer extends foreign {

    //
    function __construct(foreign $col) {
        parent::__construct(
            $col->dbname,
            $col->ename,
            $col->name, 
            $col->data_type,
            $col->default,
            $col->is_nullable,
            $col->comment, 
            $col->length,
            $col->ref
        );
        $this->home = $this->home();
        $this->away = $this->away();
    }

    //Pointers run in the opposite direction to corresponding foreign keys, so 
    //that its away entity is the home version of its foreign key
    function away(): entity {
        //
        //Get the referenced entity aand return it 
        return parent::home();
    }

    //By definition, pointers run in the opposite direction to corresponding foreign keys, so 
    //that its home entity is the away entity of its foreign key.
    function home(): entity {
        //
        //Get the referenced entity aand return it 
        return parent::away();
    }

    //
    //Get the string version of this object that will aid in searching 
    function __toString() {
        return "$this->dbname.$this->ename.$this->name";
    }
    //
    //The expression string version of a comlumn has the form
    //`$dbname`.`$ename`.`$cname`
    function to_str(): string {
        return "$this as $this->name";
    }

}

// 
//This class modeles a field primary key that creates a link from a 
//view to a table in the data model.
class field_primary extends field {
    // 
    //
    function __construct(string $dname, string $ename, string $name, expression $exp){
        parent::__construct($dname, $ename, $name, $exp);
    }
    // 
    //The to string of this sql is the this ename.name.
    public function to_str(): string {
        return "`$this->ename`.`$this->name`";
    }
}

//Expression for handling syntax and runtime errors in the code execution note that 
//the error class does not have an sql string equivalent 
//$smg is the error message that resulted to this error 
//$suplementary data is any additional information that gives more details about 
//this error.
//Error seems to be an existing class!!
class myerror implements expression {

    //
    //Keeping track of the row counter for error repoerting in a multi-row dataset
    static /* row id */  ?int $row = null;
    //The supplementary data is used for further interogation of the error 
    //message. 
    public $supplementatry_data;

    //
    //Construction requires a mandatory error message and some optional suplementary 
    //data that aids in deburging
    function __construct(string $msg, $supplementary_data = null) {
        $this->msg = $msg;
        $this->supplementary_data = $supplementary_data;
    }

    //The strimg representtaion of an error
    function __toString(): string {
        return "Error. $this->msg";
    }

    //
    function to_str(): string {
        return "Error. $this->msg";
    }

    //An error is always an error.
    function is_error() {
        return true;
    }

    //
    //There are no entity in an error  
    function yield_entity(): \Generator {
        
    }

    //
    //There are no attributes in  error 
    function yield_attribute(): \Generator {
        
    }

}

//This is the simplest form of a scalar expression.
class literal implements expression {

    //
    //A simple mechanism for distinguishing between diferent literals
    public $type;
    //
    //This is the value to be represented as an expression. It has to be a absic
    //type that can be converted to a string.
    public /* mixed */ $value;

    //
    function __construct($value, $type = null) {
        //
        //The value of a literal is a scalar. See PHP  definition of a scalar
        if (!is_scalar($value)) {
            throw new \Exception('The value of a literal must be a scalar');
        }
        //
        //save the value
        $this->value = $value;
        $this->type = $type;
    }

    //
    //Converting a literal to an sql string
    public function to_str(): string {
        //
        //A string version of a literal is teh string version of its value; hence 
        //it should be enclosed in siglge quotes as requred by mysql
        return "'$this->value'";
    }

    //String representation of a literal. Note tha there are no quotes, or special
    //processing of empty cases
    function __toString() {
        return "$this->value";
    }

    //There are no entoties in a literal expression
    function yield_entity(): \Generator {
        
    }

    //There are no attributes in a literal 
    function yield_attribute(): \Generator {
        
    }

}

//Modeling the null value.
class null_ implements expression{
    //
    function __construct(){}
    // 
    //
    function to_str(): string {
        return "null";
    }
    //There are no entoties in a literal expression
    function yield_entity(): \Generator {}

    //There are no attributes in a literal 
    function yield_attribute(): \Generator {}
    // 
    //
    function __toString() {
        return $this->to_str();
    }
}

//The log class help to manage logging of save progress data, for training 
//purposes
class log extends \DOMDocument {

    //
    //The file name used for used for streaming
    public $filename;
    //
    //The current log, so that it can be accessed globally
    static log $current;
    //
    //Indicates if logging is needed or not; by default it is needed
    static bool $execute = true;
    //
    //The elememnt stack
    public array $stack = [];

    //
    //The document to log the outputs
    function __construct($filename) {
        //
        //Set the file handle
        $this->filename = $filename;
        //
        parent::__construct();
        //
        if (log::$execute) {
            //
            //Start the xml document 
            $root = $this->createElement('capture.data');
            $this->appendChild($root);
            //
            //Place the root at the top of the atck
            $this->stack = [$root];
        }
    }

    //Returns the element at the top of the stack
    function current() {
        return $this->stack[count($this->stack) - 1];
    }

    //Output the xml document
    function close() {
        //
        //Close the file handle
        $this->save($this->filename);
    }

    //Output the open tag for start of expression save
    function open_save(schema $obj) {
        //
        //Output the expresion full name tag
        if (!log::$execute) {
            return;
        }
        //
        //Create the element
        $elem = $this->createElement($obj->full_name);
        $this->current()->appendChild($elem);
        //
        //Place it in the stack
        array_push($this->stack, $elem);
        //
        return $elem;
    }

    //Creates a tag and appends it to the tag ontop of the stack given a tag name  
    function open_tag(string $tag_name) {
        //
        //Only continue if we are in a logging mode 
        if (!log::$execute) {
            return;
        }
        //
        //In the logging mode
        //Create the element of the tagname provided 
        $elem = $this->createElement($tag_name);
        //
        //Apeend the element to the one on top of the stack  i.e current;
        $this->current()->appendChild($elem);
        //
        //Place it in the stack
        array_push($this->stack, $elem);
        //
        //return the element creates
        return $elem;
    }

    //sets the attributes of an element given the string attribute name, the element 
    //and the value 
    function add_attr(string $attr_name, string $value, $element = null) {
        //
        if (!log::$execute) {
            return;
        }
        //
        //
        //$Ensure the element we are adding the value is at the top of the stack
        //enquire on how to deal with this situatuation 
        if (!is_null($element) && $this->current() == !$element) {
            throw new Exeption('Your stack is corrupted');
        } else {
            $this->current()->setAttribute($attr_name, $value);
        }
    }

    //ClosiNg pops off the given element from the stack
    function close_tag($element = null) {
        //
        //If not in log mode
        if (!log::$execute) {
            return;
        }
        //
        //Use the givebn element for tesing integory
        if (!is_null($element) && $this->current() == !$element) {
            throw new Exeption('Your stack is corrupted');
        }
        array_pop($this->stack);
    }

}

//Models the network of paths that start from an entity and termnate on another
//as a schema object so that it can manage errors associated with the process of 
//formulating the paths.
abstract class network extends schema {

    //
    //keeps a count of all the paths that were considered for deburging puposes 
    public int $considered = 0;
    //
    //The entity that is the root or origin of all the paths pf this network
    public entity $source;
    //
    //The collection of paths that form this network. Each path terminates on
    //another entity. Multiple paths terminating on the same entity are not allowed.
    //The better of the two is prefered over any other alternative. Note that 
    //this property is deliberately unset, so that execute() will do it when 
    //required.
    public array /* path[name] */$paths;
    //
    //The strategy to use in searching for paths in a network (to improve 
    //performance). This ensures that networks that dont use pointers do not have
    //to carry the budden asociated with construcring poinsters
    public strategy $strategy;

    //To create a network we must atleast know where the network will begin which 
    //is the source entity. The constructor cannot be called from javascript 
    //because of its complex data type. 
    function __construct(entity $source, strategy $strategy) {
        //
        //save the start point of this network
        $this->source = $source;
        $this->strategy = $strategy;
        //
        //Initialize the parent process. There is no partial name that is 
        //associated with a network as it has no presence in the relatinal data 
        //model (unlike entities, attributes, indices, etc)
        parent::__construct('unnamed');
        //
        //Extract the paths involved in this network 
        $this->build_paths();
    }

    //Every network should have a way of defining whe its paths come to 
    //an end
    abstract function is_terminal(entity $entity): bool;

    //
    //By default, every foreign key can contribute in a network
    function is_excluded(foreign $key): bool {
        //
        //Ignore the key
        mutall::ignore($key);
        //
        //No forein key is excluded from partcipating in a network
        return false;
    }

    //By default every foreign key should be included.
    function is_included(foreign $key): bool {
        //
        //Ignore the key
        mutall::ignore($key);
        //
        //No forein key is excluded from partcipating in a network
        return true;
    }

    //Executing the network establishes and sets its associated paths. Any errors 
    //encountered are handled according to the throw_excepon setting. If true, 
    //an expetion will be thrown immedtedly. If not, it is save in the error 
    //log. (Remmember that network is a schema object). 
    function Build_paths(bool $throw_exception = true) {
        //
        //Execute this process only if the path is not set
        if (isset($this->paths))
            return;
        //
        //Begin with an empty path. 
        /* path[name] */$this->paths = [];
        //
        //Starting from the source, populate ths network's  paths, indexed 
        //by the terminal entity name. In a multi-database setting the ename is
        //not sufficent to identify an entity. The database name is also required
        //Hence the partial name.
        foreach ($this->path_from_entity($this->source, []) as $newpath) {
            //
            $this->paths[] = $newpath;
        }
        //
        //Verify integrity of the paths. E.g., in a fit, ensure that all the
        //targets are covered.
        $this->verify_integrity($throw_exception);
    }

    //By default all paths returned from exceuting a network have integrity. So,
    //do noting.
    function verify_integrity(bool $throw_exception = true) {
        mutall::ignore($throw_exception);
    }

    //Yields all the paths that start from the given entity. Each path is indexed
    //by a suitable name
    private function path_from_entity(entity $from, /* foreigner[] */ $path): \Generator {
        //
        //Check if we are at the end of the path. We are if the
        //termnal condition is satisfied
        if ($this->is_terminal($from)) {
            //
            //Yield teh indexed and the target name
            yield $from->partial_name => $path;
        }
        //
        //Us the foreigner returned by executing each of the serch functiion
        foreach ($this->strategy->search($from) as $foreigner) {
            //var_dump($foreigner->partial_name);
            //
            //count the foreigners
            $this->considered++;
            //
            // Consider teh foghner for the path being searched
            yield from $this->path_thru_foreigner($foreigner, $path);
        }
    }

    //Yields all the paths that pass through the given foreigner
    private function path_thru_foreigner(foreign $foreigner, array /* foreigner[] */$path): \Generator {
        //
        //Determine if this foreigner is to be included in the path. Don't waste
        //time with any operation besed on this foeigner if,after all, we are 
        //not goin to include it in the path!
        if ($this->is_excluded($foreigner)) {
            return;
        }
        //
        if (!$this->is_included($foreigner)) {
            return;
        }
        //
        //We are not at the end yet; Prepare to add this foreigner to the path
        //and continue buiiding the path using its away component; but first, 
        //attend to cyclic looping condition. For now....(in future we throw 
        //exeption immedately or log it as an error, e.g., in identifier)
        //
        //A cyclic path will occur if a) the relation is hierarchical or.... 
        if ($foreigner->is_hierarchical()) {
            return;
        }
        //
        //b)...if 'there is evidence' that it is already in the path.
        $repeated = array_filter($path, fn($f) => $f->partial_name == $foreigner->partial_name);
        //
        if (count($repeated) > 0) {
            return;
        }
        //
        //Add this foreigner to the path
        $path[] = $foreigner;
        //
        //Continue buildig the path, as if we are starting from the away entity
        //of the foreigner.
        $entity = $foreigner->away();
        //
        yield from $this->path_from_entity($entity, $path);
    }

}

//Modelling strategy for searching through a network. Searching through paths 
//indiscriminately is very time consuming because potetually we would have to 
//search through all the databases in the sever -- in a multi-database scenario. 
//To improvoe performance, we have limuetd to the search to currently opened 
//databases only. Even then, pointers are not buffered, because, with introduction 
//of views (that can be connected to the model at any time) the problems of 
//updating the buffer is not worth the trouble. Some searches do not require
//pomiters, so thet dont have to beer the budden. The stargey class is desifned 
//to dismiss pointers when they are not necessary
abstract class strategy extends mutall {

    // 
    //Types of strategies for searching paths in a network are designed for  
    //boosting the search performance
    //
    //Use the foreign key columns only. Typically, the identifier network uses 
    //this strategy
    const foreigners = 0;
    //
    //Use the pointers only for the network. I have no idea which network would
    //ever use this, so this strategy is not implemented for now.
    const pointers = 1;
    //
    //Use both pointers and foreign key columns. The fit and save (indirect) 
    //networks use this strategy. 
    const both = 2;
    //
    //using only structural foreigners 
    const structural = 3;

    //
    function __construct(int $type = self::foreigners) {
        $this->type = $type;
        //
        //The true in the parent is for the throw exception option which by default 
        //is true but i passed it here so that i can be aware of it.
        parent::__construct(true);
    }

    //
    //Yields the required foreign depending on the strategy onwhich the network is 
    //operating on
    abstract function search(entity $source): \Generator;
}

//Use foreiners only
class strategy_foreigner extends strategy {

    //
    function __construct() {
        parent::__construct(self::foreigners);
    }

    function search(entity $source): \Generator {
        yield from $source->foreigners();
    }

}

//
//The network that utilises both the foreigners and the pointers in the formulation of
//its path this strategy is particulary important in the areas where we do 
//not know how the entites are related i.e for the fit and the save network 
class strategy_both extends strategy {

    //
    //The stategy for this network is a both see in strategy above 
    function __construct() {
        parent::__construct(self::both);
    }

    //
    //Serches in this strategy are bound to both the foreigners and the pointers 
    //since both constitute the path of a network in this strategy 
    function search(entity $source): \Generator {
        yield from $source->foreigners();
        yield from $source->pointers();
    }

}

//
//This strategy is to save on the processing time needed to where we constrain the path 
//to only the structural or administative entities (no reporting) ment to reduce the number 
//of paths that are considered for a complete join 
class strategy_structural extends strategy {

    //
    //The stategy for this network is a both see in strategy above 
    function __construct() {
        parent::__construct(self::structural);
    }

    //
    //Serches in this strategy are bound to both the foreigners and the pointers 
    //since both constitute the path of a network in this strategy 
    function search(entity $source): \Generator {
        //
        //Test if this entity is a reporting entity any to ensure that no path in yielded in 
        //such a situation
        if ($source->reporting()) {
            
        }
        //
        //entity not reporting yield both the pointers and the foreigners 
        else {
            yield from $source->structural_foreigners();
            yield from $source->structural_pointers();
        }
    }

}

//This is a network of all the foreigns that are none cross members from the source 
//to terminal condition 
//Terminal condition is an entity that does not have structural foreign key(structural
//means those entties that that are  not cross members)
//parameter $source is the root orignin of this network see in network above 
class dependency extends network {

    //
    //
    function __construct(entity $source) {
        //
        //The dependency network only relies on the foreign keys to create for 
        //its path
        $strategy = new strategy_foreigner();
        //
        //Search the network paths using the foreign strategy 
        parent::__construct($source, $strategy);
    }

    //We only utilise those foreign keys that are not cross members 
    function is_included(foreign $key): bool {
        //
        //Include the maExclude cross members 
        if ($key->is_cross_member()) {
            return false;
        }
        //
        return true;
    }

    //Returns true if the given entity does not have any foreign keys that are 
    //not cross members i.e structural foreign keys 
    function is_terminal(entity $from): bool {
        //
        //Filter the columns of the entity to remain with the foreign keys
        //that are not cross members
        $id_foreigners = array_filter($from->columns, fn($col) =>
                $col instanceof foreign & !$col->is_cross_member()
        );
        //
        //We are at the end of the path if the given entity has no foreign column 
        //that are structural
        return count($id_foreigners) === 0;
    }

}
