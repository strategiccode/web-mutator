<?php
/**
 * Generate random alpha-numeric string
 * 
 * @param  int  $length  Result string length
 * 
 * @return  string
 */
function randomString ($length) {
	$randStr = '';
	$pool = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	$poolLength = strlen($pool) - 1;

	while($length > 0) { 
		$randStr .= $pool[mt_rand(0, $poolLength)];
		$length --;
	}
	
	return $randStr;
}

/**
 * Generate token value from secret string
 *
 * @param  string  $secret  Secret string value
 * @param  string  $salt  Key salt (default random string)
 * 
 * @return  string
 */
function generateToken ($secret, $salt = null) {
	if(!$salt) {
		$salt = randomString(16);
	}
	return $salt . ":" . MD5($salt . ":" . $secret);
}

/**
 * Validate token value
 *
 * @param  string  $token  Token string value
 * @param  string  $secret  Secret string value
 * 
 * @return  bool
 */
function isValidToken ($token, $secret) {
	$salt = strstr($token, ':', true);

	return generateToken($secret, $salt) === $token;
}
?>