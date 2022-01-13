<?Php
//
//Include the file that has the connection to the database.
include $_SERVER['DOCUMENT_ROOT'] . "/chama/v/chama.php";
//
//create an instance of class chamas.
$chama = new chamas();
//Get the values parsed in the query string.
//i.e the group id and the member id.
//With the group id you can get a single group and member id a specific member in
//that group.
$group_id = $_GET['group'];
//
$member_id = $_GET['member'];
//
//Get the groups in the database.
$group = $chama->groups;
//
//Get the group name.
$name = $group[$group_id]->name;
echo "$name";
//Get the members in the respective group.
$members = $group[$group_id]->members;
// 
//$allmembers = $group[$group_id]->show_members();
//Get the member username.
$username = $members[$member_id]->username;
//
//Get the member picture.
$pic = $members[$member_id]->picture;
//
include $_SERVER['DOCUMENT_ROOT'] . './metavisuo/sql_library.php';
//
$show_members = new sql\editor('member', 'mutalco_chamas');
//
$show_contributions = new sql\editor('journal','mutalco_chamas');
//
$show_events = new sql\editor('event','mutalco_chamas');
//
$show_messages = new sql\editor('message','mutalco_chamas');
?>
<html>
    <head>
        <title>Chairman Services</title>
        <link href="Stylesheets/services.css" rel="stylesheet"> 
        <script src="metavisuo/library.js"></script> 
        <script src="/Services_ui/classes.js"></script>
        <script src="/Services_ui/services.js"></script>
        <script src="/chama/v/javascript_files/chama.js"></script>
        <script src="/chama/v/javascript_files/dbconfig.js"></script>
        <script src="/chama/v/javascript_files/tabs.js"></script>
    </head>
    <body class="body">
        <div class="head">
            <?php echo "<img src='img/$name/$pic'><div>$username</div>"; ?>
        </div>
        <div class="name" align="center">Chairman Services</div>
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
            <p class="service_name" align="center">Services</p> 
        </div>
        <div class="show">
            <button itemid="sect1">Members</button>
            <button itemid="sect2">Events</button>
            <button itemid="sect3">Messages</button>
            <button itemid="sect4">Contributions</button>
        </div>
        <div class="dbview">
            <section id="sect1" class="active">
                <div class="review">
                    <div id='members'>
                        All Members
                        <?php $show_members->show('mutalco_chamas')?>
                    </div> 
                </div>
                <div class="review_pane">
                    <button>add Member</button>
                    <button>update member info</button>
                    <button>delete Member</button> 
                </div>
            </section>
              <section id="sect2" class="">
                <div class="review">
                    <div id='events'>
                       All Events
                       <?php $show_events->show('mutalco_chamas')?>
                    </div> 
                </div>
                <div class="review_pane">
                    <button>add Event</button>
                    <button>update Event</button>
                    <button>delete EVent</button>
                </div>
            </section>
            <section id="sect3" class="">
                <div class="review">
                    <div id='messages'>
                     All Messages
                     <?php $show_messages->show('mutalco_chamas')?>
                    </div> 
                </div>
                <div class="review_pane">
                    <button>Send Message</button>
                    <button>Delete Message</button> 
                </div>
            </section>
            <section id="sect4" class="">
                <div class="review">
                    <div id='contributions'>
                     All Contributions
                     <?php $show_contributions->show('mutalco_chamas')?>
                    </div> 
                </div>
                <div class="review_pane">
                    <button>add Contribution</button>
                    <button>update Contribution</button> 
                </div>    
            </section>
        </div>
      
        <div class="right_panel">

        </div>
        <div class="bottom">

        </div>
    </body>
</html>
