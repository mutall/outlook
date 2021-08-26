import { basic_value, Ifuel } from "../../../library/v/code/library";
import * as schema from "../../../library/v/code/schema";
import { checkbox, input, io, readonly, select } from "../../../outlook/v/code/io";
import {view } from "../../../outlook/v/code/outlook";
import create_element from "./create";
import { column_meta } from "./library";
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
//This is the coomponets of an sql statement
type sql= {stmt:string,dbname:string}
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
type Ibarrel= Array<basic_value>;
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
  //The body element is the parent of all the barrels on this panel
  public body: HTMLElement;
  //
  // The barrel that contains the header tins required for ordering the body and
  // to retrieve metadata for our metamod
  public header_barrel?: barrel;
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
  //Get Ifuel i.e.,the data to paint to the body 
  abstract get_Ifuel():Promise<Ifuel>;
  //
  //Returns the io of the given header tin
  abstract get_io(header_tin:tin):io;
  //
  //Returns the header column names, technically referred to as an Ibarrel.
  abstract get_col_names():Promise<Array<string>>;
  //
  //This is a user defined metadata that shapes the relationships between the
  // key and their data values.  
  abstract get_udf_meta():{ [cname: string]: udf_meta };
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
        //Create the boby element for this panel
        this.body= create_element(target, body, {});
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
        this.header = await this.get_header_barrel();
        //
        //Show or display the header.It is necessary if the layout
        //is tabular
        if (this.layout.type=== "tabular")this.header.paint();
        // 
        //Get Ifuel i.e.,the data to paint to the body 
        const Ifuel = await this.get_Ifuel();
        //
        //Use the fuel to paint the lister body
        this.paint_body(Ifuel)
  }
  //
  //It returns the row of data for painting the header 
  async get_header_barrel(): Promise<barrel>{
    // 
    //Get the header column names
    const Ibarrel = await this.get_header_Ibarrel();
    //
    //Create the header barrel for this panel
    const header_barrel = new barrel(this);
    //
    //Get the user defined metadata
    const udf_meta= this.get_udf_meta;
    //
    //Use the header barrel to convert the column names to tins of this barrel
    const tins= Ibarrel.map((cname,dposition)=>{
        const Tin= new tin(header_barrel);
        //
        //Add the default data position to the tin
        tin.dposition= dposition;
        //
        //Add the user-defined metadata that matches this tin
        const udf = this.udf_meta![cname];
        //
        //Assign the Metadata to the tin if it is valid
        if (udf !== undefined) Object.assign(tin, udf);
        //
        //Header tins are always displayed are always displayed in readonly mode 
        Tin.io = new readonly(Tin.anchor);
        //
        //The value of the header tin is the column name
        Tin.value = cname;
        //
        return(Tin);
    });
    // 
    //Sort the tins by order of the ascending data position
    tins.sort((a:tin, b:tin) => a.dposition! - b.dposition!);
    //
    //Attach the tins to the barrel 
    header_barrel.tins= tins;
    //  
    //Create the header barrel
    const Barrel = new barrel(this);
    //
    //Return the header barrel
    return header_barrel;
  }
  //
  //
  //Use the given Ifuel(data)to show or display the panels body.This is a double
  //loop that iterates over the barrels in the fuel and the tins in the barrels
  paint_body(Ifuel:Ifuel):void { 
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
  // 
  public sql?: sql
  // 
  //;
  constructor(
    base: view,
    css: string,
    public Udf_meta?: { [cname: string]: udf_meta }
  ) {
    super(css, base, Udf_meta);
  }
  // 
  //Every scroller must be associated with an sql 
  abstract get_sql(): Promise<sql>;
   
  // 
  
  
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
    //Get the column position
    get_col_position(data_cname: string){
        //
        // 1.Get the caller header tin with the given name
        // 
        // 1.1 Get the caller header barrel
        const caller_barrel = this.caller.header_barrel;
        //
        //1.2 Filter the header tin that matches the data cname,i.e., we expect 
        //one element
        const header_tin = caller_barrel.tins.filter(tin=> tin.name=== data_cname);
        // 
        // Return the dposition of the header tin
        return header_tin[0].uposition;
        
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
        //
        switch (meta_cname){
          case "cname": return data_cname;
          case "position": return this.get_col_position(data_cname) ;
          case "hidden": return this.caller.is_col_hidden(data_cname);
          case "region": return "verticals";
          case "size": return this.caller.get_col_size(data_cname);
          default: throw new Error(`Column ${meta_cname} not known`); 
        }
    }
    //
    // 
    async paint_header(): Promise<barrel>{
    // 
    //Create the header barrel
    const hbarrel = new barrel(this);
    // 
    //Populatr the barrel with the ton based oon the columns names 
    hbarrel.tins = ["cname", "order", "hidden", "region", "size"]
      .map((name, index) => {
        // 
        //Create the new tin 
        const Tin = new tin(hbarrel);
        // 
        //Add the name and the datapositon properties
        Tin.name = name; Tin.dposition = index; Tin.uposition = index;
        return Tin;
      });
    // 
    //Return the  promised barrel 
    return hbarrel;
  }
  // 
  //Paint the  body
  async paint_body(): Promise<void>{
    // 
    //loop through the  array of colmetadata
    for (const col_metadata of this.caller.col_metadata) {
      // 
      //Create a barrel 
      const Barrel = new barrel(this);
      // 
      //Loop through the header tins
      for (const htin of this.header!.tins!) {
        // 
        //Create the datatin 
        const Tin = new tin(Barrel);
        // 
        //Populate tin with value and io data.
        this.populate_tin(Tin,htin,col_metadata)
        Barrel.tins.push(Tin);
      }
      Barrel.paint()
    }
  }
  
  // 
  // 
  populate_tin(
    /*body_tin*/Tin:tin,
    /*header_tin*/htin: tin,
    column_meta: column_meta
  ): void{
    // 
    // 
    const anchor = Tin.anchor;
    const Udf_meta=this.udf_meta[htin.name]
    
    
    // 
    return  Tin
  }
}
// 
  // 
class tin{
  // 
  // 
  public io?: io;
  public anchor: HTMLElement;
  public uposition?: number
  public name?: string;
  public dposition?:number,
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
  //The rich description of the sql is activated when we are painting the column headers;
  private sql_meta?: sql_meta;
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
  //
  async get_sql(): Promise<sql>{
    // 
    //Get the rich sql metadata
    const sql_meta = await this.exec("editor", this.subject, "describe", []);
    // 

  }

}

class tabulator extends scroller{
  // 
  // 
  constructor(base: view, css: string, private sql_: sql, udf: udf_meta) {
    super(base, css, udf);
    
  }
  // 
  // 
  async get_sql(): Promise<sql>{
    return this.sql_;
  }
}