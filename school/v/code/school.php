<?php
/*
 * This files models the server side of the school system 
 * which extends the outlook app and hence extending the 
 * schema database*/
//
//Resolve the app from the outlook
include_once '../../../outlook/v/code/app.php';
include_once '../../../library/v/code/schema.php';
// 
//To create a school 
class school extends database{
    // 
    //This is the app id that strictly identifies the school in 
    //the general school database 
    private string $id;
    // 
    //To create a school we need a school id 
    function __construct(string $id){
        // 
        //The school system makes use of the school model.
        parent::__construct("general_school");
        // 
        //Initialize the school id 
        $this->id= $id;
        
    }
    // 
    //
    // 
    //Returns all the scores of a particular subject in a particular
    //stream for a paticular grade.
    function get_subject_scores(
        string $subject,
        string $stream,
        string $exam, 
        string $grade
    ): string{
       return "select " 
                ." student.name as name ,"
                ." score.value as score "
        ." from score "
            ." inner join allocation on score.allocation=allocation.allocation"
            ." inner join teacher on teacher.teacher= allocation.teacher"
            ." inner join subject on teacher.subject=subject.subject"
            ." inner join student on score.student= student.student"
            ." inner join progress on progress.student= student.student"     
            ." inner join stage on progress.stage= stage.stage"
            ." inner join stream on stage.stream= stream.stream"
            ." inner join grade on stream.grade=grade.grade"
            ." inner join school on school.school=grade.school"
            ." inner join term on score.term= term.term"
        ." where subject.name='$subject'"
        ." AND school.id='{$this->id}'"
        ." AND term.name= '$exam'"
        ." AND stream.name='$stream'"
        ." AND grade.name= '$grade'";
    }
  
    // 
    //Get the marks of all the students from all the subjects
    function stream_results(){
        // 
        //Get all the subjects that this student is taught 
        $subjects= $this->get_student($stream, $grade, $year);
        //
        $sql= "select  student.name as name";
        // 
        //Appends every subjects name
        foreach ($subjects as $value) {
          //
          $sql."{$value}.score as $value"; 
        }
        
    }
    function get_column_metadata(string $sql):array{
        // 
        //initialize the array promised to be returned 
        $metadata=[];
        // 
        //Get the pdo statement 
        $stmt =$this->pdo->query($sql);
        // 
        //Get the length of this metadata array which is 
        $count = $stmt->columnCount();
        // 
        //loop through count times populating the array
        for ($index = 0; $index<$count; $index++) {
           $metadata[]=$stmt->getColumnMeta($index); 
        }
        //
        //Return the metadata 
        return $metadata;  
    }

}
