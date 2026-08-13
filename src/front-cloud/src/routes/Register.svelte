<script lang="ts">
	import AuthLayout from "../components/layout/AuthLayout.svelte";
	import RegisterForm from "../components/auth/RegisterForm.svelte";
	import PublicOnlyRoute from "./PublicOnlyRoute.svelte";
</script>

<PublicOnlyRoute />
<main class="register">
	<AuthLayout title="Inscription">
		<RegisterForm />
	</AuthLayout>
</main>
