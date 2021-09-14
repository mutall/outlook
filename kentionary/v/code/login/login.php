<?php
//
//Kick off the session storage.
session_start();
//
if(isset($_SESSION['Email'])){
    header('location:http://127.0.0.1/new_word/index.php');
}
?>
<!DOCTYPE html>
<html>
    <head>
        <title>
            Login
        </title>
        
        <link rel="stylesheet" href="index.css">
        <!--
        Bootstrap-->
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.1/dist/css/bootstrap.min.css" 
              rel="stylesheet" integrity="sha384-F3w7mX95PdgyTmZZMECAngseQB83DfGTowi0iMjiWaeVhAn4FJkqJByhZMI3AhiU" crossorigin="anonymous">
    </head>
    <body>
        <div class="container">
            <div class="login-box">
                <div class="row">
                    <!--
                    Login -->
                    <div class="col-md-6 login-left">
                        <h2>Login here</h2>
                        <form action="validation.php" method="post">
                            <div class="form-group">
                                <label>
                                    Username
                                </label>
                                <input type="text" name="email" class="form-control" required/>
                            </div>
                            <div class="form-group">
                                <label>
                                    Password
                                </label>
                                <input type="password" name="pwd" class="form-control" required/>
                            </div>
                            <button type="submit" class="btn btn-primary">Login</button>
                        </form>
                    </div>      

                    <!--
                    Register -->
                    <div class="col-md-6 login-right">
                        <h2>Register here</h2>
                        <form action="register.php" method="post">
                            <div class="form-group">
                                <label>
                                    Email
                                </label>
                                <input type="email" name="email" class="form-control" required/>
                            </div>
                            <div class="form-group">
                                <label>
                                    Password
                                </label>
                                <input type="password" name="pwd" class="form-control" required/>
                            </div>
                            <button type="submit" class="btn btn-primary">Register</button>
                        </form>
                    </div>      
                </div>
            </div>
        </div>
    </body>
</html>