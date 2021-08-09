/** 
 * This file models the data as retrived from the database with classes such as the 
 * fuel, barell and the tins and the various ways the data can be displayed 
 */
import * as library from "../../../library/v/code/library.js"
import * as io from "./io.js";
import school from "./school.js";
import * as school_lib from "./library.js"
import create_element from "./create.js";
import { scroll } from "./scroll.js";
// 
//The column metadata that provides the user defined display peoperties of 
//of the fuel barrels these setting should be saved in the local storage 
//for persistence.
interface display{
  // 
  //The name of the column being displayed
  name:string,
  // 
  //Indicate if a given fuel should be hidden or not 
  hidden: boolean,
  // 
  //The order of presentation of a particular column
  order: number,
  // 
  //position where this column should appear in the display screen
  position: "horizontal" | "verticals" | "intersepts" | "footer" | null,
  // 
  //The format of display 
  format:"tabular"|"label"
}
//
// 
//This class models the fuel retrieved from the server as a class model. this ia particulary 
//useful when we want to display this model in the various formats
//This class extends an Map where the barels are identified by the offset values they were 
//derived with in the database.
export class fuel extends Map<number, barrel> {
  // 
  //This fuel can only be displayed as a label or a table by default it 
  //is a table
  public display: "label" | "tabular" = "tabular";
  // 
  //The column names used if the display is tarbular
  public col_names:Array<string>
  // 
  //To create a barrel we need the ifuel that is used.
  constructor(
    // 
    //These are the records retrieved from the database 
    public records: library.Ifuel,
    // 
    //The metadata used to describe the fuel.  
    public metadata:Array<school_lib.metadata>,
    // 
    //This is the scrollable theme panel that generated this fuel.
    public host: scroll,
    // 
    //This is the offset of the first record in this sql.
    public offset:number
  ) {
    super();
    // 
    //Set the columns names involved that.
    this.col_names = this.metadata.map(meta => meta.name);
  }
  // 
  //Converts the static list of the records into barrels making them members of this 
  //array coz currently this array is empty. This method is also called when there 
  //is need to expand this array with more data hence the method is public and has an 
  //optional Ifuel with it
  public activate(ifuel?: library.Ifuel, start?: number): void{
      //
      //The records to be activated can either come from the constructor or as a 
      //parameter
      const records = ifuel === undefined ? this.records : ifuel;
      const offset = start === undefined ? this.offset : start;
      // 
      //Loop through the static structure of the ifuel creating barrels in each 
      //indexing them by their offsets.
      records.forEach((rec,index) => {
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
          this.set(map_index, new barrel(rec, this, map_index));
      });
  }
  //
  //Construct the header row and append it to the thead.
  public show_header(thead: HTMLElement) {
      // 
      //paint these columns in a user defined form if set 
      //  
      //clear the current text content of the thead 
      thead.innerHTML = "";
      //
      //Header should look like this
      //The primary key column will also serve as the multi line selector
      //<tr>
      //  <th id="todo" onclick="select_column(this)">Todo</th>
      //        ...
      //</tr>
      //Construct the th and attach it to the thead.
      const tr = create_element(thead,"tr",{});
      // 
      // 
      //paint the header in the used defined format is isset 
      if (this.host.position !== undefined) {
        this.reorder(tr);
        return;
    }
    else{
      // 
      //For debuging and prove of concept 
      this.populate_order_section();
      //
      //2. Loop through each to create the table headers  matching the example above
      this.col_names!.forEach(col_name => {
          //
          //Create the th element using this panel document with the column name as the
          //id and the text content 
          const th = create_element(tr, "th", {
              id: `${col_name}`, textContent: `${col_name}`,onclick:(evt)=>this.host.select_column(evt)
          });
      });
    }
  }
  // 
  //Paints the header in a user defined format 
  private reorder(tr: HTMLTableRowElement): void{
    // 
        //Get the order of painting 
        const position = <Array<number>>Object.keys(this.host.position);
        // 
        //sort the positions in an accending order 
        position.sort(function(a, b){return a-b});
        // 
        //paint using that order 
        position.forEach(pos => {
          // 
          //Get the cname at this position 
          const cname = this.host.position![pos];
          // 
          // 
          create_element(tr, "th",{textContent:cname,onclick:(evt)=>this.host.select_column(evt)})
        })
  }
  // 
  //Populate a table that allows user to enter the various positions on how they want the 
  //columns laid out in the display.
  private populate_order_section(): void{
    // 
    //Get the element where this table is to be displayed 
    const element = this.host.get_element("position");
    //
    //Create an element to display the column names allowing users to add any display
    //metadata.
    const tr = create_element(element, "tr", {});
    this.col_names?.forEach(col => create_element(tr, "td", { textContent: col,contentEditable:"true" }));
    //  
    //Add the tr for user interactions. 
    const tr2 = create_element(element, "tr", {})
    this.col_names?.forEach((col,index) => create_element(tr2, "td", { textContent:`${index}`,contentEditable:"true" }));
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
  //This fuel paints by looping through the barrels and painting it in a particular 
  //html element.
  //The offset shows from which index the barrel should start painting.
  public async paint(element?: HTMLElement, offset?: number): Promise<void>{
    // 
    //Get the default start and the default element if they are not defined.
    const start = offset === undefined ? this.offset : offset;
    const el = element === undefined ? this.host.target! : element;
        //
        //Let the tag be the element where this fuel will be painted 
        let Tag: HTMLElement;
        // 
        //If the display is tarbular paint the head and the tag is the tbody.
        if (this.display === "tabular") {
            this.show_header(this.host.document.querySelector("thead")!);
            Tag=this.host.document.querySelector("tbody")! 
        }
        // 
        //If the display is tarbular create a div and attach it to the element 
      else { Tag = create_element(el, "div", { className: "fuel" }) }
      // 
      //Paint the fuel from the given offset 
      for (let index = start; index <this.size; index++) {
        const bar = this.get(index);
        if (bar === undefined) throw new Error(`barrel at offset ${offset} is undefined`);
        //
        //Allow every barrel to paint itsself
         bar.paint(Tag);
      }
        
  }
}
// 
//Models a complete record as retrieved from the database by a given sql.
//This barrel extends a map which stores all the tins inside indexing them by 
//"offset,cname" the offset they were retrieved with in the database and the 
export class barrel extends Map<string, tin>{
    // 
    //The html element where this barrel will be painted
    public anchor?: HTMLElement;
  // 
  //To create a vessel we need the fuel
  constructor(
      // 
      //This is the static collection of the tins as an object 
      public items:{[index:string]:library.basic_value},
      //
      //The bigger fuel collection
      public parent: fuel,
      // 
      //The offset of this barrel in the database 
      public offset:number
  ) {
      super();
      // 
      //Activate these static tins into tins. This method talks to the 
      //server to obtain the tins metadata hence asynchronous executed 
      //using an iif function.
      this.activate()
  }
  // 
  //The activation of the static tins to tins required population of its 
  //metadata this is incase these tins were derived from a random sql.
   activate():void{
      // 
      //Construct the the collection of tins 
      for (let index = 0; index < this.parent.metadata.length; index++) {
          const col_matadata = this.parent.metadata[index];
          const colname = Object.keys(this.items)[index];
          const data = Object.values(this.items)[index];
          this.set(colname, new tin(this,col_matadata,data))
      }
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
        //Element used for the display of this barrel
        let tag: HTMLElement;
        if (this.parent.display === "tabular") {
            // 
            //Create the element that represents this barrel by default this is a tr
            //any other format can overide this 
            tag = create_element(element, 'tr', { id: `r.${this.offset}` });
        } else {
            const elem = create_element(element, 'div', { id: `r.${this.offset}`, classname: "card" });
            tag=create_element(elem,"div",{className:"card-body"})
        }
      // 
      //Paint the tins in user defined format if specified
      if (this.parent.host.position !== undefined) {
        // 
        //Get the order of painting 
        const position = <Array<number>>Object.keys(this.parent.host.position);
        // 
        //sort the positions in an accending order 
        position.sort(function(a, b){return a-b});
        // 
        //paint using that order 
        position.forEach(pos => {
          // 
          //Get the cname at this position 
          const cname = this.parent.host.position![pos];
          // 
          //Get the tin in this position it must be defined
          const tin = this.get(cname);
          // 
          //Paint the tin 
          tin?.paint(tag)
        })
      }
      else {
        //Loop through the tin appending each this element
        this.forEach(Tin => Tin.paint(tag));
      }
      // 
      //Return the elemnt created.
      return tag;
   }
}
// 
//this models the basic data
export class tin{
  // 
  //The io that defined the display of this io both for display and for data entry
  public io: io.io;
  // 
  //The name of this column as retrieved from the database.
  public name: string;
  // 
  //The io that aids in the data entry of this tin;
  constructor(
      public parent: barrel,
      public meta_data: school_lib.column_meta,
      public data: library.basic_value 
  ) {
    this.name = this.meta_data.name;
    this.io = this.parent.parent.host.get_io(meta_data);
      
  }
  // 
  // 
  //Paint this tins content inorder to display it as a html
  //by default this  content is pasted at the 
  paint(element: HTMLElement): HTMLElement{
      // 
      //The element that represents this tins io 
        let El: HTMLElement;
      // 
      //Create the tds which is the default display for a 
      //tin 
        if (this.parent.parent.display === "tabular") {
            El = create_element(element, "td", {className:`col ${this.name}`}); 
        }
        else{El= create_element(element,"div",{})}
      // 
      //Get the io 
      this.io.show(El);
      this.io.value = this.data;
      // 
      //Set the data to the respective ios
      // 
      //Return the default element created. 
      return El;
  }
}
