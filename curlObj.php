/* CurlObj.php
 * Devon O'Connor
 * March 15, 2019 */
<?php
$url		= "https://web.njit.edu/~wbv4/Middle/midlogin.php";
$contents	= file_get_contents('php://input');
$myCurl   	= curl_init(); 
curl_setopt($myCurl, CURLOPT_URL, $url);
curl_setopt($myCurl, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($myCurl, CURLOPT_POST, 1);
curl_setopt($myCurl, CURLOPT_POSTFIELDS, $contents);
curl_setopt($myCurl, CURLOPT_FOLLOWLOCATION, true);  
$output		= curl_exec($myCurl); 
curl_close($myCurl); 
echo $output; 
?>

