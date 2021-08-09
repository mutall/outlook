// 
//Resolve the outlook config so as to extend it. s 
import outlook_config from '../../../outlook/v/code/config.js'
// 
//Export the extended config local to the rentize.
export default class config extends outlook_config{
    constructor(){super();}
    // 
    //Overide the application database.
    public app_db = "mutall_chama";
    //Subject
    public subject: [string, string] = ['group', 'mutall_chama'];
    //
    //The id of this application; if not given, we use this 
    //constructors name
    public id: string = "chama";
    //
    //The window application's url; if  not provided, we use that of
    //the current window
    public url:string= "";
    //
    //Image associated with this app 
    public image: string = "";
    //
    //The full trademark name of the application
    public trade: string = "Merging all your Chama needs";
    //
    //For advertising purposes
    public tagname: string = "Chama Bora";
    // 
    //Overide the application database. 
    // 
    //This is the general template for collecting simple user data.
    public general = "/outlook/v/code/general.html";
    // 
    //The maximum number of records that can be retrieved from 
    //the server using one single fetch. Its value is used to modify 
    //the editor sql by  adding a limit clause 
    public limit: number = 40; 
    // 
    //The maximum number of records that can be retrieved from 
    //the server using one single fetch. Its value is used to modify 
    //the editor sql by  adding a limit clause 
}
