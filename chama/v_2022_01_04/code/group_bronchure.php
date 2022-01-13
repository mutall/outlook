<?php
include_once"./chama.php";
$chamas = new chamas();
//
//Let $group be the group that was selected
//
$group = $chamas->groups[$_GET['group']];
?>
<html>
    <head>
        <title>Group Website</title>
        <link rel="stylesheet" href="Stylesheets/group_bronchure.css">
   </head>
    <body class="bronchure">
        <div class="head">
            
        </div>
        <div class="left_panel">
            
        </div>
        <div class="details">
            
        </div>
        <div class="right_panel">
            
        </div>
        <div class="bottom">
            
        </div>
        
      <?php
      $group->show_bronchure();
      //$group->show_members();
      ?>
    </body>
</html>
