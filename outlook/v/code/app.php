<?php
 //
//Define the schema to make use of the database methods that 
//are already defined.
include_once '../../../library/v/code/schema.php';
//
//The class that houses all server functionality of
//an application.
class app extends database{
    //
    //The application id whose.
    public string $id;
    // 
    //The database name of this application
    public string $dbname;
    // 
    //For now to create an application class it takes 
    //no parameters.
    function __construct(string $app_id) {
        parent::__construct("mutall_users");
        $this->id=$app_id;
    }
    // 
    //Retrieve all the products that are customed to a particular 
    //role.
    function customed_products(){
        // 
        //Formulate the sql.
        $sql ="SELECT
                `product`.`id` as product_id ,
                `role`.`id` as role_id
           FROM `product`
               inner JOIN  `custom` on `custom`.`product`=`product`.`product`
               inner JOIN  `role` on `custom`.`role`=`role`.`role`
               inner join   player on `player`.`role`= `role`.`role`
               inner join   `application` on `player`.`application`=`application`.`application`
           WHERE `application`.`id`='$this->id'
        ";
        // 
        //Return the executed sql.
        return $this->get_sql_data($sql);
    }
    // 
    //Returns all the products that are executions of a 
    //particular application
    function execution_products(): string{
       return "SELECT
                 `product`.`id` as id ,
                `product`.`name` as title,
                 `product`.`cost` as cost,
                `solution`.`id` as solution_id ,
                `solution`.`name` as solution_title ,
                `solution`.`listener` as listener
            FROM `execution`
                 inner JOIN `application` ON `execution`.`application`=`application`.`application`
                 inner JOIN `product` on `execution`.`product`=`product`.`product`
                 inner JOIN `resource` ON `resource`.`product`=`product`.`product`
                 inner JOIN `solution` ON `resource`.`solution`=`solution`.`solution`
            WHERE `application`.`id`='$this->id'";
    }
    // 
    //Returns all the products that are globally 
    //available for all applications 
    function global_products():string{
       return "SELECT
                 `product`.`id` as id ,
                `product`.`name` as title,
                 `product`.`cost` as cost,
                `solution`.`id` as solution_id ,
                `solution`.`name` as solution_title ,
                `solution`.`listener` as listener
            FROM `product`
                inner join `resource` on `resource`.`product`=`product`.`product`
                inner join `solution` on `resource`.`solution`=`solution`.`solution`
                left join `execution` on `execution`.`product`=`product`.`product`
            WHERE `execution`.`product` is null"; 
    }
    // 
    //Returns all the products that are subscribed by a certain 
    //user 
    function subscribed_products(string $email){
        $sql ="SELECT
                 `product`.`id` as product_id
            FROM `product`
                inner JOIN `asset` ON `asset`.`product`=`product`.`product`
                inner JOIN  `player` on `asset`.`player`=`player`.`player`
                inner join  `user` on `user`.`user`= `player`.`player`
                inner join `application` on `application`.`application`= `player`.`player`
            WHERE `user`.`email`='$email' and `application`.`id`='$this->id'";
         // 
        //Return the executed sql.
        return $this->get_sql_data($sql);
    }
    // 
    //Returns all the products a user can play in an application
    function get_products(){
        $sql ="{$this->execution_products()} "
            . " UNION "
             . " {$this->global_products()}";
        return $this->get_sql_data($sql);
    }    
}


