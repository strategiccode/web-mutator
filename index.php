<?php
/**
 * Init application:
 *  - load config
 *  - authenticate user
 */
require_once('init.php');

/**
 * Process AJAX requests
 */
require_once('actions.php');
?>
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>WEB Mutator</title>
	<link rel="stylesheet" type="text/css" href="assets/font-awesome/css/font-awesome.min.css">
	<link rel="stylesheet" type="text/css" href="assets/css/style.css">
</head>
<body>
	<script type="text/javascript" src="assets/jquery/jquery.min.js"></script>
	<?php
		// if user not logged show login form
		if(empty($user)) {
			require_once('login-form.php');
		}
		else {
			require_once('main.php');
		}
	?>
	</div>
</body>
</html>