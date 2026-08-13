<script lang="ts">
	export let href: string;
</script>

<a {href} class="link">
	<slot />
</a>

<style>
	.link {
		color: var(--fgColor);
		text-decoration: none;
	}

	.link:hover {
		text-decoration: underline;
	}
</style>
