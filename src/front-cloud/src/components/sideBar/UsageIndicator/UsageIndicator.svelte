<script lang="ts">
	export let used: number;
	export let total: number;
</script>

<main class="usage-indicator">
	<div class="usage-indicator-bar">
		<div
			class="usage-indicator-bar-inner"
			style="width: {(used / total) * 100}%"
		></div>
	</div>
	<p class="usage-indicator-number">
		<b>{used}</b> algorithmes réalisés sur <b>{total}</b> disponibles
	</p>
</main>

<style>
	.usage-indicator {
		position: relative;
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.usage-indicator-bar {
		width: 80%;
		height: 10px;
		background-color: var(--bgColorSecondary);
		box-shadow: 0 0 4px var(--titleColor);
		border: 1px solid var(--titleColor);
		border-radius: 20px;
		overflow: hidden;
	}

	.usage-indicator-bar-inner {
		height: 100%;
		background-color: var(--titleColor);
	}

	.usage-indicator-number {
		color: var(--fgColor);
		font-size: 0.7rem;
		margin-top: 5px;
	}
</style>
