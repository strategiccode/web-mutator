<div id="login">
	<div class="panel">
		<div class="panel-heading">LOGIN</div>
		<div class="panel-body">
			<form method="POST" action="">
				<div <?= isset($errors['name']) ? 'class="has-error"' : '' ?>>
					<label for="name">Name</label>
					<input id="name" type="text" name="name" required autofocus <?= isset($_POST['name']) ? 'value="' . htmlentities($_POST['name']) . '"' : '' ?>>
					<?php if(isset($errors['name'])) : ?>
						<span class="error">
							<strong><?= $errors['name'] ?></strong>
						</span>
					<?php endif ?>
				</div>
				<div <?= isset($errors['password']) ? 'class="has-error"' : '' ?>>
					<label for="password">Password</label>
					<input id="password" type="password" name="password" required <?= isset($_POST['password']) ? 'value="' . htmlentities($_POST['password']) . '"' : '' ?>>
					<?php if(isset($errors['password'])) : ?>
						<span class="error">
							<strong><?= $errors['password'] ?></strong>
						</span>
					<?php endif ?>
				</div>
				<div>
					<button type="submit" name="login"><span class="fa fa-sign-in"></span>login</button>
				</div>
			</form>
		</div>
	</div>
</div>
<script type="text/javascript">
	$('#name,#password').on('change', function (e) {
		$(e.target).parent().removeClass('has-error');
	});
</script>