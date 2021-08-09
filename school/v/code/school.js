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
var app_js_1 = require("./app.js");
var config_js_1 = __importDefault(require("./config.js"));
var sql_js_1 = __importDefault(require("./sql.js"));
//
//The school model that link teacher, pupils and parents
var school = /** @class */ (function (_super) {
    __extends(school, _super);
    //
    //Initialize the school
    function school() {
        return _super.call(this, 
        //
        //Overide the config  
        new config_js_1.default()) || this;
    }
    // 
    //Allow users to take various actions on the score sheet. i.e enter a score, edit a score , 
    //view student score.
    school.prototype.score = function (action) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // const baby = new score(this, this.products.get("manage_exams")!, action);
                        // school.Score = baby;
                        // baby.administer()
                        _a = alert;
                        return [4 /*yield*/, this.exec("school", ["kaps"], "hello", [])];
                    case 1:
                        // const baby = new score(this, this.products.get("manage_exams")!, action);
                        // school.Score = baby;
                        // baby.administer()
                        _a.apply(void 0, [_b.sent()]);
                        return [2 /*return*/];
                }
            });
        });
    };
    // 
    //Converts the uproducts to the correct format of iproduct by expanding the already 
    //existing iproducts.
    school.prototype.activate_Iproducts = function (src, dest) {
        // 
        //Loop through the uproducts appending them to iproduct
        src.forEach(function (uprod) {
            //
            //Begin with an empty collection of the solutions
            var sols = {};
            // 
            //Populate the solution.
            uprod.solution.forEach(function (sol) { return sols[sol.id] = sol; });
            // 
            //Add this user product
            dest[uprod.id] = { id: uprod.id, title: uprod.title, solutions: sols };
        });
        // 
        //Return the expanded products 
        return dest;
    };
    // 
    school.prototype.test = function () {
        this.exec("database", ["dvfh"], "get_sql_data", ["bdjfb"]);
    };
    //
    //Simplifies the windows equivalent fetch method with the following 
    //behaviour.
    //If the fetch was successful, we return the result; otherwise the fetch 
    //fails with an exception.
    //partcular static methods are specifed static:true....
    //It returns the same as result as the method  in php 
    //     async exec<
    //     // 
    //     //The php claasses are organised as a library interface, e.g.,
    //     //  interface library{
    //     //      database:Idatabase,
    //     //      editor:Ieditor,...}
    //     classes extends library.sch_library,
    //     //
    //     //...the class name as the key of the classes. It must be a tring inorder to 
    //     //comply with the formdata.append parameters i.e., string|blob, e.g., 
    //     //database, editor etc.
    //     static_class_name extends Extract<keyof classes, string>,
    //     // 
    //     //Get the static form of the class e.g., Idatabse, ieditor
    //     static_class extends classes[static_class_name],
    //     // 
    //     //Get the method name
    //     static_method_name extends keyof static_class,
    //     // 
    //     //Get the static method
    //     static_method extends static_class[static_method_name],
    //     // 
    //     //Get the constructor 
    //     $constructor extends Extract<static_method, new (...args:any)=>any>,
    //     // 
    //     //... the constructor parameters without using the predefined construction parameter.
    //     //cargs extends $class extends new (...args: infer c) => any ? c : never,
    //     //Because the following  bit failed to work.
    //     cargs extends ConstructorParameters<$constructor>,
    //     //
    //     //...The  instance type of the constructor directly without using the predefined construction
    //     //instance extends $class extends new (...args: any) => infer r ? r : never,
    //     instance extends InstanceType<$constructor>,
    //     // 
    //     //...The object method name.
    //     method_name extends keyof instance,
    //     // 
    //     //...The object method
    //     method extends instance[method_name],
    //     //extends { (...args: any): any } ? instance[method_name] : never,
    //     // 
    //     //....the method arguments 
    //     //margs extends method extends (...args: infer p)=> any ? p[] : never,
    //     margs extends Parameters<method>,
    //     // 
    //     //...The return type 
    //     $return extends ReturnType<method>,
    // >(
    //     //
    //     //The class of the php class to execute.
    //     class_name: static_class_name,
    //     //
    //     c_args: cargs,
    //     //
    //     m_name: method_name,
    //     //
    //     m_args: margs
    //     ): Promise<$return>
    //     { await super.exec(class_name, c_args, m_name, m_args) }
    // 
    //Add a home pannel before this pannels are painted 
    school.prototype.show_panels = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // 
                        // 
                        this.panels.set("theme", new sql_js_1.default("select * from result", this, "#content", this.dbname));
                        return [4 /*yield*/, _super.prototype.show_panels.call(this)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return school;
}(app_js_1.app));
exports.default = school;
//
//Start the application after fully loading the current 
//window.
window.onload = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                // 
                //This proccess will soon be evocked at the market place but for 
                //the school id  will be kaps
                app_js_1.app.current = new school();
                return [4 /*yield*/, app_js_1.app.current.initialize()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
