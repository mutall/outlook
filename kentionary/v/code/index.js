//
//Greetings function.
function display_greetings() {
    //
    //Date
    var today = new Date();
    //
    //Extract the current hour from the date.
    var hourNow = today.getHours();
    //
    //Store the greeting here.
    var greeting;
    //
    //Condition.
    if (hourNow > 15) {
      //
      //Evening.
      greeting = "Good Evening";
    } else if (hourNow > 12) {
      //Afternoon.
      greeting = "Good Afternoon";
    } else if (hourNow > 0) {
      //
      //Morning.
      greeting = "Good Morning";
    } else {
      greeting = "Welcome";
    }
    return greeting;
}
//
var i = 0;
//
//This is the function that returns a greeting. We have it here to pass it to the function
//that sets the speed at which the greeting is displayed.
var txt = display_greetings();
//
//The speed at which to display the greeting message.
var speed = 250;
//
//This function gets the greeting message and sets the speed at which the message is displayed.
function typeWriter() {
    //
    //Get the length of the greeting message.
    if (i < txt.length) {
      //
      //Display the greeting message.
      document.getElementById("greetings").innerHTML += txt.charAt(i);
      i++;
      //
      //Set the speed at which the greeting is displayed.
      setTimeout(typeWriter, speed);
    }
}