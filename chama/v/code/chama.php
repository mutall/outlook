<?php
//
include_once "./config.php";
//
//Every class needs to perform operations in the database thereby 
//requiring a connection to the database.
//
//Define a trait that contains the connection to the database.
//Using trait, the connection can be accessed by all classes.
//
trait connection{
    //
    //Create a function that returns a db connection on execution.
    function connect(){
        //
        //Create an instance of the database class that contains the connection.
        $conn = new dbase();
        //
        //Return the connection on success.
        return $conn->connection;
    }
}
//
//Chamas supports management of multiple social groups 
class chama {
    //
    //Get the db connection.
    use connection;
    //
    //Define properties within class chamas.
    public $groups;
    //
    public function __construct() {
        //
        $this->groups = [];
        //
        //Initialize the groups in this database.
        $this->set_groups();
    }

    //Initialize the groups of this database 
    function set_groups() {
        //
        //Fomulate the group selection sql statement, includong is primary key
        $sql = "select * from `group`";
        //
        
        //Execute the statement on this database.
        $result = $this->connect()->query($sql);
        //
        //Retrieve the returned groups from the query result.
        foreach ($result->fetchAll(PDO::FETCH_CLASS, 'group') as $group) {
            //
            //Get every group by Primary Key and save it into groups array.
            $this->groups[$group->group] = $group;
        }
    }

    //Display the market pace for all chamas
    function show() {
        
        //Register chamas
        foreach ($this->groups as $group) {
            //
            //Echo all chamas
             echo "
            <div class='group' id='$group->name'>
                <p> $group->name</p>
                <img src='img/$group->name/$group->logo'  alt=''/>
                <p>$group->website</p>
                <a href='group_bronchure.php?group=$group->group' id='disabled_link'>Show more details...</a>    
            </div>
                   ";
        }
   }
  
}
//With all groups set,
//start modelling the chama......
class group{
    //
    //Define properties in class group.
    //A group has a name, website, email, vision and an Id.
    // public $name;
    // public $website;
    // public $email;
    // public $vision;
    // public $mission;
    // public $id;
    //
    //Get the connection to the database for querying purpose.
    //In this case a trait that executes a db connect.
    use connection;
    //
    //Establishing a link between group and member
    public $members = [];
    //
    //Establish a link between group and officials.
    //
    public $officials = [];
    //
    public function __construct(){
        //
        //Once this class is Instantiated, set the members as well as other group details
        //such as objectives, events, officials.
        $this->set_members();
    }
    //
    //Set the group members using the database (rather than using the constructor arguments)
    function set_members(){
        //
        //Retrieve the members
        $sql = "SELECT * FROM member where member.`group` = $this->group";
        //$sql = "SELECT * FROM member";
        // Run the statement in the database.
        $results = $this->connect()->query($sql);
        //
        //Populate the member collection.
       $this->members = $results->fetchAll(PDO::FETCH_CLASS, "member");
    }
      //
      function show_bronchure() {
        //
        //display group details in a printable format for a bronchure.
        //develop sections using a grid layout.
 
        echo
        "
            <div class='head'>
            <div class='logo'><img src='img/$this->name/$this->logo'></div>
            </div>
            <div class='logo_nm'><p>$this->name</p></div>
            <div class='statement'>
                <div>Vission:</div><div>{$this->vision}</div>
                <div class='mission'>Mission:</div><div>{$this->mission}</div>
            </div>";
       
        // $this->show_objectives();
        // //
        // $this->show_events();
        // //
        // $this->show_officials();
        // //
        echo json_encode($this->members) ;
         //$this->show_members();
    }
    function show_members() {
        //
        echo "<div class='membr'><div class='mem'>Members</div>";
        echo "<div class='members'>";
       
        foreach ($this->members as $member) {
        //
        $member_ = $member->member-1;    
        if(empty($member->picture)){
            echo "<div class='member'><img src='img/$this->name/user.png'>"
                . "<div>"
                     . "<a href='member_service.php?group=$this->group&member=$member_'>$member->user.name</a>"
                . "</div>"
                . "</div>";
            
        } else {
            echo "<div class='member'><img src='img/$this->name/$member->picture'>"
                . "<div>"
                    . " <a href='member_service.php?group=$this->group&member=$member_'> $member->username</a>"
                . "</div>"
                ."</div>";  
                   
        }
    }
    
        function set_officials(){

        }
        function set_objectives(){

        }
        function set_events(){

        }
    }
}

class member {
    //
    //Get the dbase connection for querying purpose.
   use connection;
   //
   //Link the member table to official.
   public $office;
   public $resume = [];
    //
   //
   public function __construct() {
    //    $this->set_office();
    //    $this->set_contribution();
    //    $this->set_resume();
   }
   function set_office(){

   }
   function set_resume(){

   }
   function set_contribution(){

   }
}

//
//Create the objectives class.
class objective {
    //
    //Get the connection to the database.
   use connection;
   //
   //Establish the link between objective and theme.
   public $theme;

   public function __construct() {
       //set themes.
       $this->set_theme();
   }

   function set_theme() {
       //
       //Retrieve all the themes from the database.
       $sql = "select * from theme where theme.`objective` = $this->objective";
       //
       //Run the statement in the database.
       $result = $this->connect->query($sql);
       //
       //Set the theme.
       $this->theme = $result->fetchAll(PDO::FETCH_CLASS, "theme");
   }

}
//
//Create the events class.
class event {
    //
    //Get the dbase.
   use connection;
   //
   //Establish a link between event and agm.
   public $agm;

   //
   public function __construct() {
       //
       $this->set_agm();
   }

   function set_agm() {
       //
       //Retrieve the agm from the database.
       $sql = "select * from agm where agm.`event` = $this->event";
       //
       //Run the statement in the database.
       $result = $this->connect()->query($sql);
       //
       //Set the agm.
       $this->agm = $result->fetchAll(PDO::FETCH_CLASS, "agm");
   }

}
//
class theme {
    //
    //Get the database.
   use connection;
   //
   //Establish a link between the theme and the message.
   public $messages = [];

   public function __construct() {
       //
       //$this->set_message();
   }

   function set_message() {
       //
       //Retrieve all the messages from the database.
       $sql = "select * from message where message.`theme` = $this->theme";
       //
       //Run the statement in the database.
       $result = $this->connect()->query($sql);
       //
       //Populate the messages collection.
       $this->theme = $result->fetchAll(PDO::FETCH_CLASS, "message");
   }

}
//
class message {
   use connection;
   //
   //Establish a link between the message and the member.
   public $member;

   public function __construct() {
       //
       //$this->set_member();
   }

   function set_member() {
       //
       //GEt the member that sent the message.
       $sql = "select * from mer where message.`member` = $this->message";
       //
       //Run the statement in the database.
       $result = $this->connect()->query($sql);
       //
       //set the member.
       $this->member = $result->fetchAll(PDO::FETCH_CLASS, "member");
   }

}
//
class agm {
   use connection;
   //
   //Establish a link between agm and minutes.
   public $minutes = [];

   public function __construct() {
       //
       $this->set_minutes();
   }

   function set_minutes() {
       //
       //Retrieve the minutes from the db.
       $sql = "select * from minute where minute.`agm` = $this->agm";
       //
       //Run the statement in the database.
       $result = $this->connect()->query($sql);
       //
       //Populate the minutes collection.
       $this->minutes = $result->fetchAll(PDO::FETCH_CLASS, "minute");
   }

}
class minute {
    use connection;
    //
    public function __construct() {
        
    }
 
 }
class contribution{
    use connection;
    //
    public function __construct() {
        
    }
 }
 class resume{
    use connection;
    //
    public function __construct() {
        
    }
 }
class official {
   use connection;
   //
   public function __construct() {
       
   }

}

