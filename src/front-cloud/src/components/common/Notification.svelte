<script lang="ts">
	import type { notification } from "../../utils/types";
	import { onMount } from "svelte";

	export let type: notification = "success";
	export let message: string = "";
	export let duration: number = 7000;
	export let onClose: () => void = () => {};

	let visible = true;
	let progressWidth = 100;
	let animationFrameId: number;

	function close() {
		visible = false;
		if (animationFrameId) {
			cancelAnimationFrame(animationFrameId);
		}
		onClose();
	}

	onMount(() => {
		const startTime = Date.now();

		function updateProgress() {
			const elapsed = Date.now() - startTime;
			progressWidth = Math.max(0, 100 - (elapsed / duration) * 100);

			if (progressWidth > 0 && visible) {
				animationFrameId = requestAnimationFrame(updateProgress);
			} else if (progressWidth <= 0) {
				close();
			}
		}

		animationFrameId = requestAnimationFrame(updateProgress);

		return () => {
			if (animationFrameId) {
				cancelAnimationFrame(animationFrameId);
			}
		};
	});
</script>

{#if visible}
	<div class="notification {type}" role="alert">
		<div class="content">
			<span class="message">{message}</span>
			<button class="close" on:click={close} aria-label="Fermer">✕</button
			>
		</div>
		<div class="progress-bar" style="width: {progressWidth}%"></div>
	</div>
{/if}

<style>
	.notification {
		position: fixed;
		bottom: 20px;
		right: 20px;
		min-width: 300px;
		max-width: 400px;
		padding: 15px;
		border-radius: 4px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
		z-index: 1000;
		animation: slideIn 0.3s ease-out;
	}

	.notification.error {
		background-color: var(--errorColor);
		color: white;
	}

	.notification.success {
		background-color: var(--goodColor);
		color: white;
	}

	.notification.warning {
		background-color: var(--warningColor);
		color: white;
	}

	.content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 10px;
	}

	.message {
		margin-right: 15px;
		font-size: 14px;
	}

	.close {
		background: none;
		border: none;
		color: white;
		cursor: pointer;
		font-size: 18px;
		opacity: 0.7;
		transition: opacity 0.2s;
	}

	.close:hover {
		opacity: 1;
	}

	.progress-bar {
		position: absolute;
		bottom: 0;
		left: 0;
		height: 3px;
		background-color: rgba(255, 255, 255, 0.7);
		transition: width linear;
	}

	@keyframes slideIn {
		from {
			transform: translateX(100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}
</style>
