<?php
include "chama.php";
$chamas = new chamas();
$group_id = $_GET['group'];
$member_id = $_GET['member'];
$group = $chamas->groups;
$group_name = $group[$group_id]->name;
//Get the members in the respective group.
$members = $group[$group_id]->members;
//Get the member username;
$username = $members[$member_id]->username;
//Get the member picture.
$pic = $members[$member_id]->picture;
//
?>
<html>
    <head>
        <title>Member Profile</title>
        <link rel="stylesheet" href="services.css">
    </head>
    <body class="body">
        
        <div class="head">
            <?php echo "<img src='img/$group_name/$pic'><div>$username</div>";?>
        </div>
        <div class="name" align="center">Profile</div>
        <div class="left_pan">
            <p align="center">Resume</p>
            <div class="resume">
               <?php
             
                $members[$member_id]->show_resume();
                ?> 
            </div>
            <button onclick="member.update_resume(<?php echo $member_id; ?>)">Update resume</button>
        </div> 
        <div class="service_pan">
            <p align="center">Services</p> 
            <button>Add Member</button>
            <button>See Scheduled Events</button>
            <button>Send Message</button>
            <button>Contribute</button>
            <button>View Contributions</button>
         
        </div>
        <div class="right_panel"></div>
        <div class="bottom"></div>
        
    </body>
</html>
