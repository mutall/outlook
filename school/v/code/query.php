<?php
// 
//Include the sql where the selector is defined 
include_once "../../../library/v/code/sql.php";
include_once '../../../library/v/code/schema.php';
// 
//Include this application default setting 
include_once './config.php';
// 
//This class is  to test the display of the json object 
//by altering the format of the friendly name in the selecto 
//to output a json object instead. 
class id_sql extends selector{
    // 
    //
    function __construct(string $ename, string $dbname){
        // 
        //Create the parent selector 
        parent::__construct($ename,$dbname);
        // 
        //Update the columns with a json object as friend2
        $this->columns["friendly"]=$this->get_friendly_json();
    }
    // 
    //Obtains the all the friendly columns of this selector and 
    //outputs them as a json object and returns a field column.
    function get_friendly_json():field{
       //
       //Begin with an empty array of the attribute id columns
       $ids/*Array<attributes>*/=[]; 
       // 
       //Get all the joint that are involved in this join as an
       //array 
        $joints=$join_etities=$this->join->joints->toArray();
       //
       //Loop through all the entities in the join yielding all 
       //attributes columns.
       foreach($joints as $joint){
           // 
           //Filter the columns of this join entity to retrieve 
           //the attribute columns that are used for identification
           $id_columns= array_filter($joint->base->columns,
                   fn($col)=>$col instanceof attribute && $col->is_id());
           // 
           //For all that has a count of more than one yield the column fullname name 
           //literal and the column
           foreach ($id_columns as $column){
               $full_name=new literal("{$column->ename}_{$column->name}");
               $ids[]=new function_("JSON_OBJECT", [$full_name,$column]);
           }
       }
       // 
       //Get the json object function
       $exp=new function_("JSON_OBJECT",$ids);
       // 
       //Return the friendly2 field.
       return new field($this->dbname, $this->name, "friendly", $exp);
    } 
}
// 
// 
//This represents the heirachy of all the subjects in the school 
//system. the subject can either be barren or parent 
class subject extends id_sql{
    // 
    //The name of this subject 
    public field $sub_name;
    // 
    //The field that represents this subject. it is 
    //a field that is named the same as the view since it is used 
    //for identification 
    public field $pk;
    // 
    //The self referencing foreign key that indicates the heirachy 
    public foreign $ref;
    // 
    //The smaller subject division under this subject. it is empty 
    //if this subject is barren 
    public array $children;
    //
    //This view borrow all its joins from the id sql of the subject 
    //hence there it does not require any constructor parameters 
    function __construct() {
        // 
        //Initialise the parent subject selector for the join formulation 
        //if needed
        parent::__construct("subject", "general_school");
        // 
        //Set the foreign column that is used to show the heirachy 
        $this->ref= $this->get_ref();
        //
        //The name of the subject as saved in the database.
        $this->sub_name=new field(
            $this->dbname,
            $this->ename,
            'name',
            $this->source->columns["name"]
        );
        // 
        //The columns needed for this query include 
        //1. The primay key named the same as the classname
        $this->pk=new field(
            $this->dbname,
            $this->ename,
            $this->name,
            $this->source->columns['subject']
        );
        // 
        //Set the default condition for retrieving the highest parent in the 
        //heirachy 
        $this->where= $this->set_condition();
        // 
        //The column in the subject table am interested to display the heirachy
        //by default the columns are the name and the primary key.
        $this->columns= $this->get_columns();
    }
    // 
    // 
    //Returns the foreign key that is used to indicate the self referenceing 
    function get_ref():foreign{
        // 
        //Get column that is used for self referencing 
        $refs = array_filter($this->source->columns,fn($col)=>
          $col instanceof foreign && $col->ref->table_name===$this->source->name);
        // 
        //Throw an error if these refs are more than one 
        if (count($refs)>1){
            throw new Exception("Heirachy is invalid");
        }
        // 
        //Ensure that the array is indexed by the the default number keys 
        $Ref=array_values($refs);
        // 
        //Return the foreign key 
        return $Ref[0];
    }
    // 
    //The condition for the parent subject is that the papers
    //is null
    function set_condition():binary{
      //
      //Return the null condition.
      return new binary($this->ref,"is", new null_());
    }
    // 
    //Returns an array of all the fields that are requred 
    //for the parent subject.
    function get_columns():array/*Array<field>*/{
       // 
       //Return the columns array 
       return [
        $this->pk->name=>$this->pk,
        $this->sub_name->name=>$this->sub_name
      ];
    }
    // 
    //Get the children of this parent subject 
    function get_children_data()/*Array<>*/{
        // 
        //Get the entity columns 
        $columns = $this->source->columns;
        // 
        //Get all the subjects.
        $sql=' SELECT '
                . " {$columns['subject']} as `child_subject`, "
                . " {$columns['name']} as name, "
                // 
                //The parent of this subject is this subject
                ."{$this->name}.{$this->name} "
           // 
           //The sql that drives this view is the same
            . "from {$this->source}  "
           // 
           //include the parent subject to include the heirachy 
           ."INNER JOIN ({$this->stmt()}) as `{$this->name}` "
           . "on $this->ref =`$this->name`.`$this->name`"; 
        // 
        //Activate the subjects to either heirachial or 
        //none heirachial.
        return $this->open_dbase($this->dbname)->get_sql_data($sql);
    }
    // 
    //Activate the children data 
    function populate_children():array{
      // 
      //Begin with an empty collection of the children
      $this->children=[];
      // 
      //Get the children data 
      $data= $this->get_children_data();
      // 
      //Activate each child as parent or baren based on the children 
      //it has 
      foreach ($data as $subject/*[name:string,child_subject:number,parent]*/){
         // 
         //Find out if this subject is barren or parent 
         $sql = "select count($this->ref) as child  from $this->source "
                 . " where $this->ref ={$subject['child_subject']}";
        // 
        //No of children.
        $children = $this->open_dbase($this->dbname)->get_sql_data($sql);
        //
        //If the count is more than one this child is a parent otherwise a barren
        if(count($children)>1){
            $this->children[$subject['name']]=new composite($subject["name"],$subject['child_subject']); 
        }else{
           $this->children[$subject['name']]=new barren($subject["name"],$subject['child_subject']); 
        } 
      }
      // 
      // 
      return $this->children;
    }
}

// 
//This a subject with no children and not other parent it is the highest 
//in the rank in the school system it generally called the overall 
//score.The subject has an underscore since the word parent is reserved.
class composite extends subject{
    // 
    //The children of this parent subject are known as 
    //child subjects whether they have children or not 
    public function_ /*Array<field>*/ $child_subject;
    // 
    //To create a subject we need the subject name and an optional pk
    function __construct(string $name) {
        // 
        //Initialize the parent subject 
        parent::__construct();
        // 
        //Set the constructor parameters.
        $this->name=$name;
        $this->partial_name= $this->name;
        // 
        //The columns needed for this query include 
        //1. The primay key named the same as the classname
        $this->pk=new field(
            $this->dbname,
            $this->ename,
            $this->name,
            $this->source->columns['subject']
        );
        // 
        //overide the columns to change primary column name and include 
        //name and the children.
        $this->columns= $this->get_columns();
        // 
        //Set the condition for this query 
        $this->where= $this->set_condition();
    }
    // 
    //The condition for the parent subject which is equivalent to the name
    function set_condition():binary{
      return new binary($this->source->columns['name'],"=", new literal($this->name));
    }
}
// 
//This simulates one level of inheritance from the parent
 class barren extends subject{
    // 
    function __construct(string $name) {
        parent::__construct();
        $this->name=$name;
        $this->partial_name=$name;
        //
        // 
        //The columns needed for this query include 
        //1. The primay key named the same as the classname
        $this->pk=new field(
            $this->dbname,
            $this->ename,
            $this->name,
            $this->source->columns['subject']
        );
        
    }
    // 
    //The condition for the parent subject which is equivalent to the name
    function set_condition():binary{
      return new binary($this->source->columns['name'],"=", new literal($this->name));
    }
}
// 
//The total score is the percentage average of all the 
//children of a particular score.
class total extends id_sql{
    // 
    //The subject score under study 
    public subject $subject;
    // 
    //The foreigner that links this view to the 
    //theme subject.
    public field_foreign $foreigner;
    // 
    //The database where this view is homed this property 
    //is protected incase we will need to json encode this object.
    protected database $dbase;
    // 
    //This id sql is based on the score id sql 
    function __construct(subject $subject) {
        //
        //
        parent::__construct('score', 'general_school');
        // 
        //Initialize the subject under study 
        $this->subject=$subject;
        // 
        //Set the database where these views are homed 
        $this->dbase= $this->open_dbase($this->dbname);
        // 
        //Ensure that the subject and this query are part of the 
        //database.
        if(!isset($this->dbase->entities[$subject->name]))
            $this->dbase->entities[$subject->name]=$subject;
        //
        if(!isset($this->dbase->entities[$this->name]))
            $this->dbase->entities[$this->name]= $this;

        //
        $this->foreigner= $this->get_subject_theme();
        //
        //The columns an interested in are
        $this->columns= $this->get_columns();
    }
    // 
    //overide the join statement to ensure this foreigner is included in 
    //the join;
    function join_stmt():string{
        if(!isset($this->foreigner)) return parent::join_stmt();
        // 
        //Add this foreigner to the join
        $this->join->add_descendants($this->foreigner,30);
        // 
        return $this->join->stmt();
    }
    //
    //Returns the columns needed to calculate a score 
    function get_columns():array{
        // 
        //
        $entites= $this->dbase->entities;
        //
        //Begin with an empty array.
        $columns=[];
        //
        //The exam column 
        $columns["sitting"] = new field(
           $this->dbname,
           $this->name,
           "sitting",
           $entites["sitting"]->columns["sitting"]
        );
        //
        //The student progress 
        $columns["progress"] = new field(
           $this->dbname,
           $this->name,
           "progress",
           $entites["progress"]->columns["progress"]
        );
        //The name of the subject 
        $columns["name"] = new field(
           $this->dbname,
           $this->name,
           "name",
           new function_("concat",[new literal("Total_"),$this->subject->sub_name->exp])
        );
        // 
        //The calculated subject total value 
        $columns["total"]= $this->get_calculated_avg();
        // 
        //The children of these subjects 
        $columns["children"]= $this->get_children();
        // 
        //Return the promised array 
        return $columns;
    }
    // 
    //Calculates the average of this subject`s children 
    function get_calculated_avg():expression{
      $entities= $this->open_dbase($this->dbname)->entities;
      // 
      //Get the expression that returns the sum of all the 
      //children scores of this subject
      $sum_value=new function_("sum",[$this->source->columns['value']]);
      // 
      //The sum of all the outoffs
      $sum_outof= new function_("sum",[$entities["sitting"]->columns['out_of']]);
      // 
      //The binary that retrieves the fraction
      $fraction= new binary($sum_value,"/",$sum_outof);
      // 
      $value= new binary($fraction,"*",new literal(100));
      // 
      return new field(
        $this->dbname,
        $this->name,
        "value",
         $value
      );
    }
    // 
    //The link to the subject in place 
    function get_subject_theme():field_foreign{
        //
        //
        $ref=new stdClass();
        $ref->table_name= $this->subject->name;
        $ref->dbname= $this->subject->dbname;
        // 
        $exp=$this->subject->ref;
        //
        //Compile and return the compiled foregn key.
        return $this->foreigner=new field_foreign(
            $this->dbname,
            $this->source->name,
            $this->subject->name,
            //
            //The field's expression.
            $exp,
            //
            //The referenced entity identifier.
            $ref
        );
    }  
    // 
    //
    function get_children():function_{
        return new function_(
            "json_array",
            [
                new function_("json_object",
                 [
                     new literal("name"),
                    $this->dbase->entities['subject']->columns["name"],

                    new literal("value"),
                    $this->source->columns["value"],

                    new literal("out_of"),
                    $this->dbase->entities['sitting']->columns["out_of"]
                ]
              )
            ]);
    }
}