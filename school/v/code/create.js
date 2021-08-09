"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//TO ENABLE ME USE THIS METHOD OF CREATING WITHOUT HAVING TO CREATE THE IO.
//Create a new element from  the given tagname and attributes 
//we assume that the element has no children in this version.
function create_element(
//
//The parent of the element to be created
anchor, 
//
//The elements tag name
tagname, 
//
//The attributes of the element
attributes) {
    // 
    //Initialize the element that is created diferently ddepending on whether 
    //the anchor is an htmlelement or a document 
    var element;
    // 
    //If the anchor is a html element get the document from the element and append the element
    //to the anchor 
    if (anchor instanceof HTMLElement) {
        //
        //Greate the element holder based on the td's owner documet
        element = anchor.ownerDocument.createElement(tagname);
        //
        //Attach this element to the anchor 
        anchor.appendChild(element);
    }
    // 
    //Create the element from the document 
    else {
        element = anchor.createElement(tagname);
    }
    //
    //Loop through all the keys to add the atributes
    for (var key in attributes) {
        var value = attributes[key];
        // 
        // JSX does not allow class as a valid name
        if (key === "className") {
            // 
            //Take care of mutiple class values
            var classes = value.split(" ");
            classes.forEach(function (c) { return element.classList.add(c); });
        }
        else if (key === "textContent") {
            element.textContent = value;
        }
        else if (key.startsWith("on") && typeof attributes[key] === "function") {
            element.addEventListener(key.substring(2), value);
        }
        else {
            // <input disable />      { disable: true }
            if (typeof value === "boolean" && value) {
                element.setAttribute(key, "");
            }
            else {
                //
                // <input type="text" />  { type: "text"}
                element.setAttribute(key, value);
            }
        }
    }
    return element;
}
exports.default = create_element;
