<script lang="ts">
	import AuthLayout from "../components/layout/AuthLayout.svelte";
	import ForgotPasswordForm from "../components/auth/ForgotPasswordForm.svelte";
	import PublicOnlyRoute from "./PublicOnlyRoute.svelte";
</script>

<PublicOnlyRoute />
<main class="forgot-password">
	<AuthLayout title="Mot de passe oublié">
		<ForgotPasswordForm />
	</AuthLayout>
</main>
