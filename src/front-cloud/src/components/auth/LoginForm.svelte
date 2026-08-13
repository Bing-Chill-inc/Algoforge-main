<script lang="ts">
	import { setUser } from "../../stores/userStores";
	import InputField from "../common/InputField.svelte";
	import Checkbox from "../common/Checkbox.svelte";
	import Button from "../common/Button.svelte";
	import Link from "../common/Link.svelte";
	import { notifications } from "../../stores/notificationStore";
	import type { User } from "../../utils/types";

	let email: string = "";
	let password: string = "";
	let rememberMe: boolean = false;

	let messageError: string = "";
	let hasError = false;

	async function handleLogin(event: Event) {
		event.preventDefault();

		messageError = "";
		hasError = false;

		if (!email || !/\S+@\S+\.\S+/.test(email) || !password) {
			hasError = true;
		}

		if (!hasError) {
			try {
				const response = await fetch("/api/users/login", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ email, password }),
				});

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.message || "Erreur de connexion");
				}

				const responseData = await response.json();
				console.log(responseData);
				const user: User = responseData.data;
				setUser(user, rememberMe);
				console.log("user", user);
				notifications.add("success", "Connexion réussie");
				window.location.hash = "#/";
			} catch (error) {
				if (error instanceof Error) {
					hasError = true;
				} else {
					notifications.add("error", "Erreur de connexion");
				}
			}
		}
		if (hasError) {
			messageError = "Email et/ou mot de passe invalide.";
		}
	}
</script>

<main class="login-form">
	<form on:submit={handleLogin} novalidate>
		<InputField
			type="text"
			id="email"
			label="Email"
			bind:value={email}
			errorMessage={messageError}
			required
		/>
		<InputField
			type="password"
			id="password_show"
			label="Mot de passe"
			bind:value={password}
			errorMessage={messageError}
			required
		/>
		<Link href="#/forgot-password">Mot de passe oublié ?</Link>
		<Checkbox
			id="rememberMe"
			label="Rester connecté"
			bind:checked={rememberMe}
		/>
		<Button type="submit">Se connecter</Button>
		<div class="register-link">
			<Link href="#/register">Pas de compte ? S'inscrire</Link>
		</div>
	</form>
</main>

<style>
	.login-form {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	form {
		width: 100%;
		max-width: 400px;
	}

	.register-link {
		margin-top: 1rem;
		display: block;
		text-align: center;
	}

	.login-form :global(button[type="submit"]) {
		display: inline-block;
	}
</style>
