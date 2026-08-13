<script lang="ts">
	import AuthLayout from "../components/layout/AuthLayout.svelte";
	import LoginForm from "../components/auth/LoginForm.svelte";
	import PublicOnlyRoute from "./PublicOnlyRoute.svelte";
</script>

<PublicOnlyRoute />
<main class="login">
	<AuthLayout title="Connexion">
		<LoginForm />
	</AuthLayout>
</main>
