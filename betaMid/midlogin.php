<?php
date_default_timezone_set("America/New_York"); 
/* stores activities via a log */ 

$log = fopen("/afs/cad/u/w/b/wbv4/public_html/Middle/log.txt", "a+"); 
if (! $log) 
    $fail = error_get_last(); 
$write .= "page accessed " . date("Y-m-d h:i:sa") . "\n"; 
// echo $write; 
/*get the user name and password */
$mux = file_get_contents("php://input"); 
$demux = json_decode($mux, true); 

if (isset($demux['username'])) 
   $user = $demux['username']; 
if (isset($demux['password'])) {
   $pass = $demux['password']; 
   $cart = loginVERIFY($user, $pass); 
   echo $cart; 
   }


/*legacy/deprecated
if (isset($demux['question'])) {
   //print question with answers. 
   // tracer($demux); 
   $question = $demux['question']; 
   echo $question . "<br>" ; 
   $answers = $demux['answers']; 
   $answer1 = $answers[0];
   $answer2 = $answers[1];   
   echo "answer 1: " . $answer1 . '<br>'; 
   echo "answer 2: " . $answer2 . '<br>'; 
   }
*/

if (isset($demux['qnum'])) {
   $qnum = $demux['qnum']; 
   $cart  = getQUEST($qnum); 
   echo $cart; 
   } 

if(isset($demux['Type'])) {
   $note =  "running addQUEST() \n"; 
   $description = $demux['Description']; 
   $testcase1 = $demux['TestCase1']; 
   $testcase2 = $demux['TestCase2']; 
   $testcase3 = $demux['TestCase3']; 
   $testcase4 = $demux['TestCase4']; 
   $mid = "mid received data"; 
   $barrel = array("mid" => $mid, "Question" => $description, "TestCase1" => $testcase1, "TestCase2" => $testcase2, "TestCase3" => $testcase3, "TestCase4" => $testcase4); //note: Backend is asking for Question. 
   $barrel = array("Question" => $description, "Cases" => array("TestCase1" => $testcase1, "TestCase2" => $testcase2, "TestCase3" => $testcase3, 
            "TestCase4" => $testcase4)); 
   $write .= trace($barrel, $note); 
   $cart = addQUEST($barrel); 	  

   echo json_encode($cart); 
 //  echo ($cart); 
 //   echo json_encode($cart);  
}

/*
send a payload to backend.
echo "<br> sent a payload to back. <br>"; 
$url = "https://web.njit.edu/~wbv4/Middle/backend.php";
*/
//************************console and log******************************
function trace($trail, $note) {
       $global .= $note . "\n"; 
       $global .= "sending data..\n"; 
       $global .= $trail . "\n"; 
       return $global; 
} //trace(); 
//************************login****************************************

function loginVERIFY($user, $pass) {
// $url = "https://web.njit.edu/~rd248/download/backend.php";
    $url = "https://web.njit.edu/~rd248/download/Student&Teacher.php"; 
    $payload = array("username" => $user, "password" => $pass, "njit" => $njit);
// echo http_build_query($payload) . "<br>"; 
    $fac2 = curl_init(); 
    curl_setopt($fac2, CURLOPT_URL, $url);
    curl_setopt($fac2, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($fac2, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($fac2, CURLOPT_FOLLOWLOCATION, true);  
    if (curl_exec($fac2) === false) 
         echo "curl_error:" . curl_error($fac2) . "<br>"; 
    $result2 = curl_exec($fac2); 
        curl_close($fac2); 
    return $result2; 
} //loginVERIFY()

//************************get question**********************************

function getQUEST($qnum) {
    $tgt  = 'https://web.njit.edu/~wbv4/Middle/back.php'; 
    $ammo =  array('qnum' => $qnum); 

    $proj  = curl_init(); 
    curl_setopt($proj , CURLOPT_URL, $tgt);
    curl_setopt($proj , CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($proj , CURLOPT_POSTFIELDS, json_encode($ammo));
    curl_setopt($proj , CURLOPT_FOLLOWLOCATION, true);  
    if (curl_exec($proj) === false) 
         echo "curl_error:" . curl_error($proj) . "<br>"; 
    $recoil = curl_exec($proj); 
    curl_close($proj); 
    return  $recoil; 

}//getQUEST(); 

//*************************add question**********************************

function addQUEST($ammo) {
 //  $tgt = 'https://web.njit.edu/~rd248/download/InsertQuestion.php'; 
    $tgt  = 'https://web.njit.edu/~wbv4/Middle/insert.php'; 
    $proj  = curl_init(); 
    curl_setopt($proj , CURLOPT_URL, $tgt);
    curl_setopt($proj , CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($proj , CURLOPT_POSTFIELDS, json_encode($ammo));
    curl_setopt($proj , CURLOPT_FOLLOWLOCATION, true);  
    if (curl_exec($proj) === false) 
         echo "curl_error:" . curl_error($proj) . "<br>"; 
    $recoil = curl_exec($proj); 
    curl_close($proj); 
    return json_encode($recoil); 

}//addQUEST();  

fwrite($log, $write); 
fclose($log); 
$error .= error_get_last(); 
//*********************************************************************
/*
$hit = json_decode($result2, true); 
echo $hit . "<br>"; 
vardump($hit); 
if ($hit['Response'] == 'student'){
    echo "succesful student login <br>"; 
}

if ($hit['Response'] == 'teacher'){
    echo "succesful teacher login <br>"; 
}
*/
/*
function tracer($ret) {
    $question = $ret['question']; 
    $array = $ret['answers']; 
    $count = sizeof($array); 
    echo $question . '<br>'; 
    for ($i = 0; $x < count; $i++) {
        echo $array[i] . "<br>";  
    }
}
*/ 


/*
workog 02.22.19 

this program retrieves JSON with username, password, and question. 

*/

/* LEGACY -- NJIT LOGIN 
$payload = array("ucid" => $user, "pass" => $pass); 
$url = "https://aevitepr2.njit.edu/myhousing/login.cfm"; 
$fac = curl_init(); 
curl_setopt($fac, CURLOPT_URL, $url);
curl_setopt($fac, CURLOPT_POST, 1); 
curl_setopt($fac, CURLOPT_POSTFIELDS, http_build_query($payload)); 
curl_setopt($fac, CURLOPT_RETURNTRANSFER, true); 
curl_setopt($fac, CURLOPT_FOLLOWLOCATION, true); 
if (curl_exec($fac) ===  false) 
      echo "curl_error:" . curl_error($fac) . "<br>";
$result = curl_exec($fac); 
curl_close($fac); 

if (strpos($result, "Please login using your UCID") != true) {
//         echo "NJIT accept"; 
	   $njit = "NJIT accept"; 
} else {
//	   echo "NJIT reject"; 
           $njit = "NJIT reject"; 
}

if (strpos($result2, "NJIT accept") == true) {  
         echo "NJIT login accepted <br>";           
}
if (strpos($result2, "NJIT reject") == true) { 
         echo "NJIT login rejected <br>"; 
}


//legacy - save for later. 
if (strpos($result2, "Success") == true) {
         echo "Database login succesful <br>"; 
}
if (strpos($result2, "Failure") == true) {
         echo "Database login failure <br>"; 
}
*/
/*
<script>
console.log(<?= json_encode($fail) ?>); 
console.log(<?= json_encode($log) ?>); 
console.log(<?= json_encode($write) ?>); 
console.log(<?= json_encode($error)?>);
</script>
*/
?>
