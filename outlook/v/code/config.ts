//
//This class is designed to customise the operating 
//environmennt for the various applications e.g the 
//running versions, file directories, passwords, e.t.c 
//i.e the environmental settings that change frequently
// based on the application.  
 export default class outlook_config {
    // 
    //This is the general template for displaying the user report 
    public report = "/outlook/v/code/report.html";
    //
    //This is the complete path for the login template
    public login= "/outlook/v/code/login.html";
    //
    //The complete path of the welcome template 
    public welcome= "/outlook/v/code/welcome.html";
    //
    //The database for managing users and application that are 
    //running on this server 
    public login_db = "mutall_users";
        
    //The crud's template
    public crud = "/outlook/v/code/crud.html";
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
    //This is the general template for collecting simple user data.
    public general = "/outlook/v/code/general.html";
    // 
    //The maximum number of records that can be retrieved from 
    //the server using one single fetch. Its value is used to modify 
    //the editor sql by  adding a limit clause 
    public limit: number = 40; 
    constructor(){}
}
