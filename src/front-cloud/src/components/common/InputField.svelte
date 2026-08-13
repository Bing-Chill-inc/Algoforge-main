<script lang="ts">
	export let type: string = "text";
	export let id: string;
	export let label: string;
	export let value: string = "";
	export let errorMessage: string = "";
	export let required: boolean = false;
	export let disabled: boolean = false;

	let isPasswordVisible = false;

	function togglePasswordVisibility() {
		isPasswordVisible = !isPasswordVisible;
	}
</script>

<div class="user-box">
	<div class="input-container">
		<input
			type={type === "password"
				? isPasswordVisible
					? "text"
					: "password"
				: type}
			{id}
			bind:value
			{required}
			{disabled}
			class={value ? "has-value" : ""}
		/>
		{#if id === "password_show"}
			<button
				type="button"
				class="toggle-password"
				on:click={togglePasswordVisibility}
				aria-label={isPasswordVisible
					? "Masquer le mot de passe"
					: "Afficher le mot de passe"}
				{disabled}
			>
				{#if isPasswordVisible}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<path
							d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
						/>
						<circle cx="12" cy="12" r="3" />
					</svg>
				{:else}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<path
							d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
						/>
						<line x1="1" y1="1" x2="23" y2="23" />
					</svg>
				{/if}
			</button>
		{/if}
		<label for={id}>{label}</label>
	</div>
	{#if errorMessage}
		<span class="error-message">{errorMessage}</span>
	{/if}
</div>

<style>
	.user-box {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		margin-bottom: 35px;
		position: relative;
	}

	.user-box label {
		position: absolute;
		top: 0;
		left: 0;
		padding: 10px 0;
		font-size: 16px;
		color: var(--fgColor);
		pointer-events: none;
		transition: 0.5s;
	}

	.user-box input {
		width: 100%;
		padding: 10px 0;
		font-size: 16px;
		margin-bottom: 5px;
		border: none;
		border-bottom: 1px solid var(--fgColorForward);
		outline: none;
		background: transparent;
		color: var(--fgColor);
	}

	.user-box input:focus ~ label,
	.user-box input.has-value ~ label {
		top: -20px;
		left: 0;
		color: var(--titleColor);
		font-size: 12px;
	}

	.user-box input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.error-message {
		color: var(--errorColor);
		font-size: 12px;
	}

	.input-container {
		position: relative;
		width: 100%;
	}

	.toggle-password {
		position: absolute;
		right: 0;
		top: 50%;
		transform: translateY(-50%);
		background: none;
		border: none;
		cursor: pointer;
		padding: 5px;
		color: var(--fgColor);
		opacity: 0.7;
		transition: opacity 0.2s;
	}

	.toggle-password:hover:not(:disabled) {
		opacity: 1;
	}

	.toggle-password:disabled {
		cursor: not-allowed;
		opacity: 0.4;
	}

	svg {
		fill: var(--bgColor);
	}
</style>
