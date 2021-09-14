import * as library from "../../../library/v/code/library.js";
import * as schema from "../../../library/v/code/schema.js";
import * as server from "../../../library/v/code/server.js";
import * as io from "../../../outlook/v/code/io.js";
import {view, subject } from "../../../outlook/v/code/outlook.js";
// 
//These are the user defined metadata
interface udf_meta{
  cname: string,
  uposition?: number,
  hidden?: boolean,
  region?: "horizontals" | "verticles" | "intersept" | "page",
  size?: number 
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
//These are the components of an sql statement
type sql= {stmt:string, dbname:string};
//
//This type is used for constraining a string to a valid name of a html element.
type HTMLElementTagName= keyof HTMLElementTagNameMap;
//
//A panel is a targeted section of a view. It can be painted 
//independently
export abstract class panel extends view {
  //
  //The panels target element is set when the panel is painteg
  public anchor: HTMLElement;
  //
  constructor(
    //
    //The CSS to describe the targeted element on the base page
    public css: string,
    //
    //The base view that is the home of the panel: it must be protected to avoid
    //potential recursion because the view akes reference to this panel as a 
    //child.
    protected base: view
  ) {
    //The ur is that of the base
    super(base.config, base.url);
    this.anchor = this.get_anchor();
  }
  //
  //Use this css to get the anchor element where this pannel is painted.
  get_anchor(): HTMLElement {
    //
    //Get the targeted element. It must be only one
    const targets = Array.from(
      this.document.querySelectorAll(this.css));
    //
    //There must be a target    
    if (targets.length == 0) throw new schema.mutall_error(
      `No target found with CSS ${this.css}`);
    //
    //Multiple targets is a sign of sn error
    if (targets.length > 1) throw new schema.mutall_error(
      `Multiple targets found with CSS ${this.css}`);
    //
    //The target must be a html element
    if (!(targets[0] instanceof HTMLElement)) throw new schema.mutall_error(`
      The element targeted by CSS ${this.css} must be an html element`)
    //
    //Set teh html element and continue painting the panel
    return targets[0];
  }
  // 
  //
  public abstract paint(): Promise<void>;
  //
  //The window of a panel is the same as that of its base view, 
  //so a panel does not need to be opened
  get win() {
    return this.base.win;
  }
}
//
//This is an array of basic values used for constructing the Ifuel
type Ibarrel= Array<library.basic_value>;
//
//There are two possible layouts:tabular or label.
type layout=
    //
    //The tabular layouts are known to be characterized by the following three
    //elements, tbody,tr,and td.
    {type:"tabular"}
    //
    //For label layouts, we need three HTML element tag git names
    |{type:"label",
        //
        //This is the root element of the data being displayed
        body:HTMLElementTagName,
        //
        //This is the element for tagging one record whose parent is the body
        barrel:HTMLElementTagName,
        //
        //This is the element for tagging a child of a barrel.
        tin:HTMLElementTagName
    };
//
//A lister is a panel that can be used for presenting data in tabular or label
//format.
abstract class lister extends panel{
  //
  //This method allows us to run asynchronous methods whose natural point of call
  //would have been at the constructor level.the programmer is expected to call
  //this method before he implements any public method of this class.
  abstract initialize(): Promise<void>
  //
  //The following properties and methods are relevant for tabular layouts only.
  //This property is made private because it is relevant when the layout is set
  private table: HTMLTableElement;
  //
  //This is the stylesheet that we manipulate programmatically to control
  // the look of this panel e.g. hiding and selecting columns
  public stylesheet:CSSStyleSheet;
  //
  //The body element is the parent of all the barrels on this panel
  public body: HTMLElement;
  //
  // The barrel that contains the header tins required for ordering the body and
  // to retrieve metadata for our metamod
  public header?: Map<library.cname, tin>;
  //
  //Get the current barrel tag name
  get barrel_tag_name(){
    return this.layout.type === "tabular" ? "tr" : this.layout.barrel;
  }
  //
  //Get the current tin tag name
  get tin_tag_name(){
      return this.layout.type === "tabular" ? "td" : this.layout.tin;
  }
  //
  //Returns the header column names, technically referred to as an Ibarrel.
  abstract get_col_names():Promise<Array<string>>;
  //
  //Returns the io of the given header tin
  abstract get_io(header_tin:tin):io;
  //
  //This is a user defined metadata that shapes the relationships between the
  // key and their data values.  
  abstract get_udf_meta():{ [cname: string]: udf_meta };
  // 
  //Get Ifuel i.e.,the data to paint to the body 
  abstract get_Ifuel():Promise<library.Ifuel>;
  //
  //
  constructor(
    //
    //This css describes the location (on the base page) where the panel the
    //anchored
    css: string,
    //
    //This is the view that is the parent of this panel.
    base: view,
    //
    //This is the general format of the data i.e. either tabular of label.
    public layout: layout
  ) {
        //
        //Initialize the parent panel class
        super(css, base);
        
        //
        //Create the necessary HTML elements depending on the layouts.
        let body:HTMLElementTagName;
        //
        //This is parent of the body element
        let target: HTMLElement;
        //
        //
        switch(layout.type){
            //
            //For the tabular case the elements are well known
            case "tabular":
                //
                this.table = create_element(this.anchor, 'table', {});
                // 
                //Create the thead
                create_element(this.table, "thead", {});
                //
                //The body elementTagName of a tabular layout is tbody
                body= "tbody";
                //
                //The target for the body is the table element
                target = this.table;
                break;
            //
            //For the label case the elements are user supplied
            case "label":
                //
                //The body elementTagName of the label layout is user defined
                body= layout.body;
                //
                //The target of a label layout is the panel
                target= this.target;
            break;
        }
        // 
        //Create the body element for this panel
        this.body= create_element(target, body, {});
        //
        //Create a sheet for styling the content of this panel to control the
        //styling of the body's children
        this.stylesheet= create_element(header,"style",{});
    }
  //
  //Display or show this panel on its base view
  async paint(): Promise<void>{
        //
        //Run any asynchronous methods that may be required to complete 
        //the definition of a lister
        await this.initialize();
        //
        //Get and set the lister header
        this.header = await this.get_header();
        //
        //Show or display the header.It is necessary if the layout
        //is tabular
        if (this.layout.type=== "tabular")this.header.paint();
        // 
        //Get Ifuel i.e.,the data to paint to the body 
        const Ifuel = await this.get_Ifuel();
        //
        //Use the fuel to paint the lister body
        this.paint_body(Ifuel);
  }
//
//Return the header map with tins indexed by their column name
async get_header(): Promise<Map<library.cname, tin>>{
  // 
  //Get the header column names
  const cnames = await this.get_col_names();
  //
  //Create the header barrelto support construction of tins
  const header_barrel = new barrel(this);
  //
  //Get the user defined metadata
  const udf_meta= this.get_udf_meta();
  //
  //Map the column names to their entries, i.e.,column name/tin pairs
   const entries:Array<[library.cname,tin]>= cnames.map((cname,dposition)=>{
      const Tin= new tin(header_barrel);
      //
      //Add the default data position to the tin
       Tin.dposition= dposition;
      //
      //Add the user-defined metadata that matches this tin
      const udf = udf_meta![cname];
      //
      //Assign the Metadata to the tin if it is valid
      if (udf !== undefined) Object.assign(Tin, udf);
      //
      //Header tins are always displayed in readonly mode 
      Tin.io = new readonly(Tin.anchor);
      //
      //The value of the header tin is the column name
      Tin.value = cname;
      //
      //Add the following details to this tin's anchor as required by the theme
      //panel
      //a. Add an id that matches the column name
      Tin.anchor.id= cname;
      //
      //b. Add the column select event listener to the tin
      Tin.anchor.onclick=(evt: Event)=> this.select_column(evt);
      //
      //Compile and return the entry
      return [cname,Tin];
  });
  // 
  //Sort the entries by order of the ascending data position
  entries.sort(
      (a:[library.cname,tin], b:[library.cname,tin])=> a[1].dposition! - b[1].dposition!
  );
  //
  //Return the header map
  return new Map(entries);
}
//
  //Mark the current column as selected.
  private select_column(evt: Event | HTMLTableHeaderCellElement){
      //
      //0. Get the target th.
      const th = evt instanceof HTMLTableHeaderCellElement
          ?evt:<HTMLTableHeaderCellElement>evt.target;
      //
      //1. Get the stylesheet named column from the current document.
      const stylesheet = (<HTMLStyleElement>this.get_element("columns")).sheet;
      if(stylesheet === null)
          throw new schema.mutall_error("Stylesheet 'column' not known");
      //
      //2. De-highlight any column that is currently selected.
      //2.1 Get the currently selected column (there may be none).
      const selected_column = this.anchor.querySelector(".TH");
      //
      //2.2 If there's one ...
      if (selected_column !== null) {
          //
          //2.2.1 Get its index.
          const index = 
              (<HTMLTableHeaderCellElement>selected_column).cellIndex;
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
//Query the database to get the Ifuel
async get_Ifuel(): Promise<library.Ifuel>{
    //
    //Retrieve and display $limit number of rows of data starting from the 
    //given offset/request.
    let pk: library.pk | undefined;
    if (this.selection !== undefined) pk = this.selection.pk;
    //
    //
    return await this.query(pk, this.limit);
}    
//
//
//Use the given Ifuel(data)to show or display the panels body.This is a double
//loop that iterates over the barrels in the fuel and the tins in the barrels
paint_body(Ifuel:library.Ifuel):void { 
      // 
      //Loop over all the ifuel to paint the barrels
      for(const Ibarrel of Ifuel) {
          //
          //Create the barrel 
          const body_barrel = new barrel(this);
          //
          //Assuming that the header tins are already sorted by the data
          //position loop through all the tins in the header barrels  
          for (const htin of this.header!.tins){
              // 
              //Create the data tinl 
              const Tin = new tin(body_barrel);
              // 
              //Get and set the tin's io.
              Tin.io = this.get_io(htin);
              //
              //Get the value to be associated with this tin
              const value= Ibarrel[htin.dposition!];
              //
              //Set the tins value
              Tin.value = value; 
              // 
              //Add the tin to the barrel
              body_barrel.tins.push(Tin)
          }
          //
          //Paint or show or display the body's barrel
          body_barrel.paint();
      }
  }
}
// 
abstract class scroller extends lister{
    //
    //This is the offset that indicates the last retrievable record 
    //i.e., the green part of our scroll diagram.
    get extreme():boundary{
        return {top: 0, bottom: this.max_records!};
    }
    //  
    //3...The maximum possible records that are available to paint
    //the content pannel. they are required in adjusting the boundaries
    max_records?: number;
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
    //
    //
    public selection;
    // 
    //;
    // 
    //Every scroller must be associated with an sql 
    abstract get sql(): sql;
    constructor(
        base: view,
        css: string,
        public Udf_meta?: { [cname: string]: udf_meta }
    ){
        super(css, base, Udf_meta);
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
            //Get the first row in the view
            const tr = (<HTMLTableSectionElement>this.body).rows[0];
            //
            //The offset is the joint top boundary if we are scrolling upwards.
            offset = this.get_joint("top");
            //
            //Retrieve and display $limit rows of data starting from the 
            //given offset/request subject to the available data.
            await this.goto(offset);
            //
            //Reposition the client window so that the first row,tr, becomes the 
            //last one in the client window. 
            //This will stop the current disorientation.
            tr.scrollIntoView({block:"end"});
        }
        //
        else {
            //
            //The offset is the bottom view boundary if we are 
            //scrolling downwards.
            offset = this.view.bottom;
            //
            //Retrieve and display $limit rows of data starting from the 
            //given offset/request subject to the available data.
            await this.goto(offset);
        }
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
        const constrained_limit = h < this.config.limit ? h : this.config.limit;
        //
        //Query the database 
        const result: library.Ifuel = await this.query(offset, constrained_limit);
        //
        //Paint the body
        this.paint_body(result);
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
            const y = view_top + app.current.config!.limit;
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
        //Complete the sql using the offset and the limit.
        const complete_sql =
            //
            //Paginate results.
            this.sql.stmt + ` LIMIT ${limit} OFFSET ${offset}`;
        //
        //Use the sql to query the database and get results as array of row objects.
        return  await server.exec(
            "database",
            //
            //dbase class constructor arguments
            [this.sql.dbname],
            //
            "get_sql_data",
            //
            //The sql stmt to run
            [complete_sql]
        );
        
    }
}
// 
//This class models an input panel used for modifying the look of a crud page.ie.
//what columns are visible,the positions of the columns relative to each other,
//their widths e.t.c. This is controlled by a set of metadata that is modified
// by this panel.
class metamod extends lister{
    // 
    //
    constructor(
        css: string,
        base: view,
        //
        //This is the panel whose look is being modified
        public caller:scroller
    ){  
        //
        //The typical layout of a metamod panel is tabular
        super(css, base,{type:"tabular"}); 
    }
    //
    //There are no asynchronous methods pending after constructing this panel
    async initialize(): Promise<void>{};
    //
    //The column names of metamod are very well known
    async get_col_names(): Promise<Array<string>>{
        return ["cname","hidden","position","length","region"];
    }
    //
    //Returns the io that matches the given tin
    get_io(header_tin: tin):io{
        //
        //Get the anchor element for the tin
        const anchor = header_tin.anchor;
        //
        //Return the io depending on the tins column name
        switch (header_tin.name) {
          case "cname":
            return new readonly(anchor);
          case "position":
            return new input("number", anchor);
          case "hidden":
            return new checkbox(anchor);
          case "region":
           return new select(anchor, ["page", "verticles", "horizantals", "intersects"]);
          case "length": 
            return new input("number", anchor);
          default:
            return new readonly(anchor);
        } 
    }
    //
    //Returns the data that constitutes the body of this panel. This data comes
    // from the metadata of the caller panel.
    async get_Ifuel(): Promise<Ifuel>{
        //
        //Get the column metadata from the caller
        const col_meta:Array<column_meta>= this.caller.get_col_meta();
        //
        //Convert the array of col_meta to an array of Ibarrels,i.e., the Ifuel
        return col_meta.map(col=> this.get_data_Ibarrel(col));
    }
    //
    //We dont expect to change the appearance of the metamod panel so it doesn't
    //have metadata of its own
    async get_udf_meta():{ [cname: string]: udf_meta }{return{}}
    //
    //Derive the barrel from the caller scroller
    get_data_Ibarrel(col_meta: column_meta): Array<basic_value>{
        //
        //Initialize the list of basic values to return
        const Ibarrel= [];
        //
        //Get all the column names of this panel
        const col_names= await this.get_col_names();
        //
        //Loop through each column and derive its value
        for(let cname of col_names){
            //
            //*get_col_meta derives the metdata from the caller
            Ibarrel.push(this.get_col_value(cname, col_meta)) ;
        }
        //
        //Return the compiled list of values
        return Ibarrel;
    }
    //
    //Get the column status .i.e., its hidden status
    is_col_hidden(data_cname){
        //
        //    
    }
    get _col_size(data_cname){
        //
        //
    }
    //
    //Get the value that corresponds to the given column of a metamod row.
    get_col_value(meta_cname: string, row:col_meta): basic_value{
        //
        //Get the name of the row of the metadata being considered
        const data_cname= row.name;
        //
        //Get the caller header tin that corresponds to this data column name
        const Tin= this.caller.header!.get(data_cname);
        //
        //Verify that this tin is valid
        if(Tin === undefined)throw new Error(`Column name ${data_cname} was not found`);
        //
        //
        switch (meta_cname){
          case "cname": return data_cname;
          case "position": return Tin.dposition!;
          case "hidden": return Tin.hidden;
          case "region": return "verticals";
            case "size": return Tin.anchor.offsetWidth;
          default: throw new Error(`Column ${meta_cname} not known`); 
        }
    }
}
  // 
class tin{
  // 
  // 
  public io?: io;
  public anchor: HTMLElement;
  public uposition?: number;
  public name?: string;
  public dposition?:number;
  public hidden?:boolean;
  // 
  //A tin has a value which is only accessible through its io.
  get value(){return this.io!.value;}
  set value(v){this.io!.value=v;}
  //
  //
  constructor(protected Barrel:barrel) {
    this.anchor = create_element(this.Barrel.get_parent().document, "td", {})
  }
  paint() {
    this.Barrel.anchor.appendChild(this.anchor);
    this.io!.paint()
  }
    
}
// 
class barrel{
  //
  //The first time we create a barrel it has an empty list of tins 
  //that are filled at a latter stage.
  public tins: Array<tin> = [];
  // 
  public anchor: HTMLElement;
  constructor(protected Lister:lister) {
    this.anchor = create_element(Lister.table.tBodies[0], "tr", {})
  }
  // 
  // 
  paint() { this.tins!.forEach(Tin => Tin.paint()) }
  // 
  get_parent(): lister {return this.Lister}
}
// 
class scorer extends scroller{
  // 

  // 
  constructor(css: string, base: view) {
    const sql ='select * from result'
    super(css,base,sql)
  }
  async create_tins(type: "header" | "body"): Promise<Array<tin>>{
    //
    if (type === 'header') {
      // 
      //The standard header of a scroller 
      const headers: Array<tin> = await super.create_tins('header');
      // 
      //Yield all columns of a test 
      const ifuel = await this.exec("database", [this.config.app_db], "get_sql_data", ["select * from test_meta"]);
      // 
      const xheaders:Array<tin> = Array.from(this.expand_headers(headers, ifuel));
      // 
      // 
      return xheaders;
    }
  }
  *expand_header(headers: Array<tin>, test_ifuel:Ifuel): tin{
    // 
    for (const tin of headers) {
      // 
      if (tin.cname !== 'tests') { yield tin; continue }
      // 
      for (const topic of test_ifuel) {
         for (const test in topic["tests"] ) {
           yield new tin(test)
        }
        yield new tin()
        }
      }
  }

}
// 
// 
class metamod1 extends lister{
  // 
  constructor(base: view, css: string, public data:{[cname: string]:basic_value}, udf_meta?: { [cname: string]: udf_meta }, public dbname:string) {
    super(css, base,udf_meta);
    
  }
  // 
  // 
  async create_tins(type: "header" | "body", Barrel:barrel): Promise<Array<tin>>{
    // 
    //
    if(type==="header")
      return ["cname", "order", "hidden", "region", "size"].map((name,index) => new tin(name,index,Barrel))
    // 
    //The tin is of type body

  }
  // 
  // 
  async create_barrels():Promise<Array<barrel>>{
    // 
    //Get the metadata associated with this sql
    const col_metadata:Array<column_meta> = await this.exec("database", [this.dbname], 'get_sql_metadata', [this.sql]);
    // 
    //Map the col metadata to produce promised barrels 
    return col_metadata.map(metadata => this.create_barrel(metadata));
  }
  // 
  //Compiles and returns a barrel from a specified metadata
  create_barrel(metadata: column_meta): barrel {
       // 
    const Barrel = new barrel(this);
        //
        const tins= this.headers!.map((htin,dposition)=>this.create_tin(htin, metadata,Barrel,dposition))
    
       const tr = create_element(this.table.tBodies[0], "tr", {});
        return Barrel
  }
  // 
  // 
  create_tin(htin: tin, metadata: column_meta,Barrel:barrel,dposition:number): tin{
    //
    const Tin = new tin(htin.name,dposition,Barrel);
    // 
    // 
    const anchor = Tin.anchor;
    const Udf_meta=this.udf_meta[htin.name]
    
    switch (htin.name) {
      case "cname":
        Tin.Io = new readonly(anchor);
        Tin.Io.value=htin.name
        break;
      case "order":
        Tin.Io = new input("number", anchor);
        Tin.Io.value = Udf_meta.uposition===undefined? Tin.dposition:Udf_meta.uposition;
        break;
      case "hidden":
        Tin.Io = new checkbox(anchor);
        Tin.Io.value = Udf_meta.hidden === undefined ? false : Udf_meta.hidden;
        break;
      case "region":
        Tin.Io = new select(anchor, ["page", "verticles", "horizantals", "intersects"]);
        Tin.Io.value = Udf_meta.region === undefined ? "horizontals" : Udf_meta.region;
        break;
      case "size": Tin.Io = new input("number", anchor);
        Tin.Io.value = Udf_meta.size === undefined ? metadata.len : Udf_meta.size;
        break;
    }
    // 
    return  Tin
  }
}
//
//
class theme extends scroller{
    // 
    //1...The sql used to extract information painted in this 
    //in the content section of this theme
    public sql?: string;
    // 
    //2...The column names involved in the above named sql
    public col_names?: Array<library.cname>;
    // 
    //3...The maximum possible records that are available to paint
    //the content pannel. they are required in adjusting the boundaries
    public max_records?: number;
    //
    //4....The database where this subject entity is housed 
    public dbase?: schema.database;
    //
    //The database and entity name that is displayed in this 
    //theme panel.
    public subject: subject;
    // 
    // 
    constructor(
      base: view,
      css: string,
      public subject: subject,
      udf_meta:udf_meta
    ) {
      super(base, css, udf_meta)
    }
    //
    //Complete the construction of the theme panel by running necessary
    //asynchronous processes.
    public async initialize() {
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
        this.sql = sql; 
        this.col_names = col_names; 
        this.max_records = parseInt(max_record);
        //
        //Activate the static php database.
        this.dbase = new schema.database(idbase);
    }
    //
    //Get the column names of this panel
    async get_col_names():Promise<Array<library.cname>> {return this.col_names!;}
    //
    //Returns the io of the given header tin
    get_io(header_tin:tin): io.io {
        const td= <HTMLTableCellElement>header_tin.anchor;
        // 
        //Get the position of this td 
        const rowIndex = (<HTMLTableRowElement>td.parentElement).rowIndex;
        const cellIndex = td.cellIndex;
        //
        //Destructure the subject to get the entity name; its the 
        //first component. 
        const ename = this.subject[0];
        // 
        //Get the column name that matches this td. 
        const col_name = this.col_names![cellIndex];
        //
        //Get the actual column from the underlying database.
        const col = this.dbase!.entities[ename].columns[col_name];
        //
        //Create and return the io for this column.
        const Io = io.create_io(td, col);
        return Io;
    }
}
//
//This panel is for presenting data from an arbitrary sql statement in a tabular
//form
class tabulator extends scroller{
  // 
  // 
  constructor(base: view, css: string, private sql_: sql, udf: udf_meta) {
    super(base, css, udf);
    
  }
  //
  //This is the method that runs the asynchronous method that would have 
  //otherwise be needed at the constructor level
  async initialize(): Promise<void>{
    //
    //
    this.col_meta= await server.exec(
        "database", 
        [this.sql.dbname],
        "get_col_meta", 
        [this.sql.stmt]);
    //
    //Get the maximum number of records in this query. Its a count of the results
    //returned by the sql.
    this.max_records= await server.exec(
        "database",
        [this.sql.dbname],
        "get_sql_data",
        [`select count(*) from (${this.sql.stmt}) as x`])[0][0];
  }
  // 
  // 
  async get_sql(): Promise<sql>{
    return this.sql_;
  }
}