//
//This models the score as a baby inorder to incorporate the customization 
//of the display 
import * as outlook from "../../../outlook/v/code/outlook.js";
import tabulator from "./sql.js";
import * as app from "../../../outlook/v/code/app.js";
import school from "./school.js";
import { theme } from "./theme.js";
import * as crud from "./crud.js";
/**
 * helps to keep track of all the visited exams,subject,year, stream and grade 
 * for easier monitaring and saving
 */
class visit{
  public exams: Set<string> = new Set();
  public subjects: Set<string> = new Set()
  public year: Set<string> = new Set()
  public stream: Set<string> = new Set()
  public grades: Set<string> = new Set()
  constructor() { }
}
class visited{
  public create: visit = new visit()
  constructor(){ }
}
//
//This is a baby page that is not used for collecting data 
export default class exam extends crud.page{
  //
  //The input selector for the stream of the class being studies
  public stream_selector?: HTMLInputElement;
  // 
  //Get the 
  get stream(): string{
    return this.stream_selector!.value;
  }
  // 
  //set the stream of the exam under study
  set stream(name: string) {
    this.stream_selector!.value=name;
  }
  //
  //The input selector that specifies the grade of the class in study.
  public grade_selector?: HTMLInputElement;
  // 
  //Get the level of the class 
  get grade(): string{ return this.grade_selector!.value }
  // 
  //set the name of the exam 
  set grade(name: string) { this.grade_selector!.value = name;}
  //
  //The input selector that specifies the subject.
  public subject_selector?: HTMLInputElement;
  // 
  //Get the subject 
  get subject(): string{ return this.subject_selector!.value }
  // 
  //set the subject 
  set subject(name: string) {
    this.subject_selector!.value=name;
  }
  // 
  //
  //The input selector that specifies the name of the exam
  public exam_selector?: HTMLInputElement;
  // 
  //Get the name of the exam 
  get exam(): string{return this.exam_selector!.value}
  // 
  //set the name of the exam 
  set exam(name: string) { this.exam_selector!.value = name; }
  //
  //Keep track of the visited options for easier monitaring
  public visited: visited = new visited();
  //
  //The input selector that specifies the name of the exam
  public year_selector?: HTMLInputElement;
  // 
  //Get the name of the exam 
  get year(): string{return this.year_selector!.value}
  // 
  //set the name of the exam 
  set year(name: string) {this.year_selector!.value = name;}
  // 
  //The theme derived from an sql
  public theme ?: tabulator;
  // 
  //To create this view we include the mother  window and the score 
  //product to be manipulated.
  constructor(
    // 
    //The mother of this baby 
    public mother: outlook.view,
    //
    //The product under unvestigation 
    public product: outlook.assets.product,
    // 
    //The action to be done in the score page 
    public action?: "create" | "edit" | "print"|"analyse"
  ) {
    // 
    super(mother, "score.html")
    this.set_panels();
  }
  async administer(): Promise<void>{
    // 
    //Start with the parent administer routin
    await super.administer();
  }

  // 
  //Sets the panels that are required for this view the panel include the 
  //welcome panel and the the modified sql theme panel 
  private set_panels() {
    // 
    //Create the service
    const product = school.current.products.get("manage_exams")!;
    const Products = new app.products({"manage_exams":product });
    // 
    //Create the service pannel
    const service = new app.services(this, Products)
    this.panels.set("service", service);
  }
  // 
  //Set the relevant sql for this page based on the sql. 
  async take_action() {
    // 
    //Initialize the sql created based on the action taken by this page 
    let sql: string = '';
    // 
    //Paint the theme section with an sql that retrieves all the students of a particilar 
    //stream in a particular with a 0 mark giving room for data entry
    switch (this.action) {
      // 
      //Create 
      case "create":
        if (this.check()) {
          const test=await this.create()
          // 
          if(test === null) return
          sql = <string>test;
        }
        break;
      // 
      //produce a work sheet for the students with marks for a particular subject in a 
      //particular stream to the staff to edit
      case "edit":
        if (this.check())
          sql = await school.current.exec("school",[school.current.id],"get_subject_scores",[this.subject,this.stream,this.exam,this.grade])

        break
      default:
        sql = "select * from student";
    }
    // 
    //Set the theme panels
    //
    //Set the theme panel so that it will be shown when this page is 
    //administered.
    //To create a tabulator theme we need the sql the mother and the css of the elements 
    //Where this theme will place its records
    const Theme = new tabulator(sql, this, "#content","general_school");
    this.panels.set("theme", Theme);
    Theme.paint();
    this.theme = Theme;
  }
  // 
  //Users are not allowed to change the grade,subject, stream,exam before they save their data 
  create_condition(): boolean{
    if (
      this.visited.create.exams.has(this.exam)
      || this.visited.create.grades.has(this.grade)
      || this.visited.create.stream.has(this.stream)
      || this.visited.create.year.has(this.year)
      || this.visited.create.subjects.has(this.subject)
    ) return false
    // 
    //Set the current options
    this.visited.create.exams.add(this.exam)
    this.visited.create.grades.add(this.grade)
    this.visited.create.stream.add(this.stream)
    this.visited.create.year.add(this.year)
    this.visited.create.subjects.add(this.subject)
     // 
    //Return a false if no data 
    return true
  }

  // 
  //Creates a new worksheet of a particular subject where the teacher/staff is allowed to
  //enter the scores.
  //This function returns the sql that retrieves the students of the selected class with
  //an empty section where they can fill in the marks
  async create(): Promise<string|null>{
    // 
    //Keep track of the already visited subjects 
    if (this.create_condition()) {
      const sql= await school.current.exec("school", ["kaps"], "get_student", [this.stream, this.grade, this.year]);
    return sql;
    }
   
    alert("save your data before doing any changes")
    return null
  }
  // 
  //
  async get_result() { }
  // 
  //Returns true if all the parameters needed to create a theme panel are set 
  check(): boolean {
    // 
    //To get the subjects we need the stream, grade, year 
    if (this.stream_selector!.value === undefined || this.stream_selector!.value === "") { alert("Please select a stream"); return false}
    if (this.grade_selector!.value === undefined || this.grade_selector!.value === "") { alert("Please select a class"); return false}
    if (this.subject_selector!.value === undefined || this.subject_selector!.value === "") { alert("Please select a subjects"); return false }
    if (this.year_selector!.value === undefined || this.year_selector!.value === "") { alert("Please select a year"); return false }
    return true;
  }
  // 
  //Overide the default way of showing a panel to only show the service pannel untill
  //the user selects the parameters needed for the theme pannel
  public async show_panels(): Promise<void>{
      //
      //Paint the panels on top of the template, if they are  set
      if (this.panels!==undefined)
       //
       //The for loop is used so that the panels can throw 
       //exception and stop when this happens  
        for (const panel of this.panels.values()) {
              // 
              //do not paint the theme pane 
          if (panel instanceof tabulator) continue;
               await panel.paint();
      }
    // 
    //Create the input selector for the name, stream, grade and subject.
    this.exam_selector = <HTMLInputElement>this.get_element("exam");
    this.grade_selector =  <HTMLInputElement>this.get_element("grade");
    // 
    //Initialize the subject and popilate it with the available subjects
    this.subject_selector =  <HTMLInputElement>this.get_element("subject");
    // 
    //Initialize the stream selector and populate it with the relevant stream
    this.stream_selector = <HTMLInputElement>this.get_element("stream");
    this.year_selector = <HTMLInputElement>this.get_element("year");

  }
}
// 
//models a single score and the various parameters required to make a score valid 
class score extends theme {
  // 
  //
}

