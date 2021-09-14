<?php
//
//Kick off the session storage.
session_start();
//
//Ensure a user is logged in so that s/he can add a new translation.
if(!isset($_SESSION['Email'])){
    //
    //If not logged in, go to the login page.
    header('location:login.php');
}
?>

<!DOCTYPE html>
<html>
    <head>
        <!-- Global site tag (gtag.js) - Google Analytics -->
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-YE75DVP8WG"></script>
        <script>
            window.dataLayer = window.dataLayer || [];
            function gtag() {
                dataLayer.push(arguments);
            }
            gtag('js', new Date());

            gtag('config', 'G-YE75DVP8WG');
        </script>
        <title>Kentionary</title>
        <!-- Required meta tags -->
        <meta charset="utf-8" />
        <meta
            name="viewport"
            content="width=device-width, initial-scale=1, shrink-to-fit=no"
            />
        <!-- 
        Boxicons CDN Link -->
        <link href='https://unpkg.com/boxicons@2.0.7/css/boxicons.min.css' rel='stylesheet'>
        <!--
        Favicon -->
        <link rel="shortcut icon" href="favicon.ico" type="image/x-icon" />
        <!--
        CSS Bootstrap  -->
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/css/bootstrap.min.css" 
              rel="stylesheet" integrity="sha384-KyZXEAg3QhqLMpG8r+8fhAXLRk2vvoC2f3B09zVXn8CA5QIVfZOJ3BCsw2P0p/We" 
              crossorigin="anonymous">
        <!--
        Link to css file  -->
        <link rel="stylesheet" href="index.css" />
        <!--
        Theme css -->
        <link rel="stylesheet" href="dark-mode.css" />
        <!--
        Google icons. -->
        <link
            href="https://fonts.googleapis.com/icon?family=Material+Icons"
            rel="stylesheet"
            />
        <link
            href="https://fonts.googleapis.com/css2?family=Hanalei&family=Righteous&family=Knewave&family=Monoton&family=Oleo+Script&display=swap"
            rel="stylesheet"
            />
        <!--
        Google Adsense. -->
        <script
            data-ad-client="ca-pub-9375547553342229"
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
        ></script>
    </head>
    <body onload="select1(), select2()" id="background">
        <!--
        Main container. -->
        <div class="container"> 
            <!-- 
            Logout option. -->
            <a class="float-right" href="../login/logout.php">Logout</a>
            <!--
            Home page -->
            <a class="float-right" href="../index.php">Home</a>
            <!--
            Row 2 (Select language to translate)-->
            <div class="row justify-content-center mt-5 ">
                <h2><?php 
                        $user_email = $_SESSION['Email'];
                        $user = substr($user_email, 0, strpos($user_email, '@'));
                        echo "Welcome ".$user;
                    ?>
                </h2>
                <!--
                Card having the select option to choose a language to translate from. -->
                <div class="card text-center bg-light mb-3" style="max-width: 18rem">
                    <div class="card-header">
                        <div class="row justify-content-center h6">
                            <!--
                            Translate to this language  -->
                            Enter the english word to translate                                                     
                        </div>

                    </div>
                    <!--
                    Input field (translate from) -->
                    <div class="card-body">
                        <input
                            type="text"
                            id="input_code"
                            name="browser"
                            list="browsers"
                            placeholder="Enter text"
                            onkeyup="auto_suggest()"
                            required
                            />
                        <datalist id="browsers">
                        </datalist>
                    </div>
                </div>
            </div>

            <p id="demo"></p>

            <!--      
            Row 4 
            Translate from... -->
            <div class="row justify-content-center h6">
                Translate to:
            </div>

            <!--
            Row 5 (Select language to translate to) -->
            <div class="row justify-content-center">
                <!--
                Card having the select option to choose a language to translate to. -->
                <div class="card text-center bg-light mb-3" style="max-width: 18rem">
                    <div class="card-header">
                        <!--
                        Translate to this language  -->
                        <select id="select1" style="width: 80%; height: 5vh">
                        </select>
                    </div>
                    <div class="card-body">
                        <input
                            class="mt-2"
                            type="text"
                            id="input_new1"
                            placeholder="Enter translation"
                            style="height: 4vh"
                            />
                        <br><br>
                        <textarea
                            id="meaning"
                            cols="22"
                            rows="2"
                            placeholder="Enter translation meaning"
                            ></textarea>
                    </div>
                </div>
            </div>
            
            <!--      
            Row 6 
            Translate from... -->
            <div class="row justify-content-center h6">
                Translate to:
            </div>
            <!--
            Row 7 (Select language to translate to) -->
            <div class="row justify-content-center">
                <!--
                Card having the select option to choose a language to translate to. -->
                <div class="card text-center bg-light mb-3" style="max-width: 18rem">
                    <div class="card-header">
                        <!--
                        Translate to this language  -->
                        <select id="select2" style="width: 80%; height: 5vh">
                        </select>
                    </div>
                    <div class="card-body">
                        <input
                            class="mt-2"
                            type="text"
                            id="input_new2"
                            placeholder="Enter translation"
                            style="height: 4vh"
                            />
                        <br><br>
                        <textarea
                            id="meaning2"
                            cols="22"
                            rows="2"    
                            placeholder="Enter translation meaning"
                            ></textarea>
                    </div>
                </div>
            </div>
            <!--
            Row 8 (Translate button)-->
            <div class="row justify-content-center mt-3">
                <button type="button" id="translate" onclick="new_translation()">Add new translation</button>
            </div>
            <br>

            <!--
            Dark theme. -->
            <div class="custom-control custom-switch">
                <input type="checkbox" class="custom-control-input" id="darkSwitch" />
                <label class="custom-control-label" for="darkSwitch">
                    <i class="material-icons">brightness_4</i>
                </label>
            </div>
        </div>

        <!--
        Dark theme Js. -->
        <script src="dark-mode-switch.min.js"></script>
        <!-- Popper js for bootstrap
         Js delivery -->
        <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.3/dist/umd/popper.min.js" 
                integrity="sha384-eMNCOe7tC1doHpGoWe/6oMVemdAVTMs2xqW4mwXrXsW0L84Iytr2wi5v2QjrP/xp" 
        crossorigin="anonymous"></script>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/js/bootstrap.min.js" 
                integrity="sha384-cn7l7gDp0eyniUwwAZgrzD06kc/tftFf19TOAs2zVinnD/C7E91j9yyk5//jjpt/" 
        crossorigin="anonymous"></script>
        
        <!--
        Font awesome -->
        <script src="https://kit.fontawesome.com/5cb76f8bd2.js" crossorigin="anonymous"></script>
        
        
        <!-- 
        Select1 file -->
        <script src="select1.js"></script>
        
        <!-- 
        Select2 file -->
        <script src="select2.js"></script>
        
        <!-- 
        Auto-suggest file -->
        <script src="auto-suggest.js"></script>
        
        <!-- 
        New_translation file -->
        <script src="new_translation.js"></script>
    </body>
</html>