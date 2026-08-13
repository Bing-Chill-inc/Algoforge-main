<script lang="ts">
	import InputField from "../common/InputField.svelte";
	import Button from "../common/Button.svelte";
	import { notifications } from "../../stores/notificationStore";
	import Link from "../common/Link.svelte";

	let email: string = "";
	let password: string = "";
	let pseudo: string = "";
	let passwordConfirm: string = "";

	let emailError: string = "";
	let passwordError: string = "";
	let pseudoError: string = "";
	let passwordConfirmError: string = "";

	// Fonction pour gérer la soumission du formulaire d'inscription
	async function handleRegister(event: Event) {
		event.preventDefault();

		emailError = "";
		passwordError = "";
		pseudoError = "";
		passwordConfirmError = "";

		if (!pseudo) {
			pseudoError = "Veuillez entrer un pseudo";
		}
		if (!email) {
			emailError = "Veuillez entrer votre email";
		} else if (!/\S+@\S+\.\S+/.test(email)) {
			emailError = "Adresse email mal formée";
		}
		if (!password) {
			passwordError = "Requis";
		}
		if (
			password.length < 8 ||
			!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)|(?=.*[a-z])(?=.*[A-Z])(?=.*\W)|(?=.*[a-z])(?=.*\d)(?=.*\W)|(?=.*[A-Z])(?=.*\d)(?=.*\W)/.test(
				password,
			)
		) {
			passwordError =
				"Doit comporter au moins 8 caractères et contenir trois des quatre types de caractères suivants : majuscules, minuscules, chiffres et symboles";
		}
		if (!passwordConfirm) {
			passwordConfirmError = "Requis";
		}
		if (password !== passwordConfirm) {
			passwordConfirmError = "Les mots de passe ne correspondent pas";
		}

		if (
			!pseudoError &&
			!emailError &&
			!passwordError &&
			!passwordConfirmError
		) {
			try {
				const response = await fetch("/api/users/register", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ pseudo, email, password }),
				});

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(
						errorData.message || "Erreur à l'inscription",
					);
				}

				const data = await response.json();
				notifications.add("success", "Inscription réussie");
				window.location.hash = "#/login";
			} catch (error) {
				if (error instanceof Error) {
					notifications.add("error", error.message);
				} else {
					notifications.add("error", "Erreur à l'inscription");
				}
			}
		}
	}
</script>

<main class="register-form">
	<form on:submit={handleRegister} novalidate>
		<InputField
			type="text"
			id="pseudo"
			label="Pseudo"
			bind:value={pseudo}
			errorMessage={pseudoError}
			required
		/>
		<InputField
			type="email"
			id="email"
			label="Email"
			bind:value={email}
			errorMessage={emailError}
			required
		/>
		<InputField
			type="password"
			id="password"
			label="Mot de passe"
			bind:value={password}
			errorMessage={passwordError}
			required
		/>
		<InputField
			type="password"
			id="password-confirm"
			label="Confirmer le mot de passe"
			bind:value={passwordConfirm}
			errorMessage={passwordConfirmError}
			required
		/>
		<Button type="submit">S'inscrire</Button>
		<div class="login-link">
			<Link href="#/login">Déjà un compte ? Se connecter</Link>
		</div>
	</form>
</main>

<style>
	form {
		width: 100%;
		max-width: 400px;
	}

	.login-link {
		margin-top: 1rem;
		display: block;
		text-align: center;
	}

	.register-form :global(button[type="submit"]) {
		display: inline-block;
		margin-top: 0;
	}
</style>
