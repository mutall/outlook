<?php
//
//Kick off the session storage.
session_start();
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
        <!--
        Google fonts -->
        <link rel="preconnect" href="https://fonts.gstatic.com" />
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
    <body onload="typeWriter(), select1(), select2()" id="background">
        <!--
        Main container. -->
        <div class="container">

            <span id="greetings"></span>

            <br>

            <?php
            if (isset($_SESSION['Email'])) {
                //
                //
                $user_email = $_SESSION['Email'];
                $user = substr($user_email, 0, strpos($user_email, '@'));
                echo "Welcome " . $user . '<br>';
                echo '<button><a href="/login/logout.php">Logout</a></button>';
            } else {
                //
                //
                echo '<button><a href="/login/login.php">Login</a></button>';
            }
            ?>

            <!--      
            Row 1 
            Translate from... -->
            <div class="row justify-content-center h6">
                Translate from:
            </div>

            <!--
            Row 2 (Select language to translate)-->
            <div class="row justify-content-center">
                <!--
                Card having the select option to choose a language to translate from. -->
                <div class="card text-center bg-light mb-3" style="max-width: 18rem">
                    <div class="card-header">
                        <!--
                        Select tag (translate from) -->
                        <select
                            id="select_from"
                            style="width: 70%; height: 5vh"
                            >
                        </select>
                    </div>
                    <!--
                    Input field (translate from) -->
                    <div class="card-body">
                        <input
                            name="new_word"
                            type="text"
                            id="input"
                            name="browser"
                            list="browsers"
                            placeholder="Enter text"
                            onkeyup="auto_suggest()"
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
                        <select id="select_to" style="width: 80%; height: 5vh">
                        </select>
                    </div>
                    <div class="card-body">
                        <textarea
                            id="translation"
                            cols="22"
                            rows="3"
                            disabled
                            ></textarea>
                    </div>
                </div>
            </div>
            <!--
            Row 3 (Translate button)-->
            <div class="row justify-content-center">
                <input id="translate" onclick="translate_()" type="button" value="translate" />
                <button id="new_word" type="submit" value="submit">
                    <a href="login/login.php">Add translation</a>
                </button>
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
        Main js file -->
        <script src="index.js"></script>

        <!-- 
        Select1 file -->
        <script src="select1.js"></script>

        <!-- 
        Select2 file -->
        <script src="select2.js"></script>

        <!--
        Font awesome -->
        <script src="https://kit.fontawesome.com/5cb76f8bd2.js" crossorigin="anonymous"></script>

        <!-- 
        Translate file -->
        <script src="translate.js"></script>

        <!-- 
        Auto-suggest file -->
        <script src="auto-suggest.js"></script>

    </body>
</html>