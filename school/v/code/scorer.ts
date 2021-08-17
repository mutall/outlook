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
  //??? it is the base that should be protected 
  protected header?: barrel;
  //
  //The following properties and methods are relevant for tabular layouts only.
  public table: HTMLTableElement;
  //
  //The body element is the parent of all the barrels on this panel
  public body: HTMLElement;
  //
  //Returns the barrel that represents the lister heasder.  
  abstract get_header_barrel(): Promise<barrel>;
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
    public layout: layout,
    //
    //This is a user defined metadata that shapes the relationships between the
    // key and their data values. 
    public udf_meta?: { [cname: string]: udf_meta }
  ) {
        //
        //Initialize the parent panel class
        super(css, base);
        //
        //Create the necessary HTML elements depending on the layouts.
        let body:HTMLElementTagName;
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
                break;
            //
            //For the label case the elements are user supplied
            case "label":
                //
                //The body elementTagName of the label layout is user defined
                body= layout.body;
            break;
        }
        // 
        //Create the boby element for this panel
        this.body= create_element(this.table, body, {});
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
  async paint_header(): Promise<barrel>{
    // 
    //At this point we need to get the sql.
    this.sql = await this.get_sql();
    // 
    //Execute the sql to get the databased column metadata
    const dcolumns: Array<column_meta> = this.exec("database", [this.sql.dbname], "get_sql_metadata", [this.sql.stmt]);
    //
    //commbine the user defined metadata with the database once
    const c_columns = this.udf_meta === undefined
      ? dcolumns
      : dcolumns.map((col, dposition) => {
        // 
        //Save the column data position
        col.dposition = dposition;
        // 
        //Get any metadata from the udf that matches the name of this colum
        const udf = this.udf_meta[col.name];
        if (udf !== undefined) {
          // 
          //Add the user defined metadata to the column
          Object.assign(col, udf);
        }
      });
    // 
    //Sort the columns by order of ascending user position
    c_columns.sort((a, b) => {
      // 
      //If the user defined position is not provided then use the data one.
      //Get the user defined position of a 
      const pa = a.uposition ?? a.dposition;
      // 
      //Get the user position of b 
      const pb = b.uposition ?? b.dposition;
      // 
      //Return the comparison result.
      if (pa === pb) return 0;
      if (pa > pb) return 1;
      return -1;
    });
    // 
    //Create the header barrel
    const Barrel = new barrel(this);
    // 
    //Step through all the columns and display each one of them
    for (const col of c_columns) {
      // 
      //Create a header tin out of the columns
      const Tin = new tin(col.name, col.dposition, Barrel);
      // 
      //Ofload all column data to the tin
      Object.assign(Tin, col);
      // 
      Tin.Io = new readonly(Tin.anchor);
      Tin.Io.value = col.name;
      Barrel.tins?.push(Tin);
    }
    Barrel.paint();
    return Barrel;
  }

  get_fuel() {
    return  this.exec("database", [""], "get_sql_data", [this.sql]);
  }
  // 
  // 
  
  
  }
}
// 
// 
class metamod extends lister{
  // 
  constructor(
    base: view,
    css: string,
    public caller:scroller
  ) {
    super(css, base);
    
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
        Tin.Io.value =this.get_hidden_status()
          //Udf_meta.hidden === undefined ? false : Udf_meta.hidden;
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