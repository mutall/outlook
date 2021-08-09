<?php 
//class config{
//    const host = "localhost";
//    const username = "root";
//    const password = "";
//    const dbname = "chama_testdb";
//} 
?>
<script>
    var formdisplay = document.getElementById('showform');
    var fom = document.getElementById('form');
    fom.addEventListener('submit', function (e) {
        e.preventDefault();
    });
    formdisplay.addEventListener('submit', function (e) {
        e.preventDefault();
    });
    class section2 extends Section {
        constructor() {
            super();
        }
        loadElements(section) {
            section.style.display = "block";
            this.button1 = section.querySelector("#gmail_sign");
            this.span_element = section.querySelector("#close");
            this.button2 = section.querySelector("#modalbtn");
            this.input1 = section.querySelector("#username");
            this.input2 = section.querySelector("#email");
            this.input3 = section.querySelector("#password");
        }
        addListeners(section) {
            this.button1.addEventListener("click", () => {
                Firebase.gmail_signin();
            });
            this.button2.addEventListener("click", () => {
                var username = this.input1.value;
                var mail = this.input2.value;
                var pass = this.input3.value;
                try {
                    Firebase.custom_user(username, mail, pass);
                } catch (err) {
                    alert(err.message);
                }
                section.style.display = "none";
            });
            this.span_element.addEventListener("click", () => {
                section.style.display = "none";
            });
        }
    }
</script>
<!--0-->
<!--Create a Modal for collecting user details-->
<div class="modal" id="section2">
    <div class="modal-content">
        <span class="click" aria-hidden="true" id="close">&times;</span>
        <h2>Create Account</h2>
        <button class="signbtn" id="gmail_sign">SignUp with Gmail</button>
        <button class="fbsign">SignUp with facebook</button>
        <form class="form" id="form">
            <div class="form_control">
                <label>Username</label>
                <i class="fa fa-envelope-o" aria-hidden="true"></i>
                <input type="text" placeholder="username" id="username" onblur="checkinputs()">
                <i class="fa fa-check-circle" aria-hidden="true"></i>
                <i class="fa fa-exclamation-circle"></i>
                <small class="small">Error Messsage</small>
            </div>
            <div class="form_control">
                <label>Email</label>
                <i class="fa fa-envelope-o" aria-hidden="true"></i>
                <input type="email" placeholder="email" id="email" onblur="checkinputs()">
                <i class="fa fa-check-circle" aria-hidden="true"></i>
                <i class="fa fa-exclamation-circle"></i>
                <small class="small">Error Messsage</small>
            </div>
            <div class="form_control">
                <label>Password</label>
                <input type="password" placeholder="password" id="password">
                <i class="fa fa-check-circle" aria-hidden="true"></i>
                <i class="fa fa-exclamation-circle"></i>
                <small class="small">Error Messsage</small>
            </div>
        </form>
        <button class="btn" id="modalbtn">Ok</button>
    </div>
</div>