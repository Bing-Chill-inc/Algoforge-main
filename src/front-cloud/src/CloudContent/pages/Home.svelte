<script lang="ts">
	import { getUser } from "../../stores/userStores";
	import { fetchAlgosByUserId, getAlgos } from "../../stores/algoStore";
	import type { Algo, User } from "../../utils/types";
	import AlgoList from "../components/AlgoList.svelte";
	import { onMount } from "svelte";

	const user: User | null = getUser();
	let loading: boolean = true;
	let error: string = "";
	let algos: Algo[] = [];

	onMount(async () => {
		try {
			await fetchAlgosByUserId();
			algos = getAlgos();
		} catch (e: any) {
			error = e?.message;
		} finally {
			loading = false;
		}
	});
</script>

<main class="mainContent">
	<h1>Bienvenue dans ta Forge, <b>{user?.pseudo}</b> !</h1>
	<AlgoList {algos} {loading} {error} />
</main>

<style>
	.mainContent {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		height: 100%;
		width: calc(100% - 80px);
		padding: 0 40px;
	}
	h1 {
		color: var(--fgColor);
		font-size: 2.5em;
		font-weight: 600;
	}
</style>
