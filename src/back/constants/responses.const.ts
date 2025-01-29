export const Responses = {
	User: {
		Email_already_exists: "Email déjà utilisé.",
		Not_found_or_already_verified:
			"Utilisateur introuvable ou déjà vérifié.",
		Not_verified: "Utilisateur non vérifié.",
		Invalid_password: "Mot de passe incorrect.",
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
	General: {
		Invalid_data: "Données invalides.",
		Missing_data: "Il manque des données.",
		Forbidden: "Permission refusée.",
	},
};
