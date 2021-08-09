
import { database, editor, record,library } from "../../../library/v/code/library.js"
// 
//Defines all the metadata that can be retrieved from a column used in an sql 
interface column_meta{
    // 
    //The PHP native type used to represent the column value.
    native_type: string,
    //
    //The SQL type used to represent the column value in the database. 
    //If the column in the result set is the result of a function, 
    //this value is not returned by PDOStatement:: getColumnMeta()
    driver?: decl_type,
    // 
    //Any flags set for this column.
    flags: Array<string>,
    // 
    //The name of this column as returned by the database.
    name: string,
    //
    //The name of this column's table as returned by the database.
    table: string,
    // 
    //The length of this column. Normally -1 for types other than floating point decimals.
    len: number,
    //
    //The numeric precision of this column. Normally 0 for types other than floating point
    // decimals.
    precision: number
}
// 
//The school extension of the library interface 
export interface sch_library extends library{
    school:Ischool
}
//
//The school interface that holds the constructor and all the static 
//methods. 
 interface Ischool {
     // 
    //To create a school we need a school id 
    constructor:new(id:string)=>school
}
// 
//The school interface with all the object  methods 
interface school{
    // 
     //returns an sql that retrieves all the students of a particular class in a
    //certain year
    get_student(
        stream:string, 
        grade:string,
        year:string
     ):Array<istudent>;
    // 
    //Returns all the scores of a particular subject in a particular
    //stream for a paticular grade.
    get_subject_scores(
        subject:string,
        stream:string,
        exam:string, 
        grade:string
    ):string;
    // 
    //Returns all the subjects taught to a particular stream
     get_subjects(
        stream:string,
        grade:string,
        year:string
     ): string
     // 
     //returns all the metadata of a column involved in a particular sql 
     get_column_metadata(sql: string): Array<column_meta>
     // 
     hello(): string;
}
//
//The additional information required to paint the fuel information
export type metadata=column_meta/**include udf and the test metadata */