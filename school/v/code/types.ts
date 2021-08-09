//
//
type result_header={
    // 
    // 
    seq:number|code,
    members:number
}
//
type result_body={
    horizontals:Array<horizontal>,
    subjects:Array<subject>/**/,
    overall:number/**/
}
// 
//
type horizontal={
    ename:string,
    fields:Array<{cname:string,value:basic_value}>
}    
// 
//
type subject = {
    name:string,
    children:Array<child_subject>,
    total:percent
}
    
type child_subject ={
    name:string, 
    mark:number,  
    out_of:number
}