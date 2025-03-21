export const Responses = {
	User: {
		Email_already_exists: "Email déjà utilisé.",
		Not_found_or_already_verified:
			"Utilisateur introuvable ou déjà vérifié.",
		Not_verified: "Utilisateur non vérifié.",
		Invalid_password: "Mot de passe incorrect.",
		Invalid_profile_url: "URL de photo de profil invalide.",
		Not_found: "Utilisateur introuvable.",
		Errors: {
			While_creating_user: "Erreur lors de la création de l'utilisateur.",
			While_confirming_user:
				"Erreur lors de la confirmation de l'inscription.",
		},
		Success: {
			Created: "Utilisateur créé.",
			Updated: "Utilisateur mis à jour.",
			Deleted: "Utilisateur supprimé.",
			Confirmed: "Inscription confirmée.",
			Found: "Utilisateur trouvé.",
			Quota: "Quota de l'utilisateur trouvé.",
		},
	},
	Token: {
		Missing: "Token manquant.",
		Not_found: "Token introuvable.",
		Invalid: "Token invalide.",
		Valid: "Token valide.",
		Expired: "Token expiré.",
		Errors: {
			While_creating_token:
				"Erreur lors de la création du token de confirmation.",
		},
		Success: {
			Token_created: "Token créé.",
		},
	},
	Auth: {
		Success: {
			Logged_in: "Connexion réussie.",
			Logged_out: "Déconnexion réussie.",
		},
	},
	Algo: {
		Forbidden_create:
			"Vous n'avez pas les droits pour créer cet algorithme.",
		Forbidden_update:
			"Vous n'avez pas les droits pour modifier cet algorithme.",
		Not_found: "Algorithme non trouvé.",
		Invalid: "Algorithme invalide.",
		By_User: {
			Not_found: "Aucun algorithme trouvé.",
			Found: "Algorithmes trouvés.",
		},
		Errors: {
			While_deleting_algo:
				"Erreur lors de la suppression de l'algorithme.",
		},
		Success: {
			Created: "Algorithme créé.",
			Updated: "Algorithme mis à jour.",
			Deleted: "Algorithme supprimé.",
			Found: "Algorithme trouvé.",
		},
	},
	General: {
		Invalid_data: "Données invalides.",
		Missing_data: "Il manque des données.",
		Forbidden: "Permission refusée.",
	},
};
