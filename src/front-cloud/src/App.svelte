<script lang="ts">
	import Login from "./routes/Login.svelte";
	import Cloud from "./routes/Cloud.svelte";
	import Register from "./routes/Register.svelte";
	import ForgotPassword from "./routes/ForgotPassword.svelte";
	import { theme } from "./stores/themeStore";
	import { onMount } from "svelte";
	import { loadUser, isUserLoggedIn } from "./stores/userStores";
	import Test from "./routes/test.svelte";
	import NotificationManager from "./components/NotificationManager.svelte";

	let isLoading = true;

	// Définir les routes
	const routes: { [key: string]: typeof Login } = {
		"#/login": Login,
		"#/register": Register,
		"#/forgot-password": ForgotPassword,
		"#/": Cloud,
		"#/test": Test,
	};

	// Déterminer le composant actuel en fonction du hachage
	let currentHash: keyof typeof routes =
		(window.location.hash as keyof typeof routes) || "#/login";
	let CurrentComponent = routes[currentHash] || Login;

	// Écouter les changements de hachage et charger l'utilisateur
	// Split the initialization into two onMount calls
	onMount(() => {
		// First onMount to load user
		loadUser().then(() => {
			isLoading = false;
		});
	});

	// Second onMount to handle routing
	onMount(() => {
		const handleHashChange = () => {
			// Extract the base hash without query parameters
			const fullHash = window.location.hash;
			const hashParts = fullHash.split("?");
			currentHash = hashParts[0];
			const queryParams = hashParts.length > 1 ? hashParts[1] : "";

			// Check if the route exists
			if (!routes[currentHash]) {
				window.location.hash = "#/login";
			} else if (currentHash === "#/login" && isUserLoggedIn()) {
				// Preserve query parameters when redirecting
				window.location.hash =
					"#/" + (queryParams ? "?" + queryParams : "");
			} else {
				CurrentComponent = routes[currentHash];

				// Log query parameters for debugging
				if (queryParams) {
					console.log("Query parameters detected:", queryParams);
				}
			}
		};

		// Vérifier la route actuelle au chargement de la page
		handleHashChange();

		window.addEventListener("hashchange", handleHashChange);

		return () => {
			window.removeEventListener("hashchange", handleHashChange);
		};
	});
</script>

<main>
	{#if isLoading}
		<div class="loading">Chargement...</div>
	{:else}
		<svelte:component this={CurrentComponent} />
	{/if}
	<NotificationManager />
</main>

<style>
	main {
		background-color: var(--bgColor);
		width: 100%;
		height: 100%;
		margin: 0 auto;
	}

	.loading {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
		color: var(--textColor);
	}
</style>
