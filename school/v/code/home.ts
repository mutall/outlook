// 
//Import the theme
import * as scroll from "./scroll.js";
import * as outlook from "../../../outlook/v/code/outlook.js";
import * as library from "../../../library/v/code/library.js"
import * as fuel from "./fuel.js"
import school from "./school.js";
import market from "./market.js";
import * as school_lib from "./library.js";
import create_element from "./create.js";
import * as io from "./io.js"
// 
//This is my school sytem market place where the school data is represented as 
//lables with a brief description of the school and links to their schools.
export default class home extends scroll.scroll{
  // 
  public Fuel: show|null=null;
  public sql_: string;
  // 
  constructor(
    //The css string used to derive the elemnt where this sql will be placed 
    css: string,
    // 
    //The mother view where this panel is placed.
    base: outlook.view,
    // 
    //The database name that is the base of this query 
    dbname: string
  ) {
    super(css, base, dbname);
    this.sql_ = this.get_sql_();
  }
  // 
  //Get the sql that was set by the constructor
  private get_sql_():string {
    return ' select  `school`.`logo`, '
      + ' `school`.`id`, '
      + ' `school`.`name`, '
      + ' `school`.`address`, '
      + ' `school`.`location` '
      + ' from  `general_school`.`school` ';
  }
  // 
  set sql(s: string) { this.sql_=s }
  get sql(){return this.sql_}
  //
  // 
  //Paint this market place from the first selection in a lable format.
  async continue_paint() {
    //
    const count_sql = `select count(1) as count from (${this.sql}) as su`;
    //
    //Retrieve the maximum records available for display 
    const records = await school.current.exec("database", [this.config.app_db], "get_sql_data", [count_sql])
    const ifuel = Object.values(records)[0]
    this.max_records = parseInt(String(ifuel["count"]));
    await this.goto();  
  }
  // 
  // 
  get_io(col: school_lib.column_meta):io.io{
    return new io.input("text",this)
  }
  // 
  //Sets the ifuel and displays it in the required procedure 
  public async show(Ifuel:library.Ifuel, offset:number) {
    //
    //Make these retrieved results visible  
    if (this.Fuel === null) {
      // 
      this.Fuel =  new show(Ifuel, this.sql, this, offset);
      // 
      //Activate the fuel 
      await this.Fuel.activate();
      //
      //Paint this labels to make them visible.
      await this.Fuel.paint(this.target!);
    } else {
      await this.Fuel.activate(Ifuel, offset);
      this.Fuel.paint(this.target!,offset)
    }
  }
  //
  //This is the search event listener 
  //Filters the schools displayed on the market pannel and to a selected 
  //shool
  public async show_school(evt: Event): Promise<void>{
    //
    //Throw an error if this method was called without the fuel being set
    if (this.Fuel === null) throw new Error("method called before fuel isset");
    // 
    //Get the selector element selected value selected.
    const selected = (<HTMLSelectElement>evt.target).value;
    //
    //Test if the  accademy is already displayed in the show 
    const exist: false|academy = await this.Fuel.exists(selected);
    /** 
     * 
     * 1. the accademy is already painted bring it to focus*/
    if (exist instanceof academy) { exist.focus(); return }
     /* 
     * 2. Get the associated Ifuel, expand the show and bring it to focus */
    this.Fuel!.add_academy(selected);
  }
}
// 
//This home page models the school market place and hence we need to model a market.
//this promted the modeling of the fuel as stock and the barrels as items 
 class show extends fuel.fuel {
  // 
  constructor(records: library.Ifuel, sql: string, public host: home, offset: number) {
    super(records, sql, host, offset)
    // 
    this.display = 'label';
  }
  // 
  //Overide the show method to include the bootrap class styles keeping in mind 
  //we are only interested in the label view
  public paint(element: HTMLElement): void {
    //
    //Allow every barrel to paint itsself
    this.forEach(bar => bar.paint(element));
   }
   // 
   //Adds an academy with the given selection name 
   async add_academy(selection: string):Promise<academy|false> {
     // 
     //Change the sql to include that condition
     //
      //Get the original sql
      const sql = this.host.original_sql === undefined ? this.sql : this.host.original_sql;
      this.host.original_sql = sql;
      // 
      //The modifying where clause 
      const modify = ` where school.name= ${selection}`;
      // 
      //Modify the sql 
      this.host.sql = sql + modify;
      //
      //Get the ifuel for this
      const ifuel = await this.host.query(0, 1);
      //
      //Expand this repository with the given information.
     this.expand(-1, ifuel)
     //
     //Return the newly created accademy if it exists
     return this.exists(selection);
   }
   // 
   //Returns the accademy with a given name from its current repository, i.e., displayed in the show room 
   async exists(selection: string): Promise<academy | false>{
     // 
     //Get the academy with the given name 
     const acdms: Array<academy> = []
     this.forEach(acc => acdms.push(<academy>acc));
     // 
     //filter to obtain the required accademy
     const selected = acdms.filter(acc => acc.name!.data === selection)
     // 
     //result false if none is selected
     if (selected.length === 0) return false;
     // 
     return selected[0];
   }
  // 
  //Converts the static list of the records into barrels making them members of this 
  //array coz currently this array is empty. This method is also called when there 
  //is need to expand this array with more data hence the method is public and has an 
  //optional Ifuel with it
  public async activate(ifuel?: library.Ifuel, start?: number): Promise<void> {
    // 
    //Test if the columns are already set
    if (this.columns === undefined) await this.get_columns();
    // 
    //The records to be activated can either come from the constructor or as a 
    //parameter
    const records = ifuel === undefined ? this.records : ifuel;
    const offset = start === undefined ? this.offset : start;
    // 
    //Loop through the static structure of the ifuel creating barrels in each 
    //indexing them by their offsets.
    records.forEach((rec, index) => {
      // 
      //Evaluate the offset used to derive this barrel 
      const map_index: number = offset + index;
      // 
      //Die for now if this fuel has repeated barellels
      if (this.has(map_index)) {
        // 
        //alert the user then die 
        alert(`The fuel is overiding at idex ${map_index}`);
        throw new Error(`The fuel is overiding at idex ${map_index}`);
      }
      // 
      //Add the activated tin  into this collection.
      this.set(map_index, new academy(rec, this, map_index));
    });
  }
}

// 
//An accademy is an advert of a school as it appears in the market place once selected
//the accademy becomes an institution and hence allows the users to have accces of the 
//various school assets.
 class academy extends fuel.barrel{
  // 
  // The tin that houses the name of this accademy. 
  public name?: fuel.tin;
  // 
  //The tin that houses the short code of this accademy.
  public id?: fuel.tin;
  // 
  //The tin with the logo/image tag
  public logo?: fuel.tin;
  // 
  //The school name tag that has an onclick used for openning a selected school
   public header?: HTMLHeadElement;
   // 
   //The element used to display th
   public element ?:HTMLElement
  // 
  //The short code for this accademy
  constructor(
    // 
      //This is the static collection of the tins as an object 
    items:{[index:string]:library.basic_value},
    //
    //The bigger fuel collection
    parent: show,
    // 
    //The offset of this barrel in the database 
    offset: number
  ) {
    super(items, parent, offset);
  }
  // 
  //The activation of the static tins to tins required population of its 
  //metadata this is incase these tins were derived from a random sql.
  activate():void{
    super.activate();
    // 
    //Set the image, name and id tins
    const Tins=["logo", "name", "id"].map(el => this.find(el));
    //
    //Assign the properties
    for (let index = 0; index < Tins.length; index++) {
      switch (index) {
        case 0: this.logo = Tins[index]; break
        case 1: this.name = Tins[index]; break
        case 2: this.id = Tins[index]; break
      }
    }
   }
   // 
   //Put this element into focus
   focus() {
     this.element!.scrollIntoView();
     this.element!.focus();
   }
  // 
  //Returns the accademy property selected from the current collection of tins
  private find(property: string): fuel.tin{
    // 
    //convert this map into a simple array
    let Tins: Array<fuel.tin> = [];
    this.forEach(element => Tins.push(element));
    // 
    //Filter the tins using the name as a creiteria 
    const selected= Tins.filter(Tin=>Tin.name===property)
    // 
    //Ensure only one tin was filtered 
    if(selected.length>1) throw new Error("invalid sql that returned dublicate column names")
    // 
    //return the promised tin
    return selected[0]
  }
  // 
  //
  //Converts this accademy to an institution for the user to access the various school 
  //resources
  public async open_school() {
    //
    //The institution to be viewed
    const Institution= new institution(this.parent.host)
    // 
    //administer the institution
    await Institution.administer()
  }
  // 
  //Paints this barrel by default as a table this method can be overidden to 
  //change the mode of display
  public paint(el?: HTMLElement): HTMLElement{
    //
    //Set the anchor
    if (el instanceof HTMLElement) this.anchor = el;
    // 
    //Get the element to attach this display
    const element = el === undefined ? this.anchor! : el;
    // 
    //Create the div element responsible for panting this academy
    this.element = create_element(element, "div", { className: "accademy col-md-4", tabindex:0});
    // 
    //The div that houses the logo and the school name used for bootrap styling
    const container = create_element(this.element, "div", { className: "full blog_img_popular" });
    // 
    //The image tag for the logo 
   create_element(container, "img", { src: String(this.logo?.data), className: "img-responsive" });
    // 
    //The school name as a h4
    this.header= create_element(container,"h4",{onclick:()=>this.open_school(),textContent:String(this.name!.data)})
    // 
    //Return the elemnt created.
    return this.element;
 }
}
// 
//An institution is a class where the user can access the various school resources via event 
//listeners.
//This class was designed to extend an app as a baby but since it cannot extend both an app 
//and a baby an institution was created that has a school.
class institution extends outlook.baby<void>{
  // 
  //To create this instition we need a school an the url where this school will be 
  //displayed 
  constructor(
    // 
    //The mother of this institution is the school
    mother:school,
    // 
    //The id or short name for this institution
    public id: string,
    //
    //The name of this instutution
    public name: string
    //
  ) {
    super(mother);
    // 
    //Set the pannels of this institution
    this.set_pannels();
  }
  // 
  //Both the get_results and the check are requirement of the baby which by now are doing 
  //nothing
  async get_result() { }
  check(): boolean {return true;}
}