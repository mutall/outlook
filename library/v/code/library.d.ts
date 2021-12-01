//
// 
import * as schema from ".schema.js"
//We don't need to export things from a d.ts.
//export {node, database,editor,record,ename,dbname };
//
//This represents the modal.
export type Ifuel = Array<{[index:string]:basic_value}>;
//
//Modelling the database connection
class database {
    //
    //The login credentials for this database are fed in a config file 
    constructor(
        
        //The database name.
        name: string,
        //
        //An optional boolean that indicates whether we desire a database
        //complete with its entities or not. The the default is complete.
        // If not  complete an empty shell is returned; this may be useful when 
        //quering the database directly, i.e., without the need of the object model
        complete: boolean= true,
        //
        //An optional Throws an error as soon as they are found the  default is 
        //true. If false the error will be buffered in a property called errors
        //and can be accessed through the method report
        throw_exception: boolean = true
    );
    //
    //Returns data as an array of simple objects after executing 
    //the given sql on this database
    get_sql_data(sql: string): Ifuel;
    //
    //
    get_col_meta(sql:string):Ifuel;
    // 
    //Returns the accounting details of a specified account 
    accounting(accname: string): Ifuel;
    //
    //Returns a complete database structure, .i.e one that is populated with 
    //entities and columns
    //We return an any because we do not wish to check the structure of our data  
    export_structure(): schema.Idatabase;
    
    //
    //The query command is used for executing the insert,
    //upadet and delete statements. The return value is the number of affected rows.
    query(sql:string):number;
    //
    //Use the given credentials to authenticate the matching user.
    authenticate(email:string, password:string):boolean;
    //
    //Use the given credentials to create a new user account.
    register(email:string, password:string):void;
    
}
//
//The sql statement string, e.g, select client.name from client 
type sql = string;
//
//This class models a select statement that retrieves all the columns 
//of an entity. In particular the foreign keys values are accompanied 
//by their friendly names. These names are useful for editing/looking up
// the foreign key values.
class editor {
   //
    constructor(
        //
        //This is the entity name from which we are doing the selection
        ename: ename,
        //
        //The name of the database in which the entity is defined
        dbname: dbname
    );
    //
    //Returns the standard string representation of a select sql statement
    stmt(): string;
    //
    //This method returns the metadata necessary for driving a 
    //CRUD table.
    //The last paramete maximum length is returned as a string
    describe():[schema.Idatabase, Array<cname>, sql, string];
}
///Mutall label format for exporting data to a database.
//The data has the following structure [dbname, ename, alias, cname, value].
export type dbname = string;
//
//The table in the named dbname where the data will be saved 
export type ename = string;
//
//The number of similar records being saved
type alias = Array<number>;
//
//COlumn name in the database table to be saved 
type cname = string;
//
//The primary key value which is modeled as a number beause we 
//often use it for specifying the ofset of an sql result.
export type pk= number;
//
//The location of a td in a crud table. This is important for saving and 
//restoring a crud td. 
export type position =[rowIndex,cellIndex];
//
//The actual value being sent to the server 
type basic_value = boolean|number|string|null;
//
//An atom is the smallest datatype that is aware of its origin.
export type atom = [basic_value, position?];
//
//The exact position of the td with the data to be saved relative to the 
//table 
type cellIndex= number;
type rowIndex= number;
//
//The complete label format 
type label = [dbname, ename, alias, cname, atom];
//
//The index of the value being saved
type col_position= number;
//
//TARBULAR DATA FORMAT
interface tabular{
   header: Array<[dbname, ename, alias, cname, col_position]>,
   //
   //There are as many entries of the values as there are header 
   //options
   body:Array<basic_value>
}
//This class models a container for saving data to the server
class record {
    //
    //
    constuctor();
    //
    //
    export(            
        milk: Array<label>|tabular,
        format: "label" | "tabular",
        keep_log: boolean=true
    ):Imala;
    //
    //loads text files to 
    load_text(filename:string, format:'label'|'tabular'|'javax'):Imala;

}
//
//This interface is stripped version of a php expression 
//its main purpose is to support reporting errors and the primary
//keys back to the crud page.
interface Iexp{
   //
   //These types are derived from the myerror and the literal 
    //classes.
   type:"error"|"pk";
   //
   //The basic value is either an error message if the type is 
   //an error or the primary key value if the type is a primary key 
   value:basic_value;
   //
   //This is the friendly component if the type is a primary key 
   friend?:string       
}

//
//This interface is designed for reporting runtime results
interface runtime{
    //
    //The type of update/write result
    class_name:"runtime";
    //
    //This is a runtime result 
    result:Array<[Iexp,position]> ; 
}
//
//This interface is designed for reporting syntax errors.
interface syntax{
    //
    //The type of update/write result
    class_name:"syntax";
    //
    //This is a list of error messages when the class_name is
    // syntax
    errors :Array<string>;
}
//
//
//The imala result is either a runtime or a syntax result
type Imala= syntax | runtime; 
//
//This is special construct for mporting a partialy complete 
//tree structure that reprresents files and folders from
// the  server. Partialy complete means some folder are rich 
//with children and others are not. The rich ones are part of
//the intial path specification. 
export interface Inode{
    // 
    //This the full name of the path 
    name:string;
    // 
    //The type of the path, i.e leaf or branch.
    //Leaf are maped to files and branches to folders.
    class_name: "leaf"|"branch"; 
}
//
//A leaf is a node that has no children by design. 
export interface Ileaf extends Inode{}
//
//A branch is a node that can have children. If the children 
//are defined then this is a rich branch else it is not.
export interface Ibranch extends Inode{
    // 
    //The children of a rich branch are nodes
    children?:Array<Inode>;
}
//
//This is the php version of the js node. mainly used for 
//housing the export method.
export class node{
    //
    constructor(
        // 
        //The name of this node 
        name: string,
        //
        //Full name of this node's parent 
        full_name:string        
    ) 
    
    //Form a complete node structure using the initial path and return 
    //a static node.
    static export(
        //
        //e.g  absolute: /pictures/water/logo.jpeg.
        //     relative:  pictures/water/logo.jpeg.
        initial_path:string,
        target:"file"|"folder"
    ): Inode;
    
}
export class accounting{
    constructor(bus:string,acc:string,date:string);
    records(dis_type:"closed"|"open"|"all"):Ifuel;
    closed_records():Ifuel;
    close_books():Imala;
}
//
// 
export interface Iproduct{
    id: string,
    title: string,
    cost: number | null,
    solution_id: string,
    solution_title: string,
    listener:string
}
// 
export class app{
    constructor(app_id: string);
    get_products():Array<Iproduct>
    customed_products():Array<{role_id:string,product_id:string}>
    subscribed_products(email:string):Array<{product_id:string}>
}
//
//
export interface Imerge{
  dbname?:string,
  ref_ename?:string,
  members?:sql  
}
export type principal=sql;
export type minors=sql;

export type error1062=string;
export type error1451=string;
//
export class merger{
    constructor(m:Imerge);
    get_players(): [principal,minors]|null;
    get_values(): sql;
    get_conflicts():{clean: sql, conflicts: sql};
    get_contributors(error:error1451, minors:sql):sql
    get_contributing_members(error:error1062,contributors:sql):Array<Imerge>
    update_principal(consolidations:Array<{cname:string, value:string}>): void
    get_conflicting_values(all_values:sql, conflicts:sql):Array<{cname:string,value:string}>
    get_clean_values(all_values:sql, clean:sql): Array<{cname:string, value:string}>
    //
    delete_minors(): boolean
    redirect_contributors(contributors:sql): error1062|null
}
