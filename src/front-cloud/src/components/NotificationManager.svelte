<script lang="ts">
	import { notifications } from "../stores/notificationStore";
	import Notification from "./common/Notification.svelte";
</script>

<div class="notification-container">
	{#each $notifications as notification (notification.id)}
		<Notification
			type={notification.type}
			message={notification.message}
			onClose={() => notifications.remove(notification.id)}
		/>
	{/each}
</div>

<style>
	.notification-container {
		position: fixed;
		top: 20px;
		right: 20px;
		z-index: 1000;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
</style>
