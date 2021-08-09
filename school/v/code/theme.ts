import * as outlook from "../../../outlook/v/code/outlook.js";
//
//Allows methods on this page to talk to the server
import * as server from "../../../library/v/code/server.js";
// 
//This is the problem we have of solving that.
import * as library from "../../../library/v/code/library.js";
//
//Resolve the schema classes, viz.:database, columns, mutall e.t.c. 
import * as schema from "../../../library/v/code/schema.js";
//
import * as io from "../../../school/v/code/io.js";
// 
import { scroll,crud_selection } from "./scroll.js";
import { column_meta } from "./library.js";
//
//These are pages based on a particular subject as its theme 
export class theme extends scroll {
    // 
    //Saves io instances that created this theme table saved as a map 
    //indexed by their position in a thematic oanel
    static ios: Map<string, io.io> = new Map();
    // 
    //
    constructor(
        //
        //The database and entity name that is displayed in this 
        //theme panel.
        public subject: outlook.subject,
        // 
        //The css for retrieving the html element where to display 
        //the theme's subject record.
        public css: string,
        // 
        //The view page that is the home of this panel 
        public base: outlook.view,
        // 
        //An optional selection of the first record 
        public selection?: crud_selection
        
    ) { super(css, base);}
    //
    //Paint the content panel with editable records of the subject
    public async continue_paint() {
        //
        //Get the editor description.
        const metadata = await server.exec(
            //
            //The editor class is an sql object that was originaly designed 
            //to return rich content for driving the crud page.
            "editor",
            //
            //Constructor args of an editor class are ename and dbname 
            //packed into a subject array in that order.
            this.subject,
            //
            //Method called to retrieve editor metadata on the editor class.
            "describe",
            //
            //There are no method parameters
            []
        );
        //
        //Destructure the metadata
        const [idbase, col_names, sql, max_record] = metadata;
        //
        //Set the metadata properties
        this.sql = sql; this.col_names = col_names; 
        this.max_records = parseInt(max_record);
        //
        //Activate the static php database.
        this.dbase = new schema.database(idbase);
        //
        //Initialize the crud style for managing the hide/show feature 
        //of columns
        this.initialize_styles(col_names);
        //
        //Retrieve and display $limit number of rows of data starting from the 
        //given offset/request.
        let pk: library.pk | undefined;
        if (this.selection !== undefined) pk = this.selection.pk;
        await this.goto(pk);
        //
        //Select the matching row and scroll it into view.
        this.select_nth_row(pk);
    }
    //
    //Return the io structure associated with the given td
    public get_io(meta:column_meta): io.io {
        //
        //Destructure the subject to get the entity name; its the 
        //first component. 
        const[ename] = this.subject;
        // 
        //Get the column name that matches this td. 
        const col_name = meta.name;
        //
        //Get the actual column from the underlying database.
        const col = this.dbase!.entities[ename].columns[col_name];
        //
        //Create and return the io for this column.
        const Io = io.create_io(this, col);
        // 
        return Io;
    }
    // 
    // 
    get sql(): string{
        if (this.sql_ !== undefined) return this.sql_;
        // 
        //Otherwise throw an exception this is because a getter property cannot be asynchronous 
        //hence this property was required before it was set.
        throw new schema.mutall_error("property sql cannot be obtains before the continue paint")
    }
    // 
    // 
    set sql(s: string) {
        this.sql_ = s;
    }
}
