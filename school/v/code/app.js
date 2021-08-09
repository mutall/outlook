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
Object.defineProperty(exports, "__esModule", { value: true });
exports.products = exports.services = exports.app = void 0;
var server = __importStar(require("../../../library/v/code/server.js"));
//
//Resolve the schema classes, viz.:database, columns, mutall e.t.c. 
var schema = __importStar(require("../../../library/v/code/schema.js"));
// 
// 
var outlook = __importStar(require("../../../outlook/v/code/outlook.js"));
var crud = __importStar(require("./crud.js"));
var theme = __importStar(require("../../../school/v/code/theme.js"));
var login = __importStar(require("../../../outlook/v/code/login.js"));
//
//The mechanism of linking services providers 
//to their various consumers.
//This app is the home page of the various mutall
//services also called the index.html of the chama,
//tracker, postek e.t.c 
var app = /** @class */ (function (_super) {
    __extends(app, _super);
    //
    //
    function app(
    //
    //The configuration settings for this application
    config) {
        var _this = 
        //
        //If the url of an application is not defined, then use that of
        //the current window
        _super.call(this, config, config.url) || this;
        //
        //Collector for first level login data.
        _this.collector = [];
        //
        _this.dbname = _this.config.app_db;
        // 
        // 
        _this.subject = config.subject;
        //
        //If the id of an appliction is not given, then use name of application
        //class that extednds this ne.
        _this.id = config.id;
        //
        //Set the page document.
        _this.win = window;
        // 
        //Get the inbult imala used for compiling the bootraped products 
        var Iproducts = _this.get_Iproducts();
        _this.products = new products(Iproducts);
        //
        //Test if there is a user that already exists in the local 
        //storage.
        var user_str = _this.win.localStorage.getItem("user");
        //
        //If this user exist use the already existing user to login
        if (user_str !== null) {
            _this.user = JSON.parse(user_str.trim());
            _this.login(_this.user);
        }
        return _this;
    }
    // 
    //Returns a range of bootrapped products 
    app.prototype.get_Iproducts = function () {
        // 
        //The inbuilt solutions that are the crud solutions for the assets
        //resources and the roles           
        var solutions = {
            crud_resource: {
                title: "Package Solutions to Products",
                id: "crud_resource",
                listener: ["crud", 'resource', ['review'], '+', "mutall_users"]
            },
            crud_roles: {
                title: "Customise Products",
                id: "crud_roles",
                listener: ["crud", 'custom', ['review'], '+', "mutall_users"]
            },
            crud_assets: {
                title: "Product Subscription",
                id: "crud_assets",
                listener: ["crud", 'asset', ['review'], '+', "mutall_users"]
            },
            executions: {
                title: "Specialize products",
                id: "executions",
                listener: ["crud", 'execution', ['review'], '+', "mutall_users"]
            },
            scores: {
                title: "Manage Scores",
                id: "scores",
                listener: ["crud", 'score', ['review'], '+']
            },
            school: {
                title: "Manage Scores",
                id: "school",
                listener: ["crud", 'school', ['review'], '+']
            }
        };
        //  
        //The roles and products of this application.
        var products = {
            admin: {
                id: "admin", title: "Manage Admin Products",
                solutions: solutions
            }
        };
        return products;
    };
    //
    //The user must call this method on a new application object; 
    app.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        //
                        //Open the application to set the win and title properties.
                        this.open();
                        //
                        //Set the database property based on the subject property.
                        return [4 /*yield*/, this.set_dbase()];
                    case 1:
                        //
                        //Set the database property based on the subject property.
                        _a.sent();
                        // 
                        //Expand the inbuilt products with all those read from the database that 
                        //a) associated with this application through the execution link 
                        //b) Are not associated with any application. 
                        return [4 /*yield*/, this.products.expand()];
                    case 2:
                        // 
                        //Expand the inbuilt products with all those read from the database that 
                        //a) associated with this application through the execution link 
                        //b) Are not associated with any application. 
                        _a.sent();
                        //
                        //Set the application panels
                        //
                        //Set the services panel
                        this.panels.set("services", new services(this));
                        //
                        //Set the theme panel
                        this.panels.set("theme", new theme.theme(this.subject, "#content", this));
                        //
                        //Show the theme and the services panel
                        return [4 /*yield*/, this.show_panels()];
                    case 3:
                        //
                        //Show the theme and the services panel
                        _a.sent();
                        // 
                        //Show this application on the address bar and make ensure that
                        //the initial window history state is not null.
                        this.save_view('replaceState');
                        return [2 /*return*/];
                }
            });
        });
    };
    //     
    //Return true/false depending on whether the named entity is linked to 
    //the user database or not 
    app.prototype.get_role_id = function (ename, dbase) {
        // 
        //Get the named entity 
        var entity = dbase.entities[ename];
        // 
        //Get the column names of this entity 
        var cnames = Object.keys(entity.columns);
        // 
        //Select only those columns that are used for linking 
        //this application's database to the mutall_user one.
        var f_cnames = cnames.filter(function (cname) {
            // 
            //Get the named column 
            var col = entity.columns[cname];
            // 
            //Test if this is a foreign key column pointing to the
            //mutall_user's database
            //
            var test = col instanceof schema.foreign
                && col.ref.db_name === "mutall_user"
                && col.ref.table_name === "user";
            // 
            //
            return test;
        });
        // 
        //Only those entities that have columns that pass the test are 
        //considered
        return f_cnames.length > 0;
    };
    //
    //Set the current database 
    app.prototype.set_dbase = function () {
        return __awaiter(this, void 0, void 0, function () {
            var idbase;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, server.exec("database", [this.dbname], "export_structure", [])];
                    case 1:
                        idbase = _a.sent();
                        //
                        //Activate the static and set it to this app
                        this.dbase = new schema.database(idbase);
                        return [2 /*return*/];
                }
            });
        });
    };
    //
    //Authenticate a new user that wants to access the 
    //services of this application. 
    //This the parameter user is usered when this method is called 
    //by the constructor is a user is found already existing in the local 
    //storage hence no loging in is required. 
    app.prototype.login = function (User) {
        return __awaiter(this, void 0, void 0, function () {
            var Login, _a, sql, role_ids, ids;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(User === undefined)) return [3 /*break*/, 2];
                        Login = new login.page(this.config, this.config.login);
                        //
                        //2.Get the authenticated user from the login popup
                        _a = this;
                        return [4 /*yield*/, Login.administer()];
                    case 1:
                        //
                        //2.Get the authenticated user from the login popup
                        _a.user = (_b.sent());
                        _b.label = 2;
                    case 2:
                        //
                        //Continue only if the user id defined
                        if (this.user === undefined)
                            return [2 /*return*/];
                        sql = 
                        //
                        //1. Specify what we want using a "select" clause 
                        "SELECT "
                            //
                            //...Specify the role id and its full name.
                            + "role.id "
                            //
                            //2. Specify the "from" clause
                            + "FROM "
                            + "subscription "
                            //
                            //These are the joins that trace our route of intrest 
                            + "inner join user ON subscription.user= user.user "
                            + "inner join player ON subscription.player= player.player "
                            + "inner join application ON player.application=application.application "
                            + "inner join role on player.role = role.role "
                            //
                            //3. specify the condition that we want to apply i.e "where" clause
                            + "WHERE "
                            //
                            //Specify the email condition 
                            + ("user.email='" + this.user.email + "' ")
                            //
                            //Specify the application condition
                            + ("AND application.id='" + this.id + "'");
                        return [4 /*yield*/, server.exec("database", ["mutall_users"], "get_sql_data", [sql])
                            // 
                            //Extract the roleid component from the server result
                        ];
                    case 3:
                        ids = _b.sent();
                        // 
                        //Extract the roleid component from the server result
                        this.user.role_ids = ids.map(function (e) { return e.id; });
                        //
                        //The user is a visitor if he has no previous roles 
                        this.user.type = this.user.role_ids.length === 0 ? "visitor" : "regular";
                        if (!(this.user.type === "visitor")) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.register()];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5: 
                    //
                    //Welcome the user to the home page unconditionaly
                    return [4 /*yield*/, this.welcome_user()];
                    case 6:
                        //
                        //Welcome the user to the home page unconditionaly
                        _b.sent();
                        //
                        //Save the user in local storage to allow reaccess to this page 
                        //without logging in.
                        window.localStorage.setItem("user", JSON.stringify(this.user));
                        return [2 /*return*/];
                }
            });
        });
    };
    //
    //On successful login, welcome the definite user, i.e., regular or visitor 
    //and not anonymous,  to the homepage by painting the matching message.
    app.prototype.welcome_user = function () {
        return __awaiter(this, void 0, void 0, function () {
            var role_element;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    //
                    //Paint the welcome message for a regular user.
                    return [4 /*yield*/, this.paint_welcome("regular")];
                    case 1:
                        //
                        //Paint the welcome message for a regular user.
                        _a.sent();
                        //
                        //Modify the appropriate tags
                        //
                        //Set user paragraph tags
                        this.get_element("user_email").textContent = this.user.email;
                        this.get_element("app_id").textContent = this.id;
                        this.get_element("app_name").textContent = this.name;
                        role_element = this.get_element("roles");
                        //
                        //Clear the current roles 
                        role_element.innerHTML = "";
                        //
                        //Add all the user roles to the welcome panel. 
                        this.user.role_ids.forEach(function (role_id) {
                            //
                            //Get the role title. Note the role_id as the datatype defind in 
                            //the application parameters, rather than outlook.role.role_id
                            //const title = this.products[<role_id>role_id][0];
                            var title = role_id;
                            //
                            //This is what the role fragment looks like.
                            //<div id="role_tenant">Tenant</div>
                            //
                            //Build the fragment 
                            var html = "<div id=\"role_" + role_id + "\">" + title + "</div>";
                            var div = _this.document.createElement("div");
                            role_element.appendChild(div);
                            div.outerHTML = html;
                        });
                        //
                        //4.Filter the products to remain with only those customed 
                        //for this role and those that are free
                        this.products.filter(this.user);
                        // 
                        //Activate the free products and those that this user is subscribed for
                        // 
                        //Get the product ids of all products this user is subscribed to
                        return [4 /*yield*/, this.activate_products()];
                    case 2:
                        // 
                        //Activate the free products and those that this user is subscribed for
                        // 
                        //Get the product ids of all products this user is subscribed to
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // 
    //Activates all the products that are free or this user is subscribed to
    app.prototype.activate_products = function () {
        return __awaiter(this, void 0, void 0, function () {
            var prod_id, subscribed;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        prod_id = new Set();
                        // 
                        //Get all the free products
                        this.products.forEach(function (Product) {
                            if (Product.cost === undefined || Product.cost === null || Product.cost === 0)
                                prod_id.add(Product.id);
                        });
                        return [4 /*yield*/, server.exec("app", [this.id], "subscribed_products", [this.user.email])
                            // 
                            //Add the subscribed
                        ];
                    case 1:
                        subscribed = _a.sent();
                        // 
                        //Add the subscribed
                        subscribed.forEach(function (prod) {
                            prod_id.add(prod.product_id);
                        });
                        // 
                        //Activate this product
                        prod_id.forEach(function (id) { return _this.products.activate(id); });
                        return [2 /*return*/];
                }
            });
        });
    };
    //
    //Register the user and return the role ids for which the 
    //user has registered.
    app.prototype.register = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var roles, inputs, Role, role_ids, login_db_data, result, _b, is_error, html, Report;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        roles = this.dbase.get_roles();
                        inputs = roles.map(function (role) {
                            // 
                            //return a role id 
                            var title = role.title === undefined ? role.id : role.title;
                            return { key: role.id, value: title };
                        });
                        // 
                        //If these roles are undefined alert the user
                        if (inputs === undefined || inputs.length < 0) {
                            alert("No roles found");
                            return [2 /*return*/];
                        }
                        Role = new outlook.choices(this.config, inputs, "role_id");
                        return [4 /*yield*/, Role.administer()];
                    case 1:
                        role_ids = _c.sent();
                        //
                        //Test if the user has aborted registration or not         
                        if (role_ids === undefined)
                            throw new schema.mutall_error("User has aborted the (level 1) registration");
                        //
                        //Save the user roles 
                        this.user.role_ids = role_ids;
                        login_db_data = this.get_subscription_data();
                        return [4 /*yield*/, server.exec("record", [], "export", [login_db_data, "label"])];
                    case 2:
                        result = _c.sent();
                        _b = this.get_report(result), is_error = _b.is_error, html = _b.html;
                        if (!is_error) return [3 /*break*/, 4];
                        Report = new outlook.report(app.current, html);
                        return [4 /*yield*/, Report.administer()];
                    case 3:
                        _c.sent();
                        // 
                        //Abort the login process.
                        throw new Error("Registration failed");
                    case 4: 
                    //
                    // The registration was successful so, return the role ids  
                    return [2 /*return*/, (_a = this.user) === null || _a === void 0 ? void 0 : _a.role_ids];
                }
            });
        });
    };
    // 
    //Report the  runtime or syntax errors
    app.prototype.get_report = function (imala) {
        // 
        // Define the structure of the report to be returned
        //  
        var html;
        //
        //Prepare to compile the error messages 
        var msgs = [];
        // 
        //The type of error message 
        var report_type;
        // 
        //Syntax errors occur if ...
        if (
        //... the class name matches syntax...
        imala.class_name === "syntax") {
            // 
            //Reporting syntax errors
            report_type = "syntax";
            //
            //Format the errors into a html
            msgs = imala.errors;
        }
        // 
        //Report runtime errors
        /// 
        //A runtime error exists if ... 
        if (
        // 
        //...the class name is tagged as syntax
        imala.class_name === "runtime"
            // 
            //... and there are indeed matching error messages 
            && (msgs = this.get_runtime_errors(imala.result)).length > 0) {
            // 
            //Reporting syntax errors 
            report_type = "runtime";
        }
        // 
        //Report the error messages if any. 
        if (report_type === undefined)
            return { is_error: false };
        // 
        //Compile the error message
        html =
            "<p> Error Type: " + report_type + "</p>"
                + msgs
                    .map(function (msg) { return "<p>" + msg + "</p>"; })
                    .join("<br/>");
        // 
        //Return the full report if report type is dfeiend
        return { is_error: report_type !== undefined, html: html };
    };
    // 
    //Test for runtime errors and return them if available
    app.prototype.get_runtime_errors = function (
    // 
    //The runtime results
    r_results) {
        // 
        //Error messages to be returned using a referenced variable
        var msgs;
        // 
        //Select the erroneous runtime results
        var rf_results = r_results.filter(function (ins) { return ins[0].type === "error"; });
        // 
        //Extract the messages from the erroneous runtime result and 
        //bind them to the input variable
        msgs = rf_results.map(function (res) { return res[0].value; });
        // 
        //Runtime errors exist if there are atleast one error
        return msgs;
    };
    //
    // Return the data needed for a successful 'first level' registartion, 
    // i.e., the data required for the current visitor to be recognized as a 
    // subscriber of the current application.
    app.prototype.get_subscription_data = function () {
        var _this = this;
        //
        // Prepare an array for holding the registration data.
        var reg = this.collector = [];
        //
        //Collect the user and appication data
        this.collector.push(['mutall_users', 'application', [], 'id', [this.id]]);
        //
        if (this.user.email === (undefined || null)) {
            throw new schema.mutall_error("You cannot login using without an email");
        }
        this.collector.push(['mutall_users', 'user', [], 'email', [this.user.email]]);
        //
        //Collect as much subcription data as there are roles
        //subscribed by this the use.
        this.user.role_ids.forEach(function (myrole, i) {
            //
            //Collect all available pointers to the user to enable us link to 
            //the application's specific database.
            _this.collector.push([app.current.dbname, myrole, [i], 'email', [_this.user.email]]);
            //
            //Indicate that we need -to  save a subscription record
            _this.collector.push(['mutall_users', "subscription", [i], 'is_valid', [true]]);
            //
            //Indicate that we need to save a player 
            _this.collector.push(['mutall_users', 'player', [i], 'is_valid', [true]]);
            //
            //COllect the user roles in this application
            _this.collector.push(['mutall_users', 'role', [i], 'id', [myrole]]);
        });
        //
        // Return the completer required array.
        return reg;
    };
    // 
    //This method is defined here but will gravitate to its proper 
    //home in future 
    app.prototype.new_crud = function (mother, subject, Xverbs) {
        return new crud.page(mother, subject, Xverbs);
    };
    // 
    //This is the generalised crud listener 
    app.prototype.crud = function (subject, Xverbs) {
        return __awaiter(this, void 0, void 0, function () {
            var baby, results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        baby = app.current.new_crud(app.current, subject, Xverbs);
                        return [4 /*yield*/, baby.administer()];
                    case 1:
                        results = _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    //
    //Paint the welcome message for users on the home page.
    app.prototype.paint_welcome = function (usertype) {
        return __awaiter(this, void 0, void 0, function () {
            var url, Template, win;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        /**
                         * If the usertype is visitor invite the user to login
                         */
                        if (usertype === "visitor") {
                            this.welcome_visitor();
                            return [2 /*return*/];
                        }
                        url = this.config.welcome;
                        Template = new outlook.template(this.config, url);
                        return [4 /*yield*/, Template.open()];
                    case 1:
                        win = _a.sent();
                        //
                        //Carnibalise the welcome template
                        //
                        //Paint the application homepage with the welcome message.
                        Template.copy(usertype, [this, 'welcome']);
                        //
                        //Close the tenplate (view)
                        win.close();
                        return [2 /*return*/];
                }
            });
        });
    };
    // 
    //Welcoming the visitor means inviting him to login and 
    //diactivating all the services that could have been active
    app.prototype.welcome_visitor = function () {
        //
        //Invite the user to login 
        this.get_element("welcome").innerHTML =
            " Please <button onclick=\"app.current.login()\">login</button> to access \n                various services";
        // 
        //Diactivate any active service 
        Array.from(this.document.querySelectorAll(".a"))
            .forEach(function (el) {
            el.classList.remove("a");
            el.removeAttribute("onclick");
        });
    };
    //
    //Log the user out of this application.
    app.prototype.logout = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                //
                //Use firebase to close its logout system
                //await firebase.auth().signOut();
                // 
                // 
                //Celar the entore local storage for this (debugging) version
                this.win.localStorage.clear();
                //Remove the user from the local storege
                //this.win.localStorage.removeItem("user");
                //
                //Restore default home page by replacing the regular
                //user's welcome message with the visitor's.
                this.paint_welcome("visitor");
                return [2 /*return*/];
            });
        });
    };
    return app;
}(outlook.view));
exports.app = app;
//
//The welcome panel of an app
var services = /** @class */ (function (_super) {
    __extends(services, _super);
    // 
    // 
    function services(base, Products) {
        if (Products === void 0) { Products = null; }
        var _this = _super.call(this, "#services", base) || this;
        _this.products = Products;
        return _this;
    }
    //
    //Use the products to complete the painting of the services panel
    services.prototype.continue_paint = function () {
        return __awaiter(this, void 0, void 0, function () {
            var panel, prods;
            var _this = this;
            return __generator(this, function (_a) {
                panel = this.get_element("services");
                prods = this.products === null ?
                    this.base.products : this.products;
                // 
                //
                //Step through the products to paint each one of them.
                prods.forEach(function (product, key) {
                    //
                    //Paint the product and return to a field set 
                    var fs = _this.paint_products(panel, product);
                    // 
                    //Loop through the solutions of this product appending them 
                    //as children  of this fs
                    Object.keys(product.solutions).forEach(function (id) {
                        // 
                        //Get the solution to paint
                        var solution = product.solutions[id];
                        // 
                        //Paint the solution
                        _this.paint_solution(fs, solution);
                    });
                });
                return [2 /*return*/];
            });
        });
    };
    //
    //Paint the given product and return to a field set.
    services.prototype.paint_products = function (
    // 
    //The panel element where to paint the products 
    panel, 
    //
    //The product being painted
    product) {
        //
        //1. Create a fieldset Element.
        var fs = document.createElement("fieldset");
        //
        //Set the id to be the same as that of the role
        fs.id = product.id;
        //
        //2. Set the fieldset's legend
        //
        //Create the legend
        var legend = document.createElement("legend");
        //
        //Set its content to the title of the role
        legend.textContent = product.title;
        legend.classList.add("redo-legend");
        legend.classList.add("reset-this");
        //
        //
        //Link the legend to the fieldset.
        fs.appendChild(legend);
        fs.classList.add("redo-fieldset");
        fs.classList.add("reset-this");
        //
        //Add the field set to the panel to complete the painting
        panel.appendChild(fs);
        // 
        //Return the fieldset Element.
        return fs;
    };
    // 
    // 
    //Paint the solution
    services.prototype.paint_solution = function (
    // 
    //The fieldset tag where we paint this solution. 
    fs, 
    // 
    //The solutions of the object currently being painted
    solution) {
        //
        //
        //Return if this product has empty solutions
        if (solution === undefined)
            return;
        // 
        // Destructure the solution to get the title; its the first component of 
        // the solution tuple
        var title = solution.title, id = solution.id;
        //
        //1. Convert the service into a (hidden by default) html element.
        var innertext = "<div "
            //
            //A solution withn a product is identified by the soultion id, 
            //i.e., ename.
            + ("class='" + id + "' \n          >\n              " + title + "\n          </div>");
        //
        //Create the DOM service element.
        var element = document.createElement("div");
        //
        //fill it with the inner html.
        element.innerHTML = innertext;
        //
        //2. Attach the element to the fieldset.
        fs.appendChild(element);
    };
    return services;
}(outlook.panel));
exports.services = services;
//
//Models a colllection of the products as a map. It extends a map 
//so that it can be indexed by a role id.
var products = /** @class */ (function (_super) {
    __extends(products, _super);
    //
    //To initialize this products we begin 
    function products(Iproducts) {
        var _this = _super.call(this) || this;
        //
        //Convert the iproduct to a map
        Object.keys(Iproducts).forEach(function (id) { return _this.set(id, Iproducts[id]); });
        return _this;
    }
    // 
    //Retrieve more products from the users database to create a more expanded
    //collection of all the products that are available for a particular 
    //application.
    products.prototype.expand = function () {
        return __awaiter(this, void 0, void 0, function () {
            var new_products;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, server.exec("app", [app.current.id], "get_products", [])];
                    case 1:
                        new_products = _a.sent();
                        // 
                        //Convert the retrived products into outlook complient product 
                        //structure
                        new_products.forEach(function (Iproduct) {
                            _this.add_product(Iproduct);
                        });
                        // 
                        //Update these products with the customization information.
                        this.update();
                        return [2 /*return*/];
                }
            });
        });
    };
    // 
    //Compiles a product from an iproduct and add it into this collection
    products.prototype.add_product = function (Iproduct) {
        // 
        //The structure of the iproduct
        //{id,title,cost,solution_id,solution_title,listener}
        //
        //Create an outlook solution of structure 
        //{id, title, listener}
        var sol;
        //
        //To create a dbase solution we need a title and listener
        var title = Iproduct.solution_title;
        // 
        //Get the string function declaration.
        var listener = ["post_defined", Iproduct.listener];
        //
        //Formulate the solution
        //{id, title,listener}
        sol = { id: Iproduct.solution_id, title: title, listener: listener };
        // 
        //Get the product where to append this solution. 
        var Product;
        //
        //Get the product from the existing products
        if (this.has(Iproduct.id)) {
            Product = this.get(Iproduct.id);
        }
        // 
        //Product does not exist Create a product with empty solutions 
        else {
            Product = { title: Iproduct.title, id: Iproduct.id, solutions: {} };
            // 
            //Add this product to the collection
            this.set(Iproduct.id, Product);
        }
        // 
        //Add the cost of this product 
        Product.cost = Iproduct.cost === null ? null : parseInt(String(Iproduct.cost));
        // 
        //Add the solution
        Product.solutions[Iproduct.solution_id] = sol;
    };
    // 
    //Hides all the products that are not customed to a certain user
    products.prototype.filter = function (user) {
        // 
        //Get all the global products_id
        var prod_ids = new Set();
        this.forEach(function (Product) {
            var _a;
            if (Product.customed === undefined || Product.customed === null || ((_a = Product.customed) === null || _a === void 0 ? void 0 : _a.size) === 0) {
                prod_ids.add(Product.id);
            }
        });
        // 
        //Add to the product id the productscustomed for this roles
        this.forEach(function (Product) {
            var _a;
            if (Product.customed !== undefined) {
                // 
                //Test if any of this users role exists in the customed array
                (_a = user.role_ids) === null || _a === void 0 ? void 0 : _a.forEach(function (role_id) {
                    var _a;
                    if ((_a = Product.customed) === null || _a === void 0 ? void 0 : _a.has(role_id))
                        prod_ids.add(Product.id);
                });
            }
        });
        // 
        //Hide all the products whose ids are neither customed to this roles
        //nor free
        this.forEach(function (Product) {
            if (!prod_ids.has(Product.id)) {
                //
                //Get the product's field set
                var fs = app.current.get_element(Product.id);
                // 
                //Hide this product
                fs.hidden = true;
            }
        });
    };
    // 
    //Update these products with the customised roles
    products.prototype.update = function () {
        return __awaiter(this, void 0, void 0, function () {
            var updates;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, server.exec("app", [app.current.id], "customed_products", [])
                        // 
                        //Loop through the updates and update the affected
                    ];
                    case 1:
                        updates = _a.sent();
                        // 
                        //Loop through the updates and update the affected
                        updates.forEach(function (update) {
                            if (_this.has(update.product_id)) {
                                var product = _this.get(update.product_id);
                                product.customed = new Set();
                                product.customed.add(update.role_id);
                            }
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    // 
    //Activate the product with the given id 
    products.prototype.activate = function (product_id) {
        // 
        //If no product exists with the given in id throw an error 
        if (!(this.has(product_id))) {
            throw new Error("The product with id " + product_id + " was not found");
        }
        // 
        //Get the product to be activated 
        var product = this.get(product_id);
        //
        //Get the product's field set
        var fs = app.current.get_element(product_id);
        // 
        //Get the solution to update
        Object.keys(product.solutions).forEach(function (id) {
            // 
            //Get the solution to activate 
            var sol = product === null || product === void 0 ? void 0 : product.solutions[id];
            //
            //Get the solution element.
            var solution_element = fs.querySelector("." + id);
            // 
            //Set the listener based on the type which the first parameter of the listener
            switch (sol.listener[0]) {
                // 
                //The post defined element have their events as strings
                case "post_defined":
                    solution_element.setAttribute("onclick", "" + sol.listener[1]);
                    break;
                // 
                //Crud listener calls the crud method
                case "crud":
                    //
                    //Get the solution's listener
                    var _a = sol.listener, cat = _a[0], ename = _a[1], verbs_1 = _a[2], xor = _a[3], dbname = _a[4];
                    // 
                    //Compile the subject of the crud table
                    var subject_1 = [ename, dbname === undefined ? app.current.dbname : dbname];
                    //
                    //
                    //convert the implied into explicit verbs 
                    // 
                    var Xverbs_1;
                    //
                    //Returns true if a verb1 is included in the list of availble
                    //verbs
                    var found_1 = function (verb1) {
                        return verbs_1.some(function (verb2) { return verb1 === verb2; });
                    };
                    //
                    //Get the explicit verbs. Its either the current selected (+) verbs 
                    //or the list of all verbs excluding(-) the selected ones
                    Xverbs_1 = xor === '+' ? verbs_1 : outlook.assets.all_verbs.filter(function (verb) { return !found_1(verb); });
                    //
                    //Set the listener on the solution element   
                    solution_element.onclick = function () { return app.current.crud(subject_1, Xverbs_1); };
                    break;
                //
                //The predefined listeners are set directly
                case "pre_defined":
                    solution_element.onclick = function () { return sol.listener[1]; };
                    break;
                // 
                default: throw new Error("Listener of type " + sol.listener[0] + " is not known");
            }
            //
            //Mark it as active
            solution_element.classList.add('a');
        });
    };
    return products;
}(Map));
exports.products = products;
