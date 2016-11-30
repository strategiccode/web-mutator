# web-mutator
Web-mutator is a simple WEB IDE based on Ace editor.

# installation
Web-mutator works out of the box.
Don't forget to change user name/password (default - admin/admin) and CSRF-token secret key in config.php.
<pre>
    // !!! change secret key
    'secret' => 'u65hb5nsd3io0e90ie9p0rzhj4yhqujh',
    'users' => [
        'admin' => [
            'name' => 'Administrator',
            // !!! change your password
            'password' => 'admin'
        ]
    ]
</pre>

# requirements
PHP 5+ and basic read/write access to edited files from it.
