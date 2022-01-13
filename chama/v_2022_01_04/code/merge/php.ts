//To access the app_url, so that the view that inherits this one can
//behave like n application (without all the bells and whistels of an
//app)
import * as schema from "../../../../library/v/code/schema.js";
//
//To get access to data types that support the definition of the
//php-based classes, e.g., Imerge
import * as lib from "../../../../library/v/code/library.js";

//To access the method for talking to the server in order to execute
//the PHP based mathods
import * as server from "../../../../library/v/code/server.js";
//
//To access uitilites developed in Outlook project and shared by
//other view-based applications, e.g., get_element(id:string)
import * as outlook from "../../../../outlook/v/code/outlook.js";
//
//NB. Implemenetio of the Imerge interface is critical because we it
//is required to implement the constructor methods of the merger 
//merger class defined in PHP 
export class merger extends outlook.view implements lib.Imerge{
    //
    public imerge?:lib.Imerge;
    //
    //Implementation of the Imerge interface
    public get dbname(){return this.imerge!.dbname;}
    public get ename(){return this.imerge!.ename;}
    public get members(){return this.imerge!.members;}
    
    constructor(imerge?:lib.Imerge){
        //
        super();
        //
        //Initialize the view class
        this.imerge=imerge;
        //
        //Make this merger view behave like the application page
        //
        //Initialize the win property to the default value -- this window
        this.win = window;
        schema.schema.app_url = window.document.URL;
    }
    
    async get_players(){
        return await server.exec("merger", [this.imerge!], "get_players",[]);
    }
    
    async get_consolidation(){
        return await server.exec("merger", [this.imerge!], "get_consolidation",[]);
    }
    
    async delete_minors(){
        return await server.exec("merger",[this.imerge!],"delete_minors",[]);
    }

    async redirect_pointer(pointer:lib.pointer){
        return await server.exec("merger",[this.imerge!],"redirect_pointer", [pointer]);
    }
    
    async update_principal(c:lib.interventions){
        return await server.exec("merger",[this.imerge!],"update_principal", [c]);
    }
}