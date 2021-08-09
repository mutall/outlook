/**
 * This extends the theme to allow use a defined sql 
 */
// 
//Import the theme
import * as scroll from "./scroll.js";
import * as outlook from "../../../outlook/v/code/outlook.js";
import * as server from "../../../library/v/code/server.js";
import * as schema from "../../../library/v/code/schema.js";
import * as library from "../../../library/v/code/library.js"
import * as io from "./io.js";
import { column_meta } from "./library.js"
import school from "./school.js";
import * as fuel from "./fuel.js"
import * as sch_lib from "./library.js"
// 
// 
export default class tabulator extends scroll.scroll{
  //
  //The collumns that are involved in the sql being displayed.They are 
  //used in creating headers and figuring out the io type. Note these 
  //columns should be in the same order as they appeat in the sql. they are 
  //represented as column metas
  public columns?: Array<column_meta>;
  // 
  //Saves io instances that created this theme table saved as a map 
  //indexed by their position in a thematic panel.
  public ios: Map<string, io.io> = new Map();
  // 
  //Array of the column names that are involved in the sql
  public columns_?: Array<schema.column>;
  //
  //To create a tabulator theme we need the sql the mother and the css of the elements 
  //Where this theme will place its records
  constructor(
    // 
    //The sql that generates the data to be displayed in this 
    //pannel
    public sql_: string,
    //
    //The mother view where this pannel should be attached
    base: outlook.view,
    //
    //The element where the content of this sql is to be put 
    css: string,
    // 
    dbname:string,
    // 
    //An optional selection of the first record 
    public selection?: scroll.crud_selection
) {
    super(css, base,dbname);
  }
  // 
  //Get the sql that was set by the constructor
  get sql() { return this.sql_ }

   // 
  //Paint this market place from the first selection in a lable format.
  async continue_paint() {
    //
    const count_sql = `select count(1) as count from (${this.sql}) as su`;
    //
    //Retrieve the maximum records available for display 
    const records = await school.current.exec("database", [this.dbname!], "get_sql_data", [count_sql])
    const ifuel = Object.values(records)[0]
    this.max_records = parseInt(String(ifuel["count"]));
    await this.goto();  
  }
  // 
  //Sets the ifuel and displays it in the required procedure 
  public async show(Ifuel:library.Ifuel, offset:number) {
    //
    //Make these retrieved results visible  
    if (this.Fuel === null) {
      // 
      this.Fuel =  new fuel.fuel(Ifuel, this.sql, this, offset);
      // 
      //Activate the fuel 
      await this.Fuel.activate();
      //
      //Paint this labels to make them visible.
      await this.Fuel.paint(this.target!,offset);
    } else {
      await this.Fuel.activate(Ifuel, offset);
      this.Fuel.paint(this.target!, offset);
    }
  }
  //
  //Return the io structure associated with the given td by default these io are based on the column
  //metadata.
  get_io(col:sch_lib.column_meta): io.io {
    //
    //A column is a checkbox if...
    if (
        //
        //... its name prefixed by 'is_'....
        col.name.startsWith('is_')
    ) return new io.checkbox(this);
    //
    //Images and files are assumed  to be already saved on the 
    //remote serve.
    if (["logo", "picture", "profile", "image"]
        .find(cname => cname === col.name))             
            return new io.file(this, "image");
    //
    //If the column name is 'description', then its a text area
    if (col.name === 'description')  new io.textarea(this);
    //
    //Time datatypes will be returned as date.
    if (["timestamp", "date", "time"]
        .find(dtype => dtype === col.native_type))
            return  new io.input("date", this);
    //
    //The datatypes bearing the following names should be presented as images
    // 
     //
    if (col.name === ("filename" || "file"))
            return new io.file(this, "file");
    //
    //String datatypes will be returned as normal text, otherwise as numbers.
    if (["varchar", "text"]
        .find(dtype => dtype === col.native_type))
            return new io.input("text", this);
    if (["float", "double", "int", "decimal", "serial", "bit", "mediumInt", "real"]
        .find(dtype => dtype === col.native_type))
        return new io.input("number", this);
    //
    //If the length is more than 100 characters, then assume it is a textarea
    if (col.len > 100) return new io.textarea(this);

    if(col.native_type.startsWith("int"))return new io.input("number", this)
    // 
    //The default io type is read only 
    return new io.readonly(this);
}
}

// 
//This displays the score results as a table 