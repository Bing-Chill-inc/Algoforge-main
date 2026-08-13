<script lang="ts">
	import { activeItem } from "../stores/activeItemStore";
	import Home from "./pages/Home.svelte";
	import Recent from "./pages/Recent.svelte";
	import Trash from "./pages/Trash.svelte";
</script>

<main class="cloud-content">
	{#if $activeItem === "Home"}
		<Home />
	{:else if $activeItem === "Clock"}
		<Recent />
	{:else if $activeItem === "Trash"}
		<Trash />
	{/if}
</main>

<style>
	.cloud-content {
		overflow: auto;
		width: 100%;
		flex: 1;
		margin-right: 10px;
		width: calc(100% - 300px);
		min-height: 450px;
		height: calc(100vh - 80px);
		background-color: var(--bgColorTeriary);
		border-radius: 20px;
		box-shadow: 0 0 6px 0 var(--titleColor);
	}
</style>
