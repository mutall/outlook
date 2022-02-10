//
//Resolve the reference to the unindexed product(uproduct)
import * as outlook from '../../../outlook/v/code/outlook.js';
//
//Resolve the reference to the app class
import * as app from "../../../outlook/v/code/app.js";
//
//Resolve the reference to the server class
//import * as server from "../../../schema/v/code/server.js";
//import { input } from '../../../outlook/v/code/io.js';
//
//
//
//Main application
export default class main extends app.app {
    //
    //Initialize the main application.
    constructor(config: app.Iconfig) {
        super(config);
    }
    //
    //Returns all the inbuilt products that are specific to
    //this application
    get_products_specific(): Array<outlook.assets.uproduct> {
        return [
            {
                id: "developers",
                title: "Manage Developers",
                solutions: [
                    //
                    //View the due assignments
                    {
                        title: "View Due Assignments",
                        id: "view_assignments",
                        listener: ["crud", 'todo', ['review'], '+', "mutall_tracker"]
                    },
                    //
                    //Manage the developers
                    {
                        title: "View Developers",
                        id: "manage_developers",
                        listener: ["crud", "developer", ['review'], '+', "mutall_tracker"]
                    }
                ]
            }
        ]
    }
    //
    //Edit any table in the system
    async edit_table() {
        //
        //1. aGet all the tables from the system as key value pairs
        //
        //1.1 Get the application database
        const dbase = this.dbase!;
        //
        //1.2 Use the database to extract the entities
        const enames = Object.keys(dbase.entities);
        //
        //1.3 Map the entities to the required key value pairs
        const pairs = enames.map(ename => ({ key: ename, value: ename }));
        //
        //2. Use the pairs to create a new choices POPUP that returns a selected
        //table
        const Choice = new outlook.choices<string>(this.config.general, pairs, "table", null, "#content", "single");
        //
        //3. Open the POPUP to select a table.
        const selected = await Choice.administer();
        //
        //4. Test whether the selection was aborted or not
        if (selected === undefined) return;
        //
        //5. Use the table to run the CRUD services.
        const subject: outlook.subject = [selected[0], this.dbname];
        const verbs: Array<outlook.assets.verb> = ['create', 'review', 'update', 'delete'];
        this.crud(subject, verbs);
    }
    //
    //1. Populate the selector with table names from current database
    populate_selector(): void {
        //
        //1.Get the current database: It must EXIST by THIS TIME
        const dbase = this.dbase;
        if (dbase === undefined) throw new Error("No current db found");
        //
        //2.Get the subject selector
        const selector = <HTMLSelectElement>this.get_element("selection");
        //
        //3.Loop through all the entities of the database
        //using a for in statement
        for (const ename in dbase.entities) {
            //
            //3.1 Create a selector option
            const option = this.document.createElement('option');
            //
            //  Add the name that is returned when you select
            option.value = ename;
            //
            //3.2 Populate the option
            option.textContent = ename;
            // 
            //3.3 Add the option to the subject selector
            selector.appendChild(option);
        }
    }
}


