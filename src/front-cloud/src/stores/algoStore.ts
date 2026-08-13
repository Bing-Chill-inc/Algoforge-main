import { writable, get } from "svelte/store";
import type { Algo } from "../utils/types";
import { getSessionData } from "./userStores";

export type TAlgoCreateDTO = {
	nom: string;
	ownerId: number;
	sourceCode: JSON;
};

export type TAlgoUpdateDTO = {
	id: number;
	nom: string;
	requestedUserId: number;
	sourceCode: JSON;
};

export type TAlgoFetch = {
	algorithme: {
		dateCreation: string;
		dateModification: string;
		dateSuppression?: string;
		id: number;
		idDossier?: number;
		nom: string;
	};
	droits: string;
	idAlgorithme: number;
	idUtilisateur: number;
};

// Création du store pour les algorithmes
const algoStore = writable<Algo[]>([]);

const sessionData = getSessionData();
const API_BASE_URL = "/api/algos";

export const convertAlgoFetch = (algo: TAlgoFetch): Algo => {
	return {
		id: algo.algorithme.id,
		nom: algo.algorithme.nom,
		ownerId: algo.idUtilisateur,
		sourceCode: {} as JSON,
		dateCreation: algo.algorithme.dateCreation,
		dateModification: algo.algorithme.dateModification,
		dateSuppression: algo.algorithme.dateSuppression,
		idDossier: algo.algorithme.idDossier,
		droits: algo.droits,
	};
};

export const fetchAlgosByUserId = async (options?: {
	deleted?: boolean;
	sorted?: boolean;
}) => {
	// Construire l'URL avec les paramètres de requête
	let url = `${API_BASE_URL}/byUserId/${sessionData?.userId}`;
	const params = new URLSearchParams();

	if (options?.deleted !== undefined) {
		params.append("deleted", options.deleted.toString());
	}

	if (options?.sorted) {
		params.append("sorted", options.sorted.toString());
	}

	// Ajouter les paramètres à l'URL s'il y en a
	if (params.toString()) {
		url += `?${params.toString()}`;
	}

	const response = await fetch(url, {
		headers: {
			Authorization: `Bearer ${sessionData?.token}`,
		},
	});
	const responseData = await response.json();

	if (!response.ok) {
		throw new Error(
			`Impossible de récupérer les algorithmes: ${responseData.message}`,
		);
	}

	// Mise à jour du store avec les données récupérées
	algoStore.set(responseData.data.map(convertAlgoFetch));
	return responseData;
};

export const createAlgo = async (algo: TAlgoCreateDTO) => {
	const response = await fetch(API_BASE_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${sessionData?.token}`,
		},
		body: JSON.stringify(algo),
	});

	const isresponseOk = response.ok;
	const responseData = await response.json();

	if (!isresponseOk)
		throw new Error(
			`Impossible de créer l'algorithme: ${responseData.message}`,
		);

	// Extraire l'algorithme
	const algoData: Algo = responseData.data;

	algoStore.update((current) => [...current, algoData]);
};

export const updateAlgo = async (id: number, algo: TAlgoUpdateDTO) => {
	const response = await fetch(`${API_BASE_URL}/${id}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(algo),
	});
	const responseData = await response.json();

	// Extraire l'algorithme
	const algoData: Algo = responseData.data;
	algoStore.update((current) =>
		current.map((a) => (a.id === id ? algoData : a)),
	);
};

export const deleteAlgo = async (id: number) => {
	const response = await fetch(`${API_BASE_URL}/${id}`, {
		method: "DELETE",
		headers: {
			Authorization: `Bearer ${sessionData?.token}`,
		},
	});

	const responseData = await response.json();

	if (!response.ok) {
		throw new Error(
			`Impossible de supprimer l'algorithme: ${responseData.message}`,
		);
	}

	// Mise à jour du store en supprimant l'algorithme supprimé
	algoStore.update((current) => current.filter((a) => a.id !== id));
	return responseData;
};

// Fonctions pour récupérer les algorithmes
export function getAlgos() {
	return get(algoStore);
}

export function getLastAlgo() {
	return get(algoStore)[get(algoStore).length - 1];
}

export default algoStore;
