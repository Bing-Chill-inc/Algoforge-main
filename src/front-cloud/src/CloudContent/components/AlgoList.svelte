<script lang="ts">
	import { deleteAlgo } from "../../stores/algoStore";
	import { notifications } from "../../stores/notificationStore";
	import type { Algo } from "../../utils/types";

	// Recevoir la liste d'algos en tant que prop
	export let algos: Algo[];
	export let loading: boolean = false;
	export let error: string = "";
	export let isTrash: boolean = false;

	function handleRowClick(e: MouseEvent, algo: Algo) {
		if (algo?.id === undefined) {
			console.error("Erreur lors de l'ouverture de l'algorithme:", error);
			notifications.add(
				"error",
				"Erreur lors de l'ouverture de l'algorithme",
			);
			return;
		}
		notifications.add("success", "Algorithme ouvert avec succès");
		window.open(`/edit/#/${algo.id}`, "_blank");
	}

	async function handleDeleteClick(e: MouseEvent, algo: Algo): Promise<void> {
		e.stopPropagation();

		try {
			await deleteAlgo(algo.id);
			notifications.add("success", "Algorithme supprimé avec succès");
			window.location.reload();
		} catch (error) {
			console.error(
				"Erreur lors de la suppression de l'algorithme:",
				error,
			);
			notifications.add(
				"error",
				"Erreur lors de la suppression de l'algorithme",
			);
		}
	}
</script>

<div class="algo-list">
	{#if loading}
		<div class="loading">Chargement des algorithmes...</div>
	{:else if error}
		<div class="error">{error}</div>
	{:else if algos.length === 0}
		<div class="empty">Aucun algorithme trouvé</div>
	{:else}
		<table>
			<thead>
				<tr>
					<th>Nom</th>
					<th>Dernière modification</th>
					<th>Date de création</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				{#each algos as algo}
					<tr
						on:click={(e) => handleRowClick(e, algo)}
						class="table-row"
					>
						<td>{algo.nom}</td>
						<td>
							{#if algo.dateModification}
								{new Date(
									algo.dateModification,
								).toLocaleString()}
							{:else}
								-
							{/if}
						</td>
						<td>
							{#if algo.dateCreation}
								{new Date(algo.dateCreation).toLocaleString()}
							{:else}
								-
							{/if}
						</td>
						<td class="actions-cell">
							<button
								class="action-btn delete"
								aria-label="Supprimer l'algorithme"
								data-title={isTrash
									? "Supprimer définitivement l'algorithme"
									: "Déplacer l'algorithme vers la corbeille"}
								on:click={(e) => handleDeleteClick(e, algo)}
							>
								{#if isTrash}
									<svg
										id="DefinitelyDeleteIcon"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg"
										data-name="DefinitelyDeleteIcon"
										><path
											d="m21.389 4.704c-.108-.046-1.83-.756-4.479-1.245-.307-1.135-.637-1.639-.738-1.771-.146-.191-.355-.323-.591-.373-.062-.013-1.533-.315-3.581-.315s-3.488.304-3.549.317c-.232.05-.439.181-.584.37-.101.132-.432.633-.737 1.765-2.671.489-4.41 1.207-4.518 1.252-.508.214-.746.8-.533 1.309.172.408.582.629 1.002.596.076 1.456.2 2.963.407 4.529.85 6.434 2.303 9.898 2.585 10.527.112.25.321.442.579.533.533.188 2.496.803 5.35.803s4.816-.614 5.349-.803c.258-.091.467-.284.579-.533.283-.629 1.736-4.096 2.586-10.527.208-1.575.331-3.079.406-4.528.411.07.833-.2 1.002-.597.213-.509-.025-1.094-.533-1.308zm-6.182 9.589c.391.391.391 1.023 0 1.414s-1.023.391-1.414 0l-1.793-1.793-1.793 1.793c-.391.391-1.023.391-1.414 0s-.391-1.023 0-1.414l1.793-1.793-1.793-1.793c-.391-.391-.391-1.023 0-1.414s1.023-.391 1.414 0l1.793 1.793 1.793-1.793c.391-.391 1.023-.391 1.414 0s.391 1.023 0 1.414l-1.793 1.793z"
										/>
									</svg>
								{:else}
									<svg
										id="DeleteIcon"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg"
										data-name="DeleteIcon"
										><path
											d="m21.389 4.704c-.108-.046-1.83-.756-4.479-1.245-.307-1.135-.637-1.639-.738-1.771-.146-.191-.355-.323-.591-.373-.062-.013-1.533-.315-3.581-.315s-3.488.304-3.549.317c-.232.05-.439.181-.584.37-.101.132-.432.633-.737 1.765-2.671.489-4.41 1.206-4.518 1.252-.509.214-.747.799-.533 1.308.171.409.583.63 1.002.596.075 1.451.198 2.956.406 4.529.852 6.45 2.304 9.902 2.586 10.529.112.249.321.44.578.532.533.188 2.492.803 5.349.803s4.817-.614 5.349-.803c.258-.091.467-.284.579-.533.283-.629 1.736-4.096 2.586-10.527.208-1.575.331-3.079.406-4.528.411.07.833-.2 1.002-.597.213-.509-.025-1.094-.533-1.308zm-6.389 9.296h-2v2c0 .552-.448 1-1 1s-1-.448-1-1v-2h-2c-.552 0-1-.448-1-1s.448-1 1-1h2v-2c0-.552.448-1 1-1s1 .448 1 1v2h2c.553 0 1 .448 1 1s-.447 1-1 1z"
										/>
									</svg>
								{/if}
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</div>

<style>
	.algo-list {
		padding: 20px;
		height: 100%;
		width: 100%;
		overflow-y: auto;
	}

	.table-row {
		cursor: pointer;
		transition: background-color 0.2s ease;
	}

	.table-row:hover {
		background-color: var(--fgColorSemiTransparent);
	}

	table {
		width: 100%;
		border-collapse: collapse;
		background: var(--bgColor);
	}

	th,
	td {
		padding: 12px;
		text-align: left;
		border-bottom: 1px solid var(--titleColor);
		color: var(--fgColor);
	}

	td {
		font-weight: 500;
	}

	th {
		background-color: var(--titleColor);
		color: var(--bgColor);
		font-weight: bold;

		&:first-child {
			border-top-left-radius: 10px;
		}
		&:last-child {
			border-top-right-radius: 10px;
		}
	}

	.loading,
	.error,
	.empty {
		text-align: center;
		padding: 20px;
		color: var(--fgColor);
	}

	.actions-cell {
		position: relative;
		z-index: 1;
	}

	button {
		display: flex;
		justify-content: center;
		align-items: center;
		background: none;
		border: none;
		cursor: pointer;
		fill: var(--fgColor);
		width: fit-content;
		height: 100%;
		position: relative;
		margin: 0 20px 0 auto;
		z-index: 2;

		&::before {
			content: attr(data-title);
			position: absolute;
			bottom: calc(100% + 4px);
			left: 50%;
			width: 100px;
			transform: translateX(-50%);
			background: var(--bgColor);
			color: var(--fgColor);
			border: 1px solid var(--borderColor2);
			border-radius: 0.6em;
			padding: 0.3rem 1rem;
			font-size: var(--font-size2);
			white-space: wrap;
			text-align: center;
			opacity: 0;
			visibility: hidden;
			pointer-events: none;
			transition:
				opacity 0.3s ease,
				visibility 0.3s ease;
			z-index: 10;
		}

		&:hover::before {
			opacity: 1;
			visibility: visible;
		}

		&:hover {
			position: relative;
			z-index: 3;
		}
	}

	button > svg {
		width: 24px;
		height: 24px;
		fill: inherit;
	}

	#DeleteIcon {
		&:hover {
			fill: var(--warningColor);
		}

		&:active {
			fill: var(--warningColor);
			transform: scale(0.9);
		}
	}

	#DefinitelyDeleteIcon {
		&:hover {
			fill: var(--errorColor);
		}

		&:active {
			fill: var(--errorColor);
			transform: scale(0.9);
		}
	}

	.error {
		color: var(--errorColor);
	}
</style>
