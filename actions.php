<?php
function sendAJAXResponse ($data) {
	echo json_encode([
		'result' => $data,
		'error' => error_get_last()
	]);
}

// actions from URL
if(!empty($_GET['action'])) {
	if(!empty($user) && isValidToken(urldecode($_COOKIE['_token']), $config['secret'])) {
		// user is logged and token is valid
		switch($_GET['action']) {
			
			case 'getFileContent': // send file content with headers
				if(!empty($_GET['fileName'])) {
					$fileName = $_GET['fileName'];
					if(file_exists($fileName)) {
						// clear output buffer
						while(ob_get_level()) {
							ob_end_clean();
						}
						header('Content-Type: application/octet-stream');
						header('Content-Disposition: attachment; filename=' . basename($fileName));
						header('Expires: 0');
						header('Cache-Control: must-revalidate');
						header('Content-Length: ' . filesize($fileName));
						readfile($fileName);
					}
				}
				break;
		}
	}
	else {
		// unser not logged
		echo '<h1>Not authorized!</h1>';
	}
	exit();
}

// actions from AJAX
if(!empty($_POST['action'])) {
	
	error_reporting(0);

	if(!empty($user) && isset($_POST['token']) && isValidToken(urldecode($_POST['token']), $config['secret'])) {
		// user is logged
		switch($_POST['action']) {

			case 'getTree':	// send folder tree in array

				function getFolderContent ($folder) {
					$folders = [];
					$files = [];
					chdir($folder);
					$dir = dir('./');
					while(($entry = $dir->read()) !== false) {
						if($entry !== '.' && $entry !== '..')
						{
							if(is_dir($dir->path . $entry)) {
								$folders[utf8_encode($entry)] = [];
							}
							else {
								$files[] = $entry;
							}
						}
					}
					$dir->close();

					asort($folders);
					sort($files);

					return [
						'path' => getcwd(),
						'tree' => array_merge($folders, $files)
					];
				}
				
				if(!empty($_POST['path'])) {
					sendAJAXResponse(getFolderContent($_POST['path']));
				}
				break;

			case 'getFileInfo': // send file name and size in array
				if(!empty($_POST['fileName'])) {
					$fileName = $_POST['fileName'];
					sendAJAXResponse([
						'name' => $fileName,
						'size' => filesize($fileName),
					]);
				}
				break;

			case 'getFileContent': // send file content as string data
				if(!empty($_POST['fileName'])) {
					sendAJAXResponse(file_get_contents($_POST['fileName']));
				}
				break;

			case 'setFileContent': // save file content
				if(!empty($_POST['fileName']) && !empty($_POST['fileContent'])) {
					sendAJAXResponse(file_put_contents($_POST['fileName'], 
						json_decode($_POST['fileContent'])));
				}
				break;

			case 'createFolder': // create new folder
				if(!empty($_POST['path']) && !empty($_POST['folderName'])) {
					sendAJAXResponse(mkdir($_POST['path'] . '/' . $_POST['folderName']));
				}
				break;

			case 'createFile': // create new file
				if(!empty($_POST['path']) && !empty($_POST['fileName'])) {
					$fileName = $_POST['path'] . '/' . $_POST['fileName'];
					sendAJAXResponse(file_put_contents($fileName, '', FILE_APPEND));
				}
				break;

			case 'renameFile': // rename file
				if(!empty($_POST['fileName']) && !empty($_POST['newName'])) {
					$newName = dirname($_POST['fileName']) . '/' . $_POST['newName'];
					sendAJAXResponse(rename($_POST['fileName'], $newName));
				}
				break;

			case 'uploadFile': // receive and save file
				if(!empty($_POST['path']) && !empty($_FILES['upload-file'])) {
					sendAJAXResponse(move_uploaded_file(
						$_FILES['upload-file']['tmp_name'],
						$_POST['path'] . '/' . $_FILES['upload-file']['name']
					));
				}
				break;

			case 'deleteFile': // delete file
				if(!empty($_POST['fileName'])) {
					$fileName = $_POST['fileName'];
					sendAJAXResponse((is_dir($fileName)) ? rmdir($fileName) : unlink($fileName));
				}
				break;			

			default:
				// unknown action
				sendAJAXResponse("Action '$_POST[action]' not allowed!");
				break;
		}
	}
	else {
		// user not logged
		sendAJAXResponse('Not authorized!');
	}
	exit();
}
?>