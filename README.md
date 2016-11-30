# web-mutator
Web Mutator is a simple web IDE based on Ace editor.

# web-mutator
Web-mutator is a simple WEB IDE based on Ace editor.

# installation
Web-mutator works out of the box.
Don't forget to change user name/password (default - admin/admin) and CSRF-token secret key in config.php.
<code>
    // !!! change secret key<br>
    'secret' => 'u65hb5nsd3io0e90ie9p0rzhj4yhqujh',<br>
    'users' => [<br>
        'admin' => [<br>
            'name' => 'Administrator',<br>
            // !!! change your password<br>
            'password' => 'admin'<br>
        ]<br>
    ]<br>
</code>

# requirements
PHP 5+ and basic read/write access to edited files from it.
