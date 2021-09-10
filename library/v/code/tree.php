<?php
include_once 'schema.php';
//
abstract class node extends mutall {
    //
    //Short name of this node
    public $name;
    //
    //The full name of the parent 
    public $parent_name;
    //
    //The creation date.
    public $creation_date;
    //
    //The modification date.
    public $modification_date;
    //
    //
    public $size;
    //
    //
    public ?folder $parent;
    //
    //
    function __construct(
        //
        //This is the name of the node.
        string $name,
        //
        //This is the name of the parent node
        string $parent_name,
        //
        ?folder $parent
    ){
        //
        $this->parent= $parent;
        //
        //Get the name of this folder which is the last 
        $this->name= $name;
        //
        //Save the fullname 
        $this->parent_name = $parent_name;
        //
        //This is the creation date
        $this->creation_date = filectime($this->absolute_name());
        //
        //Get the date this folder was modified
        $this->modification_date= filemtime($this->absolute_name());
        //
        //Get the size of this folder 
        $this->size= filesize($this->absolute_name());
    }
    //
    //The full name is a path relative to the document root and it is a 
    //combination of the $name and the $parent_name.
    function full_name():string{
        //
        //Formulate the complete full path with no error checks
        $file=  "$this->parent_name\\$this->name";
        var_dump($this->parent_name);
        //
        return $file; 
    }
    //
    //The absolute path of a file is the canonical form of that file
    //name is the document root + the full name and it must exist
    function absolute_name():string{
        //
        $file= realpath($_SERVER["DOCUMENT_ROOT"])."\\".$this->full_name();
        //
        //Report an error if the file does not exist
        if(!file_exists($file))
            throw new Exception ("File/folder $file does not exist");
        return $file;
    }
    //Form a complete node structure using the initial path and return 
    //the node.
    static function export(
        //
        //The initial path is either a file or a folder depending on the 
        //target specification.The path may be relative or absolute.
        //e.g  absolute: /pictures/water/logo.jpeg.
        //     relative:  pictures/water/logo.jpeg.
        string $initial_path,
        string /*"file"|"folder"*/ $target
    ): node {
        //
        //1. Make the initial path absolute by canonicalizing it,i.e., expressing
        //it in the standard well known format.
        //e.g., the relative path 'pictures/water/logo.jpeg'
        //  becomes 
        //  'D:/mutall_projects/chama/pictures/water/logo.jpeg'
        $abs_path= realpath($initial_path);
        //
        //Check if the initial path does indeed exist.
        if ($abs_path === false){
            throw new Exception("This path '$initial_path' does not exist");
        }
        //
        //2.Separate the target file and the node path from the initial absolute 
        //path so that we have 2 components as follows:- 
        //'D:/mutall_projects/chama/pictures/water'
        //'logo.jpeg'
        //
        //2.1 Get the node path including the drive 
        $node_path_str= pathinfo($abs_path, PATHINFO_DIRNAME);
        //
        //2.2 The target path depends on the user specification; there may be 
        //none
        $target_file = $target==="file" 
            ? pathinfo($abs_path, PATHINFO_FILENAME)
            :"";
        //
        //2.3.Strip off the root directory
        
        //
        //Get the root directory
        $root_dir= $_SERVER['DOCUMENT_ROOT'];
        //
        //Now Strip this root from the node path string
        $node_path_str2= substr($node_path_str, strlen($root_dir));
        //
        //3. Build the node network from the node path array
        //
        //3.1) Convert the node path into an array 
        $node_path= explode("\\",$node_path_str2);
        //
        //Reverse the elements in the node path
        $reversed= array_reverse($node_path);
        //
        //Create a root folder, i.e., one with no parent. 
        $node= new rich_folder($reversed, "", null);
        //
        //Return the node promised 
        return $node;   
    }
}
//
//Modelling an ordinary file folder
class folder extends node{
    //
    //These are the files and subfolders of this folder
    public ?array $children= null;
    //
    //
    function __construct(
        string $name,
        string $parent_name,           
        ?folder $parent
    ) {
        //
        parent::__construct($name, $parent_name, $parent);
    }
}
//
//A rich folder is one where nodes along the initial path are populated with
//children
class rich_folder extends folder {
    //
    //
    function __construct(
        //
        //Reversed path i.e., the node at the top of the stack 
        //corresponds  to the name of the path
        array $node_path,
        string $parent_name,           
        ?folder $parent
    ) {
        //Ensure that there is at least one element in the path
        if(count($node_path)===0){
            throw  new myerror("Empty path not allowed");
        }
        //
        //Get the name of this folder which is at the top of the stack 
        $name = $node_path[count($node_path)-1];
        //
        //Pop the last component of the node path to avoid recreating
        //this folder.
        $node_path2 = array_pop($node_path);
        //
        parent::__construct($name, $parent_name, $parent);
        //
        //Use a generator to retrieve the children indexed by their names
        $this->children = iterator_to_array(
                    $this->get_children()
                );
        //
        //Only do the promotion if there are node paths still remaining 
        //to be generated
        if(count($node_path2)===0){return;}
        //
        $node = new rich_folder($node_path2, $parent_name, $this);
        //
        //Promote the current ordinary node to a rich one.
        $this->children[$node_path2[count(node_path2)-1]] = $node;
    }
    //
    //A generator function that yields a node children obtained using 
    //scan dir()
    function get_children(){
        //
        //Scan the server for folders in this full_path
        $paths = scandir($this->absolute_name());
        //
        //Map all the ifolders to nodes. 
        foreach ($paths as $path){
            //
            //Get the basename of this path
            $name = pathinfo($path,PATHINFO_BASENAME);
            //
            //Yield an ordinary folder/file, indexed by the name
            //
            //Find out whether this is a folder or a file
            //if file create new file else new folder
            if(is_dir($path)){
                //
                yield $name => new folder($name, $path, $this);
            }else{
                //
                yield $name => new file($name, $path, $this);
            }
        } 
    }
}
//
//
class file extends node {
    //
    //
    public string $icon;
    function __construct(
        //
        //The name of the leaf
        string $name,
        //
        //The full path of this leaf
        string $parent_name,
        //
        //The optional parent
        ?folder $parent
    ) {
       //
       parent::__construct($name, $parent_name, $parent);
    }
}
