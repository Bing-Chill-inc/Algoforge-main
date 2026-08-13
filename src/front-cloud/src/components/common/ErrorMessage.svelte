<script lang="ts">
	export let message: string;
</script>

{#if message}
	<span class="error-message">{message}</span>
{/if}

<style>
	.error-message {
		color: var(--errorColor);
		font-size: 12px;
	}
</style>
