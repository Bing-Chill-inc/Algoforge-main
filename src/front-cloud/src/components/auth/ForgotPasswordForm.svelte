<script lang="ts">
	import InputField from "../common/InputField.svelte";
	import Button from "../common/Button.svelte";

	let email: string = "";
	let emailError: string = "";

	// Fonction pour gérer la soumission du formulaire de mot de passe oublié
	async function handleForgotPassword(event: Event) {
		event.preventDefault();

		emailError = "";

		if (!email) {
			emailError = "Veuillez entrer votre email";
		} else if (!/\S+@\S+\.\S+/.test(email)) {
			emailError = "Veuillez entrer une adresse email valide";
		}

		if (!emailError) {
			try {
				const response = await fetch("/api/users/recover", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ email }),
				});

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(
						errorData.message ||
							"Erreur lors de la réinitialisation du mot de passe",
					);
				}

				const data = await response.json();
				console.log("Email de réinitialisation envoyé :", data);
				alert(
					"Un email de réinitialisation de mot de passe vous a été envoyé",
				);
			} catch (error) {
				if (error instanceof Error) {
					alert(error.message);
				} else {
					alert("Une erreur inconnue est survenue");
				}
			}
		}
	}
</script>

<main class="forgot-password-form">
	<form on:submit={handleForgotPassword} novalidate>
		<InputField
			type="email"
			id="email"
			label="Email"
			bind:value={email}
			errorMessage={emailError}
			required
		/>
		<Button type="submit">Envoyer</Button>
	</form>
</main>

<style>
	form {
		width: 100%;
		max-width: 400px;
	}

	.forgot-password-form :global(button[type="submit"]) {
		display: inline-block;
		margin-top: 0;
	}
</style>
