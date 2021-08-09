//create functions to signup, login and logout users.
//
var user = 'something';
function signup() {
    //
    var email = document.getElementById("emailtxt").value;
    var password = document.getElementById("passtxt").value;
    //
    firebase.auth().createUserWithEmailAndPassword(email, password).catch(function (error) {
        // Handle any Errors..
        var errorMessage = error.message;
        // ...
        window.alert(errorMessage);
    });
}
function login() {
    //
    
    var username = document.getElementById("emailtxt").value;
    var password = document.getElementById("passtxt").value;
    //
    firebase.auth().signInWithEmailAndPassword(username, password).catch(function (error) {
        var errorMessage = error.message;
        // ...
        window.alert(errorMessage);
    });
    isloggedin();
}
//
//if not signedin, current user is null...check the User`s AuthState.
//create a promise that checks the login state
const userAuthState = new Promise(function (resolve, reject) {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            //user is signed in.
            var response = "user is signed in";
            resolve(response);
            console.log(user.email, user.password);
        } else {
            //User isn`t signed in
            var error_response = new Error("User isn`t signed in");
            reject(error_response);
        }
    });
});
//
//use the promise
const isloggedin = function () {
    userAuthState
            .then(function (success) {
                window.location.replace("http://localhost/chama/v/home.php");
                console.log(success);
            })
            .catch(function (error) {
                console.log(error.message);
            });
};
//
//
function logout() {
    firebase.auth().signOut();
    window.location.replace("http://localhost/chama/v/authentication.php");

}






