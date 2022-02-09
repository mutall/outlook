import * as outlook from "./outlook.js";
//
//Allows methods on this page to talk to the server
import * as server from "../../../schema/v/code/server.js";
// 
//This is the problem we have of solving that.
import * as library from "../../../schema/v/code/library.js";
//
//Resolve the schema classes, viz.:database, columns, mutall e.t.c. 
import * as schema from "../../../schema/v/code/schema.js";
//
import * as io from "./io.js";
// 
//
import * as app from './app.js';

//
//This interface helps us to control the data we retrieve from the server
//to support scrolling
interface outcome {
    type: "nothing" | "adjust" | "fresh" | "out_of_range";
}
//
//We don`t need to retrieve new records from the server since the request
//can be met with the available data...ie.,desired offset is 
//within view boundaries
interface nothing extends outcome {}
//
//We require to adjust the top/bottom view boundaries to accomodate 
//the scroll request
interface adjust extends outcome {
    //
    //Indicator of which boundary we are adjusting i.e.,top/bottom
    dir: direction,
    //
    //This is the offset from where to retrieve the data
    start_from: offset,
    //
    //The amount by which to adjust the top/bottom boundaries
    adjusted_view: number
}
//
//This ouitcome arises when the request is:-
//- within extremes, 
//- and outside the joint boundaries
//In that case, we need to load a fresh set of table rows i.e., 
// -clear current tbody, 
// -load new rows 
// -and adjust the views.
interface fresh extends outcome {
    //
    //This value constrains the top boundary of the fresh view.
    view_top: offset,
    //
    //This value constrains the bottom boundary of the same view.
    view_bottom: number
}
//
//This outcome arises from a request that is outside/beyond  the 
//extreme boundaries
interface out_of_range extends outcome {
    //
    //Illegal request.(Used in formulating the error message)
    request: offset
}
//
//This a positive number i.e., above 0 that is less than 
//the maximum number of records in the subject. It is important for 
//paginating crud.
type offset = number;
//
//This represents the td from which we initiated the administration.
//It is also used for passing back edited td
export type crud_selection = {
    //
    //The td position where the original primary key came from 
    position: library.position,
    //
    //The primary key auto number represented as a string
    //because we are mostly using it as such  
    pk? : library.pk,
    //
    //The long friendly name associated with a primary key and used 
    //for labelling fk edit buttons    
    friendly? : string
}
// 
//A theme view boundary has two extremes, the top and the bottom 
export interface boundary{
    // 
    //The top extreme is an offset number that represents the upper limit 
    //of this boundery.
    top: number,
    // 
    //The bottom extreme is an offset that represents lower limit 
    //of this boundery
    bottom:number
}
// 
//Boundary markers    
export type direction = "top" | "bottom";
//
//The scroll outcomes depending on the pressed key. 
type key_outcome = {
    //
    //Movement may be between rows, pages or across the whole table. 
    move: "row" | "page" | "table";
    //
    //The key movement may be in the up or down direction.
    dir: "up" | "down";
    //
    //The tr that becomes the current selection. The number is the offset to
    //the first or last row in the current dataset.
    tr: HTMLTableRowElement | number;
}
//
//These are pages based on a particular subject as its theme 
export class theme extends outlook.panel {
    /** 
     * THE SQL (view in our class schema class model) METADATA 
     * OF THE QUERY USED TO RETRIEVE DATA PAINTED IN THE CONTENT 
     * PANEL INCLUDE....
     */
    // 
    //1...The sql used to extract information painted in this 
    //in the content section of this theme
    sql?: string
    // 
    //2...The column names involved in the above named sql
    col_names?: Array<library.cname>;
    // 
    //3...The maximum possible records that are available to paint
    //the content pannel. they are required in adjusting the boundaries
    max_records?: number;
    // 
    //Saves io instances that created this theme table saved as a map 
    //indexed by their position in a thematic panel
    static ios: Map<string, io.io> = new Map();
    //
    //4....The database where this subject entity is housed 
    dbase?: schema.database;
    /** 
     * The scrolling variables
     */
    //
    //The offset of the records that are visible in the page 
    //both top and bottom i.e within scrolling without loading 
    //more data in the purple part of our boundary diagram
    view: boundary={top:0, bottom:0};
    // 
    //This is the limit number of records that can be retrieved and 
    //constrained by the extreme boundery the blue part of the 
    //blue region of our map
    joint:boundary={top:0, bottom:0};
    //
    //This is the offset that indicates the last retrievable record 
    //i.e., the green part of our scroll diagram.
    get extreme():boundary{
        return {top: 0, bottom: this.max_records!};
    }
    //
    //
    //The database and entity name that is displayed in this 
    //theme panel.
    public subject: outlook.subject;
    //
    //Track the original sql for supporting the review service.
    public original_sql: string | null = null;
    //
    //Display mode to be used in controlling the usage of the scrolling keys.
    public display_mode: "edit" | "normal" = "normal";
    //
    constructor(
        //
        //The database and entity name that is displayed in this 
        //theme panel.
        subject: outlook.subject|null,
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
        
    ) {
        super(css, base);
        this.subject = subject === null ? app.app.current.subject:subject;
    }
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
        //Assuming that we are in a document where the table header 
        //is already available...
        const thead = this.document.querySelector("thead")!;
        //
        //Show the header
        this.show_header(thead);
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
    //Initialize the crud style for managing the hide/show feature 
    //of columns
    protected initialize_styles(col_names: Array<string>) {
        //
        //Get the columns style sheet
        const sheet: CSSStyleSheet = (<HTMLStyleElement>this.get_element("columns")).sheet!;
        //
        //loop through all the columns and set the styling for each column
        col_names.forEach((_col, index) => {
            //
            //Change  the index to a 1-based
            const index1 = index + 1;
            //
            //Create the rule for supporting styling of a header and its matching
            //fields the same way.
            //e.g When hiding th:nth-child(2), td:nth-child(2){ display:none}
            const rule = `th:nth-child(${index1}), td:nth-child(${index1}){}`;
            //
            //Insert the rule to the style sheet.
            sheet.insertRule(rule, index);
        });

    }
    //
    //Construct the header row and append it to the thead.
    protected show_header(thead: HTMLElement) {
        //
        //Header should look like this
        //The primary key column will also serve as the multi line selector
        //<tr>
        //  <th id="todo" onclick="select_column(this)">Todo</th>
        //        ...
        //</tr>
        //Construct the th and attach it to the thead.
        const tr = document.createElement("tr");
        thead.appendChild(tr);
        //
        //2. Loop through all the columns to create the table headers
        //matching the example above.
        this.col_names!.forEach(col_name => {
            //
            //Create the th element using this panel's document and attach to 
            //the current tr.
            const th = this.document.createElement("th");
            tr.appendChild(th);
            //
            //Add the id attribute to the th using the column name.
            th.id = `'${col_name}'`;
            //
            //Add the column name as the text content of the th.
            th.textContent = col_name;
            //
            //Add the column th column selector listener.
            th.onclick = (evt: Event)=> this.select_column(evt);
        });
    }
    //
    //Mark the current column as selected.
    private select_column(evt: Event | HTMLTableCellElement){
        //
        //0. Get the target th. NB:HTMLTableHeaderCellElment has been deprecated
        const th = evt instanceof HTMLTableCellElement
            ?evt:<HTMLTableCellElement>evt.target;
        //
        //1. Get the stylesheet named column from the current document.
        const stylesheet = (<HTMLStyleElement>this.get_element("columns")).sheet;
        if(stylesheet === null)
            throw new schema.mutall_error("Stylesheet 'column' not known");
        //
        //2. De-highlight any column that is currently selected.
        //2.1 Get the currently selected column (there may be none).
        const selected_column = this.target!.querySelector(".TH");
        //
        //2.2 If there's one ...
        if (selected_column !== null) {
            //
            //2.2.1 Get its index.
            const index = 
                (<HTMLTableCellElement>selected_column).cellIndex;
            //
            //2.2.2 Use the index to remove the background color from the
            //matching rule. NB: There are as many CSS rules as there are columns.
            //a. Get the rule that matches the index.
            const rule = <CSSStyleRule>stylesheet.cssRules[index];
            //
            //b. Remove the background-color property.
            rule.style.removeProperty("background-color");
        }
        //
        //3. Select the given th, in the current standard version, i.e.,  
        //using the TH class selector.
        theme.select(th);
        //
        //4. Highlight the td cells below the th.
        //
        //a. Get the index of the th index to be selected.
        const index2 = th.cellIndex;
        //
        //b. Use the index to get the CSS rule from the column stylesheet.
        const rule2 = <CSSStyleRule>stylesheet.cssRules[index2];
        //
        //c. Set the background color of the rule to lightgreen.
        rule2.style.setProperty("background-color", "lightgreen");
    }
    
    //
    //Load the table rows and adjust the  boundaries depending
    //on the outcome type.
    private async execute_outcome(outcome: outcome, request: offset) {
        //
        switch (outcome.type) {
            //
            //The request is within view so no loading
            //and no view boundary adjustment.
            case "nothing":
                //this.scroll_into_view(request,"center")
                break;
            //
            //We need to adjust the relevant view 
            //boundary to the given value          
            case "adjust":
                //
                //This must be an 
                const adjust = <adjust>outcome;
                //
                //Load the body from the offset and in the outcome direction.
                await this.load_body(adjust.start_from, adjust.dir);
                //
                //Now adjust the view direction to the outcome value.
                this.view[adjust.dir] = adjust.adjusted_view;
                //this.scroll_into_view(request,"start")
                break;
            case "fresh":
                //
                //Cast the outcome to a fresh view
                const fresh = <fresh>outcome;
                //
                //Clear the table body and reset the view 
                //boundaries
                // 
                //Get the table body.
                const tbody =this.document.querySelector("tbody");
                // 
                //There must be a table on this page.
                if (tbody === null)
                    throw new schema.mutall_error("tbody not found");
                // 
                //Empty the table body.
                tbody.innerHTML = "";
                // 
                //Reset the view boundaries to {0,0} before 
                //loading a fresh page.
                this.view={top:0,bottom:0};
                //
                //Load the new page starting from the view top, 
                //in the forward direction.
                await this.load_body(fresh.view_top, "bottom");
                //
                //Reset the boundaries after loading a fresh 
                //page.
                this.view.top = fresh.view_top;
                this.view.bottom = fresh.view_bottom;
                break;
            case "out_of_range":
                //
                //Show the request if it is not 0
                if (request!==0)
                    alert(
                        `Request is out of range bacause it fails this test 
                        ${this.extreme.top} <=${request} < ${this.extreme.bottom}`
                    );
                break;

            default:
                throw new schema.mutall_error(`The outcome of type 
                       ${outcome.type} is not known`);
        }
    }
    //
    //Populate our table body with new rows 
    //starting from the given offset and direction.
    protected async load_body(offset: offset/*:int*/, dir: direction/*:mytop | bottom*/) {
        //
        //Range-GUARD:Ensure that offset is outside of the view for loading to be valid.
        if (this.within_view(offset))
            throw new schema.mutall_error(
                `The requested offset ${offset} 
                is already in view 
                ${this.view.top} -- ${this.view.bottom}, 
                so a new load is not valid.`
            );
        //
        //Calculate a constrained limit to prevent negative offsets.
        //
        //Get the height from extreme[top] to view[top] boundaries.
        const h = Math.abs(this.view![dir] - this.extreme![dir]);
        //
        //Use h to constrain the limit
        const constrained_limit = h < app.app.current.config.limit ? h : app.app.current.config.limit;
        //
        //Query the database 
        const result: library.Ifuel = await this.query(offset, constrained_limit);
        //
        //   
        //Display the results on the table`s body.
        //
        //Get the tbody for appending records 
        const tbody = document.querySelector("tbody")!;
        //
        //Loop through the results loading each tr 
        //based on the dir
        result.forEach((fuel, i) => {
            //
            //The index where this tr should  be inserted 
            //into the tbody
            const index = dir ==="top"
                //
                //Counting from the top
                ? i
                //
                //Counting from the bottom
                : this.view.bottom - this.view.top+ i;
            //
            //Insert row.
            const tr = tbody.insertRow(index);
            // 
            //Use the fuel to populate the tr
            this.load_tr_element(tr,fuel);
        });
    }
    //
    //This is a scroll event listener to retrive the previous or next 
    //page of data depending in the position of the scroll button.
    public myscroll() {
        //
        //Let tbody be the scrollable element
        //const tbody = document.querySelector("tbody")!;
        // 
        //For now the scrollable element is the content 
        const tbody = this.get_element("content");
        //
        //Get the scroll top as a rounded integer (not truncated)
        //to ensure that the scroll height and the client height are 
        //always equal to or greater than the scroll height when we are at 
        //the bottom of the scroll. 
        const scrollTop = Math.round(tbody.scrollTop);
        //
        //Decide whether to retrieve new records or not
        if (scrollTop < 3) {
            //
            //Retrieve records that are above the top view boundary 
            //This is equivalent to clicking the previous button
            this.retrieve_records("top");
        }else if (scrollTop + tbody.clientHeight>= tbody.scrollHeight) {
            //
            //Retrieve records that are below the bottom view boundary
            //This is equivalent to clicking the next button 
            this.retrieve_records("bottom");
        }else{
            //
            //Ignore the scrolling
        }
    }
    //
    //This is an event listener that retrieves limit number of 
    //records from the server depending on the given direction.
    //The retrieved records are in the blue area of our scroll map.
    async retrieve_records(dir: direction) {
        //
        //Set the offset value depending on the direction of scrolling.
        let offset;
        //
        //If the direction is away from the top view boundary, 
        //the offset becomes joint 
        if (dir === "top") {
            //
            //The offset is the joint top boundary if we are scrolling upwards.
            offset = this.get_joint("top");
        }
        //
        else {
            //
            //The offset is the bottom view boundary if we are 
            //scrolling downwards.
            offset = this.view.bottom;
        }
        //
        //Retrieve and display $limit rows of data starting from the 
        //given offset/request subject to the available data.
        await this.goto(offset);
    }
    //
    //Test if offset is within joint boundaries
    private within_joint(request: offset): boolean {
        //
        //We are within the joint boundaries if...
        const condition =
            //
            //.. offset is between the top and 
            //bottom joint boundaries.
            request >= this.get_joint("top")
            && request < this.get_joint("bottom");
        return condition;
    }
    // 
    //Test if offset is within extremes and return true otherwise false.
    private within_extreme(request: offset): boolean {
        //
        //extreme top condition should always 
        //be set otherwise you get a runtime error.
        //if extreme top is undefined throw an error.
        return request >= this.extreme.top
            && request < this.extreme.bottom;
    }
    //
    //Test if offset is within view boundaries
    private within_view(req: offset): boolean {
        //
        //We are within  view if...
        return true //true is for appeasing the IDE.
            //
            //...the top view is set...
            && this.view.top !== null
            //
            //...and the offset is between the top 
            //and bottom view boundaries.
            && req >= this.view.top
            && req < this.view.bottom;
    }
    //
    //Return the joint boundary given the direction The top joint boundary
    // is a maximum of limit records from the top view boundary. The 
    // bottom joint boundary is a maiximum of limit records from the 
    // view[bottom]. see the scroll map 
    // http://206.189.207.206/pictures/outlook/scroll_2020_10_10.ppt
    private get_joint(dir: direction/*top|bottom*/): offset {
        //
        //
        let raw_boundary =
            //
            //The referenced view boundary
            this.view[dir]
            //
            //The maximum range
            + app.app.current.config.limit
            //
            //Accounts for the direction 
            * (dir === "top" ? -1 : +1);
        //
        //Return a constrained boundary
        return this.within_extreme(raw_boundary)
            ? raw_boundary : this.extreme[dir];
    }
    //
    //
    //Fetch the real data from the database as an array of table rows.
    private async query(offset: offset, limit: number): Promise<library.Ifuel>{
        // 
        //The entity name that drives this query comes from the subject of this 
        //application
        const ename = `\`${this.subject[0]}\``;
        //
        //Complete the sql using the offset and the limit.
        const complete_sql =
            //
            //Paginate results.
            this.sql + ` LIMIT ${limit} OFFSET ${offset}`;
        //
        //Use the sql to query the database and get results as array of row objects.
        return  await server.exec(
            "database",
            //
            //dbase class constructor arguments
            [this.subject[1]],
            //
            "get_sql_data",
            //
            //The sql stmt to run
            [complete_sql]
        );
        
    }
    //
    //Convert the row object obtained from the server to a tr element.
    //It's public because it's called by create (in crud), to create a blank row.
    public load_tr_element(
        //
        //Tee table row to load data to. 
        tr:HTMLTableRowElement,
        //
        //The row of data to load to the tr. There may be none for newly
        //created rows
        row?: {[index:string]:library.basic_value}
    ):void {
        //
        //Convert the row object into key-value pairs where the
        //key is the column name. Take care of those cases where row 
        //is undefined, e.g., new rows.
        const pairs: Array<[string, library.basic_value]> = row === undefined
            ? this.col_names!.map(cname => [cname, null])
            : Object.entries(row);
        //
        //Enrich the tr with the id, pk and the friendly attributes
        // 
        //Prepare to collect the primary key and the friendly components
        //value
        let pk: string, friend: string;
        //
        //
        //Use empty value strings for pk and friend when there is no value
        if (row === undefined){ pk = ""; friend = ""; }
        else{
            //Get the primary key column; It is indexed using this theme's
            // subject name.
            const column = <string>row[this.subject[0]];
            //
            //The primary key column is a tupple of two values: the autonumber 
            //and the friendly components packed as a single string.
            //e.g., '[1, "kamau/developer"]'
            //Prepare to convert the string value to an object  and 
            //destructure it into its primary key and friendly component
            [pk, friend] = JSON.parse(column);
            //
            //Make the pk a valid id by preffixing it with letter r
            tr.id = `r${pk}`;
        }
        //
        //Append the id and the primary key attributes to the tr
        tr.setAttribute("pk", pk);
        tr.setAttribute("friend", friend);
        //
        //Make the tr focusable to allow it to receive keystrokes for 
        //scrolling purposes.
        tr.setAttribute("tabindex", "0");
        //
        //Listen for the key movement.
        tr.onkeydown=(evt)=>this.keydown(evt);
        tr.onclick = () => theme.select(tr);
        //
        //Loop through all the pairs outputting each one
        //of them as a td. 
        pairs.forEach(([key, value]) => {
            //
            //Create a td and append it to the row.
            const td = document.createElement("td");
            tr.appendChild(td);
            //
            //Set the click event listener of the td
            td.onclick =()=> theme.select(td);
            //
            //Set the column name to be associated with this td
            td.setAttribute('data-cname', key);
            //
            //Set the td's "value"
            //
            //Get the td's io
            const Io = this.get_io(td);
            //
            //
            Io.show();
            //
            //Set the io's value
            Io.value = value;
        });
    }
    //
    //Listening to keystrokes for scrolling purposes.
    public keydown(evt:KeyboardEvent){
        //
        //Test if we are in the scroll mode or not.
        //If we are not, do nothing, i.e., return.
        if (this.display_mode === "edit") return;
        //
        //Continue to process the keystrokes for scrolling.
        //
        //1. Prevent the default behaviour.
        evt.preventDefault();
        //
        //Get the key outcome; may have to move between rows, pages or do nothing.
        const outcome = this.get_key_outcome(evt.keyCode);
        //
        //Discontinue this process if we are at the view extremes.
        if(outcome === "do_nothing") return;
        //
        //2. Execute the requested movement.
        switch (outcome.move){
            //
            //2.1 Scroll to the requested row.
            case "row":  this.scroll_row(outcome); break;
            //
            //2.2 Scroll full client page (Up or Down).
            //case "page": this.scroll_page(outcome); break;
            //
            //2.3 Scroll to either the first or last row of the current dataset.
            //case "table": this.scroll_table(outcome); break;
        }
    }
    // 
    //Scrolls page number of records in a given direction.
    private scroll_page(dir:"up"|"down"):void{
       // 
       //Get the selected tr if any
       const tr = this.document.querySelector(".TR");
       //
       //Something must be wrong if no tr is selected because you could not have
       //gotten to this stage.
       if( tr === null){
           //
           alert("Please select a tr");
           throw new Error("No tr is currently selected");
       } 
        //
        //Get the tr to be scrollled into view.
        const scroll_tr= this.get_page_tr(tr, dir);
       //
       // Scroll the given tr to either top or bottom
       const block = dir=== "up"?"end":"start";
       //
       //Scroll the row into view...
       scroll_tr.scrollIntoView({block:block});
       // 
       //and select it 
       theme.select(scroll_tr);
    }
    //
    //Return the tr to either be the first or the last in the view depending
    //on the scroll direction
    private get_page_tr(tr:HTMLTableRowElement, dir:"up"|"down"):HTMLTableRowElement{
        //
        //This is the new tr element
        let scroll_tr:HTMLTableRowElement;
        // 
        //If the tr element is in view i.e., not at the top or bottom then it 
        //does not change
        if(this.inview(tr))return tr;
        //
        //The tr is at the bottom or at the top of the client window so it is 
        //outside of the range, we need to get a fresh one which is as far away
        //as the height of the client window depending on the direction.
        //
        //1. Get the direction factor i.e. +1 or -1
        const factor= dir==="up"?-1:+1;
        //
        //The number of pixels to scroll by
        const amount = this.target!.clientHeight*factor;
        //
        //Scroll by this amount in the y direction
        this.target!.scrollBy(0, amount);
        //
        //Get the new tr by counting from the current tr in the factor direction
        //until we get out of view. Return the row at which we get out of view.
        //
        //Get the current table's body
        const tbody= <HTMLTableSectionElement>tr.parentElement!;
        //
        //Step through all the table rows until you get out of the view.
        //Note that the current i=0 and the next one i=1 are outside of the view
        //by definition, hence the initial setting of i=2.
        for(let i=2;;i++){
            //
            //Get the tr at the next i'th position
            scroll_tr = tbody.rows[tr.rowIndex + i*factor];
            //
            //Test if the new row is still valid; we may be on the edge of the 
            //view
            if(scroll_tr === undefined){
                //
                //Retrieve more data if necessary; if not, return the original
                //tr which effectively does nothing.INVESTIGATE IF SCROLLING
                //BY A CERTAIN AMOUNT INVOKES THE SCROLL EVENT.
                throw new Error("Please investigate this scrolling error");
                break;
            }
            //
            //When the tr is valid, check whether it is inside or outside of the
            //client window view
            //
            //If its not within view, then we must have arrived at the tr we 
            //required
            if(!this.inview(scroll_tr)) return scroll_tr; 
        }
    }
    //
    //Test if the given tr is in view or not. A tr is in view if it is between 
    //the top and the bottom boundaries of the client window
    public inview(tr:HTMLTableRowElement):boolean{
        //
        //Get the top boundary of client window.
        const top_boundary = this.target!.scrollTop;
        //
        //Get the bottom boundary of client window.
        const bottom_boundary = this.target!.scrollTop + this.target!.clientHeight;
        //
        // Get the tr's top edge
        const top_edge = tr.offsetTop;
        //
        //Get the tr's bottom edge
        const bottom_edge = top_edge + tr.offsetHeight;
        //
        //If the given tr is within view we do nothing; it is within view if:
        //      if its top edge is below the top boundary and
        //      its bottom edge is above the bottom boundary
        if (top_edge > top_boundary && bottom_edge< bottom_boundary)return true;
        return false;
    }
    //
    //Returns one out of 6 outcomes of pressing a scrolling key including 
    //doing nothing when we are at the extreme boundaries of a view.
    private get_key_outcome(key_code: number): key_outcome | "do_nothing"{
        //
        //Get the table that contains the new row; it must exist.
        const table = this.target!.querySelector("table");
        if(table === null)throw new Error("Table not found");
        //
        //Initialize the up/down movement. It is set to a null to allow us test.
        let dir: "up" | "down" | null = null;
        //
        //Initialize the nature of scrolling, i.e., is it between rows, pages 
        //or to the extremes of the dataset.
        let move: "row" | "page" | "table";
        //
        //The tr to be selected.
        let tr: HTMLTableRowElement | null = null;
        //
        switch(key_code){
            //
            //When the keypressed is arrowDown, set the direction to down 
            //and continue to the next key.
            case 40: dir = "down";
            //
            //When the keypressed is arrowUp, set the direction to up if it's
            //not yet set.
            case 38: if(dir === null)dir = "up";
                //
                //1. Get the tr element to scroll into view.
                tr = this.get_next_element(dir);
                // 
                //Prepare to get more data for the top scroll
                if(tr===null && dir==="up"){
                    // 
                    //Retrieve more data from the database 
                    this.retrieve_records("top");
                    // 
                    //Try to retrieve the tr again.
                    tr = this.get_next_element(dir);
                }
                //
                //Set the general movement to be between rows.
                move = "row";
                //
                break;
            //
            //When the keypressed is pageUp, set the direction to up 
            //and continue to the next key.
            case 33: dir = "up"
            //
            //When the keypressed is PageDown, set the direction to down 
            //and continue to the next key.
            case 34: if(dir === null) dir = "down";
                //
                //Set the movement to between page. 
                move = "page";
                break;
            //
            //When the keypressed is Home, set the direction to up 
            //and continue to the next key.
            case 36: dir = "up";
                tr = 0;
                //
                //The movement is to the extremes of the dataset.
                move = "table";
                //
                break;
            //
            //When the keypressed is End, set the direction to down.
            case 35: dir = "down";
                tr = this.max_records!;
                //
                //The movement is to the extremes of the dataset.
                move = "table";
                //
                break;
            //
            //If a user presses any other key, then return a 'do nothing'.
            default: return "do_nothing";
        }
        //
        //If there's no new row to scroll to, decide if you want to get more 
        //data or not. For this version, simply return.
        if(tr === null && move !== "page")return "do_nothing";
        //
        //Compile the outcome for row movement (up | down).
        return {move, dir, tr}
    }
    //
    //Select the next/previous row sibling and scroll it into view
    //if necessary. The input keyoutcome is an object with 3 properties, e.g.,
    //{move, dir, tr}. 
    private scroll_row(outcome: key_outcome): void {
        //
        //Ensure that the tr of the outcome is a HTMLTableRowElement.
        if (!(outcome.tr instanceof HTMLTableRowElement))
            throw new Error("Tr must be a HTMLElement");
        //
        //1. Mark the outcome tr as selected.
        theme.select(outcome.tr);
        //
        //3. Get the action to take. It is either:-
        switch(this.get_action(outcome.tr)){
            //..
            //3.1 Do nothing.
            case "do_nothing": break;
            //
            //3.2 Scroll into view and place the tr at the top.
            case "top": outcome.tr.scrollIntoView(true); break;
            //
            //3.3 Scroll into view and place the tr at the botom.
            case "bottom": 
                outcome.tr.scrollIntoView(false); 
                break;
        }
    }
    //
    //Return the next element to become current depending on the direction.
    private get_next_element(dir: "up"|"down"): HTMLTableRowElement|null{
        //
        //1. Get the current tr element. 
        const tr = <HTMLTableRowElement>this.document.querySelector('.TR');
        //
        //2. If the direction is up, return the
        //previous sibling otherwise 
        const row_index = dir === "up"?tr.rowIndex-1:tr.rowIndex+1;
        if(row_index< 1) return null;
        //
        //Get the table that contains the new row; it must exist.
        const table = this.target!.querySelector("table");
        if(table === null)throw new Error("Table not found");
        //
        //Return the row at the required index; there may be none.
        return table.rows[row_index];
    }
    //
    //Return the proper scrolling action to take depending on if
    //we are within or outside the view. 
    private get_action(tr: HTMLTableRowElement): "do_nothing"|"top"|"bottom"{
        //
        //Get the top boundary of client window.
        const top_boundary = this.target!.scrollTop;
        //
        //Get the bottom boundary of client window.
        const bottom_boundary = this.target!.scrollTop + this.target!.clientHeight;
        //
        // Get the tr's top edge
        const top_edge = tr.offsetTop;
        //
        //Get the tr's bottom edge
        const bottom_edge = top_edge + tr.offsetHeight;
        //
        //If the given tr is within view we do nothing; it is within view if:
        //      if its top edge is below the top boundary and
        //      its bottom edge is above the bottom boundary
        if (top_edge >= top_boundary && bottom_edge< bottom_boundary)return "do_nothing";
        //
        //If the tr is semi-visible from the top, then we will align its top edge
        //with the top boundary. This is the case if the top edge is greater than
        //the top boundary
        if (top_edge < top_boundary)return "top";
        //
        //If the tr is semi-visible from the bottom, then we will align the bottom
        //edge with the bottom boundary. This is the case when the bottom edge is
        //greater than the bottom boundary.
        if (bottom_edge > bottom_boundary)return "bottom";
        //
        //If you find yourself here, something has gone wrong.
        throw new Error("Something is wrong, check your action logic.");
    }
    //
    //Return the io structure associated with the given td
    get_io(td: HTMLTableCellElement): io.io {
        // 
        //Get the position of this td 
        const rowIndex = (<HTMLTableRowElement>td.parentElement).rowIndex;
        const cellIndex = td.cellIndex;
        //
        //Destructure the subject to get the entity name; its the 
        //first component. 
        const[ename] = this.subject;
        // 
        //Get the column name that matches this td. 
        const col_name = this.col_names![cellIndex];
        //
        //Get the actual column from the underlying database.
        const col = this.dbase!.entities[ename].columns[col_name];
        //
        //Create and return the io for this column.
        const Io = this.create_io(td, col);
        // 
        //Save the io to aid in data retrieval.
        //NB: Remember to stringify the position
        theme.ios.set(String([this.key,rowIndex,cellIndex]), Io);
        // 
        return Io;
    }
    
    //
    //Creating an io from the given anchor and column. In future, 
    //consider redefining this as a schema.column methods, rather
    //than a standalone method.
    create_io(
        // 
        //The parent of the input/output elements of this io. 
        anchor:HTMLElement,
        // 
        //The column associated with this io. 
        col: schema.column
    ): io.io{
        //
        //Read only collumns will be tagged as such.
        if (col.read_only !== undefined && col.read_only)
                return new io.readonly(anchor);
        //
        //Atted to the foreign and primary key columns
        if (col instanceof schema.primary) 
            return new io.primary(anchor);
        if (col instanceof schema.foreign) 
            return new io.foreign(anchor);
        //
        //Attend the attributes
        //
        //A column is a checkbox if...
        if (
            //
            //... its name prefixed by 'is_'....
            col.name.startsWith('is_')
            // 
            //...or its datatype is a tinyint 
            || col.data_type === "tinyint"
        )return new io.checkbox(anchor);
        //
        //If the field length is 1 character, then assume it is a checkbox
        if (col.length === 1) 
            return new io.checkbox(anchor);
        //
        //If the length is more than 100 characters, then assume it is a textarea
        if (col.length! > 100) return new io.textarea(anchor);
        //
        //If the column name is 'description', then its a text area
        if (col.name === 'description')  new io.textarea(anchor);
        //
        //Time datatypes will be returned as date.
        if (["timestamp", "date", "time"]
            .find(dtype => dtype === col.data_type))
                return  new io.input("date", anchor);
        //
        //The datatypes bearing the following names should be presented as images
        // 
        //Images and files are assumed  to be already saved on the 
        //remote serve.
        if (["logo", "picture", "profile", "image","photo"]
            .find(cname => cname === col.name))             
                return new io.file(anchor, "image");
        //
        if (col.name === ("filename" || "file"))
                return new io.file(anchor, "file");
        //
        //URL
        //A column is a url if...
        if (
            // 
            //... its name matches one of the following ...
            ["website", "url", "webpage"].find(cname => cname === col.name)
            // 
            //...or it's taged as url using the comment.
            || col.url !== undefined
         )
                    return new io.url(anchor);
        //
        //SELECT 
        //The io type is select if the select propety is set at the column level
        //(in the column's comment). 
        //Select requires column to access the multiple choices.
        if (col.select !== undefined)         
            return new io.select(anchor, <schema.attribute>col);
        //
        //String datatypes will be returned as normal text, otherwise as numbers.
        if (["varchar", "text"]
            .find(dtype => dtype === col.data_type))
                return new io.input("text", anchor);
        if (["float", "double", "int", "decimal", "serial", "bit", "mediumInt", "real"]
            .find(dtype => dtype === col.data_type)) 
                return new io.input("number", anchor);
        // 
        //The default io type is read only 
        return new io.readonly(anchor);
    } 
  
    //
    //Select the row whose primary key is the given one.
    //and makes sure that it is in the view 
    protected select_nth_row(pk?: library.pk) {
        // 
        //Row selection is valid only when the pk is set
        if (pk === undefined) return;
        //
        //1. Get the row identified by the primary key. 
        const tr = <HTMLElement>document.querySelector(`#r${pk}`);
        //
        //Ensure that a row with this pk exists
        if (tr === null) {
            alert(`No tr found with row id ${pk}`);
            return;
        }
        //
        //2. Select the row.
        theme.select(tr);
        //
        //3.Bring the selected row to the center of the view.
        tr.scrollIntoView({ block: "center", inline: "center" });
    }
    //
    //
    private scroll_into_view(request:offset,position:"start"|"center"):void {
        // 
        //Get the row index 
        const rowIndex: offset = request - this.view.top;
        // 
        //Use the index to retrieve the row 
        const table =<HTMLTableElement> this.get_element("table_crud"); 
        const tr = table.rows[rowIndex];
        //
        //Ensure that a row with this pk exists
        if (tr === null) {
            alert(`No tr found with rowIndex ${rowIndex}`);
            return;
        }
        
        //
        //Bring the selected row to the top of the view.
        tr.scrollIntoView({ block: position, inline: "center" });
    }

    //
    //Ensure that the given tag is the only selected one 
    //of the same type
    static select(tag:HTMLElement):void {
        //
        //Get the tagname 
        const tagname = tag.tagName;
        //
        //1. Declassifying all the elements classified with 
        //this tagname.
        const all = document.querySelectorAll(`.${tagname}`);
        Array.from(all).forEach(element =>
            element.classList.remove(tagname)
        );
        //
        //3.Classify this element 
        tag.classList.add(tagname);
    }
    
       
    //
    //
    //Retrieve and display $limit rows of data starting from the 
    //given offset/request, subject to the available data.
    async goto(request?: offset) {
        //
        //Get the requested record offset if it is not specified
        let goto_element;
        if (request === undefined) {
            // 
            //Check whether a request is specified in the goto element 
            if((goto_element=document.querySelector('#goto'))!==null){
                //
               //
               //Get the offset from the user from the user
               //
               //Get the goto input element
               const value = (<HTMLInputElement> goto_element).value;
               //
               //Get the users request as an integer
               request = parseInt(value);   
            }
            else{
                //
                //Set it to 0
                request = 0;
            }            
        }
        //
        //It is an error if the request is above the top extreme boundary.
        if (request < this.extreme.top)
            throw new schema.mutall_error(`Goto: A request ${request}
             must be positive`);
        //
        //Determine what kind of scroll is required for the current situation. 
        const outcome /*:"nothing"|"adjust"|"fresh"*/ = this.get_outcome(request);
        //
        //Load the table rows and use the scrolling outcome to update the 
        //boundaries
        await this.execute_outcome(outcome, request);
    }
    
    //
    //Determine which scrolling outcome we need depending on the requested offset.
    private get_outcome(request: offset): outcome {
        //
        //NOTHING: If the request is within view, do 
        //nothing.i.e., no loading of new rows or adjusting 
        //current view boundaries.
        if (this.within_view(request))
            return <nothing> {type: "nothing"};
        //
        //ADJUST: If request is within the joint boundaries, 
        //load a fresh copy and adjust either the top or bottom
        //boundaries depending on the request direction.
        if (this.within_joint(request)) {
            //
            //The direction is top if the 
            //request is above the top boundary.
            const dir = request < this.view.top
                ?"top" : "bottom";
            //
            //The top or bottom boundaries 
            //should be adjusted to this value.
            const adjusted_view = this.get_joint(dir);
            //
            //Adjust the top boundary
            const start_from = dir === "top"
                ? this.get_joint(dir) : this.view[dir];
            //
            //Return the view boundary adjustment outcome.
            return <adjust> {type: "adjust", dir, start_from, adjusted_view};
        }
        //
        //FRESH: If the request is within extremes, 
        //load a fresh outcome, i.e., clear current tbody, 
        //load new rows and adjust the views.
        if (this.within_extreme(request)) {
            //
            //Constrain  the request to the extreme top.
            const view_top = request < this.extreme.top
                ? this.extreme.top : request;
            //
            //The bottom is always $limit number of rows
            //from the top, on a fresh page.
            const y = view_top + app.app.current.config.limit;
            //
            //Constrain the bottom to the extreme bottom. 
            const view_bottom = y > this.extreme.bottom
                ? this.extreme.bottom: y;

            return <fresh> {type: "fresh", view_top, view_bottom};
        }
        //
        //OUT OF RANGE: The request is out of range.
        return <out_of_range> {type: "out_of_range", request};
    }
   
    //
    //Restore the ios asociated with the tds on the theme panel. This is
    //necessary bceuase the old ios are no londer assocuate with the current
    //document wgos documetElement has changed.
    public restore_ios(){
        //
        //Collect all the tds on this page as an array
        const tds = Array.from(this.document.querySelectorAll('td')); 
        //
        //For each td, restore its io.
        tds.forEach(td=>{
            //
            //Cast the td to table cell element
            const td_element = <HTMLTableCellElement>td;
            //
            //Get the td's row and column positions
            const rowIndex = (<HTMLTableRowElement>td_element.parentElement).rowIndex;
            const cellIndex = td_element.cellIndex;
            //
            //Compile the io's key key that matches this td
            const key = String([this.key, rowIndex, cellIndex]);
            //
            //Use the static io list to get the io that matches this td
            const io = theme.ios.get(key);
            //
            //Its an error if the io is not found
            if (io===undefined) throw new schema.mutall_error(`io wth key ${key} is not found`);
            //
            //Each io has its own way of restoring itself to ensure that
            //its properties are coupld to teh given td element
            io.restore();
        });     
    }
        
}