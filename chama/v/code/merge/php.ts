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
export class merger extends outlook.view  implements lib.Imerge{
    //
    //
    public imerge?:lib.Imerge;
    //
    //Implementation of the Imerge interface
    public get dbname(){return this.imerge!.dbname;}
    public get ename(){return this.imerge!.ename;}
    public get members(){return this.imerge!.members;}
    
    constructor(imerge?:lib.Imerge){
        //
        //Initialize the view class
        super();
        this.imerge=imerge;
    }
    
    async get_players(){
        return await server.exec("merger", [this], "get_players",[]);
    }
    
    async get_consolidation(){
        return await server.exec("merger", [this], "get_consolidation",[]);
    }
    
    async delete_minors(){
        return await server.exec("merger",[this],"delete_minors",[]);
    }

    async redirect_pointer(pointer:lib.pointer){
        return await server.exec("merger",[this],"redirect_pointer", [pointer]);
    }
    
    async update_principal(c:lib.interventions){
        return await server.exec("merger",[this],"update_principal", [c]);
    }
}