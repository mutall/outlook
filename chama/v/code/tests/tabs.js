//Run a function that displays a tab and selects all buttons after 
//the webpage has completely loaded.
window.onload = function (){
    //declare a variable that stores all the buttons in the tab.    
    var btn = document.querySelectorAll("button");
    //
    //Loop through the buttons and foreach, run a function that 
    //gets the itemid.
    btn.forEach(function (button){
        //
        //For every button get attribute itemid. 
        if (button.hasAttribute('itemid')){
            //
            //declare a variable that stores the itemid.
            let target = button.getAttribute('itemid');
            //
            //Run an onclick function that switches between active 
            //sections in the page once a button is clicked.
            button.onclick = function (){
                //Get and remove the active section. 
                document.querySelector('.active').classList.remove('active');
                //
                //Using each button`s itemid attribute, set the respective
                //section active. 
                document.querySelector(`#${target}`).classList.add('active');
                
            };
        }
    });
};


