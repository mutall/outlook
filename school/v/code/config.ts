// 
//Resolve the outlook config so as to extend it. s 
import outlook_config from '../../../outlook/v/code/config.js'
// 
//Export the extended config local to the rentize.
export default class config extends outlook_config{
    constructor() { super(); }
    //
    //Subject
    public subject: [string, string] = ['student', 'general_school'];
    //
    //The id of this application; if not given, we use this 
    //constructors name
    public id: string = "school";
    //
    //The window application's url; if  not provided, we use that of
    //the current window
    public url:string= "";
    //
    //Image associated with this app 
    public image: string = "";
    //
    //The full trademark name of the application
    public trade: string = "School Systems for exams and accounting";
    //
    //For advertising purposes
    public tagname: string = "";
    // 
    //Overide the application database.
    public app_db = "general_school"; 
    // 
    //The maximum number of records that can be retrieved from 
    //the server using one single fetch. Its value is used to modify 
    //the editor sql by  adding a limit clause 
    public limit: number = 30;
}
