<script lang="ts">
	import { listTheme } from "../../utils/themes";
	import { theme } from "../../stores/themeStore";
</script>

<main class="select-theme">
	<div class="select-wrapper">
		<select name="select-theme" id="select-theme" bind:value={$theme}>
			{#each listTheme as theme}
				<option value={theme.name}>{theme.name}</option>
			{/each}
		</select>
		<div class="select-arrow">
			<svg viewBox="0 0 24 24">
				<path d="M7 10l5 5 5-5z" />
			</svg>
		</div>
	</div>
</main>

<style>
	.select-theme {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
	}

	.select-wrapper {
		position: relative;
		width: 100%;
	}

	select {
		width: 100%;
		background-color: transparent;
		border: 1px solid var(--borderColor);
		border-radius: 30px;
		color: var(--fgColor);
		cursor: pointer;
		padding: 10px;
		text-align: center;
		font-weight: 500;
		transition: background-color 0.2s;
		appearance: none;
		-webkit-appearance: none;
		-moz-appearance: none;
		text-align-last: center;
		padding-right: 30px;
	}

	select:hover {
		background-color: var(--fgColorTransparent);
	}

	select:focus {
		outline: none;
	}

	.select-arrow {
		position: absolute;
		right: 10px;
		top: 50%;
		transform: translateY(-50%);
		pointer-events: none;
	}

	.select-arrow svg {
		width: 20px;
		height: 20px;
		fill: var(--fgColor);
	}
</style>
