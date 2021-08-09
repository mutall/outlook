//
//This file is intended to contain all the scrolling functionality that 
//retrieves a constrained limit number of records from the database
//in the direction  of tghe scroll. 
//It was to be implemented as an interface but interfaces do not have 
//implemented methods
import * as outlook from "../../../outlook/v/code/outlook.js";
import * as server from "../../../library/v/code/server.js";
import * as schema from "../../../library/v/code/schema.js";
import * as library from "../../../library/v/code/library.js"
import * as io from "./io.js";
import * as fuel from "./fuel.js"
import * as sch_lib from "./library.js";
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
//This type position determines the order at which the columns are arranged on 
//display it contains the column name as the key and the poosition number as the 
//value 
type position ={[pos:number]:string}
// 
//Boundary markers    
export type direction = "top" | "bottom";
// 
// 
export abstract class scroll extends outlook.panel{
  /** 
     * THE SQL (view in our class schema class model) METADATA 
     * OF THE QUERY USED TO RETRIEVE DATA PAINTED IN THE CONTENT 
     * PANEL INCLUDE....
     */
    // 
    //1...The sql used to extract information painted in this 
    //in the content section of this theme
    abstract get sql(): string;
    abstract set sql(s: string);
    // 
    //The sql property set to make the process of recreating an sql trivial 
    public sql_?: string;
    // 
    //The sql used to populate this scroll in its raw form without any conditions 
    public original_sql?: string;
    // 
    //2...The column names involved in the above named sql
    col_names?: Array<library.cname>;
    // 
    //3...The maximum possible records that are available to paint
    //the content pannel. they are required in adjusting the boundaries
    max_records?: number;
    // 
    //Saves io instances that created this theme table saved as a map 
    //indexed by their position in a thematic oanel
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
    view: boundary = { top: 0, bottom: 0 };
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
    //The position inwhich these columns are ordered on display 
    public position?: position;
    // 
    //The data mpdel derived from this sql.
    public Fuel: fuel.fuel | null = null;
    // 
    //This is the display mode that is used in controlling the usage of the scrollong keys
    public display_mode: "edit" | "normal" = "normal";
     // 
    //To create a scrollable pannel er need to describe the css where the 
    //content is to be painted and the mother where this pannel is housed.
    constructor(css:string,base:outlook.view,public dbname?:string) {
        super(css, base);
    }
    // 
    // 
    get document(): Document {
        // 
        return this.base.document=== null? window.document:this.base.document;
    }
    //
    //This is an onchange event listener that highlights
    //this field, i.e., td, to indicate that it will be
    //considered for saving.
    static mark_as_edited(evt: Event|HTMLElement): void {
        //
        //initialize the element.
        let element;
        // 
        //If the element is wat was passed as a parameter continue
        if (evt instanceof HTMLElement) { element = evt; }
        // 
        //Check if the event target is a html element to avoid the error on 
        //event element.
        else if (evt.target instanceof HTMLElement) { element = evt.target; }
        // 
        //This event was not caused by a html element 
        else { return;}
        //
        // 
        //Do nothing if the element is null 
        if (element === null) return;
        //
        //Stop any bubblig up
        window.event!.stopPropagation();
        //
        //Get the td that houses the element and mark it as edited.
        const td = page.get_td(element);
        td.classList.add("edited");
        //
        //Get the first cell of the row (that contains this td) and 
        //mark it as edited.
        const pri =<HTMLTableCellElement>td.parentElement!.children[0]!;
        pri.classList.add("edited");
        // 
        //Update the output of this io
        const pos=[page.current.theme.key,(<HTMLTableRowElement>td.parentElement!).rowIndex,td.cellIndex]
        //
        //get the td' io
        const io = theme.theme.ios.get(String(pos))!;
        //
        //Do the transfer to update inputs
        io.update_outputs();
    }
    // 
    //Reorders the columns of the table to a given user defined structure 
    public reorder(): void{
        // 
        //Get the table that was used to reorder 
        const table =this.get_element("position");
        // 
        //Compile the position data.
        this.position = {};
        // 
        //Set the  newly specified positions 
        const tbody = table.children
        const cnames = <HTMLTableRowElement>tbody[0]
        const positions = <HTMLTableRowElement>tbody[1];
        //
        //Loop through the tbody row formuta
        for (let index = 0; index < (<HTMLTableRowElement>tbody[0]).cells.length; index++) {
            // 
            //Get the user input position 
            let pos = parseInt(positions.cells[index].textContent!)
            let cname = cnames.cells[index].textContent!;
            this.position[pos] = cname;
        }
        // 
        //Clear the tbody of the target element 
        const crud_table = this.get_element("table_crud");
        crud_table.querySelector("tbody")!.innerHTML = "";
        this.Fuel!.show_header(crud_table.querySelector("thead")!)
        this.Fuel!.paint()
    }
    //
    //Hide the selected column by controling the styling 
    hide() {
        //
        //Get the selected th
        const th = <HTMLTableHeaderCellElement | null>this.target!.querySelector(".TH")
        if (th === null) { alert("please select a column"); return; }
        //1. Get the index of the selected th
        const index = th.cellIndex;
        //
        //2.Retrieve the rule declaration associated with this index
        //    
        //2.1 retrieve the style tag.
        const style_sheet = (<HTMLStyleElement>this.get_element('columns')).sheet;
        if (style_sheet === null) throw new Error("styleshhet not found");
        //
        //2.1 Retreieve the rule declaration with this index
        const declaration = (<CSSStyleRule>style_sheet.cssRules[index]).style;
        //
        //2.2 Change the display property to none
        declaration.setProperty("display","none");
    }
    //
    //Show the columns that are already hidden.
    async unhide(){
        //
        //Get the sheet for styling the columns.
        const sheet = (<HTMLStyleElement>this.get_element('#columns')).sheet;
        if(sheet===null)throw new Error()
        //
        //Get all the table headers.
        //They are the children of the table header.
        //
        //Get the table thead
        const ths = document.querySelectorAll("th");
        //
        //From our thead get all the cell index/name pairs.
        let all_headings/*Array<[cellIndex, cellname]>*/
            = Array.from(ths)
                .map(th=>[th.cellIndex, th.textContent]);
        //
        //Filter all the hidden headings. 
        let hidden_columns/*Array<[cellIndex, cellname]>*/
            =all_headings.filter(([i])=>{
                //
                //Get the i'th rule declaration.
                const declaration = sheet.cssRules[i].style;
                //
                //Get the display property.
                const display = declaration.getPropertyValue("display");
                //
                //If the property is found return true
                return display!=="";
            });
        //
        //Let the user select the columns to become visible.
        let visible_columns /*Array<cellIndex>*/ 
            = await select_visible_columns(hidden_columns);
        
        //Show the hidden columns.
        visible_columns.forEach(i=>{
        //
        //Get the declaration of the i'th rule 
        let declaration = sheet.cssRules[i].style;
        //
        //remove the display none property
        declaration.removeProperty("display");
        declaration.removeProperty("background-color");
        });
        //
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
    //Every scrollable pannel must know how its ios are set 
    abstract get_io(col?: sch_lib.column_meta): io.io;
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
    //              alert(
    //                  `Request is out of range bacause it fails this test 
    //                  ${this.extreme.top} <=${request} < ${this.extreme.bottom}`
    //              );
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
        const constrained_limit = h < this.config.limit ? h : this.config.limit;
        //
        //Query the database 
        const Ifuel = await this.query(offset, constrained_limit);
        // 
        //Display this fuel to make it visible
        await this.show(Ifuel,offset)
    }
    // 
    //Sets the ifuel and displays it in the required procedure 
    public async show(Ifuel:library.Ifuel, offset:number) {
        //   
        //Display the results on the table`s body.
        //
        //Get the tbody for appending records 
        const tbody = document.querySelector("tbody")!;
        // 
        if (this.Fuel === null) {
            this.Fuel = new fuel.fuel(Ifuel, this.sql, this, offset);
            await this.Fuel.activate()
            await this.Fuel.paint(tbody,offset);
        } else {
            // 
            //Paint the newly obtained records
            this.Fuel.activate(Ifuel,offset);
            this.Fuel.paint(tbody, offset);
        }
    }
    //
    //Clears the target of its content inorder to allow others to be painted 
    clear(header: boolean): void{
        // 
        //Reset the boundaries
        this.view.top = 0
        this.view.bottom = 0
        // 
        //Clear the target elment
        this.target!.innerHTML = "";
        // 
        //Reset the fuel
        this.Fuel = null;
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
            + this.config.limit
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
    public async query(offset: offset, limit: number): Promise<library.Ifuel>{
        //
        const dbname = this.dbname === undefined ? this.config.app_db:this.dbname;
        //
        //Complete the sql using the offset and the limit.
        const complete_sql =
            //
            //Main sql
            this.sql
            //
            //Paginate results.
            + ` LIMIT ${limit} OFFSET ${offset}`;
        //
        //Use the sql to query the database and get results as array of row objects.
        return await server.exec(
            "database",
            //
            //dbase class constructor arguments
            [dbname],
            //
            "get_sql_data",
            //
            //The sql stmt to run
            [complete_sql]
        );
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
        scroll.select(tr);
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
    //Select the given th and highlights all the tds below it 
    select_column(evt: Event) {
       // 
        //Get the row that evoked this event 
        const th = <HTMLTableHeaderCellElement>evt.target;
        // 
        //If there was no element selected return 
        if (th === null) return;
        //
        //0. Get the column stylesheet named column from the current document.
       const style = (<HTMLStyleElement>this.get_element("columns")).sheet;
       // 
       //Die if the stylesheet was not found
       if (style === null) throw new schema.mutall_error("Stylesheet for 'columns' not known");
        //
        //1.Dehighlight the current column selection.
        //1.1 Get the currently selected column.There may be none.
       const col = this.target!.querySelector(".TH");
        //
        //1.2 If there`s one, get its index.
        if(col!==null){
            //
            //The index from which we are removing the highlight
            const index1 = (<HTMLTableHeaderCellElement>col).cellIndex;
            //
            //1.3 Use the index to remove the background color from the matching rule
            //Remember there are as many css rules as there are columns.
            //
            //a) Get the rule that matches the index.
            const rule1 = <CSSStyleRule>style.cssRules[index1];
            rule1.style.cssText
            //
            //b) Remove the background property.
            rule1.style.removeProperty("background-color");
        }
        //
        //2.Select the given th in the standard version.
        scroll.select(th);
        //
        //3.Highlight the td cells below the th.
        //
        //3.1 Get the index of the th i.e., column to be highlighted.
        const index2= th.cellIndex;
        //
        //3.2 Use the index to get the css rule from column stylesheet.
        const rule2= <CSSStyleRule>style.cssRules[index2];
        //
        //3.3 Set  the background color of the rule to lightgreen.
        rule2.style.setProperty("background-color", "lightgreen");
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
            const y = view_top + this.config!.limit;
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

}
