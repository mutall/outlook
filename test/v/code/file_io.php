<?php
//
//Catch all errors, including warnings.
\set_error_handler(function($errno, $errstr, $errfile, $errline /*, $errcontext*/) {
    throw new \ErrorException($errstr, 0, $errno, $errfile, $errline);
});
//
//Resolve the browser reference
include_once '../../../library/v/code/tree.php';
include_once '../../../library/v/code/schema.php';
//
//echo realpath("D:\\mutall_projects\\");
//Execute the static node export method
$node= node::export("D:\\mutall_projects\\library\\v\\code\\tree.php", "file");
//
echo json_encode($node);
