var webmutator = function () {

	var extTypes = {

		// file extension -> MIME-type
		application: {
			'swf': 'application/x-shockwave-flash'
		},
		
		audio: {
			'aac' : 'audio/aac',
			'mp3' : 'audio/mpeg'
		},

		image: {
			'gif' : 'image/gif',
			'jpg' : 'image/jpeg',
			'jpeg': 'image/jpeg',
			'png' : 'image/png',
			'tiff': 'image/tiff',
			'ico' : 'image/vnd.microsoft.icon',
			'wbmp': 'image/vnd.wap.wbmp',
			'webp': 'image/webp'
		},

		video: {
			'3gp' : 'video/3gpp',
			'mpeg': 'video/mpeg',
			'mp4' : 'video/mp4',
			'ogg' : 'video/ogg',
			'ogv' : 'video/ogg',
			'webm' : 'video/webm'
		},

		// file extension -> ACE mode
		text: {
			'bat' : 'batchfile',
			'c'   : 'c_cpp',
			'coffee' : 'coffee',
			'cfc' : 'coldfusion',
			'cfm' : 'coldfusion',
			'cs'  : 'csharp',
			'cpp' : 'c_cpp',
			'css' : 'css',
			'gitignore' : 'gitignore',
			'h'   : 'c_cpp',
			'htaccess': 'apache_conf',
			'html': 'html',
			'htm': 'html',
			'ini' : 'ini',
			'java': 'java',
			'js'  : 'javascript',
			'json': 'json',
			'litcoffee' : 'coffee',
			'log' : 'text',
			'makefile': 'makefile',
			'markdown': 'markdown',
			'md'  : 'markdown',
			'mysql': 'mysql',
			'pas' : 'pas',
			'pl'  : 'perl',
			'pgsql': 'pgsql',
			'php' : 'php',
			'py'  : 'python',
			'rb'  : 'ruby',
			'sass': 'sass',
			'scss': 'scss',
			'sh'  : 'sh',
			'sql' : 'sql',
			'svg' : 'svg',
			'txt' : 'text',
			'vbs' : 'vbscript',
			'xml' : 'xml',
			'yaml': 'yaml',
		}
	};

	/**
	 * Show user message.
	 * 
	 * @param  string  msg  Message
	 * 
	 * @return  void
	 */
	function showMessage (msg) {
		alert(msg);
	}

	/**
	 * Return token from cookie CSRF-TOKEN
	 *
	 * @return  string
	 */
	function getToken () {
		return document.cookie.match(/_token=([^;]+)/)[1];
	}

	/**
	 * Return file name from full file path.
	 *
	 * @param  string  filePath  Full file path
	 *
	 * @return  strign
	 */
	function extractFileName (filePath) {
		return filePath.substr(filePath.lastIndexOf('/') + 1);
	}

	/**
	 * Lock tree.
	 * 
	 * @return  void
	 */
	function lockTree () {
		$('#tree').addClass('loading');
	}

	/**
	 * Unlock tree.
	 * 
	 * @return  void
	 */
	function unlockTree () {
		$('#tree').removeClass('loading');
	}

	/**
	 * Set tree upload progress bar value.
	 *
	 * @param  object  node    JQuery li node element
	 * @param  int     value   Progress bar position form 0 to 360
	 *
	 * #return  void
	 */
	function setProgress (node, value) {
		node.css('background-size', value + '% 100%');
	}

	/**
	 * Collapse / expand / toggle folder node.
	 *
	 * @param  object  node      JQuery li node element
	 * @param  bool    collapse  Collapse or expand (default toggle)
	 *
	 * @return  void
	 */
	function collapseNode (node, collapse) {
		node.toggleClass('collapsed', collapse);
	}

	/**
	 * Return node full file name.
	 *
	 * @param  object  node  JQuery li node element
	 *
	 * @return  string
	 */
	function getNodeFileName (node) {
		return (node.parent().attr('data-path') || '') + node.attr('data-path');
	}

	/**
	 * Return node file path.
	 *
	 * @param  object  node  JQuery li node element
	 *
	 * @return  string
	 */
	function getNodeFilePath (node) {
		var path = node.parent().attr('data-path') || '';

		if(node.hasClass('folder')) {
			path += node.attr('data-path');
		}

		return path;
	}

	/**
	 * Return focused node li element.
	 * 
	 * @return  object
	 */
	function getFocusedNode () {
		return $('#tree-list li.focus');
	}

	/**
	 * Return span element of focused li node.
	 * 
	 * @return  object
	 */
	function getFocusedNodeSpan () {
		return getFocusedNode().children('span');
	}

	/**
	 * Prepend new folder li > span elements to ul.
	 *
	 * @param  object  parent  JQuery ul parent element
	 * @param  string  name  Text in new elements
	 * @param  bool  isRoot  Is root element
	 *
	 * @return  object
	 */
	function addFolderNode (parent, name, isRoot) {

		var newNode = $('<li>')
			.addClass('folder')
			.attr('data-path', ((!isRoot) ? '/' : '') + name)
			.dblclick(function (e) { // toggle collapse node on click
				var node = $(this);

				if(node.is('li')) {
					loadFolder(node);
					collapseNode(node);
				}
				e.stopPropagation();
			})
			.attr('tabindex', 0)
			.focus(onFocusNode)
			.click(onFocusNode)
			.keypress(function (e) {
				if(e.keyCode == 13) { // 'Enter'
					$(e.target).trigger('dblclick');
				}
				e.stopPropagation();
			})
			.on('contextmenu', onNodeMenu)
			.append($('<span>')
				.text(name)
				.on('contextmenu', onNodeMenu)
			);

		collapseNode(newNode, true);

		parent.prepend(newNode);

		return newNode;
	}

	/**
	 * Append new file li > span elements to ul.
	 *
	 * @param  object  parent  JQuery ul parent element
	 * @param  string  name  Text in new elements
	 *
	 * @return  object
	 */
	function addFileNode (parent, name) {
		
		var newNode = $('<li>')
			.attr('data-path', '/' + name)
			.click(function (e) {
				e.stopPropagation();
			})
			.dblclick(function (e) { // load file on click
				var node = $(this);
				if(node.is('li') &&	!node.hasClass('loading')) {
					openFile(getNodeFileName($(this)));
				}
				e.stopPropagation();
			})
			.attr('tabindex', 0)
			.focus(onFocusNode)
			.click(onFocusNode)
			.keypress(function (e) {
				if(e.keyCode == 13) { // 'Enter'
					$(e.target).trigger('dblclick');
				}
				e.stopPropagation();
			})
			.append($('<span>')
				.text(name)
				.on('contextmenu', onNodeMenu)
			);

		parent.append(newNode);

		return newNode;
	}

	/**
	 * Return file type from extTypes by file name / extension.
	 * 
	 * @param  string  fileExt  File extension
	 * 
	 * @return  string
	 */
	function getFileType (fileExt) {

		for(var type in extTypes) {
			if(extTypes[type][fileExt]) {
				return type;
			}
		}
		return 'unknown';
	}

	/**
	 * Load and open file in new tab.
	 * 
	 * @param  string  fileName  File name
	 * 
	 * @return  void
	 */
	function openFile (fileName) {

		var allTabs = $('#tabs > li');
		// activate tab if is open
		for(var i = allTabs.length - 1; i >= 0; i--) {
			if(allTabs[i].tab.file.name == fileName) {
				tabs.activateTab(allTabs[i].tab);
				return;
			}
		}

		lockTree();

		$.post('index.php', // file info request
			{
				action: 'getFileInfo',
				fileName: fileName,
				token: getToken()
			},
			function (res) {

				var response = JSON.parse(res);
				var file = response.result;

				file.ext = file.name.substr(file.name.lastIndexOf('.') + 1);

				if(file.size !== false) { // file exist
					tabs.createTab({
						name: file.name,
						ext: file.ext,
						size: file.size,
						type: getFileType(file.ext)
					});
				}
				else {
					showMessage('Can\'t open file "' + fileName + '"\n\nError: "' + response.error.message + '"');
				}

				unlockTree();
			}
		);
	}

	/**
	 * Load folder node tree.
	 * 
	 * @param  object  node  JQuery li node element
	 * @param  callback  complete  On load
	 * 
	 * @return  void
	 */
	function loadFolder (node, complete) {
		if(!node.prop('loaded')) {
			treeLoad(getNodeFileName(node) + '/', node, function () {
				if(complete) {
					complete();
				}
			});
		}
		else if(complete) {
			complete();
		}
	}

	/**
	 * Scroll tree to node element.
	 * 
	 * @param  object  node  JQuery li node element
	 * 
	 * @return  void
	 */
	function scrollToNode (node) {

		var offsetTop = 0;
		var nodeEl = node[0];

		while(nodeEl && nodeEl.id != 'tree-list') {
			offsetTop += nodeEl.offsetTop;
			nodeEl = nodeEl.offsetParent;
		}

		offsetTop -= $('#tree-list').height();

		$('#tree-list').animate(
			{ scrollTop: offsetTop },
			500
		);
	}

	/**
	 * Set focus on node li element.
	 *
	 * @param  object  node  JQuery li node element
	 *
	 * @return  void
	 */
	function focusNode (node) {
		node.trigger('click');
		scrollToNode(node);
	}

	/**
	 * Node focus event handler.
	 * 
	 * @param  object  e  Event object
	 * 
	 * @return  void
	 */
	function onFocusNode (e) {
				
		if(this == e.target) {
			var node = $(e.target);

			// if is not focused - set focus
			if(!node.hasClass('focus')) {
				getFocusedNode().removeClass('focus');
				node.addClass('focus');

				updateTreeToolbar(node);
			}
		}
	}

	/**
	 * Node context menu event handler.
	 * 
	 * @param  object  e  Event object
	 * 
	 * @return  void
	 */
	function onNodeMenu (e) {

		if(this == e.target) {
			var nodeRect = e.target.getBoundingClientRect();
			var menu =  $('#tree-menu');
			var menuPoint = {
				left: nodeRect.right,
				top: nodeRect.top
			};

			if((nodeRect.top + menu.height()) > innerHeight) {
				menuPoint.top = innerHeight - menu.height() - 4;
			}

			if((nodeRect.right + menu.width()) > innerWidth) {
				menuPoint.left = innerWidth - menu.width() - 4;
			} 

			menu.css({
					'left': menuPoint.left,
					'top': menuPoint.top
				})
				.show()
				.focus();
		}
		e.preventDefault();
	}

	/**
	 * Is element active.
	 * 
	 * @param  object  el  HTML element
	 * 
	 * @return  bool
	 */
	function isActive (el) {
		return ! $(el).hasClass('disabled');
	}

	/**
	 * Update tree toolbar buttons state.
	 * 
	 * @param  object  node  JQuery li focused node element or null
	 * 
	 * @return  void
	 */
	function updateTreeToolbar (node) {

		if(node) {
			var isFolder = node.hasClass('folder');

			$('.tree-open,.tree-rename,.tree-delete').removeClass('disabled');

			$('.tree-add-file,.tree-add-folder,.tree-upload').toggleClass('disabled', !isFolder);

			$('.tree-download')
				.toggleClass('disabled', isFolder)
				.attr('data-href', (isFolder) ? '' : 'index.php?action=getFileContent&fileName=' + getNodeFileName(node));
		}
		else {
			$('.tree-open,.tree-add-file,.tree-add-folder,.tree-rename,.tree-download,.tree-upload,.tree-delete').addClass('disabled');
			$('.tree-download').attr('data-href', '');
		}
	}

	/**
	 * Create new folder in path.
	 * 
	 * @param  string  folderName  New folder name
	 * 
	 * @return  void
	 */
	function createFolder (folderName) {

		var parent = getFocusedNode();
		var path = getNodeFilePath(parent);
		
		lockTree();

		loadFolder(parent, function () {

			collapseNode(parent, false);

			parent = parent.children('ul');	

			$.post('index.php', // create folder request
				{
					action: 'createFolder',
					path: path,
					folderName : folderName,
					token: getToken()
				},
				function (res) {

					var response = JSON.parse(res);

					try {
						if(response.result === true) {
							focusNode(addFolderNode(parent, folderName));
						}
						else {
							showMessage('Can\'t create folder "' + folderName + '"\n\nError: "' + response.error.message + '"');
						}
					}
					finally {
						unlockTree();
					}
				}
			);
		});
	}

	/**
	 * Create new file in path.
	 * 
	 * @param  string  fileName  New file name
	 * 
	 * @return  void
	 */
	function createFile (fileName) {

		var parent = getFocusedNode();
		var path = getNodeFilePath(parent);
		
		lockTree();

		loadFolder(parent, function () {

			collapseNode(parent, false);

			parent = parent.children('ul');	

			$.post('index.php', // create file request
				{
					action: 'createFile',
					path: path,
					fileName : fileName,
					token: getToken()
				},
				function (res) {

					var response = JSON.parse(res);

					try {
						if(response.result !== false) {
							// create new tree node
							var newNode = parent.children('li[data-path="/' + fileName + '"]');

							// add node if doesn't exist
							if(newNode.length == 0) {
								newNode = addFileNode(parent, fileName);
							}
							focusNode(newNode);
						}
						else {
							showMessage('Can\'t create file "' + fileName + '"\n\nError: "' + response.error.message + '"');
						}
					}
					finally {
						unlockTree();
					}
				}
			);
		});
	}

	/**
	 * Rename focused node and server file / folder.
	 * 
	 * @param  string  newName  New file / folder name
	 * 
	 * @return  void
	 */
	function renameFocusedNode (newName) {

		var node = getFocusedNode();
		var fileName = getNodeFileName(node);

		// exit if name not changed
		if(extractFileName(fileName) == newName) {
			return;
		}
		
		lockTree();

		$.post('index.php', // rename file request
			{
				action: 'renameFile',
				fileName : fileName,
				newName: newName,
				token: getToken()
			},
			function (res) {

				var response = JSON.parse(res);

				try {
					if(response.result === true) {
						node.children('span').text(newName);
						node.attr('data-path', '/' + newName);
						// update focus
						updateTreeToolbar(node);
					}
					else {
						showMessage('Can\'t rename file "' + fileName + '"\n\nError: "' + response.error.message + '"');
					}
				}
				finally {
					unlockTree();
				}
			}
		);
	}

	/**
	 * Upload file to focused folder node.
	 *
	 * @param  file  file  File to upload
	 * 
	 * @return  void
	 */
	function uploadToFocusedNode (files) {

		var parent = getFocusedNode();
		var path = getNodeFilePath(parent);

		function uploadFile (file) {

			var newNode;
			var isRealyNew = false;
			var data = new FormData();

			data.append('action', 'uploadFile');
			data.append('token', getToken());
			data.append('path', path);
			data.append('upload-file', file);

			$.ajax({ // upload file request
				url: 'index.php',
				data: data,
				processData: false,
				contentType: false,
				type: 'POST',
				beforeSend: function () {
					// create new tree node
					newNode = parent.children('li[data-path="/' + file.name + '"]');

					// add node if doesn't exist
					if(!newNode.length) {
						newNode = addFileNode(parent, file.name);
						isRealyNew = true;
					}

					newNode.addClass('loading');

					scrollToNode(newNode);
				},
				complete: function () {
					newNode.removeClass('loading');
				},
				success: function (res) {

					var response = JSON.parse(res);

					if(response.result !== true) {
						if(isRealyNew) {
							newNode.remove();
						}
						showMessage('Can\'t upload file "' + file.name + '"\n\nError: "' + response.error.message + '"');
					}
				},
				xhr: function () {
					var xhr = $.ajaxSettings.xhr();

					xhr.upload.onprogress = function (e) {
						if (e.lengthComputable) {
							var value = Math.round((e.loaded / e.total) * 100);
							setProgress(newNode, value);
						}
					};

					return xhr;
				}
			});
		}

		if(!parent.hasClass('folder')) {
			parent = parent.parent();
		}		

		loadFolder(parent, function () {

			collapseNode(parent, false);

			parent = parent.children('ul');			

			for (var i = files.length - 1; i >= 0; i--) {
				uploadFile(files[i]);
			};
		});
	}

	/**
	 * Delete focused node and server file / folder
	 *
	 * @return  void
	 */
	function deleteFocusedNode () {

		var node = getFocusedNode();
		var fileName = getNodeFileName(node);
		
		lockTree();

		$.post('index.php', // delete file request
			{
				action: 'deleteFile',
				fileName : fileName,
				token: getToken()
			},
			function (res) {

				var response = JSON.parse(res);

				try {
					if(response.result === true) {
						node.remove();
						updateTreeToolbar(null);
					}
					else {
						showMessage('Can\'t delete file "' + fileName + '"\n\nError: "' + response.error.message + '"');
					}
				}
				finally {
					unlockTree();
				}
			}
		);
	}

	/**
	 * Load folders tree
	 *
	 * @param  string  root  Root directory path (default: '/')
	 * @param  object  parent  JQuery element to load tree (default: #tree-list > li)
	 * @param  callback  complete  On tree loaded
	 * 
	 * @return  object  this
	 */
	function treeLoad (root, parent, complete) {

		root = root || '/';
		parent = parent || $('#tree-list');

		lockTree();

		$.post('index.php', // get tree request
			{
				action: 'getTree',
				path: root,
				token: getToken()
			},
			function (res) {
				try {
					var response = JSON.parse(res);
					var folder = response.result;
					var treeElem = $('<ul>').attr('data-path', folder.path);
					var tree = folder.tree;

					if(parent.is('#tree-list')) {
						$('#tree-root').val(folder.path);
						parent.children('li').remove();
						parent = addFolderNode(parent, folder.path, true);
						collapseNode(parent, false);
						updateTreeToolbar(null);
					}

					for(var v in tree) {
						if(tree[v] instanceof Object) { // is directory or file
							addFolderNode(treeElem, v);
						}
						else {
							addFileNode(treeElem, tree[v]);
						}
					}
					parent.children('ul').remove();
					parent.append(treeElem);
				}
				finally {
					parent.prop('loaded', true);
					unlockTree();
					if(complete) {
						complete();
					}
				}
			}
		);
		return this;
	}

	var tabs = {

		/**
		 * Create new tab element, add it to tabs bar and activate.
		 * 
		 * @param  object  tab  Tab info object { file, panelElement }
		 *
		 * @return  void
		 */
		addTabElem: function (tab) {

			// create new tab element
			tab.tabElem = $('<li>')
				.text(extractFileName(tab.file.name))
				.attr('tabindex', 0)
				.append($('<span>')
					.addClass('fa fa-close')
					.attr('title', 'close')
					.click(function (e) {
						if(this == e.target) {
							tabs.closeTab(tab);
						}
					})
				)
				.focus(function (e) {
					if(this == e.target) {
						tabs.activateTab(tab);
					}
				});
			tab.tabElem.prop('tab', tab);

			// add new tab
			$('#tabs').append(tab.tabElem);
			// add new tab panel
			$('#panels').append(tab.panelElem);

			setTimeout(function () {
				tabs.activateTab(tab);
			}, 0);
		},

		/**
		 * Create Ace editor and attach it to tab.
		 * 
		 * @param  object  tab  Tab info object { file, panelElement }
		 * 
		 * @return  void
		 */
		createEditor: function (tab) {

			var editor = ace.edit(tab.panelElem[0]);
			var session = editor.getSession();

			ace.require('ace/ext/settings_menu').init(editor);
			editor.setTheme('ace/theme/twilight');

			editor.commands.addCommand({
				name: 'save',
				bindKey: {win: 'Ctrl-S',  mac: 'Command-S'},
				exec: function () { 
					tabs.saveTab(tab); 
				},
				readOnly: true
			});
			
			session.setMode('ace/mode/' + extTypes['text'][tab.file.ext]);
			session.setUseWrapMode(true);

			editor.on('changeSelection', function() {
				setTimeout(function() {
					tabs.updateToolbarAndStatus(tab);
				}, 0);
			});

			tab.editor = editor;
		},

		/**
		 * Create new tab.
		 * 
		 * @param  object  file  Tab binded file { name, size, type }
		 * 
		 * @return  void
		 */
		createTab: function (file) {

			var newTab = {
				file: file,
				panelElem: $('<div>').addClass('tab-panel')
			};

			switch(file.type) {
				case 'application':
					newTab.panelElem.append($('<embed>')
						.attr({
							'src': 'index.php?action=getFileContent&fileName=' + file.name,
							'allowfullscreen': 'true',
							'height': '100%',
							'width': '100%',
							'type': extTypes['application'][file.ext]
						})
					);
					tabs.addTabElem(newTab);
					break;
				case 'audio':
					newTab.panelElem.append($('<audio>')
						.attr({
							'src': 'index.php?action=getFileContent&fileName=' + file.name,
							'controls': 'true',
							'preload': 'true',
							'loop': 'true'
						})
					);
					tabs.addTabElem(newTab);
					break;
				case 'image':
					newTab.panelElem.append($('<img>')
						.attr('src', 'index.php?action=getFileContent&fileName=' + file.name)
					);
					tabs.addTabElem(newTab);
					break;
				case 'video':
					newTab.panelElem.append($('<video>')
						.attr({
							'src': 'index.php?action=getFileContent&fileName=' + file.name,
							'controls': 'true',
							'preload': 'true',
							'loop': 'true'
						})
					);
					tabs.addTabElem(newTab);
					break;
				default:
					if(confirm('Unknown file type. Do you want to open it in editor?') !== true) {
						return;
					}
				case 'text':
					$.post('index.php', { // file content request
							action: 'getFileContent',
							fileName: file.name,
							token: getToken()
						},
						function (res) {

							var response = JSON.parse(res);
							if(response.result !== false) {
								newTab.panelElem.text(response.result);
								tabs.addTabElem(newTab);
								tabs.createEditor(newTab);
							}
							else {
								showMessage('Can\'t open file "' + file.name + '"\n\nError: "' + response.error.message + '"');
							}
						}
					);
					break;
			}
		},

		/**
		 * Activate tab.
		 *
		 * @param  object  tab  Tab info object { file, panelElement }
		 * 
		 * @return  void
		 */
		activateTab: function (tab) {

			if(tab && !tab.tabElem.hasClass('active')) { // if is not active
				$('#tabs > li.active').removeClass('active');
				$('#panels > .active').removeClass('active');

				tab.panelElem.addClass('active');
				tab.tabElem.addClass('active');

				if(tab.editor) {
					tab.editor.focus();
				}
			}

			tabs.updateToolbarAndStatus(tab);
		},

		/**
		 * Activate next tab.
		 *
		 * @return  object  Activated tab or null
		 */
		activateNextTab: function () {

			var activeTab = $('#tabs > li.active');
			var nextTab;
			
			if(activeTab.length) {
				nextTab = activeTab.next();
				if(!nextTab.length) {
					nextTab = $('#tabs > li:first-child');
				}
			}

			if(nextTab[0] != activeTab[0]) {
				tabs.activateTab(nextTab.prop('tab'));
			}
			else {
				tabs.updateToolbarAndStatus();
			}

			return nextTab;
		},

		/**
		 * Update toolbar buttons state.
		 *
		 * @param  object  tab  Tab info object { file, panelElement }
		 * 
		 * @return  void
		 */
		updateToolbarAndStatus: function (tab) {

			function makeBytesStr (bytes) {
				var dim = ['byte', 'kb', 'Mb', 'Gb'];
				var i = 0;

				if(bytes >= 1000) {
					do {
						bytes /= 1024;
						i++;
					}
					while(bytes >= 1000 && i < 3);

					bytes = bytes.toFixed(2);
				}

				return bytes + ' ' + dim[i];
			}

			$('#status').css('visibility', (tab) ? 'visible' : 'hidden');
			$('#editor-buttons').css('visibility', (tab && tab.editor) ? 'visible' : 'hidden');

			if(tab) {
				// update status bar info
				$('#file-name')
					.text(tab.file.name)
					.attr('title', tab.file.name);


				$('#file-size').text(makeBytesStr(tab.file.size));

				if(tab.editor) {
					var session = tab.editor.getSession();
					var hasUndo = session.$undoManager.hasUndo();
					var hasRedo = session.$undoManager.hasRedo();
					var selection = tab.editor.selection.selectionLead;

					tab.editor.modified = hasUndo;
					$('#tabs > li.active').toggleClass('modified', hasUndo);

					// update toolbar buttons state
					$('#editor-save,#editor-undo').toggleClass('disabled', !hasUndo);
					$('#editor-redo').toggleClass('disabled', !hasRedo);
					$('#editor-copy,#editor-cut').toggleClass('disabled', tab.editor.selection.isEmpty());

					// update editor cursor position
					$('#cursor-pos').text(selection.row + ':' + selection.column);
				}
				else {
					$('#cursor-pos').text('');
				}
			}
		},

		/**
		 * Close tab.
		 * 
		 * @param  object  tab  Tab info object { file, panelElement }
		 * 
		 * @return  void
		 */
		closeTab: function (tab) {

			// if file not saved
			if(tab.editor && tab.editor.modified && confirm('File not saved! Close?') !== true) {
				return;
			}

			tabs.activateNextTab();

			// delete tab and panel elements
			tab.panelElem.remove();
			tab.tabElem.remove();
			delete tab;
		},

		/**
		 * Save tab file.
		 * 
		 * @param  object  tab  Tab info object { file, panelElement }
		 * 
		 * @return  void
		 */
		saveTab: function (tab) {

			var fileContent = tab.editor.getValue();

			tab.panelElem.addClass('saving');

			$.post('index.php', // save file content request
				{
					action: 'setFileContent',
					fileName : tab.file.name,
					fileContent: JSON.stringify(fileContent),
					token: getToken()
				},
				function (res) {

					var response = JSON.parse(res);

					if(response.result === false) {
						showMessage('Can\'t save file "' + tab.file.name + '"\n\nError: "' + response.error.message + '"');
					}
					else {
						tab.editor.getSession().$undoManager.reset();
						tab.file.size = fileContent.length;
						tabs.updateToolbarAndStatus(tab);
					}

					tab.panelElem.removeClass('saving');
				}
			);
		}
	};

	/**
	 * Attach event handles to user interface
	 * 
	 * @return  object  this
	 */
	function attachGUIEvents () {

		$('#tree-menu li').click(function (e) {
			if(isActive(e.target)) {
				$('#tree-menu').hide();
			}
		});

		$('#tree-up').click(function (e) {
			treeLoad($('#tree-list > li').attr('data-path') + '/../');
		});

		$('#tree-root').keypress(function (e) {
			if(e.keyCode == 13) { // 'Enter'
				treeLoad($(this).val());
			}
		});

		$('.tree-open').click(function (e) {
			if(isActive(e.target)) {
				getFocusedNode().trigger('dblclick');
			}
		});

		$('.tree-add-folder').click(function (e) {
			if(isActive(e.target)) {
				var folderName = prompt('Please enter new folder name', 'new-folder');

				if(folderName !== null) {
					createFolder(folderName);
				}
			}
		});

		$('.tree-add-file').click(function (e) {
			if(isActive(e.target)) {
				var fileName = prompt('Please enter new file name', 'new-file');

				if(fileName !== null) {
					createFile(fileName);
				}
			}
		});

		$('.tree-rename').click(function (e) {
			if(isActive(e.target)) {
				var newName = prompt('Please enter new file name', extractFileName(getFocusedNodeSpan().text()));

				if(newName !== null) {
					renameFocusedNode(newName);
				}
			}
		});

		$('.tree-download').click(function (e) {
			if(isActive(e.target)) {
				window.location = $(e.target).attr('data-href');
			}
		});

		$('#upload-file').change(function (e) {
			uploadToFocusedNode(e.target.files);
		});

		$('.tree-upload').click(function (e) {
			if(isActive(e.target)) {
				$('#upload-file').val('').trigger('click');
			}
		});

		$('.tree-delete').click(function (e) {
			if(isActive(e.target)) {
				var li = getFocusedNode();
				var fileName = getNodeFileName(li);

				if(confirm('Delete "' + fileName + '"?') === true) {
					deleteFocusedNode();
				}
			}
		});

		$('#editor-undo').click(function (e) {
			if(isActive(e.target)) {
				var tab = $('#tabs > li.active')[0].tab;

				tab.editor.focus();
				tab.editor.getSession().$undoManager.undo();
				tabs.updateToolbarAndStatus(tab);
			}
		});

		$('#editor-redo').click(function (e) {
			if(isActive(e.target)) {
				var tab = $('#tabs > li.active')[0].tab;

				tab.editor.focus();
				tab.editor.getSession().$undoManager.redo();
				tabs.updateToolbarAndStatus(tab);
			}
		});

		$('#editor-save').click(function (e) {
			if(isActive(e.target)) {
				var tab = $('#tabs > li.active')[0].tab;

				tab.editor.focus();
				tabs.saveTab(tab);
			}
		});

		$('#editor-copy').click(function (e) {
			if(isActive(e.target)) {
				var tab = $('#tabs > li.active')[0].tab;

				tab.editor.focus();
				document.execCommand('copy');
			}
		});

		$('#editor-cut').click(function (e) {
			if(isActive(e.target)) {
				var tab = $('#tabs > li.active')[0].tab;

				tab.editor.focus();
				document.execCommand('cut');
			}
		});

		$('#editor-paste').click(function (e) {
			if(isActive(e.target)) {
				var tab = $('#tabs > li.active')[0].tab;

				tab.editor.focus();
				document.execCommand('paste');
			}
		});

		$('#editor-search').click(function (e) {
			var tab = $('#tabs > li.active')[0].tab;

			tab.editor.focus();
			tab.editor.findAll($('#editor-search-input').val());
		});

		$('#editor-search-input').keypress(function (e) {
			if(e.keyCode == 13) { // 'Enter'
				$('#editor-search').click();
			}
		});

		$('#editor-settings').click(function (e) {
			var tab = $('#tabs > li.active')[0].tab;

			tab.editor.showSettingsMenu();
		});

		$('#tree-menu').blur(function (e) {
			$(e.target).hide();
		});

		return this;
	}

	return {
		init: attachGUIEvents,
		treeLoad: treeLoad
	};
}();

// splitter
(function () {

	var minSize = 240;
	var collapsable = true;
	var collapsedSize = 2;

	$(function () {

		$('.splitter')
			.on('mousedown', function (e) {

				var splitter = $(this);

				var parentEl = splitter.parent();
				var nextEl = parentEl.next();

				var parentRect = parentEl[0].getBoundingClientRect();
				var wrapperRect = parentEl.parent()[0].getBoundingClientRect();

				function onSlitterDrag(e) {
			
					var wrapperSize;
					var parentSize;
					var toChange;
					var parentPerc;

					wrapperSize = wrapperRect.width;
					parentSize = e.clientX - parentRect.left;

					if(parentSize < minSize) {
						parentSize = (collapsable) ? collapsedSize : minSize;
					}
					else if(wrapperSize - parentSize < minSize) {
						parentSize = (collapsable) ? wrapperSize - collapsedSize : wrapperSize - minSize;
					}

					parentSize += 2;

					parentEl.css('width', parentSize);
					nextEl.css('padding-left', parentSize);

					e.preventDefault();
					return false;
				}

				$(document)
					.on('mouseup', function (e) {

						if(splitter) {
							$(document).off('mousemove', onSlitterDrag);
							$(document.body).css('cursor', 'default');
							splitter = null;
						}
					})
					.on('mousemove', onSlitterDrag);

				$(document.body).css('cursor', 'ew-resize');
			});
	});	
})();