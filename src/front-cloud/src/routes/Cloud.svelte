<script lang="ts">
	import ProtectedRoute from "./ProtectedRoute.svelte";
	import CloudContent from "../CloudContent/CloudContent.svelte";
	import SideBar from "../components/sideBar/SideBar.svelte";
	import MenuCompte from "../components/MenuCompte/MenuCompte.svelte";
	import Header from "../components/header/Header.svelte";
</script>

<ProtectedRoute />
<main class="cloud">
	<Header />
	<div class="cloud-wrapper">
		<SideBar />
		<CloudContent />
	</div>
</main>

<style>
	.cloud-wrapper {
		width: 100%;
		height: 100%;
		display: flex;
	}
</style>
