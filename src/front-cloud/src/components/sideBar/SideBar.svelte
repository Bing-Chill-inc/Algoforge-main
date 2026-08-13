<script lang="ts">
	import NavBar from "./NavBar/NavBar.svelte";
	import NewButtonMultiple from "./NewButtonMultiple/NewButtonMultiple.svelte";
	import UsageIndicator from "./UsageIndicator/UsageIndicator.svelte";
</script>

<main class="side-bar">
	<NewButtonMultiple />
	<NavBar />
	<UsageIndicator used={50} total={100} />
</main>

<style>
	.side-bar {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 50px;
		width: 20dvw;
		max-width: 260px;
		min-width: 200px;
		margin: 30px 0;
	}
</style>
