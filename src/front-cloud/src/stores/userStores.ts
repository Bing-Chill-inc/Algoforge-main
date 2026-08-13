import { writable, get } from "svelte/store";
import {
	theme,
	getPositionTheme,
	getThemeNameFromPosition,
} from "./themeStore";
import { getCookie } from "../utils/utils";
import type { User } from "../utils/types";

// Création du store utilisateur
const userStore = writable<User | null>(null);

// Clé pour le localStorage pour synchroniser entre les onglets
const AUTH_STATUS_KEY = "auth_status";

// Écouter les changements de localStorage entre les onglets
if (typeof window !== "undefined") {
	window.addEventListener("storage", (event) => {
		if (event.key === AUTH_STATUS_KEY) {
			if (event.newValue === "logged_out") {
				// Un autre onglet s'est déconnecté, déconnecter cet onglet aussi
				clearLocalAuth();
				userStore.set(null);
				// Rediriger vers la page de connexion sans recharger la page
				if (document.location.hash !== "#/login") {
					document.location.hash = "#/login";
				}
			} else if (
				event.newValue === "logged_in" &&
				isRememberMeChecked()
			) {
				// Un autre onglet s'est connecté, rafraîchir cette page
				window.location.reload();
			}
		}
	});
}

// Fonction pour enregistrer l'utilisateur après connexion
export function setUser(user: User, rememberMe: boolean) {
	// Stocker l'utilisateur en mémoire
	userStore.set(user);

	// Extraire le token et l'ID
	const token = user.tokens?.[0]?.token;
	const userId = user.id.toString();
	const tokenExpiration = user.tokens?.[0]?.dateExpiration;

	if (token) {
		// Calculer la durée de validité du token en secondes
		const expirationTime = tokenExpiration
			? Math.floor((tokenExpiration - Date.now()) / 1000)
			: 604800; // 7 jours par défaut

		if (rememberMe) {
			// Stockage sécurisé en cookie (expire selon la date d'expiration du token)
			document.cookie = `authToken=${token}; path=/; max-age=${expirationTime}; Secure; SameSite=Strict`;
			document.cookie = `userId=${userId}; path=/; max-age=${expirationTime}; Secure; SameSite=Strict`;
		} else {
			// Stocker dans sessionStorage
			sessionStorage.setItem("authToken", token);
			sessionStorage.setItem("userId", userId);
		}

		// Indiquer que l'utilisateur est connecté
		localStorage.setItem(AUTH_STATUS_KEY, "logged_in");
	}
}

// Fonction pour nettoyer les données d'authentification locales
function clearLocalAuth() {
	document.cookie = "authToken=; path=/; max-age=0";
	document.cookie = "userId=; path=/; max-age=0";
	sessionStorage.removeItem("authToken");
	sessionStorage.removeItem("userId");
}

// Fonction pour récupérer le token et l'ID utilisateur
export function getSessionData() {
	// Vérifier sessionStorage
	const sessionToken = sessionStorage.getItem("authToken");
	const sessionUserId = sessionStorage.getItem("userId");

	if (sessionToken && sessionUserId) {
		return { token: sessionToken, userId: sessionUserId };
	}

	// Vérifier les cookies
	const cookies = document.cookie ? document.cookie.split("; ") : [];
	const tokenCookie = cookies.find((row) => row.startsWith("authToken="));
	const userIdCookie = cookies.find((row) => row.startsWith("userId="));

	const token = tokenCookie ? tokenCookie.split("=")[1] : null;
	const userId = userIdCookie
		? parseInt(userIdCookie.split("=")[1], 10)
		: null;

	if (token && userId) {
		return { token, userId };
	}

	return null;
}

// Fonction pour charger les infos utilisateur au démarrage
export async function loadUser() {
	const sessionData = getSessionData();

	if (sessionData) {
		try {
			const response = await fetch(`/api/users/${sessionData.userId}`, {
				method: "GET",
				headers: {
					Authorization: `Bearer ${sessionData.token}`,
				},
			});

			if (!response.ok) throw new Error("Utilisateur non trouvé");
			const responseData = await response.json();

			// Extraire les données de l'utilisateur
			const user: User = responseData.data || responseData;

			// Vérifier si le token a expiré
			const tokenExpiration = user.tokens?.[0]?.dateExpiration;
			if (tokenExpiration && tokenExpiration < Date.now()) {
				logout();
				return;
			}

			// // Synchroniser le thème
			// if (user.theme !== undefined && user.theme !== null) {
			// 	const currentThemePosition = getPositionTheme(
			// 		getCookie("theme"),
			// 	);

			// 	if (currentThemePosition !== user.theme) {
			// 		theme.set(getThemeNameFromPosition(user.theme));
			// 	}
			// }

			// Stocker l'utilisateur dans le store
			userStore.set(user);
			extendCookieExpiration();
		} catch (error) {
			console.error("Erreur lors du chargement de l'utilisateur:", error);
			logout();
		}
	}
}

// Fonction pour se déconnecter
export function logout() {
	userStore.set(null);

	// Nettoyer les cookies et le sessionStorage
	clearLocalAuth();

	// Signaler aux autres onglets que l'utilisateur s'est déconnecté
	localStorage.setItem(AUTH_STATUS_KEY, "logged_out");

	document.location.hash = "#/login";
}

// Fonction pour vérifier si l'utilisateur est connecté
export function isUserLoggedIn() {
	return get(userStore) !== null;
}

// Fonctions pour récupérer les informations de l'utilisateur
export function getUser() {
	return get(userStore);
}

// Fonction pour savoir si rememberMe est coché
export function isRememberMeChecked() {
	const cookies = document.cookie ? document.cookie.split("; ") : [];
	const tokenCookie = cookies.find((row) => row.startsWith("authToken="));

	return tokenCookie !== undefined;
}

// Fonction pour prolonger la durée des cookies de 48 heures
export function extendCookieExpiration() {
	const sessionData = getSessionData();

	if (sessionData && isRememberMeChecked()) {
		const extensionTime = 48 * 60 * 60;

		const { token, userId } = sessionData;

		document.cookie = `authToken=${token}; path=/; max-age=${extensionTime}; Secure; SameSite=Strict`;
		document.cookie = `userId=${userId}; path=/; max-age=${extensionTime}; Secure; SameSite=Strict`;

		return true;
	}

	return false;
}

export default userStore;
