<script lang="ts">
	import userStore from "../stores/userStores";
	import ProtectedRoute from "./ProtectedRoute.svelte";
	import { onMount } from "svelte";
	import type { User } from "../utils/types";

	let currentUser: User | null = null;

	// Lorsque ce composant est monté, on charge l'utilisateur
	onMount(async () => {
		userStore.subscribe((user) => {
			currentUser = user;
		});
	});

	// Abonnement au store de l'utilisateur
	userStore.subscribe((user) => {
		currentUser = user;
	});
</script>

<ProtectedRoute>
	<h1>Zone protégée</h1>
	<p>Bienvenue, {currentUser?.pseudo} !</p>
</ProtectedRoute>
