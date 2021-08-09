//
//This class is designed to customise the operating 
//environmennt for the various applications e.g the 
//running versions, file directories, passwords, e.t.c 
//i.e the environmental settings that change frequently
// based on the application.  
export default class outlook_config {
    constructor() {
        // 
        //This is the general template for displaying the user report 
        this.report = "/outlook/v/code/report.html";
        //
        //This is the complete path for the login template
        this.login = "/outlook/v/code/login.html";
        //
        //The complete path of the welcome template 
        this.welcome = "/outlook/v/code/welcome.html";
        //
        //The database for managing users and application that are 
        //running on this server 
        this.login_db = "mutall_users";
        //The crud's template
        this.crud = "/outlook/v/code/crud.html";
        //
        //Subject
        this.subject = ['student', 'general_school'];
        //
        //The id of this application; if not given, we use this 
        //constructors name
        this.id = "school";
        //
        //The window application's url; if  not provided, we use that of
        //the current window
        this.url = "";
        //
        //Image associated with this app 
        this.image = "";
        //
        //The full trademark name of the application
        this.trade = "School Systems for exams and accounting";
        //
        //For advertising purposes
        this.tagname = "";
        // 
        //Overide the application database.
        this.app_db = "general_school";
        // 
        //This is the general template for collecting simple user data.
        this.general = "/outlook/v/code/general.html";
        // 
        //The maximum number of records that can be retrieved from 
        //the server using one single fetch. Its value is used to modify 
        //the editor sql by  adding a limit clause 
        this.limit = 40;
    }
}
