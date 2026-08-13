<script lang="ts">
	export let isOpen = false;
	export let onClose = () => {};
	import {
		getUser,
		setUser,
		isRememberMeChecked,
		getSessionData,
		extendCookieExpiration,
	} from "../../stores/userStores";
	import type { User } from "../../utils/types";
	import InputField from "../common/InputField.svelte";
	import { notifications } from "../../stores/notificationStore";

	const user: User | null = getUser();
	let imageUrl: string = user?.urlPfp || "";

	// Variables pour les champs de formulaire
	let pseudo: string = user?.pseudo || "";
	let currentPassword: string = "";
	let newPassword: string = "";
	let confirmPassword: string = "";

	// Variables pour les messages d'erreur
	let pseudoError: string = "";
	let imageUrlError: string = "";
	let currentPasswordError: string = "";
	let newPasswordError: string = "";
	let confirmPasswordError: string = "";

	// Variable pour indiquer si une requête est en cours
	let isLoading = false;

	// Variable pour gérer les onglets
	let activeTab = "photo"; // "photo", "pseudo", "password"

	function closeModal() {
		// Réinitialiser les champs du formulaire
		imageUrl = user?.urlPfp || "";
		pseudo = user?.pseudo || "";
		currentPassword = "";
		newPassword = "";
		confirmPassword = "";

		onClose();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === "Escape") {
			closeModal();
		}
	}

	function setActiveTab(tab: string) {
		activeTab = tab;
	}

	async function handleSave() {
		// Réinitialiser les erreurs
		pseudoError = "";
		imageUrlError = "";
		currentPasswordError = "";
		newPasswordError = "";
		confirmPasswordError = "";

		let hasError = false;

		// Validation selon l'onglet actif
		if (activeTab === "photo") {
			// Pas de validation spécifique pour l'URL de l'image
		} else if (activeTab === "pseudo" && !pseudo) {
			pseudoError = "Le pseudo est requis";
			hasError = true;
		} else if (activeTab === "password") {
			if (newPassword) {
				if (
					newPassword.length < 8 ||
					!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)|(?=.*[a-z])(?=.*[A-Z])(?=.*\W)|(?=.*[a-z])(?=.*\d)(?=.*\W)|(?=.*[A-Z])(?=.*\d)(?=.*\W)/.test(
						newPassword,
					)
				) {
					newPasswordError =
						"Doit comporter au moins 8 caractères et contenir trois des quatre types de caractères suivants : majuscules, minuscules, chiffres et symboles";
					hasError = true;
				}

				if (newPassword !== confirmPassword) {
					confirmPasswordError =
						"Les mots de passe ne correspondent pas";
					hasError = true;
				}
			} else {
				newPasswordError = "Le nouveau mot de passe est requis";
				hasError = true;
			}
		}

		// Validation du mot de passe actuel (requis pour toutes les modifications)
		if (!currentPassword) {
			currentPasswordError =
				"Mot de passe actuel requis pour effectuer des changements";
			hasError = true;
		}

		if (!hasError) {
			try {
				isLoading = true;

				// Préparation des données à envoyer selon l'onglet actif
				const updateData: any = {
					currentPassword,
				};

				if (activeTab === "photo") {
					updateData.urlPfp = imageUrl;
				} else if (activeTab === "pseudo") {
					updateData.pseudo = pseudo;
				} else if (activeTab === "password") {
					updateData.newPassword = newPassword;
				}

				const dataUser = getSessionData();

				// Appel API pour mettre à jour le profil
				const response = await fetch(`/api/users/${user?.id}`, {
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${dataUser?.token}`,
					},
					body: JSON.stringify(updateData),
				});

				const responseData = await response.json();

				if (!response.ok) {
					// Gestion des erreurs retournées par l'API
					if (responseData.data) {
						// Affichage des erreurs spécifiques
						if (responseData.data.pseudo)
							pseudoError = responseData.data.pseudo;
						if (responseData.data.urlPfp)
							imageUrlError = responseData.data.urlPfp;
						if (responseData.data.currentPassword)
							currentPasswordError =
								responseData.data.currentPassword;
						if (responseData.data.newPassword)
							newPasswordError = responseData.data.newPassword;
					} else {
						// Message d'erreur général
						notifications.add(
							"error",
							responseData.message ||
								"Erreur lors de la mise à jour du profil",
						);
					}
				} else {
					// Mise à jour réussie
					if (responseData.data) {
						// Mise à jour du store utilisateur
						setUser(responseData.data, isRememberMeChecked());
						extendCookieExpiration();
					}
					notifications.add(
						"success",
						"Profil mis à jour avec succès",
					);
					closeModal();

					window.location.reload();
				}
			} catch (error) {
				console.error(
					"Erreur lors de la mise à jour du profil:",
					error,
				);
				notifications.add("error", "Erreur de connexion au serveur");
			} finally {
				isLoading = false;
			}
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
	<div
		class="modal-overlay"
		role="dialog"
		aria-modal="true"
		aria-labelledby="modal-title"
	>
		<div class="modal-container">
			<div class="modal-header">
				<h2 id="modal-title">Modifier votre compte</h2>
				<button
					type="button"
					class="close-button"
					on:click={closeModal}
					aria-label="Fermer"
					disabled={isLoading}
				>
					<svg viewBox="0 0 24 24">
						<path
							d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
						/>
					</svg>
				</button>
			</div>

			<div class="tabs-container">
				<button
					class="tab-button"
					class:active={activeTab === "photo"}
					on:click={() => setActiveTab("photo")}
					disabled={isLoading}
				>
					Photo de profil
				</button>
				<button
					class="tab-button"
					class:active={activeTab === "pseudo"}
					on:click={() => setActiveTab("pseudo")}
					disabled={isLoading}
				>
					Pseudo
				</button>
				<button
					class="tab-button"
					class:active={activeTab === "password"}
					on:click={() => setActiveTab("password")}
					disabled={isLoading}
				>
					Mot de passe
				</button>
			</div>

			<div class="modal-content">
				<main class="profile-form">
					{#if activeTab === "photo"}
						<div class="profile-picture-container">
							<div
								class="profile-picture"
								class:has-image={imageUrl}
							>
								{#if imageUrl}
									<img src={imageUrl} alt="Profile preview" />
								{:else}
									<svg viewBox="0 0 24 24">
										<path
											d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
										/>
									</svg>
								{/if}
							</div>
							<InputField
								type="text"
								id="image_url"
								label="URL de l'image"
								bind:value={imageUrl}
								errorMessage={imageUrlError}
								disabled={isLoading}
							/>
						</div>
					{:else if activeTab === "pseudo"}
						<div class="form-fields">
							<InputField
								type="text"
								id="pseudo"
								label="Pseudo"
								bind:value={pseudo}
								errorMessage={pseudoError}
								required
								disabled={isLoading}
							/>
						</div>
					{:else if activeTab === "password"}
						<div class="form-fields">
							<InputField
								type="password"
								id="password_show"
								label="Nouveau mot de passe"
								bind:value={newPassword}
								errorMessage={newPasswordError}
								disabled={isLoading}
							/>
							<InputField
								type="password"
								id="password-confirm"
								label="Confirmer le mot de passe"
								bind:value={confirmPassword}
								errorMessage={confirmPasswordError}
								disabled={isLoading}
							/>
						</div>
					{/if}

					<div class="current-password-section">
						<h3>Mot de passe actuel</h3>
						<p class="password-info">
							Requis pour toute modification
						</p>
						<InputField
							type="password"
							id="password_current"
							label="Mot de passe actuel"
							bind:value={currentPassword}
							errorMessage={currentPasswordError}
							disabled={isLoading}
							required
						/>
					</div>
				</main>
			</div>

			<div class="modal-footer">
				<button
					type="button"
					class="cancel-button"
					on:click={closeModal}
					disabled={isLoading}
				>
					Annuler
				</button>
				<button
					type="button"
					class="save-button"
					on:click={handleSave}
					disabled={isLoading}
				>
					{#if isLoading}
						Enregistrement...
					{:else}
						Enregistrer
					{/if}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.modal-container {
		background-color: var(--bgColor);
		border-radius: 12px;
		width: 90%;
		max-width: 600px;
		max-height: 90vh;
		overflow-y: auto;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
		display: flex;
		flex-direction: column;
		border: 1px solid var(--borderColor);
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16px 20px;
		border-bottom: 1px solid var(--borderColor2);
	}

	.modal-header h2 {
		margin: 0;
		font-size: 1.5rem;
		color: var(--titleColor);
	}

	.close-button {
		background: none;
		border: none;
		cursor: pointer;
		width: 30px;
		height: 30px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
	}

	.close-button:hover {
		background-color: var(--fgColorTransparent);
	}

	.close-button svg {
		width: 24px;
		height: 24px;
		fill: var(--fgColor);
	}

	.tabs-container {
		display: flex;
		border-bottom: 1px solid var(--borderColor2);
		background-color: var(--bgColorSecondary);
	}

	.tab-button {
		flex: 1;
		padding: 12px 16px;
		background: none;
		border: none;
		cursor: pointer;
		font-size: 14px;
		color: var(--fgColor);
		transition: all 0.2s ease;
		border-bottom: 3px solid transparent;
	}

	.tab-button.active {
		color: var(--titleColor);
		border-bottom: 3px solid var(--titleColor);
		font-weight: 500;
	}

	.tab-button:hover:not(.active):not(:disabled) {
		background-color: rgba(255, 255, 255, 0.05);
	}

	.tab-button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.modal-content {
		padding: 20px;
		flex-grow: 1;
	}

	.modal-footer {
		display: flex;
		justify-content: flex-end;
		padding: 16px 20px;
		border-top: 1px solid var(--borderColor2);
		gap: 12px;
	}

	.cancel-button,
	.save-button {
		padding: 8px 16px;
		border-radius: 6px;
		font-size: 14px;
		cursor: pointer;
		border: none;
	}

	.cancel-button {
		background-color: var(--bgColorSecondary);
		color: var(--fgColor);
	}

	.save-button {
		background-color: var(--titleColor);
		color: white;
	}

	.profile-form {
		width: 100%;
	}

	.profile-picture-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
		margin-bottom: 30px;
	}

	.profile-picture {
		width: 128px;
		height: 128px;
		border-radius: 50%;
		background-color: var(--bgColorSecondary);
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 2px solid var(--borderColor);
		margin-bottom: 10px;
	}

	.profile-picture svg {
		width: 64px;
		height: 64px;
		fill: var(--fgColor);
	}

	.profile-picture img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.form-fields {
		margin-top: 20px;
	}

	.current-password-section {
		margin-top: 30px;
		border-top: 1px solid var(--borderColor2);
		padding-top: 20px;
	}

	.current-password-section h3 {
		color: var(--titleColor);
		font-size: 1.1rem;
		margin-bottom: 5px;
	}

	.password-info {
		color: var(--fgColorForward);
		font-size: 0.9rem;
		margin-bottom: 15px;
	}
</style>
