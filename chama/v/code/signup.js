//Create a Firebase class that will contain all firebase methods. 
class Firebase {
    //Once this class is instantiated,
    //Run the function that check the User`s Signin state.
    //i.e whether the user is SignedIn or not at any given time.
    constructor() {
        //on window load, get the three buttons,
        //i.e login signup and logout and display only the relevant,
        //in relation to user Authstate.
        document.addEventListener("DOMContentLoaded", () => {
         
            this.ptag = document.querySelector("#tag");
            
            this.register = document.querySelector("#register");

        });
        this.is_logged_in();

    }
    static custom_sign(email, password) {
        firebase.auth().signInWithEmailAndPassword(email, password)
                .then(onFulfill => {
                    //At this point you can get the success result from onFulfill. 
                })
                .catch(function (error) {
                    // catch error if any.
                    var errorMessage = error.message;
                    // alert the error if any.
                    alert(errorMessage);
                });
    }
    
    static custom_user(username, email, password) {
        firebase.auth().createUserWithEmailAndPassword(email, password)
                .then(onFulfill => {
                    //If user is scuccessfully created, you can get result from
                    //onFulfill.
                    //On account creation success, Login the user.
                    Firebase.custom_sign(email, password);
                    
                })
                .catch(function (error) {
                    //
                    // Handle Errors if any.
                    var errorMessage = error.message;
                    // ...
                    alert(errorMessage);
                });
    }
    static gmail_signin() {
        //Initialize firebase signin using gmail.
        //Declare the Google provider.
        var provider = new firebase.auth.GoogleAuthProvider();
        //
        //Create an instance that redirects you to Gmail and feed in the provider.
        firebase.auth().signInWithRedirect(provider);
        //
        //Once the redirect runs, Gmail will prompt the user for his/her email then 
        //process an access token that will be used to access the Google API.
        firebase.auth().getRedirectResult().then(function (result) {
            // Get the signed-in user info from the Redirect result.
            var user = result.user;
            
        }).catch(function (error) {
            // Handle Errors if any.
            // Incase the email input fed by the User is invalid, or was unsuccessful
            // an error message is generated.
            var errorMessage = error.message;
            // At this stage you can view the error message.
            alert(errorMessage);
        });

    }
    //If not signedin, current user is null...check the User`s AuthState.
    //Create a promise that checks the login state
    userAuthState() {
        //
        const this_ = this;
        //
        return new Promise(function (resolve, reject) {
            //
            //Firebase provides a function that checks User`s AuthStateChange.
            firebase.auth().onAuthStateChanged(function (user) {
                if (user) {
                    //user is signed in.
                    var response = 'user is signed in';
                    //Only display logout button at this point.
                    resolve(response);
                    try {
                        //
                        //Run this procedure after the user has logged in to chamas.
                        if (this_.after_login(user.email)) {
                            //
                            //Activate menus that acceses various services
                            this_.activate_menus(user.email);
                        } else {
                            //
                            alert('Sorry somethin went wrong; please try again');
                        }
                    } catch (e) {}
                } else {
                    //User isn`t signed in
                    var error_response = new Error("User isn`t signed in");
                    reject(error_response);
                }
            });
        });
    }
    //
    //Use the promise to determine signin state.
    is_logged_in() {
        this.userAuthState()
                .then(function (success) {
                    //If User is Signedin..do something here.
                    //console.log(success);
                })
                .catch(function (error) {
                    //Incase user isn`nt signedin..prompt user to Signin.                         
                });
    }
    static logout() {
        firebase.auth().signOut().then(function () {
            // Sign-out successful.
            //
        }).catch(function (error) {
            // An error happened.
           alert(error.message);
        });
    }
    
    
    //What happens after a user has logged in?
    after_login(email){
        //
        //Modelling our data as milk
        const milk = [];
        //
        //Define the email item.
        const item = ['mutallde_login', 'user', [], 'email', email];
        //
        //Put the emeil item to the milk container
        milk.push(item);
                //
        //Save the new milk
        sessionStorage['milk'] = JSON.stringify(milk);
        //
        //Save the current history length as the home length
        sessionStorage['home_length'] = history.length;
        //
        //After login in, verify whether the user is in our login
        //database or not. 
        //check_dbase();
        //If not, then, save the user to the database as a new member after
        //answering the following questions
        //
        //Asume user is not in our database. So, get the registration details
        //
        //location = "./login/register.php";
        //check_dbase(email);
        //
        //???????
        return true;
        
    }
    
    //Activate all service menus after a successful login 
    activate_menus(email){
        const logoutbtn = document.querySelector("#logout");
        const loginbtn = document.querySelector("#login");
        //
        //1. Welcome the user with his/her email
        this.ptag.innerHTML = "Welcome, "+email;
        //
        //2. Activate all the chama tags.
        //Get the links to individual groups and activate them.
        this.link = document.querySelectorAll(".disabled_link");
        //
        //
        
        this.link.forEach(function(link){
            link.classList.remove("disabled_link");
            link.classList.add("enabled_link");
        });
        
        //
        //3. Activate the registration button.
        this.register.style.display = "block";
        //
        //4.Activate the login/out/singup buttons
        //
        logoutbtn.style.display = "block";
        loginbtn.style.display = "none";
       
        
    }
    //static deactivate_menus(){
//        document.querySelector('#login').display = "block";
//        document.querySelector('#logout').display = "none";
//        document.querySelector("#tag").display = "none";
//        
//        
//    }
}
//Create a base section class that loads DOM elements onload.
class Section {
    constructor() {
        this.id = this.constructor.name;
        this.section = document.querySelector(`#${this.id}`);
        new Firebase();
        this.loadElements(this.section);
        this.addListeners(this.section);

    }
    loadElements() {}
    addListeners() {}
}
class section1 extends Section {
    constructor() {
        super();
    }
    loadElements(section) {
        this.button1 = section.querySelector("#login");
        this.button3 = section.querySelector("#logout");
    }
    addListeners() {
        this.button1.addEventListener("click", () => {
           new section3;
        });
      
        this.button3.addEventListener("click", () => {
            window.location.replace("http://localhost/chama/v/home.php");

            Firebase.logout();
        });
    }
}

class section3 extends Section {
    constructor() {
        super();
    }
    loadElements(section) {
        section.style.display = "block";
        this.btn1 = section.querySelector("#gmail_access");
        this.span = section.querySelector("#closed");
        this.btn2 = section.querySelector("#btn");
        this.input1 = section.querySelector("#emailtxt");
        this.input2 = section.querySelector("#passtxt");
    }
    addListeners(section) {
        this.span.addEventListener("click", () => {
            section.style.display = "none";
        });
        this.btn1.addEventListener("click", () => {
            Firebase.gmail_signin();
        });
        this.btn2.addEventListener("click", () => {
            var usermail = this.input1.value;
            var userpass = this.input2.value;
            try{
            Firebase.custom_sign(usermail, userpass);
            }catch(error){
                alert(error.message);
            }
            section.style.display = "none";
        });
    }
}


