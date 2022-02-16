//
//Resolve the reference to the unindexed product(uproduct)
import * as outlook from '../../../outlook/v/code/outlook.js';
//
//Resolve the reference to the app class
import * as app from "../../../outlook/v/code/app.js";
//
//Resolve the reference to the server class
import * as server from "../../../schema/v/code/server.js";
//
//Resolve the reference to the imerge structure
import * as lib from "../../../schema/v/code/library";
//
//Resolve the reference to the merger class
import merger from "../../../outlook/v/code/merger.js";
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
                    },
                    {
                        title: "Merge Contributions",
                        id: "merge_contribution",
                        listener: ["event", () => this.merge_contributions()]
                    },
                    {
                        title: "Merge General",
                        id: "merge_general",
                        listener: ["event", async () => {
                            //Create a new object
                            const consolidate = new merge_general(this, "merge_general.html");
                            //
                            await consolidate.administer();
                        }]
                    }
                ]
            }
        ]
    }
    //
    //Merge the contributions
    async merge_contributions(): Promise<void> {
        //
        //Create a new object
        const consolidate = new merge_contrib(this, "merge_contribution.html");
        //
        //Get the contribution data to paint it to the viewing area
        await consolidate.get_data();
        //
        await consolidate.administer();

    }
    //
    //Display the member contributions for all the group events
    async cross_tab(): Promise<void> {
        //
        //Create the view where we want to display the table
        const view: sql_viewer = new sql_viewer(this, this.config.general);
        //
        await view.get_data();
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
        const pairs = enames.map(ename => ({key: ename, value: ename}));
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
        const pairs = chama.map(pair => {return {key: "name", value: String(pair.name)}});
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
    /*populate_selector(): void {
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
    }*/
}

// 
//This is a view is used for displaying sql data in a table
class sql_viewer extends outlook.baby<void>{
    //
    //
    //This is the structure of the cross tabulation records.
    public input?: Array<{member:number,email: string, events: {[index: string]: number}}>;
    //
    //The headers to populate the cross tab table with their headings
    public headers?: Array<{name: string}>;
    //
    constructor(
        // 
        //This popup parent page.
        mother: outlook.view,
        //
        //The html file to use
        filename: string,
        //

    ) {
        // 
        //The general html is a simple page designed to support advertising as 
        //the user interacts with this application.
        super(mother, filename);
    }
    // 
    //Reporting does not require checks and has no results to return because 
    // it is not used for data entry.
    check(): boolean {return true;}
    async get_result(): Promise<void> {}
    //
    //Add the input buttons to each email column. Here, providing the checks is
    //dependent on whether the popup window has a merge button
    add_check_box(td: HTMLTableCellElement, member:number): void {}
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
        this.create_element(th, 'th', {textContent: "email"});
        //
        //Populate the events th
        this.headers!.forEach(header => {
            //
            //events:{[index:string]:number}
            //Destructure the header
            const {name} = header;
            //
            //Create a header associated with each event
            this.create_element(th, 'th', {textContent: name});
            //
        });
        //
        //Add the values as rows to the table's body
        this.input!.forEach(row => {
            //
            //Destructure the row
            const {member,email, events} = row;
            //
            //Use the row to create a tr
            const tr = this.create_element(tbody, 'tr', {});
            //
            //Populate the email td
            const td = this.create_element(tr, 'td', {textContent: email});
            //
            //Add the input buton at this point and it should be hidden by default
            //
            //Create an input button before the tr ***
            this.add_check_box(td, member);
            //
            //Add the input button before the email td's
            //.unshift('<input type="checkbox"> </input>');
            //
            //Populating the events
            this.headers!.forEach(header => {
                //
                //Destructure the header
                const {name} = header;
                //
                //
                const value = String(events[name] == undefined ? "" : events[name]);
                //
                //Use this header to create a td
                this.create_element(tr, 'td', {textContent: value});
            });
        });
    }
    async get_data(): Promise<void> {
        //
        //Obtain the contribution values from the database
        //
        //Formulate the query to obtain the values
        const sql = `
                select
                    member.member,
                    member.email,
                    json_objectagg(event.id,contribution.amount) as events
                from 
                    contribution
                    INNER JOIN member on contribution.member= member.member
                    INNER JOIN event on contribution.event= event.event
                group by member`;
        //
        //Execute the query
        const values: Array<{member:number,email: string, events: string}> =
            await server.exec("database", ["mutall_chama"], "get_sql_data", [sql]);
        //
        //Expected output
        //  [{
        //  member:125, 
        //    email:"Aisha Gatheru",
        //   events: {carol:500},
        //            {ndegwa:100},
        //            {mwihaki_dad:1000}
        //           ]
        //  }]
        //Define the suitable output of the data 
        this.input =
            values.map(value => {
                //
                //
                const {member,email, events} = value;
                //
                //Convert the events string to an event array
                const events_array: {[index: string]: number} = JSON.parse(events);
                //
                //
                return {member,email, events: events_array};
            });
        //
        //Obtain the header values
        this.headers = <Array<{name: string}>> await server.exec("database", ["mutall_chama"], "get_sql_data",
            ["select event.id as name from event order by date"]);
    }
}
//
//Merging the group contributions
class merge_contrib extends sql_viewer {
    //
    //The email column obtained from the cross tab data
    public pk?: HTMLTableCellElement;
    //
    constructor(
        // 
        //This popup parent page.
        mother: outlook.view,
        //
        //The html file to use
        filename: string
        //
        //The primary key columns,i,e the first records in the eHTMLTableCellElement
    ) {
        // 
        //The general html is a simple page designed to support advertising as 
        //the user interacts with this application.
        super(mother, filename);
        //
    }
    //
    //Execute the merge process by first obtaining the merger data from the
    // current panel. i.e.,from the processed values. 
    async merge(): Promise<void> {
        //
        //Set the database name
        const dbname = "mutall_chama";
        //
        //Set the entity name
        const ename = "member";
        //
        //Construct the members by reading off the checked values.
        //The checked values are needed to form the list of members to be merged.
        // These values are compiled in a structure and returned as values when 
        // we form the members list to complete the imerge structure.
        //Get the checked values by identifying the text boxes associated with 
        //the entry of each member.
        const inputs = document.querySelectorAll('input[type="checkbox]:checked');
        //
        //Introduce the container to store the records once they are fetched
        //let results: Array<Array<String>> = [];
        //
        // Attach an event listener to the button to compile all members to be merged
        //document.getElementById("merge")?.addEventListener('click', async () => {
            //
            //Move through each input button to check on whether it is clicked or not, 
            inputs.forEach(values => {
                //
                const {member}= values;
                //
                //
                const members_array:{member: number}= JSON.parse(member)
            });
            //
            //Define the members sql
            const members = `
                            select member.member 
                            from member 
                            where member.member 
                            in(${results.toString})
                            `;
            //
            //Construct the imerge object
            const imerge: lib.Imerge = {dbname, ename, members};
            //Construct the merger object
            const Merger: merger = new merger(imerge, this);
            //
            //Execute the merge operation
            await Merger.execute();
    }
    //
    //Add a check box to the given td
    add_check_box(td: HTMLTableCellElement,member:number): void {
        //
        //Resolve the call to the inherited checks method
        super.add_check_box(td, member);
        //
        //Create an input button before
        this.create_element(td,'input',{type:"checkbox",value:String(member)});
    }
    //
    //Over ride the show panels to attach an event that triggers the merge class
    // for the merging process.
    async show_panels(): Promise<void> {
        //
        await super.show_panels();
        //
        //Get the merge button and add an event to it
        const button = <HTMLSelectElement> this.get_element("merge");
        button.onclick = () => this.merge();
    }
}
//
//
//
//Merging the group contributions
class merge_general extends outlook.baby<void>  {
    //
    constructor(
        // 
        //This popup parent page.
        mother: outlook.view,
        //
        //The html file to use
        filename: string
        //
        //The primary key columns,i,e the first records in the eHTMLTableCellElement
    ) {
        // 
        //The general html is a simple page designed to support advertising as 
        //the user interacts with this application.
        super(mother, filename);
        //
    }
    // 
    //Reporting does not require checks and has no results to return because 
    // it is not used for data entry.
    check(): boolean {return true;}
    async get_result(): Promise<void> {}
    //
    //Merging the general records
    async merge(): Promise<void> {
        //
        //Get the merger data
        //Get the database name
        const dbname = (<HTMLInputElement> document.getElementById("dbname")).value;
        //Get the entity name
        const ename = (<HTMLInputElement> document.getElementById("ename")).value;
        //
        const members = (<HTMLInputElement> document.getElementById("members")).value;
        //
        //Construct the imerge object
        const imerge: lib.Imerge = {dbname, ename, members};
        //Construct the merger object
        const Merger: merger = new merger(imerge, this);
        //
        //Execute the merge operation
        await Merger.execute();
    }
    //
    //Over ride the show panels to attach an event that triggers the merge class
    // for the merging process.
    async show_panels(): Promise<void> {
        //
        await super.show_panels();
        //
        //Get the merge button and add an event to it
        const button = <HTMLSelectElement> this.get_element("merge");
        button.onclick = () => this.merge();
    }
}


