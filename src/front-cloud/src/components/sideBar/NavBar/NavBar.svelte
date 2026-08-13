<script lang="ts">
	import DynamicAsset from "./assets/DynamicAsset.svelte";
	import { activeItem } from "../../../stores/activeItemStore";

	function setActiveItem(item: string) {
		activeItem.set(item);
	}
</script>

<main class="nav-bar">
	<button
		type="button"
		class="nav-item"
		class:active={$activeItem === "Home"}
		on:click={() => setActiveItem("Home")}
		on:keydown={(e) => e.key === "Enter" && setActiveItem("Home")}
		aria-label="Home"
	>
		<DynamicAsset assetIdentifier="Home" />
		Accueil
	</button>
	<button
		type="button"
		class="nav-item"
		class:active={$activeItem === "Clock"}
		on:click={() => setActiveItem("Clock")}
		on:keydown={(e) => e.key === "Enter" && setActiveItem("Clock")}
		aria-label="Clock"
	>
		<DynamicAsset assetIdentifier="Clock" />
		Récent
	</button>
	<button type="button" class="nav-item disabled" aria-label="Shared">
		<DynamicAsset assetIdentifier="Shared" />
		Partagé avec moi
	</button>
	<button
		type="button"
		class="nav-item"
		class:active={$activeItem === "Trash"}
		on:click={() => setActiveItem("Trash")}
		on:keydown={(e) => e.key === "Enter" && setActiveItem("Trash")}
		aria-label="Trash"
	>
		<DynamicAsset assetIdentifier="Trash" />
		Corbeille
	</button>
</main>

<style>
	.nav-bar {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 10px;
	}

	.nav-item.active {
		border: none;
		fill: var(--bgColor);
		color: var(--bgColor);
		background-color: var(--titleColor);
		box-shadow: 0 0 0.5vw var(--titleColor);
		pointer-events: none;
	}

	.nav-item {
		display: flex;
		align-items: center;
		gap: 20px;
		margin-left: 20px;
		font-size: 1rem;
		width: 80%;
		padding: 10px;
		padding-left: 20px;
		border-radius: 10px;
		font-weight: 700;
		color: var(--fgColor);
		fill: var(--fgColor);
		border: none;
		background-color: transparent;
		user-select: none;
		transition:
			box-shadow 0.5s ease,
			color 0.3s ease,
			background-color 0.3s ease-in-out;

		&.disabled {
			color: var(--fgColorDisabled);
			fill: var(--fgColorDisabled);
			border-color: var(--fgColorDisabled);
			cursor: not-allowed;
		}
	}

	.nav-item:is(:not(.disabled):hover) {
		border: none;
		cursor: pointer;
		fill: var(--bgColor);
		color: var(--bgColor);
		background-color: var(--fgColorHover);
		box-shadow: 0 0 0.5vw var(--fgColor);
		font-weight: 700;
	}
</style>
