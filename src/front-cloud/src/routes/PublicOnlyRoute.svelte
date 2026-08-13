<script lang="ts">
	import { onMount } from "svelte";
	import { isUserLoggedIn, loadUser } from "../stores/userStores";

	// Rediriger en fonction de l'état de connexion
	onMount(() => {
		if (isUserLoggedIn()) {
			// Rediriger vers la page d'accueil si l'utilisateur est déjà connecté
			window.location.hash = "#/";
		}
	});
</script>

<slot />
