<script lang="ts">
	import { onMount } from "svelte";
	import Theme from "./Theme.svelte";
	import ProfileForm from "./ProfileForm.svelte"; // Ajout de l'import
	import { logout, getUser } from "../../stores/userStores";
	import { notifications } from "../../stores/notificationStore";
	import type { User } from "../../utils/types";

	let isMenuOpen = false;
	let isProfileModalOpen = false;

	const user: User | null = getUser();

	const toggleMenu = () => {
		isMenuOpen = !isMenuOpen;
	};

	const toggleProfileModal = () => {
		isProfileModalOpen = !isProfileModalOpen;
	};

	function handleLogout() {
		logout();
		notifications.add("success", "Déconnexion réussie");
		window.location.hash = "#/login";
	}

	onMount(() => {
		// Vérifier si le paramètre openProfileModal est présent dans l'URL
		const urlParams = new URLSearchParams(window.location.search);
		const hashParams = new URLSearchParams(
			window.location.hash.replace("#/?", ""),
		);

		if (
			urlParams.get("openProfileModal") === "true" ||
			hashParams.get("openProfileModal") === "true"
		) {
			isProfileModalOpen = true;
			// Nettoyer l'URL pour éviter que le modal s'ouvre à chaque rafraîchissement
			const cleanUrl =
				window.location.pathname + window.location.hash.split("?")[0];
			window.history.replaceState({}, document.title, cleanUrl);
		}

		const closeMenu = (event: MouseEvent) => {
			if (!(event.target as HTMLElement).closest(".menu-container")) {
				isMenuOpen = false;
			}
		};
		document.addEventListener("click", closeMenu, true);
		return () => document.removeEventListener("click", closeMenu, true);
	});
</script>

<ProfileForm isOpen={isProfileModalOpen} onClose={toggleProfileModal} />
<main class="menu-container">
	<button class="menu-icon" on:click={toggleMenu} aria-label="Toggle menu">
		<div class="avatar-circle">
			{#if user?.urlPfp}
				<img src={user.urlPfp} alt="Avatar" />
			{:else}
				<svg
					id="boutonCompte"
					class={isMenuOpen ? "menu-open" : ""}
					viewBox="0 0 24 24"
				>
					<path
						d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
					/>
				</svg>
			{/if}
		</div>
	</button>

	{#if isMenuOpen}
		<div class="menu">
			<div class="menu-header">
				<div class="user-avatar">
					{#if user?.urlPfp}
						<img src={user.urlPfp} alt="Avatar" />
					{:else}
						<svg viewBox="0 0 24 24">
							<path
								d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
							/>
						</svg>
					{/if}
				</div>
				<div class="user-info">
					<p class="greeting">
						{user?.pseudo || "utilisateur"}
					</p>
					<p class="email">{user?.adresseMail}</p>
				</div>
				<button
					class="close-button"
					on:click={toggleMenu}
					aria-label="close-button"
				>
					<svg viewBox="0 0 24 24">
						<path
							d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
						/>
					</svg>
				</button>
			</div>

			<div class="menu-action">
				<Theme />
			</div>

			<div class="menu-items">
				<button
					class="menu-item account-action"
					on:click={() => {
						toggleProfileModal();
						toggleMenu();
					}}
				>
					<svg viewBox="0 0 24 24">
						<path
							d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
						/>
					</svg>
					<span>Modifier votre compte</span>
				</button>

				<button class="menu-item logout-action" on:click={handleLogout}>
					<svg viewBox="0 0 24 24">
						<path
							d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"
						/>
					</svg>
					<span>Se déconnecter</span>
				</button>
			</div>
		</div>
	{/if}
</main>

<style>
	.menu-container {
		position: relative;
		display: inline-block;
	}

	.menu-icon {
		border: none;
		background: none;
		padding: 0;
		margin: 0;
		width: 40px;
		height: 40px;
		cursor: pointer;
	}

	.avatar-circle {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--bgColorSecondary);
		border: 2px solid var(--borderColor);
	}

	.menu {
		position: absolute;
		top: calc(100% + 10px);
		right: 0;
		background-color: var(--bgColor);
		border-radius: 12px;
		width: 360px;
		font-size: 14px;
		display: flex;
		flex-direction: column;
		z-index: 999;
		border: 1px solid var(--borderColor);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		overflow: hidden;
	}

	.menu-header {
		padding: 20px;
		display: flex;
		position: relative;
		border-bottom: 1px solid var(--borderColor2);
	}

	.user-avatar {
		width: 70px;
		height: 70px;
		border-radius: 50%;
		overflow: hidden;
		margin-right: 15px;
		background-color: var(--bgColorSecondary);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.user-avatar svg {
		width: 100%;
		height: 100%;
		fill: var(--fgColor);
	}

	.user-info {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: start;
		max-width: 235px;
	}

	.greeting {
		font-size: 1.5rem;
		font-weight: 500;
		margin: 0 0 5px 0;
		color: var(--fgColor);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 100%;
	}

	.email {
		font-size: 0.9rem;
		margin: 0;
		color: var(--fgColorForward);
	}

	.close-button {
		position: absolute;
		top: 10px;
		right: 10px;
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

	.menu-action {
		padding: 15px 20px;
		border-bottom: 1px solid var(--borderColor2);
	}

	.menu-items {
		padding: 10px 0;
		border-bottom: 1px solid var(--borderColor2);
	}

	.menu-item {
		display: flex;
		align-items: center;
		padding: 12px 20px;
		width: 100%;
		background: none;
		border: none;
		cursor: pointer;
		color: var(--fgColor);
		text-align: left;
	}

	.menu-item:hover {
		background-color: var(--fgColorTransparent);
	}

	.menu-item svg {
		width: 24px;
		height: 24px;
		margin-right: 15px;
		fill: var(--fgColor);
	}

	#boutonCompte {
		cursor: pointer;
		fill: var(--fgColor);
		width: 100%;
		height: 100%;
	}

	#boutonCompte:hover {
		fill: var(--fgColorHover);
	}

	#boutonCompte:active {
		scale: 0.9;
		fill: var(--titleColor);
	}

	#boutonCompte.menu-open {
		fill: var(--titleColor) !important;
	}
</style>
