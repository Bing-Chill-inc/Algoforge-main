<script lang="ts">
	type ButtonOptions = {
		color?: "primary" | "secondary";
	};

	export let type: "button" | "reset" | "submit" | null = "button";
	export let options: ButtonOptions = { color: "primary" };
	export let disabled: boolean = false;
</script>

<button
	{type}
	{disabled}
	class={`${
		options.color === "primary"
			? "primaryButton"
			: options.color === "secondary"
				? "secondaryButton"
				: undefined
	}`}
>
	<slot />
</button>

<style>
	button {
		display: flex;
		padding: 12px 24px;
		font-size: 16px;
		text-decoration: none;
		border-radius: 5px;
		margin-top: 20px;
		cursor: pointer;
	}

	button:hover {
		background-color: var(--fgColorHover);
		border: 0.1vw solid var(--fgColorForward);
		box-shadow: 0 0 0.5vw var(--fgColor);
	}

	button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.primaryButton {
		color: var(--bgColor);
		background-color: var(--titleColor);
		transition:
			border 0.6s ease,
			box-shadow 0.6s ease,
			color 0.3s ease,
			background-color 0.3s ease;
		border: 0.1vw solid transparent;

		&:hover {
			background-color: var(--fgColorHover);
			border: 0.1vw solid var(--fgColorForward);
			box-shadow: 0 0 0.5vw var(--fgColor);
		}

		&:disabled {
			opacity: 0.6;
			cursor: not-allowed;
		}
	}

	.iconContainer {
		width: 16px;
		height: 16px;
	}
</style>
