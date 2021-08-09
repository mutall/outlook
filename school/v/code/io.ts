//
//Resolve the schema classes, viz.:database, columns, mutall e.t.c. 
import * as schema from "../../../library/v/code/schema.js";
import * as library from "../../../library/v/code/library.js";
import * as crud from "../../../outlook/v/code/crud.js";
import create_element from "./create.js";
//
//Added to alllo access to a view
//import * as outlook from "./outlook.js";

// 
//Resolve the tree methods needed for browser
import * as tree from "../../../outlook/v/code/tree.js";
// 
//Resolve the server functionality
import * as server from "../../../library/v/code/server.js";
import outlook_config from "../../../outlook/v/code/config.js";
import * as outlook from "../../../outlook/v/code/outlook.js"
//
/*
 * Sample from stack overflow f how to get Typescript typoes from 
 * array of strings
    export const AVAILABLE_STUFF = <const> ['something', 'else'];
    export type Stuff = typeof AVAILABLE_STUFF[number];
 */
//Types of io bases on the input element
const input_types = <const> [ "date", "text", "number", "file", "image", "email"];
type input_type =  typeof input_types[number];
//
//Other Non-input types
const other_types = <const> ["read_only", "checkbox","primary", "foreign",
    "textarea", "url",  "select"];
type other_type =  typeof other_types[number];

//
//This is the input/output type of our database columns
//used to determine the kind of the input used for our
//column data entry.
export type io_type = input_type|other_type;
//
//Creating an io from the given anchor and column
export function create_io(
    // 
    //The parent of the input/output elements of this io. 
    anchor:outlook.view,
    // 
    //The column associated with this io. 
    col: schema.column
): io{
    //
    //Read only collumns will tagged as such.
    if (col.read_only !== undefined && col.read_only)
            return new readonly(anchor);
    //
    //Characterize the foreign and primary key columns
    if (col instanceof schema.primary) 
        return new primary(anchor);
    if (col instanceof schema.foreign) 
        return new foreign(anchor);
    //
    //Characterize the attributes
    //
    //A column is a checkbox if...
    if (
        //
        //... its name prefixed by 'is_'....
        col.name.startsWith('is_')
        // 
        //...or its datatype is a tinyint 
        || col.data_type === "tinyint"
    )return new checkbox(anchor);
    //
    //If the field length is 1 character, then assume it is a checkbox
    if (col.length === 1) 
        return new checkbox(anchor);
    //
    //If the length is more than 100 characters, then assume it is a textarea
    if (col.length! > 100) return new textarea(anchor);
    //
    //If the column name is 'description', then its a text area
    if (col.name === 'description')  new textarea(anchor);
    //
    //Time datatypes will be returned as date.
    if (["timestamp", "date", "time"]
        .find(dtype => dtype === col.data_type))
            return  new input("date", anchor);
    //
    //The datatypes bearing the following names should be presented as images
    // 
    //Images and files are assumed  to be already saved on the 
    //remote serve.
    if (["logo", "picture", "profile", "image"]
        .find(cname => cname === col.name))             
            return new file(anchor, "image");
    //
    if (col.name === ("filename" || "file"))
            return new file(anchor, "file");
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
                return new url(anchor);
    //
    //SELECT 
    //The io type is select if the select propety is set at the column level
    //(in the column's comment). 
    //Select requires column to access the multiple choices.
    if (col.data_type==="enum")         
        return new select(anchor, <schema.attribute>col);
    //
    //String datatypes will be returned as normal text, otherwise as numbers.
    if (["varchar", "text"]
        .find(dtype => dtype === col.data_type))
            return new input("text", anchor);
    if (["float", "double", "int", "decimal", "serial", "bit", "mediumInt", "real"]
        .find(dtype => dtype === col.data_type)) 
            return new input("number", anchor);
    // 
    //The default io type is read only 
    return new readonly(anchor);
} 
         

//
//Modeling the io for ofloading related methods from theme page  
export abstract class io {
    // 
    //The html element where the elemnts of this io are appended 
    public anchor?: HTMLElement;
    // 
    public document: Document;
    // 
    //This span tag is for displaying this io's
    //content in normal mode 
    public output: HTMLSpanElement;
    //
    //Default image sizes (in pixels) as they are being displayed
    // on a crud page 
    static default_height = 25;
    static default_width = 25;
    //
    constructor(
        //
        //The document where the elements of this io belong.
        public parent:outlook.view
    ) {
        // 
        //Set the document property
        this.document=parent.document
        // 
        //Set the ouput span element
        this.output =create_element(this.document,"span",{className:"normal"});
    }
    // 
    //A helper function for creating and showing labeled inputs element.
    public show_label(
        // 
        //The header text of the label 
        text: string | HTMLSpanElement,
        //
        //Child elements of the label
        ...elements: HTMLElement[]
    ): HTMLLabelElement{
        
        // 
        //Create the label and attach it to the anchor.
        const Label =create_element(this.document,"label",{className:"edit"})

        this.anchor!.appendChild(Label);
        // 
        //Create a text node if necessary and attach it to the label.
        const header = text instanceof HTMLElement
            ? text : this.document.createTextNode(text);
        Label.appendChild(header);
        // 
        //Attach the labeled elements 
        elements.forEach(element => Label.appendChild(element));
        //
        return Label;
    }
    //
    //Setting and geting io values relies on the input's value 
     get value():library.basic_value{
        return this.input_value;
    }
    set value(v:library.basic_value){
        this.input_value=v;
        this.update_outputs();
    }
    //
    //The input vales the io process.
    abstract get input_value():library.basic_value;
    abstract set input_value(v:library.basic_value); 
    //
    //  
    //
    //Transfer data from the input tags of an anchor element to 
    //the output tags, thus updating the normal mode
    abstract update_outputs(): void;
    // 
    //Show this io's elements in the desired order 
    abstract show(anchor: HTMLElement): void;
}
// 
//This io class models a single choice selector from an enumerated list that 
//that is retrieved from the column type definition.
export class select extends io{
    //
    //The element 
    public input: HTMLSelectElement;
    // 
    constructor(
        parent:outlook.view,
        // 
        //The source of our selector choices 
        public col:schema.attribute
    ) {
        super(parent);
        // 
        //Set the input select element 
        this.input = create_element(this.document, "select", {
            className: "edit",
            // 
            onchange:(evt)=>crud.page.mark_as_edited(evt)
        });
        // 
        //Extract the columns as an array from the columntype 
        const choices:Array<string> = this.get_choices();
        // 
        //Add the choices to the selector 
        choices.forEach(
            (choice) => create_element(
                this.input, "option", { value: choice, textContent: choice }
            )
        )
    }
    ///
    //The value of a select io is the value of the selected option 
    get input_value() { return this.input.value; }
    set input_value(i: library.basic_value) {
        this.input.namedItem(String(i))!.selected = true;
    }
    // 
    //Extract the available enumerated options for this column type as an array of string
    //i.e from enum(male, female) to[male, fimale]
    private get_choices(): Array<string>{
        // 
        //Get the column type 
        const column_type = this.col.type!;
        // 
        //Remove the prefix enum i.e emum(male,female) to (male,fimale) 
        const str=column_type.substring(4);
        // 
        //Remove the leading and the trailing bracket
        const len = str.length;
        const str1=str.substring(1,len-1);
        // 
        //Split by the coma and return.
        return str1.split(",");
    }
    // 
    //The displayed output of a select is the text content 
    //of the selected option
    update_outputs() {
        // 
        //Get the selected option.
        const option = this.input[this.input.selectedIndex];
        // 
        //Transfer it's textcontent to the output 
        this.output.textContent = option.textContent;
    }
    // 
    //Paint the content of this io to the anchor to make them visible 
    show(anchor: HTMLElement): void{
        // 
        //Set this elements anchor;
        this.anchor = anchor;
        this.anchor.appendChild(this.output);
        this.anchor.appendChild(this.input);
    }

}

// 
//This io class models an anchor tag.
export class url extends io{
    //
    //The output is an anchor tag overides the span output.
    public output: HTMLAnchorElement;
    // 
    //The input for the address(href)
    public href: HTMLInputElement;
    // 
    //The friendly component of an anchor tag
    public text: HTMLInputElement;
    // 
    // 
    constructor(parent: outlook.view) {
        // 
        super(parent);
        // 
        //
        this.output = create_element(this.document,`a`,{className:"normal"});
        // 
        //Create a the url label 
        const url_label: HTMLLabelElement = create_element(this.document,`label`,
            {className:"edit", textContent:"Url Address: "});
        // 
        //Attach the url input tag to the label
        this.href = create_element(url_label, `input`, {
            type: "url",
            onchange:(evt)=>crud.page.mark_as_edited(evt)
        });
        // 
        //Create a text label
        const text_label: HTMLLabelElement = create_element(this.document,`label`,{
            className:"edit", textContent:"Url Text: "});
        // 
        //Add this text tag to the the label
        this.text = create_element(text_label, `input`, {
            type: "text",
            //
            //Add a listener to to mark this text element as edited.
            onchange: (evt) => crud.page.mark_as_edited(evt)
        });
    }
    // 
    //Setting the value as a url involves a parsing the value if it 
    //is not a null and initializing the url and text inputs.
    set input_value(i:library.basic_value) {
            //
        //Convert the value  to a js object which has the following 
        //format '["address", "text"]'(taking care of a null value)
        const [address, text] = i === null
            ? [null, null]
            // 
            //The value of a url must be of type string otherwise 
            //there is a mixup datatype
            : JSON.parse((<string> i).trim());
        //
        //Set the inputs 
        this.href.value = address;
        this.text.value = text;
    }
    // 
    //Updating the url involves transfering values from the
    //input tags to the anchor tags.
    update_outputs() {
        this.output.href = this.href.value;
        this.output.textContent = this.text.value;
    }
    // 
    //The value of a url is a string of url/text tupple
    get input_value() {
        // 
        //Return a null if the address is empty...
        const rtn = this.href.value === "" ? null
            //
            //... otherwise return  url/text values as a stringified
            //tupple.
            : JSON.stringify([this.href.value, this.text.value])
        return rtn;
    }
    // 
    //Make the elements of this io visible
    show(anchor: HTMLElement): void{
        this.anchor = anchor;
        // 
        // 
        this.anchor.appendChild(this.output);
        this.anchor.appendChild(this.text);
        this.anchor.appendChild(this.href);
    }
}
 
//
//Read only class represents an io that is designed not  
//to be edited by the user directly, e.g., KIMOTHO'S 
//real estate, time_stamps, etc.
export class readonly extends io{
    //
    // The place holder for the read only value 
    public output:HTMLSpanElement; 
    // 
    constructor(parent:outlook.view){
        super(parent)
        // 
        //Read only cells will be specialy formated 
        this.output = create_element(this.document,`span`,{className:"read_only"})
    }
    // 
    //
    get input_value() {return this.output.textContent;} 
    set input_value(i) {this.output.textContent=i;}
    // 
    //The read only values do not change.
    update_outputs(): void{ }
    // 
    //Allow these io elements to be visible 
    show(anchor: HTMLElement): void{
        this.anchor = anchor;
        // 
        // 
        this.anchor.appendChild(this.output);
    }
}

//The forein key io class
export class foreign extends io{
    //
    //The span tag the displays the ouptut friendly name
    public friendly:HTMLSpanElement;
    //
    //The button used for evoking foreig key edit
    public button:HTMLInputElement;
    //
    constructor(parent:outlook.view){
        super(parent);
        //
        //Show the friendly name. Note, the friendly class is needed
        //to allow us to associate this element withi the button property
        this.friendly = create_element(
            this.document,`span`, {className:"normal friendly"}
        );
        //
        //Select a foreign key.
        //Note the class name button to allow us rstore this spcfic button
        //later
        this.button = create_element(
            this.document, `input`, {
                type: "button", className: "edit button",
                onchange: (evt) => crud.page.mark_as_edited(evt)
        }
        );
        //
        //For editing purposes, lets be as precise as 
        //we can; its the foreign key field we want.
        //Stop bubbling up to prevent the tr from being re-selected.
        this.button.setAttribute("onclick", "crud.page.current.edit_fk(this)")
    }
    
    //
    //Setting and getting input values
    get input_value(){return this.button.getAttribute("pk");}
    set input_value(i){
        //
        //Destructure the foreign key value if it is a string. 
        if (typeof i === "string") {
            const [pk, friend] = JSON.parse(i.trim());
            // 
            //Verify that the primary key is defined
            if (pk === undefined || friend === undefined) {
                throw new schema.mutall_error(`THe foreign key value '${i}' is not correctly formatted`);
            }
            // 
            //Set the button's
            this.button.value = friend;
            this.button.setAttribute("pk", pk); 
        }          
    }
    //
    //Transfer the primary key and its friend from the input button to tthe
    //friendly span tag
    update_outputs(){
        const pk = this.button.getAttribute("pk");
        const friend = this.button.value;
        // 
        //The friendly name is valid only when there is a primary key.
        this.friendly.textContent = pk=== null ? "" : `${pk}-${friend}`;
    }
    // 
    // 
    show(anchor: HTMLElement): void{
        this.anchor = anchor;
        this.anchor.appendChild(this.output);
        this.anchor.appendChild(this.button);
        this.anchor.appendChild(this.friendly);
    }

}    


//The class of ios based on the simple input tag. 
export class input extends io{
    //
    //The element that characterises an input
    public input:HTMLInputElement;
    //
    constructor(
        //
        //The type of the inpute, e.g., text, number, date, etc.
        public input_type:input_type,
        //
        //The anchor of this element, e.g., td for tabulular layout
        parent:outlook.view,
        //
       //The value of the if available during construction
        value?: library.basic_value,
    ){
        //
        //The 'element input type' of an 'input io' is the same as that
        //of the input tag
        super(parent);
        //
        //Compile the input tag
       this.input = create_element(this.document, "input",{
           type:input_type, 
           className: "edit",
           onchange:(evt)=>crud.page.mark_as_edited(evt)
       });
    }
    //
    //Setting and getting input values
    get input_value(){ return this.input.value}
    set input_value(v: library.basic_value) {
        // 
        //Convert the value into a string 
        let value = v === null ? "" : String(v);
        // 
        //If the input value is a date extract the date component inthe YYYY-MM-DD format 
        if (this.input.type === "date") value =String(v).substring(0, 10);
        // 
        //Assign the string to the input value
        this.input.value = value;
    }
    //
    //Updating of input based io is by default, simply copying the data from
    //the an input value tag to a span tag
    update_outputs(){
        this.output.textContent = this.input.value;  
    }
    // 
    show(anchor: HTMLElement): void{
        this.anchor = anchor;
        // 
        // 
        this.anchor.appendChild(this.output);
        this.anchor.appendChild(this.input);
    }
}

// 
//This io models for capturing local/remote file paths 
export class file extends input{
    //
    //The selector for the file source remote/local
    public source_selector: HTMLSelectElement;
    // 
    //This is an input of type file to allow selection of files on the 
    //local client 
    public file_selector: HTMLInputElement;
    // 
    //The home button for the click listerner that allows us to browse the server 
    //remotely
    public explore: HTMLInputElement;
    // 
    //This is a header for labeling the input element and the explorer buttom 
    public input_header?: HTMLSpanElement;
    // 
    //Home button for the click listener to upload this file from the local to the 
    //remote server. 
    public upload: HTMLInputElement;
    //
    //The tag for holding the image source if the type is an image.
    public image?: HTMLImageElement;
    // 
    constructor(
        parent: outlook.view,
        // 
        //What does the file represent a name or an image
        public type: "file"|"image"
    ) {
        // 
        //Ensure that the input is of type text 
        super("text", parent);
        // 
        //Select the remote or local storage to browse for a file/image
        this.source_selector = create_element(this.document,`select`,{
            className:"edit",
             //Show either the remote server or the local client as the 
            //source of the image. 
            onchange : (evt) => this.toggle_source(evt) 
        });
        // 
        //Add the select options 
        create_element(this.source_selector,"option",{value:"remote",textContent:"Browse remote"});
        create_element(this.source_selector,"option",{value:"local",textContent:"Browse local"});
        //
         // 
        //This is a local file or image selector. 
        this.file_selector = create_element(this.document, `input`, {
            // 
            //This is of type file because the image input type does not behave as 
            //as expected.
                type:"file",
                className:"edit local",
                value:"Click to select a file to upload"
        });
        // 
        //The home for the click listerner that allows us to browse the server 
        //remotely 
        this.explore =create_element(this.document,`input`,{
                className:"edit local",
                type:"button",
                value:"Browse server folder",
                //
                //Paparazzi, please save the folder/files path structure here after 
                //you are done 
                onclick: async (evt) => await this.browse(evt, String(this.value))
        });
        //
        //Upload this file after checking that the user has all the inputs.
        //i.e., the file name and its remote path.
        this.upload = create_element(this.document,`input`,{
            className:"edit local",
            type:"button",
            value:"Upload",
            onclick:async (evt) => await this.upload_file(evt)
        });
        //
        //The tag for holding the image source if the type is an image.
        if (type === "image") {
            // 
            this.output.hidden = true;
            //
            this.image = create_element(this.document, `img`, {
                className:"img-fluid rounded hover-shadow card-img-top",
                height:io.default_height,
                width:io.default_width
            });
            // 
            this.output.hidden=true;
        }
    }
    // 
    //Overide the show method to allow us to rearrange the input output 
    //elements of a file;
    show(anchor: HTMLElement): void{
        this.anchor = anchor;
        // 
        //Show the output elements which i.e the filename and image
        this.anchor.appendChild(this.output);
        if (this.image !== undefined) this.anchor.appendChild(this.image!);
        // 
        //Show the source selector
        this.show_label("Select source: ", this.source_selector);
        // 
        //Show the file selector
        //<Label>select image/file<input type="file"></label>
        this.show_label("Select file: ", this.file_selector);
        // 
        //Show the file/folder input and the server browser button
        // '
        //Create the header for that label
        this.input_header = this.document.createElement("span");
        this.show_label(this.input_header, this.input, this.explore)
        //
        //Reattach the upload button to force it to the last position
        this.anchor.appendChild(this.upload);
    }

    //
    //This is an event listener that paints the current page 
    //to allow the user to select an image/file
    //from either the remote server or the local client 
    public toggle_source(_evt:Event):void{
         //
        //Get the selected (and unselected) options
        const selected = <"remote" | "local">this.source_selector.value;
        const unselected= selected==="local"?"remote":"local"
        //
        //Get the link element it must exist.
        const link = <HTMLLinkElement>this.parent.get_element("theme_css")
        // 
        //Get the css stylesheet referenced by the link element it must be defined
        const sheet= link.sheet;
        if (sheet === null) throw new Error("CSSStyleSheet not found");
        //
        //Display the selected option by removing the display option
        this.parent.update_stylesheet(sheet,`.${selected}`,false)
        //
        //Hide the uselected by setting the display to none
        this.parent.update_stylesheet(sheet, `.${unselected}`, true);
        // 
        //Update the input header label to either a file or folder depending on the selected 
        //source.
        this.input_header!.textContent=`Select ${selected==="remote"? "file": "folder"} `
    }

    //
    //This is a listener for initiating the browsing of files/folders
    // on the remote server.
    public async browse(
        //
        //This is the Event that has element within the td from which this
        // method was evoked.
        //It is important for tracing the cell where to write back the resulting
        //file/folder
        evt:Event,
        //
        //Displaying the initial look of the browser.
        initial:tree.path,
    ) {
        //
        //Target tells us whether the initial path is a file or a folder.
        //This is important for controlling the browser behaviour i.e., for 
        //quality control purposes.
        const target = this.source_selector.value === "local"
            ? "folder" : "file";
        //
        //The following steps assume that we have set up a tree structure in php. 
        //
        //Get the static node structure ($Inode) from the server 
        const Inode = await server.ifetch("node", "export", [initial, target]);
        //
        //The url is the reference to the paparazzi project.
        const url = "browser.php";
        // 
        //Create and show the browser to retrieve the selected path
        const path = await (new tree.browser(target, url, Inode, initial))
            .administer();
        //
        //Only update the td if the selection was successful
        if (path == undefined) return;
        //
        //Store the $target into the appropriate input tag guided by the 
        //given button
        this.input.value = path;
        // 
        //Update the image tag.
        if (this.type === "image") this.image!.src = path;
        //
        //Mark the parent td  as edited 
        crud.page.mark_as_edited(this.input);
    }
     //
    //This is a button`s onclick that sends the selected file to the server
    //at the given folder destination, using the server.post method
    public async upload_file(evt:Event) {
        //
        //Test if all inputs are available, i.e., the file and its server path
        //
        //Get the file to post from the edit window
        //Get the only selected file
        const file = this.file_selector.files![0];
        //
        //Ensure that the file is selected
        if (file === undefined) throw new crud.crud_error('Please select a file');
        //
        //Get the sever folder
         const folder = this.input.value;
        //
        //Post the file to the server
        const {ok, result, html} = await server.post_file(file, folder);
        //
        //Flag the td inwhich the button is located as edited.
        if (ok) {
            crud.page.mark_as_edited(this.input);
            // 
            //Update the input tag 
            //
            //The full path of a local selection is the entered folder 
            //plus the image/file name
            this.input.value += "/" + file.name;
        }
        //
        //Report any errors plus any buffered messages. 
        else throw new crud.crud_error(html+result);
    }
    // 
    //Overide the setting of the input vakue so as to extend the 
    //changing of the image source.
    set input_value(i:library.basic_value){
        super.input_value = i;
        if (this.type === "image") {
            //
            //Set the image to the defalt when it is null
            this.image!.src = i === null
                ? "/pictures/default.jpeg"
                : String(i);
        }
    }
}

// 
//This is class text area is an extension of a simple input that allows
//us to capture large amount of text. 
export class textarea extends input{
    // 
    //This is the native text area Element. 
    public textarea: HTMLTextAreaElement;
    //
    constructor(parent: outlook.view) {
        super("text", parent);
        //
        //Create the native Text area element
        this.textarea =create_element(this.document,`textarea`,{
            hidden:true,
            onblur : (evt) => this.update_textarea_input(evt)
        });
        // 
        //Add the click event listener that  
        this.input.onclick = (evt) => this.edit_textarea(evt);
    }
    //
    //This is an onblur event listener of the textarea,
    //that updates the editted value to that of the input. 
    //In order to trigger the input`s onchange.
    public update_textarea_input(evt: Event) {
        // 
        //Get the textarea element that triggeres this event 
        const textarea = <HTMLTextAreaElement>evt.target!;
        //
        //Transfer the textarea content to the input value 
        //
        //Commit the changes.
        this.input.value = textarea.textContent===null?"":textarea.textContent;
        //
        //mark the cell as edited
        crud.page.mark_as_edited(this.input);  
        // 
        //Hide the textarea and show the input tag
        textarea.hidden = true;
        this.input.hidden = false;
    }
    //
    //This an onclick event listener of the input element that activates 
    //the textarea, for the user to start editting
    public edit_textarea(_evt:Event) {
        //
        //Transfer the input value to the textarea text content 
        this.textarea.textContent = this.input.value;
        //
        //Hide the input 
        this.input.hidden = true;
        //
        //Unhide the text area 
        this.textarea.hidden = false;
    }
    // 
    // 
    show(anchor: HTMLElement): void {
        this.anchor = anchor;
        super.show(this.anchor);
        this.anchor.appendChild(this.textarea);
     }
}
//
//The checkbox io is charecterised by 3 checkboxes. One for output, 2 for inputs
export class checkbox extends io{
    //
    //The output checkbox that is shown as disabled
    public output:HTMLInputElement;
    //
    //The 2 input checkboxes: 
    public nullify:HTMLInputElement;
    public input: HTMLInputElement;
    //
    constructor(parent:outlook.view){
        super(parent);
        //
        //The nomal mode for this io is the same as the edit.
        //The difference is that the output element is disabled
        this.output = create_element(this.document,`input`,{ 
            type:"checkbox", 
            disabled:true,
            className:"normal"
        });
        // 
        //THis checkbox is used for differentiating null from boolean 
        //values
        this.input = create_element(this.document,`input`,{
            type:"checkbox", 
            //
            //This checkbox is used for recording non-null values
            className: "edit value",
            //    
            //Mark the parent td as edited if the nput checkbox is cliked on
            onclick: (evt) => crud.page.mark_as_edited(evt)
        });
        const label = create_element(this.document,"label",{textContent:"NUll?: ", className:"edit"} )
        
        //
        //Seting the io taking care of the  null data entry 
        this.nullify = create_element(label, "input", {
            type: "checkbox", className: "nullable",
            //
            //Hide the input checkbox if the nullify  is checked and mark
            //the parent td as edited
            onclick: (evt) => this.input.hidden = this.nullify.checked,
            onchange:(evt)=>crud.page.mark_as_edited(evt)
        });
    }
    // 
    //The check boxes have no particula
    show(anchor: HTMLElement): void {
        this.anchor = anchor;
        this.anchor.appendChild(this.output);
        this.anchor.appendChild(this.nullify);
        this.anchor.appendChild(this.input);
    }
    //
    //The value of a check box is the checked status of the input.
    get input_value(){
        return this.input!.checked ? 1 : 0;
    }
    //
    //The value of a checkbox is a boolean or null.
    set input_value(i){
        if (i===null){
            this.nullify.checked = true; 
        }else{
            this.nullify.checked = false;
            this.input.checked = i==1
        }
    }
    //
    //Update outputs from inputs.
    update_outputs(){

        //If nullify is on...
        if (this.nullify.checked){
            //
            //...then hide the outut...
            this.output.hidden = true;
        }
        else{
            //
            //...otherwise show the ouput with the same check status
            // as the input
            this.output.hidden=false;
            this.output.checked=this.input.checked;
        } 
    }
}

//The primary key io
export class primary extends io{
    //
    //The primary key doubles up as a multi selector
    public multi_selector:HTMLInputElement;
    //
    //Tag where to reporting  runtime errors that arise from a saving the record
    // (with this primary key to the server)
    public errors:HTMLSpanElement;
    //
    //This will be activated to let the user see the error message.
    public see_error_btn:HTMLButtonElement;
    //
    constructor(parent:outlook.view){
        super(parent);
        //
        //The primary key doubles up as a multi selector
        this.multi_selector =create_element(
            this.document, "input",{type:'checkbox',className:"multi_select"}
        );
        //
        //Tag where to reporting  runtime errors that arise from a saving the record
        // (with this primary key to the server)
        this.errors =create_element(this.document, `span`,
            //
            //This is to distinguish this span for errors. as well as hiddinging 
            //it initially.
            {className:"errors", hidden:true});
        //
        //This will is activates to let the user see the error message.
        this.see_error_btn = create_element(this.document, `button`,{
            //
            //Helps us to know which button it is
            className :"error_btn error",
            hidden:true,
            onclick:(evt)=>this.see_error(evt)
        });
        //
        //Mark the span where we shall place the primary key
        this.output.classList.add("pk");
        //
        //Ensure that the primary key is visible whether in normal 
        //or edit mode
        this.output.classList.remove("normal");
    }
    //
    //This is a error button event listener for toggling the user
    //error message after writing data to the database.
    public see_error(evt: Event): void {
       //
        //Toggle the class to hide and unhide the error message.
        this.errors.hidden = !this.errors.hidden;
        //
        //Change the text content of the button to either 
        //see error or close error.
        (<HTMLElement>evt.target!).textContent =
            this.errors.hidden ? "see error" : "close error";
    }
    //
    //The value of the primary key autonumber is the content of the output tag
    get input_value() {
        // 
        //An empty primary key will be passed as a null
        const value = this.output.textContent === ""
            ? null
            : this.output.textContent;
        return value;
    }
    //
    //Set the input value of a primary key given the basic string value.
    set input_value(i: library.basic_value) {
        //
        //Destructure the primary key value if it is a string. 
        if (typeof i === "string") {
            // 
            //The input must be a string of this shape, [10,"friendlyname"].
            const [pk, friend] = JSON.parse(i.trim());
            // 
            //Verify that both the primary key and the friendlly components are defined.
            if (pk === undefined || friend === undefined) {
                throw new schema.mutall_error(`THe foreign key value '${i}' is not correctly formatted`);
            }
            //
            //Save the friendly component as an attribute
            this.output.setAttribute('friend', friend);
            //
            //Show the pk in the output content.
            this.output.textContent = pk;
        }          
    }
    //
    //Update outputs from inputs does nothing because the input
    //is the same as the output.
    update_outputs() { }
    // 
    // 
    show(anchor: HTMLElement): void {
        this.anchor = anchor;
        this.anchor.appendChild(this.output);
        this.anchor.appendChild(this.multi_selector);
        this.anchor.appendChild(this.errors);
        this.anchor.appendChild(this.see_error_btn);
     }
}