//
//Import app from the outlook library.
import { assets,choices,subject } from '../../../outlook/v/code/outlook.js';
import {app} from "../../../outlook/v/code/app.js";
import config from './config.js';
import {theme} from "../../../outlook/v/code/theme.js";
import * as server from "../../../library/v/code/server.js"
//
//The school model that link teacher, pupils and parents
export default class chama extends app{
    //
    static current:chama;
    //Initialize the chama
    constructor(){
        super(
            //
            //Override the config
            new config()
        );  
        chama.current=this; 
    }
    //
    //Include this application based products
     get_Iproducts():assets.products{
            //
            //Create the app's default products
            const Iproduct = super.get_Iproducts();
            //
            //Event Management
             const solutions1: assets.solutions={
            //
            //Join a group.
            event_manage:{
                    title: "Manage an event",
                    id:"event_manage",
                    listener:["crud",'event', ['review'],'+',"mutall_chama"]
                },
            //
            //Manage the members
            member_manage:{
                title: "Membership management",
                id:"member_manage",
                listener:["crud","member",['review'],'+',"mutall_chama"]
                },
            //
            //Edit any table in this application
            edit_table:{
                title:"Super User Table Editor",
                id:"edit_table",
                listener: ['post_defined',`app.current.edit_table()`]
            },
            //
            //Select a group or groups you belong to
            select_group:{
                title:"Select a group",
                id:"select_group",
                listener: ['post_defined',`app.current.group_selector()`]
            }
             }
        //
        //Event Management Data
          Iproduct['user']= {
                id: "user", title: "Event Management",
                    solutions: solutions1
                }
        return Iproduct;
    }
    //
    //Edit any table in the system
    async edit_table(){
        //
        //1. Get all the tables from the system as key value pairs
            //
            //1.1 Get the application database
            const dbase = this.dbase!;
            //
            //1.2 Use the database to extract the entities
            const enames = Object.keys(dbase.entities);
            //
            //1.3 Map the entities to the required key value pairs
            const pairs = enames.map(ename=>({key:ename, value:ename}));
        //
        //2. Use the pairs to create a new choices POPUP that returns a selected
        //table
        const Choice = new choices<string>(this.config,pairs,"table",null,"#content","single");
        //
        //3. Open the POPUP to select a table.
        const selected = await Choice.administer();
        //
        //4. Test whether the selection was aborted or not
        if (selected === undefined)return;
        //
        //5. Use the table to run the CRUD services.
        const subject:subject = [selected[0], this.dbname];
        const verbs: Array<assets.verb> = ['create','review','update','delete'];
        this.crud(subject,verbs);
    }
    //
    //Adding the Business Selector
    async group_selector(): Promise<void>{
       //
       //1. List all available Chama
       const chama= await server.exec("database",["mutall_chama"],"get_sql_data",
            ["select `name` from `group`"]) ;
       //
       //Set the slected groups to accept multiple values
        const pairs = chama.map(pair=>{return{key:"name",value:String(pair.name)}});
       //
       // 1.1 Use the listed chamas to create a popup
       const Choice = new choices<string>(this.config,pairs,"chama",null,"#content","single");
       //
       //2. Select one or more groups
        const selected = Choice.administer();
       //
       //3. Update the Databases in both "user" and "application"
       //
       //4. Respect the business selector to all crud sql's
    }
    //
    //1. Populate the selector with table names from current database
    populate_selector():void{
        //
        //1.Get the current database: It must EXIST by THIS TIME
        const dbase = this.dbase;
        if (dbase === undefined) throw new Error("No current db found");
        //
        //2.Get the subject selector
        const selector = <HTMLSelectElement> this.get_element("selection");
        //
        //3.Loop through all the entities of the database
        //using a for in statement
        for (const ename in dbase.entities){
            //
            //3.1 Create a selector option
            const option = this.document.createElement('option');
            //
            //  Add the name that is returned when you select
            option.value = ename;
            //
            //3.2 Populate the option
            option.textContent=ename;
            // 
            //3.3 Add the option to the subject selector
            selector.appendChild(option);
        }
    }
    //
    //Show all databases in the server to list tables within each database
    async show_databases():void{
        //
        //Call the server_exec method to return with the database
        const database= await server.exec("database",["Database"],"get_sql_data",["show databases"]);
        //
        //Get the selector 
        const option = this.get_element("dbase");
        //
        //Get the selected database and show the listed tables
        //Loop through all databases and list the entities
        
        //Populate the selector with the options
    }
    //
    //2. Change the subject of this application
    async change_subject(selector:HTMLSelectElement): Promise<void>{
       //
       //2.1 Formulate a subject
       // Get the dbname
        const dbname = this.config.app_db
        //
        //Get the selected entity
        const ename = selector.value;
        //
        //Compile the new subject
        const subject : [string,string]=[ename, dbname];
        //
        //Get the theme panel
        const Theme : theme = <theme>this.panels.get("theme");
        //
        //Change the theme's subject
        Theme.subject = subject;
        //
        //Clear the existing content in the table
        this.document.querySelector('thead')!.innerHTML = '';
        this.document.querySelector('tbody')!.innerHTML = '';
        //
        //2.2 Repaint the theme panel---
        Theme.view.top = 0;
        Theme.view.bottom = 0;
        await Theme.continue_paint();
    }
}
//
//Start the application after fully loading the current 
//window.
window.onload = async ()=>{
    app.current= new chama();
    await app.current.initialize();
    chama.current.populate_selector();
    server.exec("chama",[],"set_groups",[],app.current.url);
}