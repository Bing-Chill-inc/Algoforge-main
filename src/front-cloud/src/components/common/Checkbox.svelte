<script lang="ts">
	export let id: string;
	export let label: string;
	export let checked: boolean = false;
</script>

<div class="checkbox-container">
	<input type="checkbox" {id} bind:checked />
	<label for={id}>{label}</label>
</div>

<style>
	.checkbox-container {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 1rem;
	}

	.checkbox-container label {
		font-size: 16px;
		color: var(--fgColor);
	}
</style>
