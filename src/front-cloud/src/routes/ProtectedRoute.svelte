<script lang="ts">
	import { onMount } from "svelte";
	import { isUserLoggedIn, loadUser } from "../stores/userStores";

	// Rediriger en fonction de l'état de connexion
	onMount(() => {
		if (!isUserLoggedIn()) {
			// Rediriger vers la page de login si l'utilisateur n'est pas connecté
			window.location.hash = "#/login";
		}
	});
</script>

<slot />
