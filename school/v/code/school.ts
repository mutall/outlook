//
//Import app from the outlook library.
import { assets } from '../../../outlook/v/code/outlook.js';
import {app} from "./app.js"
import config from './config.js';
import score from "./score.js";
import * as library from "./library.js"
import * as schema from "../../../library/v/code/schema.js"
import home from "./home.js";
import tabulator from './sql.js';
// 
// 
type uproducts = Array<{id:string,title:string,solution:Array<assets.solution>}>
//
//The school model that link teacher, pupils and parents
export default class school extends app{
    // 
    //The global school property to attach the 
    static current: school;
    //
    //Initialize the school
    constructor(){
        super(
            //
            //Overide the config  
            new config()
        );
    }
    // 
    //Allow users to take various actions on the score sheet. i.e enter a score, edit a score , 
    //view student score.
    async score(action:"create"|"edit"|"print"|"analyse"):Promise<void>{
        // const baby = new score(this, this.products.get("manage_exams")!, action);
        // school.Score = baby;
        // baby.administer()
        alert(await this.exec("school", ["kaps"], "hello", []));
    }
    // 
    //Converts the uproducts to the correct format of iproduct by expanding the already 
    //existing iproducts.
    activate_Iproducts(src: uproducts, dest: assets.products): assets.products{
        // 
        //Loop through the uproducts appending them to iproduct
        src.forEach(uprod => {
            //
            //Begin with an empty collection of the solutions
            const sols: assets.solutions = {};
            // 
            //Populate the solution.
            uprod.solution.forEach(sol => sols[sol.id] = sol);
            // 
            //Add this user product
            dest[uprod.id] = { id: uprod.id, title: uprod.title, solutions: sols }
        });
        // 
        //Return the expanded products 
        return dest;
    }
    // 
    test() {
        this.exec("database",["dvfh"],"get_sql_data",["bdjfb"])
    }
    
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
    async show_panels(): Promise<void>{
        // 
        // 
        this.panels.set("theme", new tabulator(
            "select * from result",
            this, "#content", this.dbname
        ));
        await super.show_panels();
    }

}
//
//Start the application after fully loading the current 
//window.
window.onload = async () => {
    // 
    //This proccess will soon be evocked at the market place but for 
    //the school id  will be kaps
    app.current= new school();
    await app.current.initialize();
}
