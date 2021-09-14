import * as outlook from "./outlook.js";
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
import * as io from "./io.js";
// 
//
import {app} from './app.js';

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
    //Saves io instances that created this theme table saved as a map 
    //indexed by their position in a thematic oanel
    static ios: Map<string, io.io> = new Map();
    //
    //4....The database where this subject entity is housed 
    dbase?: schema.database;
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
        this.subject = subject === null ? app.current.subject:subject;
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
        const selected_column = this.target!.querySelector(".TH");
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
            case "page": this.scroll_page(outcome.dir); break;
            //
            //2.3 Scroll to either the first or last row of the current dataset.
            case "table": this.scroll_table(outcome); break;
        }
    }
    // 
    //Scrolls the appropriate number of records(depending on the client height)
    //in a given direction.
    private scroll_page(dir:"up"|"down"):void{
       // 
       //Get the selected tr if any
       const selected_tr = this.document.querySelector(".TR");
       //
       //Something must be wrong if no tr is selected because you could not have
       //gotten to this stage.
       if( selected_tr === null){
           //
           alert("Please select a tr");
           throw new Error("No tr is currently selected");
       }
       //
       let target_tr:HTMLTableRowElement|null;
       //
        if (this.inview(<HTMLTableRowElement>selected_tr)){
            //
            //Get the tr to be scrolled into view, guided by the client height.
            target_tr= this.get_target_tr(<HTMLTableRowElement>selected_tr, dir,false);
        }
        else{
            //
            //This is the scrolling by a given amount
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
            //
            target_tr= this.get_target_tr(<HTMLTableRowElement>selected_tr, dir,true);
        }
       //
       if (target_tr ===null){
            //
           alert("No tr found");
           throw new Error("No tr found");
            
       }
       // Scroll the target tr to either top or bottom of the client window.
       const block = dir=== "down"?"end":"start";
       //
       //Scroll the target row into view...
       target_tr.scrollIntoView({block:block});
       // 
       //...and select it 
       theme.select(target_tr);
    }
    //
    //Return the tr to either be the first or the last in the view depending
    //on the scroll direction
    private get_page_tr(selected_tr:HTMLTableRowElement, dir:"up"|"down"):HTMLTableRowElement{
        //
        //This is the new tr element
        let target_tr:HTMLTableRowElement;
        // 
        //If the selected tr element is in view i.e., not at the top or bottom
        // then it does not change.We simply move it to the top or bottom of the
        // client window
        if(this.inview(selected_tr))return selected_tr;
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
        //Get the target tr by counting from the selected tr in the factor direction
        //until we get out of view. Return the row at which we get out of view.
        //
        //Get the current table's body
        const tbody= <HTMLTableSectionElement>selected_tr.parentElement!;
        //
        //Step through all the table rows until you get out of the view.
        //Note that the current i=0 and the next one i=1 are outside of the view
        //by definition, hence the initial setting of i=2.
        for(let i=2;;i++){
            //
            //Get the tr at the next i'th position
            target_tr = tbody.rows[selected_tr.rowIndex + i*factor];
            //
            //Test if the target row is still valid; we may be on the edge of the 
            //view
            if(target_tr === undefined){
                //
                //Retrieve more data if necessary; if not, return the original
                //tr which effectively does nothing.INVESTIGATE IF SCROLLING
                //BY A CERTAIN AMOUNT INVOKES THE SCROLL EVENT.
                alert("Your are either at the end of the view or at the end \n\
                        of the document. NOT SURE WHAT TO DO.");
                throw new Error("Please investigate this scrolling error");
            }
            //
            //When the target tr is valid, check whether it is inside or outside of the
            //client window view
            //
            //If its not within view, then we must have arrived at the tr we 
            //required
            if(!this.inview(target_tr)) return target_tr; 
        }
    }
    //
    //Get the target tr by scrolling the requested direction until you get into
    //view or out of view depending on the request.This function returns a null
    //if the row cannot be found.
    private get_target_tr(
        selected_tr: HTMLTableRowElement,
        dir:"up"|"down",
        request: boolean
    ):HTMLTableRowElement|null{
        //
        //Get the current table's body
        const tbody= <HTMLTableSectionElement>selected_tr.parentElement!;
        //
        //Initialize the target tr with the selected tr
        let target_tr= selected_tr;
        //
        //The stop condition for the following loop will be when the request is met.
        while(this.inview(target_tr)!== request){
            //
            //1. Get the direction factor i.e. +1 or -1
            const factor= dir==="up"?-1:+1;
            //
            //Advance the target tr
            target_tr = tbody.rows[target_tr.rowIndex + factor];
            //
            //Test whether the tr is valid which means you are outside of the
            //view range
            if(!(target_tr instanceof HTMLTableRowElement)){
                //
                return null;
            }
        }
        return target_tr;
        
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
    private scroll_into_view(
        request:offset,position:"start"|"center"):void {
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
}