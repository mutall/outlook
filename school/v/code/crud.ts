//
//
import * as outlook from "../../../outlook/v/code/outlook.js";
//
//Allows methods on this page to talk to the server
import * as server from "../../../library/v/code/server.js";
// 
//This is the problem we have of solving that.
import * as library from "../../../library/v/code/library.js";
//
//Resolve the schema classes, viz.:database, columns, mutall e.t.c. 
import * as schema from "../../../library/v/code/schema.js"
//
//Impor the theme class
import * as theme from "./theme.js";
import * as scroll from "./scroll.js"
// 
import {app} from './app.js'
// 
// 
export type hidden=[library.cellIndex, library.cname]
//
//The result returned from showing a crud page this basic version 
//can be extended to a more complex result e.g., when we want to return 
//all the changes made by crud
export interface crud_result extends outlook.response {
    //
    //The current row that is selected. 
    //There may be no selection
    selection: scroll.crud_selection | null,
    //
    //All the cells that have been updated.
    updates?: Array<scroll.crud_selection>,
    //
    //All the deleted record represented by their primary keys. 
    deletes?: Array<library.pk>,
    //
    //All newly added records
    additions?: Array<outlook.html>
}
//
//Subject administration parameters required by crud 
interface admin_parameters {
    //
    //The subject, i.e., [ename,dbname] being administered, i.e., CRUDed.
    subject: outlook.subject,
    //
    //The operation allowed on the subject 
    verbs: Array<outlook.assets.verb>,
    //
    //The primary key of the record being focused/highlighted on 
    selection ?: scroll.crud_selection
}

//
//A crud page is a baby whose mother is, e.g., the application page,
//another crud page etc.
export class page extends outlook.baby<crud_result> {
    //
    //
    //This is the stack of all the current crud pages in the order inwhich 
    //they were created the most recent is at the top (LIFO).
    static stack: Array<page> = [];
    //
    //These are the operations supported by this crud page 
    public verbs: Array<outlook.assets.verb>;
    // 
    constructor(
        //
        //The page that shares the same window as this crud page
        public mother:outlook.view,
        //
        //This is the entity name associated with the 
        //records being administered.
        public subject: outlook.subject,
        //
        //These are th permissible operations on the crud page 
        verbs?: Array<outlook.assets.verb>,
        //
        //This td represents the primary key and its position from where 
        //the administration was initiated.
        //
        //A crud selection is a piece of data that helps to determine
        //the offset of the displayed records.It contains:- 
        //a) the primary key which is useful for this purpose  assuming 
        //that the data is sorted by that key, not  filtered in any way
        //and no deletions have occured.
        //b) the position that is used for updating the original td
        //using the crud result.
         public selection?: scroll.crud_selection
    ) {
        //
        super(mother, app.current.config!.crud);
        //
        //For debugging purposes
        this.id='crud';
        //
        //Save the verbs if they are not empty otherwise save all the 
        //posible casses
        this.verbs = verbs===(null || undefined) 
        ? ["create", "review", "update", "delete"]
        :verbs;
        //
        //Save this as the current crud page for use in expressing event
        //listeners on the crud page. 
        page.current = this;
        //
        //Set the theme panel so that it will be shown when this page is 
        //administered.
        const Theme = new theme.theme(subject, "#content", this,this.selection)
        this.panels.set("theme", Theme);
    }
      
    // 
    //Restore the current view, so that click listeners of this view
    //that rely that static variable can work. In general this does nothing;
    //in particular this sets property crud.page.current to this view
    restore_current(){ page.current = this;}
     
    //There are no known checks for validating crud operations 
    check(){return true}

    // 
    //In this verision we are only returning the selection 
    //component of a crud 
    async get_result(): Promise<crud_result>{
        //
        //Get the currently selected tr 
        const tr = this.document.querySelector(".TR");
        // 
        //Prepare for the case where there is no current selection 
        let selection: scroll.crud_selection|null;
        // 
        //If there  is no selected tr then the selection is set to null... 
        if (tr !== null) {
            //
            //...otherwise we compile the selection.
            //
            //Destructure the td ignoring the primary key and the friendly 
            //parts because we will replace them with new edition.
            const { position } = this.selection!;
            // 
            //Get the primary key as an auto number
            const pk_selection = tr.getAttribute("pk");
            //
            //If the pk_selection isnot a string then something must have gone wrong 
            if (typeof pk_selection !== "string") {
                throw new schema.mutall_error(`The primary key for a selected tr not found`);
            }
            // 
            //Convert the primary key from a text to a number.
            const pk = parseInt(pk_selection);
            // 
            //Get the friendly component 
            const friendly = tr.getAttribute("friend")!;
            if (friendly === null) {
                throw new schema.mutall_error(`The friendly component of tr ${pk} is not found`);
            }
            // 
            //Compile a valid selection
            selection= { position, pk, friendly };
        }
        //
        //Prepare to return a null selection
        else{selection= null}
        //
        //Compile and return the final crud result without the updates, the additions 
        //and the deletions. They will be considered for future versions
        return { selection };
    }
    
    //
    //Modify the foreign key field that matches the given button. The function 
    //is asynchronous because it waits for the user to select a new entry 
    //from the foreign key table's crud page.
    public async edit_fk(button:HTMLButtonElement): Promise<void>{
        //
        //Stop the current tr from being clicked on.
        this.win.event!.stopPropagation();
        //
        //Use te button to get the crud page's admistration parameters
        const {subject, verbs, selection}: admin_parameters =
            this.get_admin_parameters(button);
        //
        //Use the admin parameters to create a new crud (baby) page whose
        //mothr is the current page.
         const baby= this.new_crud(this, subject, verbs, selection);
        //
        //Wait for the user to collect crud operation results. The result
         //is undefiend if teh user aborts the administration.
        const result: crud_result | undefined = await baby.administer();
        // 
        //Use the crud result to update this mother page, if it is defined 
        this.update_fk(result);
    }
    //
    //Create the logical crud page .This stub is to allow us to override
    //the normal crud page with our application specific version for
    //various reasons including implementation of quality control
    //features. See the crud constructor for further details
    new_crud(
        mother: outlook.view,
        subject: outlook.subject,
        verbs: Array<outlook.assets.verb>,
        selection?: scroll.crud_selection
    ):page{
        return new page(mother, subject, verbs, selection);
    }
    //
    //Get the subject verbs and the primary keys of the current theme
    private get_admin_parameters(button: HTMLButtonElement): admin_parameters {
        //
        //Retrieve the buttons primary key
        const value = button.getAttribute("pk");
        //
        //The primary key must be either a number or undefined.
        let pk: library.pk | undefined;
        if(typeof value === "string"){pk = parseInt(value);}
        //
        //Retrieve the buttons position
        const td_element = <HTMLTableCellElement>button.parentElement;
        const cellIndex = td_element.cellIndex;
        const rowIndex = (<HTMLTableRowElement>td_element.parentElement).rowIndex;
        const position: library.position = [rowIndex,cellIndex];
        // 
        //Retrieve the button's friendly component 
        const friendly = button.value;
        // 
        //Compile a td from this button
        const selection: scroll.crud_selection = { position, pk, friendly };
        //
        //For this version we assume the user as a service provider 
        //with unlimited crud access to his data 
        const verbs: Array<outlook.assets.verb> = ["create", "update", "review", "delete"];
        //
        //Get the theme pannel of this crud page 
        const Theme = <theme.theme>this.panels.get("theme")!;
        //
        //Get the column name that matches this button       
        const colname = Theme.col_names![(<HTMLTableCellElement> button.parentElement).cellIndex]
        //
        //Get the entity and the database name of this crud page.
        const [ename] = this.subject;
        //
        //Get the actual database column
        const col =<schema.foreign> Theme.dbase!.entities[ename].columns[colname];
        //
        //Formulate the referenced subject 
        const subject: outlook.subject = [col.ref.table_name, col.ref.db_name];
        //
        //Return the admin parameters
        return { subject, verbs, selection };
    }
    //
    //Returns the td that houses the given element. 
    static get_td(element: HTMLElement | null): HTMLTableCellElement{
        // 
        //There must be a td element in the hierarchy
        if (element === null) throw new schema.mutall_error("No td element found in the hierarchy");
        // 
        //Test if the element is a td and return if it is
        if (element instanceof HTMLTableCellElement) return element;
        // 
        //Get the parent element
        const parent = element.parentElement;
        // 
        //Return the td of the parent
        return page.get_td(parent);
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
    //Use the return crud result, typicaly primary key and its friendly name
    //to update this mother page.
    private update_fk(result?: crud_result): void {
        // 
        //No update is required when crud is aborted
        if (result === undefined) return;
        //
        //Update the tr. The update is valid if the user clicked on 
        //the crud's back button to get here, rather the window's 
        //history back button.
        //
        //Destructure the crud result
        const {selection} = result;
        //
        //Prepare for a null selection
        let position: library.position,
            pk: library.pk | undefined,
            friendly: string|undefined;
        //
        if (selection !== null) {
            // 
            //Assigninig valid selections 
            //
            //Destructure the selection. We do not know why this is not working
            // ( { position, pk, friendly } )= selection;
            position = selection.position;
            friendly = selection.friendly;
            pk= selection.pk
        }
        else {
            // 
            //For the case of a null selection nullify the foreign key value
            position = this.selection!.position
        }

        //
        //Destructure the position
        const [rowIndex, colIndex] = position;
        //.
        //Get the td field being edited
        const table = (<HTMLTableElement> this.document.querySelector("table")!)
        //
        //Get the tr st the row index
        const tr = table.rows[rowIndex];
        //
        //Get the td at the columnl index 
        const td = tr.cells[colIndex];
        //
        //Get the button to be changed
        const input = <HTMLInputElement> td.querySelector('input');
        //
        //Update the input button with the new changes
        if (pk !== undefined && friendly !== undefined) {
            input.setAttribute("pk", `${pk}`);
            input.value = friendly;
        }
        // 
        //Mark all the neccesary tds that are affected by this change as 
        //edited.
        //NB THE FIRST TD IN A ROW IS IMPORTANT FOR UPDATING THE CRUD PAGE
        page.mark_as_edited(input);
      //
      //If this is a hierarchical situation update the mother with 
       //updates additions and delete    
    }
    
    
    //
    //This is the last crud page opened.
    static get current() {
        //
        //Get the lenght of the stack and it must be greater than 0 
        //if not throw an error 
        const length = page.stack.length;
        if (length === 0) {throw new Error("There is no current crud page");}
        //
        //Get and return the crud page at top of the stack 
        return page.stack[length - 1];
    }
    //
    //
    static set current(x: page) {
        page.stack.push(x)
    }

    //
    //Button event listener that adds an empty row above
    //the current selection.
    create_row(): void {       
        //
        //Get the selected tr.
        const tr_selected = this.document.querySelector(".TR");
        //
        //1. Create Element tr above the selected tr if any.
        //
        //1.1. Get the table body.
        const tbody = this.document.querySelector("tbody")!;
        //
        //1.2. Get the row index to append to; it is this
        //selected row if any otherwise its the first row.
        const rowIndex = tr_selected === null
            ? 0
            : (<HTMLTableRowElement> tr_selected).rowIndex;
        //
        //1.3. Insert the row into the table body.
        const tr = tbody.insertRow(rowIndex);
        //
        //2. Create a new tr with no row data
        this.theme.load_tr_element(tr);
    }
    //
    //This is a listener for collecting and saving the affected td
    //, i.e., both new records and existing old tds, to the database.
    // This is the U component of CRUD
    async update_database() {
        //
        //1.Collect all the edited $inputs, i.e., data and their positions
        //on the crud page.
        const inputs: Array<library.label> = [...this.collect_inputs()];
        //
        //2.Write the $inputs to the server to get back 
        //the save result.
        //This is (maziwa) mala interface object.
        const Imala = await server
            .exec("record", [], "export", [inputs, "label"])
        //
        //Use the $result to report on the crud page
        //the status of the save.  
        this.report(Imala);
        //
        //Upate the friendly components of the affected rows
        // 
        //Remove the current edited tds
    }
    // 
    //To avoid repeating ourselves define the theme of this crud page
    get theme() {
        return <theme.theme>this.panels.get("theme")!;
    }
    //
    //Collect all the edited $inputs, i.e., data and its position
    private * collect_inputs() {
        //
        //Collect all the tds that have data to be sent to the server.
        const tds = Array.from(
            this.document.querySelectorAll("td.edited"));
        //
        //Loop through all tds and convert each to a label
        for(let td of tds) {
            //
            //Cast the td to a html table cell element
            //to eliminate typescript errors.
            const td_element = <HTMLTableCellElement> td;
            //
            //Get the cname
            const cname = this.theme.col_names![td_element.cellIndex];
            //
            //Get the tr
            const tr = <HTMLTableRowElement>(td_element.parentNode);
            //
            //Get the row position
            const rowindex = tr.rowIndex;
            //
            //The alias of your data should match the index of your td row
            const alias = [rowindex];
            //
            //Get the td position
            const cellIndex= td_element.cellIndex;
            //
            //Destructure the subject.
            const [ename, dbname] = this.subject;
            // 
            //Get the io that created that td
            //NB: The Maps array key needs to be converted into a string.
            const Io = theme.theme.ios.get(String([this.theme.key,rowindex,cellIndex]));
            // 
            //
            if (Io===undefined) {
                throw new Error("Cannot get the io that created this td");
            }
            // 
            //Compile data 
            let data: library.label =
                [dbname, ename, alias, cname, [Io.input_value, [rowindex,cellIndex]]];
            
            //Yield the explicit label
            yield data;             
        }
    }
    //
    //This is an onblur event listener of the textarea,
    //that updates the editted value to that of the input. 
    //In order to trigger the input`s onchange.
    public update_textarea_input(textarea:HTMLTextAreaElement) {
        //
        //The input is a child of the parent of the textarea
        const input = textarea.parentElement!.querySelector("input")!;
        //
        //Transfer the textarea content to the input value 
        //
        //Ignore the transfer if there are no changes.
        if (
            textarea.textContent === null
            || input.value === textarea.textContent
        ) return;
        //
        //Commit the changes.
        input.value = textarea.textContent;
        //
        //mark the cell as edited
        input.parentElement!.classList.add('edited');
    }
    //
    //This an onclick event listener of the input element that activates 
    //the textarea, for the user to start editting
    public edit_textarea(input:HTMLInputElement) {
        //
        //Get the text area which is a child of the parent of the input 
        const textarea = input.parentElement!.querySelector("textarea")!;
        //
        //Transfer the input value to the textarea text content 
        textarea.textContent = input.value;
        //
        //Hide the input 
        input.hidden = true;
        //
        //Unhide the text area 
        textarea.removeAttribute("hidden");
    }
        
    //Remove the curret record from both the screen and 
    //the database.
    async delete(): Promise<void> {
        //
        //Destructure this pages subject to reveal the entity and dbname.
        const [ename, dbname] = this.subject;
        //
        //Get the currently selected tr, if any. 
        const tr = this.document.querySelector(".TR");
        if (tr === null) { 
            alert("Please select a row to delete");
            return;
        }
        //
        //Get the primary key of the currently selected record.
        const pk = tr.getAttribute("pk");
        //
        //3. Formulate the delete sql and ensure that the entity name is 
        //enclosed with back ticks.
        const ename_str = `\`${ename}\``;
        const sql = `Delete  from ${ename_str}  where ${ename_str}
        .${ename_str}='${pk}'`;
        //
        //4. Execute the delete query on the server and return the 
        //number of affected records.
        const records = await server.exec("database", [dbname], "query", [sql]);
        //
        //Check if the delete was successful or not.
        if (records !== 1) {
            throw new schema.mutall_error(`The following query was not successful:
             ${sql}`);
        }
        //
        //5. Repaint homepage content to reflect changes, i.e., remove the 
        //row from the table.
        tr.parentNode!.removeChild(tr);
    }
    //
    //This method opens a popup, shows the columns that 
    //are already hidden and lets the user select the ones 
    //to be made visible 
    public async unhide() {
        //
        //Get the sheet for styling the columns because it is used for
        //controlling the hiding and unhiding feature 
        const element = <HTMLStyleElement> this.get_element("#columns");
        const sheet = <CSSStyleSheet>element.sheet!;
        // 
        //Get the current theme.
        const Theme = <theme.theme>this.panels.get("theme")!;
        //
        //Get the column names of the current theme. 
        let colnames: Array<library.cname> =Theme.col_names!; 
        //
        //Get the popup choices as key/value pairs of columns to unhide.
        const pairs: Array<outlook.key_value<library.cname>> =
            this.get_hidden_columns(sheet, colnames, Theme);
        // 
        //
        const specs = this.get_popup_window_specs();
        //
        //Use the pairs to create a multiple choice popup
        const Popup = new outlook.choices(this.config,pairs, "hidden_column",specs);
        // 
        //Await for the user to pick the choices of column names.
        const choices = await Popup.administer();
        // 
        //Unhide the selected columns.
        choices!.forEach(cname => { 
            // 
            //Get the index of this column name from the current theme. 
            const i = colnames.indexOf(cname)!;
            //
            //Get the declaration of the i'th rule 
            const declaration = (<CSSStyleRule>sheet.cssRules[i]).style;
            //
            //remove the display none property
            declaration.removeProperty("display");
            declaration.removeProperty("background-color");
        });
    }
    //
    //Get the popup choices as key/value pairs of columns to unhide.
    private get_hidden_columns(
        sheet: CSSStyleSheet,
        cnames: Array<library.cname>,
        Theme:theme.theme
    ): Array<outlook.key_value<library.cname>>{
        // 
        //Filter all the hidden columns
        const fcnames = cnames.filter(cname => {
            // 
            //Get the index of this cname
            const i = cnames.indexOf(cname);
            //
            //Get the i'th rule declaration.
            const declaration: CSSStyleDeclaration =
                (<CSSStyleRule>sheet.cssRules[i]).style;
            //
            //Get the display property.
            const display = declaration.getPropertyValue("display");
            //
            //If the property is found return true
            return display !== "";
        });
        // 
        //Get the theme's entity name from the subject 
        const ename = Theme.subject[0];
        // 
        //Get the entites columns 
        const columns = Theme.dbase!.entities[ename].columns;
        // 
        //Map the filtered column names to key value pairs 
        return fcnames.map(cname => {
            //
            //Get the matching column 
            const col = columns[cname];
            // 
            //The value of a column is its title if it's available.  
            const value = col.title === undefined ? cname : col.title; 
            // 
           return {key:cname, value} 
        });    
    }
    //
    //This will hide the selected column by controlling the styling 
    public hide() {
        //
        //1. Get the index of the selected th element
        const index = (<HTMLTableCellElement>this.document.querySelector(".TH")).cellIndex;
        //
        //2.Retrieve the rule declaration associated with this index
        //    
        //2.1 Retrieve the style tag.
        const style_sheet = <CSSStyleSheet>(<HTMLStyleElement>this.get_element('#columns')).sheet;
        //
        //2.1 Retrieve the rule declaration with this index, assuing a css styling rule
        const declaration:CSSStyleDeclaration = (<CSSStyleRule>style_sheet.cssRules[index]).style;
        //
        //2.2 Change the display property to none
        declaration.setProperty("display", "none");
        //
        //2.3 Why do we need to do this?
        declaration.removeProperty("background-color");
    }
    //
    //Toggles the checkbox at the primary td allowing user to do multiple 
    //tr selection. 
    public multi_select() {
        //
        //Retrieve the rule declaration associated with this index
        //    
        //Retrieve the style tag.
        const style_sheet = <CSSStyleSheet>(<HTMLStyleElement>this.get_element('multi_select')).sheet;
        //
        //Retrieve the rule declaration with this index, assuing a css styling rule
        const declaration:CSSStyleDeclaration = (<CSSStyleRule>style_sheet.cssRules[0]).style;
        //
        //Get the css property that is being toggled which is empty 
        //if this property is not found and string if it issset.
        const property = declaration.getPropertyValue("display");
        // 
        //If the property is an empty string set the property to a display none
        if (property === "") { declaration.setProperty("display", "none"); }
        //
        //The display is already none none remove it
        else { declaration.removeProperty("display"); }
    }
    //
    //This is a toggle switch that puts the page in edit or normal mode. You know you 
    //are in the edit mode because of Joyce's cursor. When re-pressed, it 
    //switches to normal mode
    public edit_click() {
        //
        //Put the body in edit or normal mode
        this.toggle_edit_normal();
        //
        //Scroll to the curently selected row, if any
        const tr = document.querySelector('.TR');
        //
        //scroll the tr into the center of the view, both vertically and 
        //horizontally
        if (tr !== null)
            tr.scrollIntoView({block: 'center', inline: 'center'});
    }
    //
    //Toggle the state of this page's body section between the edit and normal
    //modes by changing styling, rather than the acutal body 
    private toggle_edit_normal() {
        //
        //Get the edit style tag. The crud page must have one
        const style = document.querySelector('#edit_style')!;
        //
        //Toggle between the edit class and no edit (i.e., normal) modes 
        style.classList.toggle('edit');
        //
        //Select the mode to switch off. For instance, switch off edit if the style
        //is classified as edit
        const mode = style.classList.contains('edit') ? 'edit' : 'normal';
        //
        //Switch off the selected mode
        style.textContent = `.${mode}{display:none;}`;
    }
    // 
    //Get the popup's window size and location.
    get_popup_window_specs():string {
        //we dont seem to understand what window innerwidth and 
        //innerheight are. 
        //const winh= window.innerhHeight;
        //const winw= window.innerhWidth;
        //
        //We expected the following values for window height
        //$width on kimotho`s machine.
        const winh = 900;
        const winw = 1600;
        //
        //Specify the window location and size.
        const height = 1 / 3 * winh;
        //
        const top_pos = 1 / 2 * winh - 1 / 2 * height;
        //
        const width = 1 / 3 * winw;
        const left = 1 / 2 * winw - 1 / 2 * width;
        //
        //The specifications of the pop up.
         return `width=${width},top=${top_pos},height=${height},left=${left}`;

    }           
    
    //
    //This method make the button visible and puts the error in a span
    //tag. Which allows the user to view the error message.
    private report(mala: library.Imala): void {
        //
        //1.1 If syntax alert the error messages.
        if (mala.class_name === "syntax") {
            //
            //Convert the errors to a string.
            const errors = mala.errors!.join("\n");
            //
            //Display the errors.
            alert(`this is a syntax error ${errors}`);
            //
            //Stop code execution.
            return;
        }
        //
        //1.2 If runtime loop through the result array doing 
        //the following:- 
        mala.result!.forEach(([Iexp, position]) => {
            //
            //1.2.1 Get the position.
            const [rowIndex, cellIndex] = position;
            //
            //1.2.2 Get the affected tr.
            const tr = (<HTMLTableElement> this.document.querySelector("table"))
                .rows[rowIndex];
            //
            //1.2.3 Get the affected td.
            const td = (<HTMLTableCellElement> tr.cells[cellIndex]);
            //
            //Get the error button at that given position
            const error_btn=(<HTMLButtonElement> td.querySelector(".error_btn"));
            //
            //Get the span for the error messages
            const errors = <HTMLSpanElement>td.querySelector(".errors"); 
            //
            //If the writting was successful we update the primary key attributes 
            //and remove highlighs of the edited tds
            if (Iexp.type === "pk") {
                //
                //Get the span for the pk.
                const pk_span = <HTMLSpanElement> td.querySelector(".pk")!;
                //
                //Update the primary key.
                pk_span.textContent = String(eval(<string>Iexp.value));
                //
                //Update the friend.
                pk_span.setAttribute("friend", `${Iexp.friend}`);
                //
                //Remove the highlight for all sibligs of this tr 
                Array.from(tr.querySelectorAll("td.edited"))
                    .forEach(td2 => td2.classList.remove("edited"));
                //
                //Clear the error button by emptying and hiding it
                error_btn.hidden = true; error_btn.textContent="";
                //
                //Clear the error messages and hide the containing span
                errors.textContent = ""; errors.hidden=true;
                //
                //
                //
                return;
            }
            //The returned expression is an error.
            //
            //Highlight the whole row to mark it as an error.
            tr.classList.add("report");
            //
            //unhide the error button.
            error_btn.hidden = false;
            //
            //1.2.4 Get the span and paint its text content.
            errors.textContent = <string>Iexp.value;
        });
    }
    
}

//
//Modelling the tr as the basic unit for CRUD operations. The cud.page
//manages the same CRUD operatins for bulk operations, i.e., 
//creating, reviewing, updating and deleting multiple records at once
export class tr {
    // 
    //Pool of previously selected records 
    static map: Map<string, tr> = new Map();
    // 
    //The tr that is currently selected
    private static current__: tr;
  
    // 
    constructor(
        //
        //The entity and database name associated with this 
        //tr
        public crud: page, 
        //
        //The primary key of this tr
        public pk ?:library.pk
    ){}
    static get current() {
        // 
        //Check whether there is a currrent selection alert
        //user and throw exception if  none 
        if (tr.current__ === undefined) {
            throw new schema.mutall_error("Please select a tr");
        }
        return this.current__;
    }
    // 
    static set current(tr) {
        this.current__ = tr;
    }
}
//
//Override the normal error logging with an alert.
export class crud_error extends Error {
    constructor(msg:string) {
        //
        //Compile an error message that redirects the user
        //to the console
        const msg2 = `${msg}.<br> See Console.log for details.`;
        //
        //Update the error tag, assuming we are in the crud page.
        document.querySelector("#error")!.innerHTML = msg2;
        //
        //Log to the view variable to the console. 
        //Throw the default exception 
        super(msg2);
    }

}
