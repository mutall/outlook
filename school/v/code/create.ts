//TO ENABLE ME USE THIS METHOD OF CREATING WITHOUT HAVING TO CREATE THE IO.
//Create a new element from  the given tagname and attributes 
//we assume that the element has no children in this version.
export default function create_element<
    //
    //The tagname is the string index ofthe html map.
    tagname extends keyof HTMLElementTagNameMap,
    // 
    //Collection of attributed values. The typescript Partial  data type
    //is a short form of
    //attribute_collection extends {[key in attribute_name]?:HTMLElementTagNameMap[tagname][key]}
    attribute_collection extends Partial<HTMLElementTagNameMap[tagname]>
>(
    //
    //The parent of the element to be created
    anchor:HTMLElement|Document,
    //
    //The elements tag name
    tagname:tagname,
    //
    //The attributes of the element
    attributes:attribute_collection|null
): HTMLElementTagNameMap[tagname]{
    // 
    //Initialize the element that is created diferently ddepending on whether 
    //the anchor is an htmlelement or a document 
    let element:HTMLElementTagNameMap[tagname];
    // 
    //If the anchor is a html element get the document from the element and append the element
    //to the anchor 
    if (anchor instanceof HTMLElement) {
        //
        //Greate the element holder based on the td's owner documet
        element= anchor.ownerDocument.createElement(tagname);
        //
        //Attach this element to the anchor 
        anchor.appendChild(element);
    }
    // 
    //Create the element from the document 
    else {
        element=anchor.createElement(tagname); 
    }
    //
    //Loop through all the keys to add the atributes
    for(let key in attributes){
        const value:any = attributes[key];
        // 
        // JSX does not allow class as a valid name
        if (key === "className") {
            // 
            //Take care of mutiple class values
            const classes= (<string>value).split(" ");
            classes.forEach(c=>element.classList.add(c));
        } 
        else if (key === "textContent") { 
            element.textContent= value;
        } 
        else if (key.startsWith("on") && typeof attributes[key] === "function") {
            element.addEventListener(key.substring(2), value);
        }
        else {
            // <input disable />      { disable: true }
            if (typeof value === "boolean" && value) {
                element.setAttribute(key, "");
            } else {
                //
                // <input type="text" />  { type: "text"}
                element.setAttribute(key, value);
            }
        }
    }
    return element;
}
