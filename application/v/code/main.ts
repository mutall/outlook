//
/*
 * This drives your APPLICATION, the SERVICES, the CONTENT, MESSAGES, and EVENTS
 */
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
                    }
                ]
            }
        ]
    }
    //
    //Paint the messages with messages generated by the group.
    async populate_messages(): Promise<void> {
        //
        //Define the query to set the results
        const query = `
                        select
	                        msg.date,
	                        msg.time,
	                        member.email as sender,
	                        msg.text
                        from msg
	                        INNER JOIN member on member.member= msg.member
                    `;
        //
        //Get the events 
        const msg: Array<{ date: number, time: number, sender: number, text: string }> = await server.exec("database", ["mutall_chama"], "get_sql_data", [query]);
        //
        //Access the values of the elements.

        //
        //Get the section to paint the messages
        const panel: HTMLElement = this.get_element("messenger");
        //
        for (let message of msg) {
            //
            //Destructure the msg array
            const { date, time, sender, text } = message;
            //
            //Set the messages to messages panel
            const texts: string = `
            <div id="msg">
                <div id='datetime'>${date}+${time}</div>
                <div id='sender'>${sender}</div>
                <div id='text'>${text}</div>
            </div>
            `;
            //
            //Create the area that is set to contain the messages
            panel.innerHTML = texts;
        }
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
}