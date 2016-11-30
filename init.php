<?php

require_once('utils.php');

session_start();

/**
 * Application config
 * @var array
 */
$config = require_once('config.php');

$appName = $config['app_name'];

if(isset($_GET['logout'])) {
	// user is logout now
	unset($_SESSION[$appName]);
}

/**
 * Application session
 * @var array
 */
$session = [];
if(isset($_SESSION[$appName])) {
	$session = $_SESSION[$appName];
}

if(!empty($session['user'])) {
	// user is logged
	$user = $session['user'];
}
else {
	if(isset($_POST['login'])) {
		// verify login form data
		if(empty($_POST['name'])) {
			$errors['name'] = 'name field is required';
		}
		elseif(empty($_POST['password'])) {
			$errors['password'] = 'password field is required';
		}
		else {
			if(empty($config['users'][$_POST['name']]) // invalid user name value
				|| $config['users'][$_POST['name']]['password'] !== $_POST['password']) { // invalid password value

				$errors['name'] = 'invalid name field value';
				$errors['password'] = 'invalid password field value';
			}
			else {
				// valid user name and password values, login successfully
				$user = $config['users'][$_POST['name']];
				$session['user'] = $user;
				$session['token'] = generateToken($config['secret']);
				setcookie('_token', $session['token'], 0);

				$_SESSION[$appName] = $session;
			}
		}
	}
}
?>