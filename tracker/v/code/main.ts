//
//Import app from the outlook library.
import {assets, baby, popup} from '../../../outlook/v/code/outlook.js';
import * as outlook from '../../../outlook/v/code/outlook.js';

import * as app from "../../../outlook/v/code/app.js";
//
import {input, io} from '../../../outlook/v/code/io.js';
//
//Import server
import * as server from '../../../schema/v/code/server.js';
//
//Import schema.
import * as schema from '../../../schema/v/code/schema.js';
//
//Resolve the iquestionnaire
import * as quest from '../../../schema/v/code/questionnaire.js';         
//
//System for tracking assignments for employees of an organization.
//
//A column on the application database that is linked to a corresponding one
//on the user database. Sometimes this link is broken and needs to be
//re-established.
type replica = {ename: string, cname:string};
//
export default class main extends app.app {
    //
    //Initialize the main application.
    constructor(config: app.Iconfig) {
        super(config);
    }
    //
    //
    //Retuns all the inbuilt products that are specific to
    //thus application
    get_products_specific(): Array<outlook.assets.uproduct> {
        return [
          
            {
                title: "Actions",
                id: 'actions',
                solutions: [
                    //
                    //Edit any table in this application
                    {
                        title: "Super User Table Editor",
                        id: "edit_table",
                        listener: ["event", () => this.edit_table()]
                    },
                    //
                    //View due assignments 
                    {
                        title: "View due assignments",
                        id: "view_due_assignments",
                        listener: ["event", () => this.view_due_assignments()]
                    }                
                ]
            },
            {
                title: "Tea Services",
                id: 'tea_services',
                solutions: [
                    //
                    //Registering tea delivery 
                    {
                        title: "Tea Delivery",
                        id: "tea_delivery",
                        listener: ["event", () => this.tea_delivery()]
                    }, 
                    //
                    //Tea payments
                    {
                        title: "Pay Tea",
                        id: "pay_tea",
                        listener: ["event", () => this.pay_tea()]
                    }                  
                ]
            },
            {
                title:"Assignments",
                id: 'assignments',
                solutions: [
                    //
                    //Allow users to input assignments and save to the database 
                    //from GUI.
                    {
                        title: "Input Assignments",
                        id: "input_assignments",
                        listener: ["event", () => this.input_assignments()]
                    },
                    {
                        title: "View Assignments",
                        id: "view_assignments",
                        listener: ["event", () => this.view_assignments()]
                    }
                ]
            },
            {
                title: "Event planner",
                id: 'event_planner',
                solutions: [
                       //
                       //Add a service for crating new events.
                       {
                          title: "Create" ,
                          id: "create_event",
                          listener: ["event", () => this.create_event()]
                       }
                ]
            }
               
        ]
    }
    //
    //List all assignments that are due and have not been reported.
    //Ordered by Date. 
    view_due_assignments(): void {
       //
       //1.Create a SQL to get data from the database.
       const sql = `select 
                          todo.id,
                          todo.description,
                          developer.email,
                          datediff(now(),
                          todo.start_date) as days_due
                     from
                          todo
                          inner join developer on developer.developer =
                          todo.developer
                     where
                           datediff(now(),
                           todo.start_date) >= 14`;
         //
         //2. Create a new SQL form using the sql.
         
         
         //
         //3. Administer the form.
                  
    }
    //
    //Tea delivery
    async tea_delivery(): Promise<boolean> {
        //
        //Create an instance of the tea_delivery class
        const delivery = new tea_delivery();
        //
        //Open the popup and close when the user is done.
        await delivery.administer();
        //
        //
        return true;
    }
    //
    //Tea payment
    async pay_tea(): Promise<boolean>{
        //
        //Create an instance of the tea payment class.
        const payment = new pay_tea();
        //
        // Open the popup and close when the user is done.
        await payment.administer();
        //
        //
        return true;
    }
    //
    //Allow users to input assignments from a UI
    async input_assignments(): Promise<any> {
        //
        //Create an instance of input assignments.
        const input = new input_assignments('crud.html');
        // //
        // //Call crud page and close when done.
        await input.administer();
        // //
        // //
        // return true;
    }
    //
    //view all assignments.
    view_assignments(): void {
        alert('Service under development');
    }
    //
    //Create event and display on the events panel
    create_event(): void{
        alert('service under development');
    }
   
}
//
//Tea delivery services.
class tea_delivery extends popup<void>{
    //
    constructor(){
      super('tea_delivery.html')
    }
    //
    //check if a file json file containing Iquestionnaire is selected.
    //For now, do nothing
    check(): boolean {return true;}
    //
    //Collect data to show whether we should update the home page or not.
    async get_result(): Promise<void> {}
    //
    //Add an event listener to the ok button.
    async show_panels() {
      //
      //Get the ok button
      const save = this.get_element("go");
      //
      //Add an event listener to the ok element
      save.onclick = async () => this.save_delivery();
    }
    //
    save_delivery(){
      //
      alert('Success');
    }
  }
  //
  //Tea payment 
class pay_tea extends popup<void>{
    //
    constructor(){  
        super('pay_tea.html')
    }
    //
    //Collect data to show show if we should update the homepage or not.
    check(): boolean {return true};
    //
    //Collect data to show whether we should update the home page or not.
    async get_result(): Promise<void> {}
    //
    //Add an event listener to the ok button.
    async show_panels() {
        //
        //Get the ok button
        const save = this.get_element("go");
        //
        //Add an event listener to the ok button.
        save.onclick = async () => this.pay_tea();
    }
    pay_tea (){
        //
        alert('Success');
     }
}
//
//Assignments input. 
class input_assignments extends baby<outlook.view>{
    
    //
    //
    check(): boolean {return true};
    //
    //Check if a file json containing Iquestionare is selected.
    async get_result(): Promise<any> {}
    //
    //add an event listener.
    async show_panels() {
        //
        //Get the ok button
        const save = this.get_element("go");
        //
        //
        save.onclick = async () => this.input_assignments();
    }
    input_assignments(){
        alert('Success');
    }
}


  