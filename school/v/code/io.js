"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.primary = exports.checkbox = exports.textarea = exports.file = exports.input = exports.foreign = exports.readonly = exports.url = exports.select = exports.io = exports.create_io = void 0;
//
//Resolve the schema classes, viz.:database, columns, mutall e.t.c. 
var schema = __importStar(require("../../../library/v/code/schema.js"));
var crud = __importStar(require("../../../outlook/v/code/crud.js"));
var create_js_1 = __importDefault(require("./create.js"));
//
//Added to alllo access to a view
//import * as outlook from "./outlook.js";
// 
//Resolve the tree methods needed for browser
var tree = __importStar(require("../../../outlook/v/code/tree.js"));
// 
//Resolve the server functionality
var server = __importStar(require("../../../library/v/code/server.js"));
//
/*
 * Sample from stack overflow f how to get Typescript typoes from
 * array of strings
    export const AVAILABLE_STUFF = <const> ['something', 'else'];
    export type Stuff = typeof AVAILABLE_STUFF[number];
 */
//Types of io bases on the input element
var input_types = ["date", "text", "number", "file", "image", "email"];
//
//Other Non-input types
var other_types = ["read_only", "checkbox", "primary", "foreign",
    "textarea", "url", "select"];
//
//Creating an io from the given anchor and column
function create_io(
// 
//The parent of the input/output elements of this io. 
anchor, 
// 
//The column associated with this io. 
col) {
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
        || col.data_type === "tinyint")
        return new checkbox(anchor);
    //
    //If the field length is 1 character, then assume it is a checkbox
    if (col.length === 1)
        return new checkbox(anchor);
    //
    //If the length is more than 100 characters, then assume it is a textarea
    if (col.length > 100)
        return new textarea(anchor);
    //
    //If the column name is 'description', then its a text area
    if (col.name === 'description')
        new textarea(anchor);
    //
    //Time datatypes will be returned as date.
    if (["timestamp", "date", "time"]
        .find(function (dtype) { return dtype === col.data_type; }))
        return new input("date", anchor);
    //
    //The datatypes bearing the following names should be presented as images
    // 
    //Images and files are assumed  to be already saved on the 
    //remote serve.
    if (["logo", "picture", "profile", "image"]
        .find(function (cname) { return cname === col.name; }))
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
    ["website", "url", "webpage"].find(function (cname) { return cname === col.name; })
        // 
        //...or it's taged as url using the comment.
        || col.url !== undefined)
        return new url(anchor);
    //
    //SELECT 
    //The io type is select if the select propety is set at the column level
    //(in the column's comment). 
    //Select requires column to access the multiple choices.
    if (col.data_type === "enum")
        return new select(anchor, col);
    //
    //String datatypes will be returned as normal text, otherwise as numbers.
    if (["varchar", "text"]
        .find(function (dtype) { return dtype === col.data_type; }))
        return new input("text", anchor);
    if (["float", "double", "int", "decimal", "serial", "bit", "mediumInt", "real"]
        .find(function (dtype) { return dtype === col.data_type; }))
        return new input("number", anchor);
    // 
    //The default io type is read only 
    return new readonly(anchor);
}
exports.create_io = create_io;
//
//Modeling the io for ofloading related methods from theme page  
var io = /** @class */ (function () {
    //
    function io(
    //
    //The document where the elements of this io belong.
    parent) {
        this.parent = parent;
        // 
        //Set the document property
        this.document = parent.document;
        // 
        //Set the ouput span element
        this.output = create_js_1.default(this.document, "span", { className: "normal" });
    }
    // 
    //A helper function for creating and showing labeled inputs element.
    io.prototype.show_label = function (
    // 
    //The header text of the label 
    text) {
        //
        //Child elements of the label
        var elements = [];
        for (
        //
        //Child elements of the label
        var _i = 1; 
        //
        //Child elements of the label
        _i < arguments.length; 
        //
        //Child elements of the label
        _i++) {
            //
            //Child elements of the label
            elements[_i - 1] = arguments[_i];
        }
        // 
        //Create the label and attach it to the anchor.
        var Label = create_js_1.default(this.document, "label", { className: "edit" });
        this.anchor.appendChild(Label);
        // 
        //Create a text node if necessary and attach it to the label.
        var header = text instanceof HTMLElement
            ? text : this.document.createTextNode(text);
        Label.appendChild(header);
        // 
        //Attach the labeled elements 
        elements.forEach(function (element) { return Label.appendChild(element); });
        //
        return Label;
    };
    Object.defineProperty(io.prototype, "value", {
        //
        //Setting and geting io values relies on the input's value 
        get: function () {
            return this.input_value;
        },
        set: function (v) {
            this.input_value = v;
            this.update_outputs();
        },
        enumerable: false,
        configurable: true
    });
    //
    //Default image sizes (in pixels) as they are being displayed
    // on a crud page 
    io.default_height = 25;
    io.default_width = 25;
    return io;
}());
exports.io = io;
// 
//This io class models a single choice selector from an enumerated list that 
//that is retrieved from the column type definition.
var select = /** @class */ (function (_super) {
    __extends(select, _super);
    // 
    function select(parent, 
    // 
    //The source of our selector choices 
    col) {
        var _this = _super.call(this, parent) || this;
        _this.col = col;
        // 
        //Set the input select element 
        _this.input = create_js_1.default(_this.document, "select", {
            className: "edit",
            // 
            onchange: function (evt) { return crud.page.mark_as_edited(evt); }
        });
        // 
        //Extract the columns as an array from the columntype 
        var choices = _this.get_choices();
        // 
        //Add the choices to the selector 
        choices.forEach(function (choice) { return create_js_1.default(_this.input, "option", { value: choice, textContent: choice }); });
        return _this;
    }
    Object.defineProperty(select.prototype, "input_value", {
        ///
        //The value of a select io is the value of the selected option 
        get: function () { return this.input.value; },
        set: function (i) {
            this.input.namedItem(String(i)).selected = true;
        },
        enumerable: false,
        configurable: true
    });
    // 
    //Extract the available enumerated options for this column type as an array of string
    //i.e from enum(male, female) to[male, fimale]
    select.prototype.get_choices = function () {
        // 
        //Get the column type 
        var column_type = this.col.type;
        // 
        //Remove the prefix enum i.e emum(male,female) to (male,fimale) 
        var str = column_type.substring(4);
        // 
        //Remove the leading and the trailing bracket
        var len = str.length;
        var str1 = str.substring(1, len - 1);
        // 
        //Split by the coma and return.
        return str1.split(",");
    };
    // 
    //The displayed output of a select is the text content 
    //of the selected option
    select.prototype.update_outputs = function () {
        // 
        //Get the selected option.
        var option = this.input[this.input.selectedIndex];
        // 
        //Transfer it's textcontent to the output 
        this.output.textContent = option.textContent;
    };
    // 
    //Paint the content of this io to the anchor to make them visible 
    select.prototype.show = function (anchor) {
        // 
        //Set this elements anchor;
        this.anchor = anchor;
        this.anchor.appendChild(this.output);
        this.anchor.appendChild(this.input);
    };
    return select;
}(io));
exports.select = select;
// 
//This io class models an anchor tag.
var url = /** @class */ (function (_super) {
    __extends(url, _super);
    // 
    // 
    function url(parent) {
        var _this = 
        // 
        _super.call(this, parent) || this;
        // 
        //
        _this.output = create_js_1.default(_this.document, "a", { className: "normal" });
        // 
        //Create a the url label 
        var url_label = create_js_1.default(_this.document, "label", { className: "edit", textContent: "Url Address: " });
        // 
        //Attach the url input tag to the label
        _this.href = create_js_1.default(url_label, "input", {
            type: "url",
            onchange: function (evt) { return crud.page.mark_as_edited(evt); }
        });
        // 
        //Create a text label
        var text_label = create_js_1.default(_this.document, "label", {
            className: "edit", textContent: "Url Text: "
        });
        // 
        //Add this text tag to the the label
        _this.text = create_js_1.default(text_label, "input", {
            type: "text",
            //
            //Add a listener to to mark this text element as edited.
            onchange: function (evt) { return crud.page.mark_as_edited(evt); }
        });
        return _this;
    }
    Object.defineProperty(url.prototype, "input_value", {
        // 
        //The value of a url is a string of url/text tupple
        get: function () {
            // 
            //Return a null if the address is empty...
            var rtn = this.href.value === "" ? null
                //
                //... otherwise return  url/text values as a stringified
                //tupple.
                : JSON.stringify([this.href.value, this.text.value]);
            return rtn;
        },
        // 
        //Setting the value as a url involves a parsing the value if it 
        //is not a null and initializing the url and text inputs.
        set: function (i) {
            //
            //Convert the value  to a js object which has the following 
            //format '["address", "text"]'(taking care of a null value)
            var _a = i === null
                ? [null, null]
                // 
                //The value of a url must be of type string otherwise 
                //there is a mixup datatype
                : JSON.parse(i.trim()), address = _a[0], text = _a[1];
            //
            //Set the inputs 
            this.href.value = address;
            this.text.value = text;
        },
        enumerable: false,
        configurable: true
    });
    // 
    //Updating the url involves transfering values from the
    //input tags to the anchor tags.
    url.prototype.update_outputs = function () {
        this.output.href = this.href.value;
        this.output.textContent = this.text.value;
    };
    // 
    //Make the elements of this io visible
    url.prototype.show = function (anchor) {
        this.anchor = anchor;
        // 
        // 
        this.anchor.appendChild(this.output);
        this.anchor.appendChild(this.text);
        this.anchor.appendChild(this.href);
    };
    return url;
}(io));
exports.url = url;
//
//Read only class represents an io that is designed not  
//to be edited by the user directly, e.g., KIMOTHO'S 
//real estate, time_stamps, etc.
var readonly = /** @class */ (function (_super) {
    __extends(readonly, _super);
    // 
    function readonly(parent) {
        var _this = _super.call(this, parent) || this;
        // 
        //Read only cells will be specialy formated 
        _this.output = create_js_1.default(_this.document, "span", { className: "read_only" });
        return _this;
    }
    Object.defineProperty(readonly.prototype, "input_value", {
        // 
        //
        get: function () { return this.output.textContent; },
        set: function (i) { this.output.textContent = i; },
        enumerable: false,
        configurable: true
    });
    // 
    //The read only values do not change.
    readonly.prototype.update_outputs = function () { };
    // 
    //Allow these io elements to be visible 
    readonly.prototype.show = function (anchor) {
        this.anchor = anchor;
        // 
        // 
        this.anchor.appendChild(this.output);
    };
    return readonly;
}(io));
exports.readonly = readonly;
//The forein key io class
var foreign = /** @class */ (function (_super) {
    __extends(foreign, _super);
    //
    function foreign(parent) {
        var _this = _super.call(this, parent) || this;
        //
        //Show the friendly name. Note, the friendly class is needed
        //to allow us to associate this element withi the button property
        _this.friendly = create_js_1.default(_this.document, "span", { className: "normal friendly" });
        //
        //Select a foreign key.
        //Note the class name button to allow us rstore this spcfic button
        //later
        _this.button = create_js_1.default(_this.document, "input", {
            type: "button", className: "edit button",
            onchange: function (evt) { return crud.page.mark_as_edited(evt); }
        });
        //
        //For editing purposes, lets be as precise as 
        //we can; its the foreign key field we want.
        //Stop bubbling up to prevent the tr from being re-selected.
        _this.button.setAttribute("onclick", "crud.page.current.edit_fk(this)");
        return _this;
    }
    Object.defineProperty(foreign.prototype, "input_value", {
        //
        //Setting and getting input values
        get: function () { return this.button.getAttribute("pk"); },
        set: function (i) {
            //
            //Destructure the foreign key value if it is a string. 
            if (typeof i === "string") {
                var _a = JSON.parse(i.trim()), pk = _a[0], friend = _a[1];
                // 
                //Verify that the primary key is defined
                if (pk === undefined || friend === undefined) {
                    throw new schema.mutall_error("THe foreign key value '" + i + "' is not correctly formatted");
                }
                // 
                //Set the button's
                this.button.value = friend;
                this.button.setAttribute("pk", pk);
            }
        },
        enumerable: false,
        configurable: true
    });
    //
    //Transfer the primary key and its friend from the input button to tthe
    //friendly span tag
    foreign.prototype.update_outputs = function () {
        var pk = this.button.getAttribute("pk");
        var friend = this.button.value;
        // 
        //The friendly name is valid only when there is a primary key.
        this.friendly.textContent = pk === null ? "" : pk + "-" + friend;
    };
    // 
    // 
    foreign.prototype.show = function (anchor) {
        this.anchor = anchor;
        this.anchor.appendChild(this.output);
        this.anchor.appendChild(this.button);
        this.anchor.appendChild(this.friendly);
    };
    return foreign;
}(io));
exports.foreign = foreign;
//The class of ios based on the simple input tag. 
var input = /** @class */ (function (_super) {
    __extends(input, _super);
    //
    function input(
    //
    //The type of the inpute, e.g., text, number, date, etc.
    input_type, 
    //
    //The anchor of this element, e.g., td for tabulular layout
    parent, 
    //
    //The value of the if available during construction
    value) {
        var _this = 
        //
        //The 'element input type' of an 'input io' is the same as that
        //of the input tag
        _super.call(this, parent) || this;
        _this.input_type = input_type;
        //
        //Compile the input tag
        _this.input = create_js_1.default(_this.document, "input", {
            type: input_type,
            className: "edit",
            onchange: function (evt) { return crud.page.mark_as_edited(evt); }
        });
        return _this;
    }
    Object.defineProperty(input.prototype, "input_value", {
        //
        //Setting and getting input values
        get: function () { return this.input.value; },
        set: function (v) {
            // 
            //Convert the value into a string 
            var value = v === null ? "" : String(v);
            // 
            //If the input value is a date extract the date component inthe YYYY-MM-DD format 
            if (this.input.type === "date")
                value = String(v).substring(0, 10);
            // 
            //Assign the string to the input value
            this.input.value = value;
        },
        enumerable: false,
        configurable: true
    });
    //
    //Updating of input based io is by default, simply copying the data from
    //the an input value tag to a span tag
    input.prototype.update_outputs = function () {
        this.output.textContent = this.input.value;
    };
    // 
    input.prototype.show = function (anchor) {
        this.anchor = anchor;
        // 
        // 
        this.anchor.appendChild(this.output);
        this.anchor.appendChild(this.input);
    };
    return input;
}(io));
exports.input = input;
// 
//This io models for capturing local/remote file paths 
var file = /** @class */ (function (_super) {
    __extends(file, _super);
    // 
    function file(parent, 
    // 
    //What does the file represent a name or an image
    type) {
        var _this = 
        // 
        //Ensure that the input is of type text 
        _super.call(this, "text", parent) || this;
        _this.type = type;
        // 
        //Select the remote or local storage to browse for a file/image
        _this.source_selector = create_js_1.default(_this.document, "select", {
            className: "edit",
            //Show either the remote server or the local client as the 
            //source of the image. 
            onchange: function (evt) { return _this.toggle_source(evt); }
        });
        // 
        //Add the select options 
        create_js_1.default(_this.source_selector, "option", { value: "remote", textContent: "Browse remote" });
        create_js_1.default(_this.source_selector, "option", { value: "local", textContent: "Browse local" });
        //
        // 
        //This is a local file or image selector. 
        _this.file_selector = create_js_1.default(_this.document, "input", {
            // 
            //This is of type file because the image input type does not behave as 
            //as expected.
            type: "file",
            className: "edit local",
            value: "Click to select a file to upload"
        });
        // 
        //The home for the click listerner that allows us to browse the server 
        //remotely 
        _this.explore = create_js_1.default(_this.document, "input", {
            className: "edit local",
            type: "button",
            value: "Browse server folder",
            //
            //Paparazzi, please save the folder/files path structure here after 
            //you are done 
            onclick: function (evt) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.browse(evt, String(this.value))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            }); }); }
        });
        //
        //Upload this file after checking that the user has all the inputs.
        //i.e., the file name and its remote path.
        _this.upload = create_js_1.default(_this.document, "input", {
            className: "edit local",
            type: "button",
            value: "Upload",
            onclick: function (evt) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.upload_file(evt)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            }); }); }
        });
        //
        //The tag for holding the image source if the type is an image.
        if (type === "image") {
            // 
            _this.output.hidden = true;
            //
            _this.image = create_js_1.default(_this.document, "img", {
                className: "img-fluid rounded hover-shadow card-img-top",
                height: io.default_height,
                width: io.default_width
            });
            // 
            _this.output.hidden = true;
        }
        return _this;
    }
    // 
    //Overide the show method to allow us to rearrange the input output 
    //elements of a file;
    file.prototype.show = function (anchor) {
        this.anchor = anchor;
        // 
        //Show the output elements which i.e the filename and image
        this.anchor.appendChild(this.output);
        if (this.image !== undefined)
            this.anchor.appendChild(this.image);
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
        this.show_label(this.input_header, this.input, this.explore);
        //
        //Reattach the upload button to force it to the last position
        this.anchor.appendChild(this.upload);
    };
    //
    //This is an event listener that paints the current page 
    //to allow the user to select an image/file
    //from either the remote server or the local client 
    file.prototype.toggle_source = function (_evt) {
        //
        //Get the selected (and unselected) options
        var selected = this.source_selector.value;
        var unselected = selected === "local" ? "remote" : "local";
        //
        //Get the link element it must exist.
        var link = this.parent.get_element("theme_css");
        // 
        //Get the css stylesheet referenced by the link element it must be defined
        var sheet = link.sheet;
        if (sheet === null)
            throw new Error("CSSStyleSheet not found");
        //
        //Display the selected option by removing the display option
        this.parent.update_stylesheet(sheet, "." + selected, false);
        //
        //Hide the uselected by setting the display to none
        this.parent.update_stylesheet(sheet, "." + unselected, true);
        // 
        //Update the input header label to either a file or folder depending on the selected 
        //source.
        this.input_header.textContent = "Select " + (selected === "remote" ? "file" : "folder") + " ";
    };
    //
    //This is a listener for initiating the browsing of files/folders
    // on the remote server.
    file.prototype.browse = function (
    //
    //This is the Event that has element within the td from which this
    // method was evoked.
    //It is important for tracing the cell where to write back the resulting
    //file/folder
    evt, 
    //
    //Displaying the initial look of the browser.
    initial) {
        return __awaiter(this, void 0, void 0, function () {
            var target, Inode, url, path;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        target = this.source_selector.value === "local"
                            ? "folder" : "file";
                        return [4 /*yield*/, server.ifetch("node", "export", [initial, target])];
                    case 1:
                        Inode = _a.sent();
                        url = "browser.php";
                        return [4 /*yield*/, (new tree.browser(target, url, Inode, initial))
                                .administer()];
                    case 2:
                        path = _a.sent();
                        //
                        //Only update the td if the selection was successful
                        if (path == undefined)
                            return [2 /*return*/];
                        //
                        //Store the $target into the appropriate input tag guided by the 
                        //given button
                        this.input.value = path;
                        // 
                        //Update the image tag.
                        if (this.type === "image")
                            this.image.src = path;
                        //
                        //Mark the parent td  as edited 
                        crud.page.mark_as_edited(this.input);
                        return [2 /*return*/];
                }
            });
        });
    };
    //
    //This is a button`s onclick that sends the selected file to the server
    //at the given folder destination, using the server.post method
    file.prototype.upload_file = function (evt) {
        return __awaiter(this, void 0, void 0, function () {
            var file, folder, _a, ok, result, html;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        file = this.file_selector.files[0];
                        //
                        //Ensure that the file is selected
                        if (file === undefined)
                            throw new crud.crud_error('Please select a file');
                        folder = this.input.value;
                        return [4 /*yield*/, server.post_file(file, folder)];
                    case 1:
                        _a = _b.sent(), ok = _a.ok, result = _a.result, html = _a.html;
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
                        else
                            throw new crud.crud_error(html + result);
                        return [2 /*return*/];
                }
            });
        });
    };
    Object.defineProperty(file.prototype, "input_value", {
        // 
        //Overide the setting of the input vakue so as to extend the 
        //changing of the image source.
        set: function (i) {
            _super.prototype.input_value = i;
            if (this.type === "image") {
                //
                //Set the image to the defalt when it is null
                this.image.src = i === null
                    ? "/pictures/default.jpeg"
                    : String(i);
            }
        },
        enumerable: false,
        configurable: true
    });
    return file;
}(input));
exports.file = file;
// 
//This is class text area is an extension of a simple input that allows
//us to capture large amount of text. 
var textarea = /** @class */ (function (_super) {
    __extends(textarea, _super);
    //
    function textarea(parent) {
        var _this = _super.call(this, "text", parent) || this;
        //
        //Create the native Text area element
        _this.textarea = create_js_1.default(_this.document, "textarea", {
            hidden: true,
            onblur: function (evt) { return _this.update_textarea_input(evt); }
        });
        // 
        //Add the click event listener that  
        _this.input.onclick = function (evt) { return _this.edit_textarea(evt); };
        return _this;
    }
    //
    //This is an onblur event listener of the textarea,
    //that updates the editted value to that of the input. 
    //In order to trigger the input`s onchange.
    textarea.prototype.update_textarea_input = function (evt) {
        // 
        //Get the textarea element that triggeres this event 
        var textarea = evt.target;
        //
        //Transfer the textarea content to the input value 
        //
        //Commit the changes.
        this.input.value = textarea.textContent === null ? "" : textarea.textContent;
        //
        //mark the cell as edited
        crud.page.mark_as_edited(this.input);
        // 
        //Hide the textarea and show the input tag
        textarea.hidden = true;
        this.input.hidden = false;
    };
    //
    //This an onclick event listener of the input element that activates 
    //the textarea, for the user to start editting
    textarea.prototype.edit_textarea = function (_evt) {
        //
        //Transfer the input value to the textarea text content 
        this.textarea.textContent = this.input.value;
        //
        //Hide the input 
        this.input.hidden = true;
        //
        //Unhide the text area 
        this.textarea.hidden = false;
    };
    // 
    // 
    textarea.prototype.show = function (anchor) {
        this.anchor = anchor;
        _super.prototype.show.call(this, this.anchor);
        this.anchor.appendChild(this.textarea);
    };
    return textarea;
}(input));
exports.textarea = textarea;
//
//The checkbox io is charecterised by 3 checkboxes. One for output, 2 for inputs
var checkbox = /** @class */ (function (_super) {
    __extends(checkbox, _super);
    //
    function checkbox(parent) {
        var _this = _super.call(this, parent) || this;
        //
        //The nomal mode for this io is the same as the edit.
        //The difference is that the output element is disabled
        _this.output = create_js_1.default(_this.document, "input", {
            type: "checkbox",
            disabled: true,
            className: "normal"
        });
        // 
        //THis checkbox is used for differentiating null from boolean 
        //values
        _this.input = create_js_1.default(_this.document, "input", {
            type: "checkbox",
            //
            //This checkbox is used for recording non-null values
            className: "edit value",
            //    
            //Mark the parent td as edited if the nput checkbox is cliked on
            onclick: function (evt) { return crud.page.mark_as_edited(evt); }
        });
        var label = create_js_1.default(_this.document, "label", { textContent: "NUll?: ", className: "edit" });
        //
        //Seting the io taking care of the  null data entry 
        _this.nullify = create_js_1.default(label, "input", {
            type: "checkbox", className: "nullable",
            //
            //Hide the input checkbox if the nullify  is checked and mark
            //the parent td as edited
            onclick: function (evt) { return _this.input.hidden = _this.nullify.checked; },
            onchange: function (evt) { return crud.page.mark_as_edited(evt); }
        });
        return _this;
    }
    // 
    //The check boxes have no particula
    checkbox.prototype.show = function (anchor) {
        this.anchor = anchor;
        this.anchor.appendChild(this.output);
        this.anchor.appendChild(this.nullify);
        this.anchor.appendChild(this.input);
    };
    Object.defineProperty(checkbox.prototype, "input_value", {
        //
        //The value of a check box is the checked status of the input.
        get: function () {
            return this.input.checked ? 1 : 0;
        },
        //
        //The value of a checkbox is a boolean or null.
        set: function (i) {
            if (i === null) {
                this.nullify.checked = true;
            }
            else {
                this.nullify.checked = false;
                this.input.checked = i == 1;
            }
        },
        enumerable: false,
        configurable: true
    });
    //
    //Update outputs from inputs.
    checkbox.prototype.update_outputs = function () {
        //If nullify is on...
        if (this.nullify.checked) {
            //
            //...then hide the outut...
            this.output.hidden = true;
        }
        else {
            //
            //...otherwise show the ouput with the same check status
            // as the input
            this.output.hidden = false;
            this.output.checked = this.input.checked;
        }
    };
    return checkbox;
}(io));
exports.checkbox = checkbox;
//The primary key io
var primary = /** @class */ (function (_super) {
    __extends(primary, _super);
    //
    function primary(parent) {
        var _this = _super.call(this, parent) || this;
        //
        //The primary key doubles up as a multi selector
        _this.multi_selector = create_js_1.default(_this.document, "input", { type: 'checkbox', className: "multi_select" });
        //
        //Tag where to reporting  runtime errors that arise from a saving the record
        // (with this primary key to the server)
        _this.errors = create_js_1.default(_this.document, "span", 
        //
        //This is to distinguish this span for errors. as well as hiddinging 
        //it initially.
        { className: "errors", hidden: true });
        //
        //This will is activates to let the user see the error message.
        _this.see_error_btn = create_js_1.default(_this.document, "button", {
            //
            //Helps us to know which button it is
            className: "error_btn error",
            hidden: true,
            onclick: function (evt) { return _this.see_error(evt); }
        });
        //
        //Mark the span where we shall place the primary key
        _this.output.classList.add("pk");
        //
        //Ensure that the primary key is visible whether in normal 
        //or edit mode
        _this.output.classList.remove("normal");
        return _this;
    }
    //
    //This is a error button event listener for toggling the user
    //error message after writing data to the database.
    primary.prototype.see_error = function (evt) {
        //
        //Toggle the class to hide and unhide the error message.
        this.errors.hidden = !this.errors.hidden;
        //
        //Change the text content of the button to either 
        //see error or close error.
        evt.target.textContent =
            this.errors.hidden ? "see error" : "close error";
    };
    Object.defineProperty(primary.prototype, "input_value", {
        //
        //The value of the primary key autonumber is the content of the output tag
        get: function () {
            // 
            //An empty primary key will be passed as a null
            var value = this.output.textContent === ""
                ? null
                : this.output.textContent;
            return value;
        },
        //
        //Set the input value of a primary key given the basic string value.
        set: function (i) {
            //
            //Destructure the primary key value if it is a string. 
            if (typeof i === "string") {
                // 
                //The input must be a string of this shape, [10,"friendlyname"].
                var _a = JSON.parse(i.trim()), pk = _a[0], friend = _a[1];
                // 
                //Verify that both the primary key and the friendlly components are defined.
                if (pk === undefined || friend === undefined) {
                    throw new schema.mutall_error("THe foreign key value '" + i + "' is not correctly formatted");
                }
                //
                //Save the friendly component as an attribute
                this.output.setAttribute('friend', friend);
                //
                //Show the pk in the output content.
                this.output.textContent = pk;
            }
        },
        enumerable: false,
        configurable: true
    });
    //
    //Update outputs from inputs does nothing because the input
    //is the same as the output.
    primary.prototype.update_outputs = function () { };
    // 
    // 
    primary.prototype.show = function (anchor) {
        this.anchor = anchor;
        this.anchor.appendChild(this.output);
        this.anchor.appendChild(this.multi_selector);
        this.anchor.appendChild(this.errors);
        this.anchor.appendChild(this.see_error_btn);
    };
    return primary;
}(io));
exports.primary = primary;
