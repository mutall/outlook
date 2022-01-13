//
//Resolve the reference to the unindexed product(uproduct)
import * as outlook from '../../../outlook/v/code/outlook.js';
//
//Resolve the reference to the app class
import * as app from "../../../outlook/v/code/app.js";
//
//Resolve the reference to the server class
import * as server from "../../../library/v/code/server.js";
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
                id: "contributions",
                title: "Manage Member Contributions",
                solutions: [
                    //
                    //Join a group.
                    {
                        title: "Manage an event",
                        id: "event_manage",
                        listener: ["crud", 'event', ['review'], '+', "mutall_chama"]
                    },
                    //
                    //Manage the members
                    {
                        title: "Membership management",
                        id: "member_manage",
                        listener: ["crud", "member", ['review'], '+', "mutall_chama"]
                    },
                    //
                    //Edit any table in this application
                    {
                        title: "Super User Table Editor",
                        id: "edit_table",
                        listener: ["event", () => this.edit_table()]
                    },
                    //
                    //Select a group or groups you belong to
                    {
                        title: "Select a group",
                        id: "select_group",
                        listener: ["event", () => this.group_selector()]
                    },
                    //
                    //
                    {
                        title: "Tabulate Contributions",
                        id: "cross_tab",
                        listener: ["event", () => this.cross_tab()]
                    }
                ]
            }
        ]
    }
    //
    //Display the member contributions for all the group events
    async cross_tab(): Promise<void> {
        //
        //Obtain the contribution values from the database
        //
        //Formulate the query to obtain the values
        const sql = `
                select
                    member.email,
                    json_objectagg(event.id,contribution.amount) as events
                from 
                    contribution
                    INNER JOIN member on contribution.member= member.member
                    INNER JOIN event on contribution.event= event.event
                group by email`;
        //
        //Execute the query
        const values: Array<{ email: string, events: string }> =
            await server.exec("database", ["mutall_chama"], "get_sql_data", [sql]);
        //
        //Expected output
        //  [{ email:"Aisha Gatheru",
        //   events: {carol:500},
        //            {ndegwa:100},
        //            {mwihaki_dad:1000}
        //           ]
        //  }]
        //Define the suitable output of the data 
        const results: Array<{ email: string, events: { [index: string]: number } }> =
            values.map(value => {
                //
                //
                const { email, events } = value;
                //
                //Convert the events string to an event array
                const events_array: { [index: string]: number } = JSON.parse(events);
                //
                //
                return { email, events: events_array };
            });
        //
        //Obtain the header values
        const headers: Array<{ name: string }> = await server.exec("database", ["mutall_chama"], "get_sql_data",
            ["select event.id as name from event order by date"]);
        //
        //Create the view where we want to display the table
        const view: sql_viewer = new sql_viewer(this, this.config.general, results, headers);
        //
        //
        await view.administer();
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
    //Adding the Business Selector
    async group_selector(): Promise<void> {
        //
        //1. List all available Chama
        const chama = await server.exec("database", ["mutall_chama"], "get_sql_data",
            ["select `name` from `group`"]);
        //
        //Set the slected groups to accept multiple values
        const pairs = chama.map(pair => { return { key: "name", value: String(pair.name) } });
        //
        // 1.1 Use the listed chamas to create a popup
        const Choice = new outlook.choices<string>("general", pairs, "chama", null, "#content", "single");
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
// 
//This is a view is used for displaying sql data in a table
class sql_viewer extends outlook.baby<void>{
    // 
    //
    constructor(
        // 
        //This popup parent page.
        mother: outlook.view,
        //
        //The html file to use
        filename: string,
        //
        public input: Array<{ email: string, events: { [index: string]: number } }>,
        //
        public headers: Array<{ name: string }>
    ) {
        // 
        //The general html is a simple page designed to support advertising as 
        //the user interacts with this application.
        super(mother, filename);
    }
    // 
    //Reporting does not require checks and has no results to return because 
    // it is not used for data entry.
    check(): boolean { return true; }
    async get_result(): Promise<void> { }
    // 
    //Display the report 
    async show_panels() {
        // 
        //Get the access to the content panel and attach the html
        const content = this.get_element('content');
        //
        //Hide the go button from the general html since it is not useful in the 
        //the reporting
        this.get_element("go").hidden = true;
        //
        //Create a table and display the values in a proper format
        //Create the table element
        const table = this.create_element(content, 'table', {});
        //
        //Create the thead element
        const thead = this.create_element(table, 'thead', {});
        //
        //Create the table's body
        const tbody = this.create_element(table, 'tbody', {});
        //
        //
        //Use the columns to create a th
        const th = this.create_element(thead, 'tr', {});
        //
        //Populate the email th
        this.create_element(th, 'th', { textContent: "email" });
        //
        //Populate the events th
        this.headers.forEach(header => {
            //
            //events:{[index:string]:number}
            //Destructure the header
            const { name } = header;
            //
            //Create a header associated with each event
            this.create_element(th, 'th', { textContent: name });
            //
        });
        //
        //Add the values as rows to the table's body
        this.input.forEach(row => {
            //
            //Destructure the row
            const { email, events } = row;
            //
            //Use the row to create a tr
            const tr = this.create_element(tbody, 'tr', {});
            //
            //Populate the email td
            this.create_element(tr, 'td', { textContent: email });
            //
            //Populating the events
            this.headers.forEach(header => {
                //
                //Destructure the header
                const {name}= header;
                //
                //
                const value = String(events[name] == undefined ? "" : events[name]);
                //
                //Use this header to create a td
                this.create_element(tr, 'td', { textContent: value });
            });
        });
    }
}


