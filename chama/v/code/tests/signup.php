
<html>
    <head>
        <title>Create Account</title>
        <link rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
        <link rel="stylesheet" href="Stylesheets/signup.css">
        <script src="signup.js"></script>
    </head>
    <body>
        <div class="contain">
            <div class="head">
                  <h2>Create Account</h2>
            </div>
            <form class="form" id="form">
                <div class="form_control">
<!--                    <i class="fa fa-envelope-o" aria-hidden="true"></i>-->
                    <label>Username</label>
                    <input type="text" placeholder="username" id="username" onblur="checkinputs() inputstate()">
                    <i class="fa fa-check-circle" aria-hidden="true"></i>
                    <i class="fa fa-exclamation-circle"></i>
                    <small class="small">Error Messsage</small>
                </div>
                <div class="form_control">
                    <label>Email</label>
                    <input type="email" placeholder="email" id="email">
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
                <div class="form_control">
                    <label>Retype Password</label>
                    <input type="password" placeholder="retype password" id="repassword">
                    <i class="fa fa-check-circle" aria-hidden="true"></i>
                    <i class="fa fa-exclamation-circle"></i>
                    <small class="small">Error Messsage</small>
                </div>
                <button class="btn" onclick="checkinputs(); return false;">SignUp</button>
            </form>
        </div>
    </body>
</html>
