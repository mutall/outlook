//
//Resolve the view which this class extends 
import * as outlook from "../../../outlook/v/code/outlook.js";
// 
//The defaault config settings of this page.
import config from "./config.js";
// 
//Home is one  of the panels for this page.
import home from "./home.js";
//
//This file is the deault home   that acts as the market place of this school system 
export default class market extends outlook.view{
  // 
  //The current open market
  static current: market;
  // 
  //The main pannel of this page where listeners of that pannel are found
  public home?: home
  // 
  //The input that allows used to search and choose a particular school
  public school_selector: HTMLInputElement;
  // 
  //The market place of the school 
  constructor() {
      super(
        //
        //Overide the config  
        new config()
    );
    // 
    //The id of this page is 
    this.id = "market";
    // 
    //Set the panels for this view
    this.set_pannels(); 
    //
    //Set the page document.
    this.win = <Window>window;
    // 
    //Set an event listener at the search input to
    this.school_selector = <HTMLInputElement>this.get_element("search_school");
    // 
    //add event listener to the input selector
    this.school_selector.onchange = (evt: Event) => this.home!.show_school(evt);
  }
  // 
  //Sets the pannels for now am interested in setting the home pannel
  set_pannels():void{
    //
    //Create the home pannel
    const Home = new home("#home", this, "general_school");
    // 
    //Set the home pannel;
    this.panels.set("home", Home);
  }
}
//
//Start the application after fully loading the current 
//window.
window.onload = async ()=>{
  market.current= new market();
  await market.current.show_panels();
}