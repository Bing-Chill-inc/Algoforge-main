import { writable } from "svelte/store";

type Notification = {
	id: number;
	type: "success" | "error" | "warning";
	message: string;
};

function createNotificationStore() {
	const { subscribe, update } = writable<Notification[]>([]);

	return {
		subscribe,
		add: (type: Notification["type"], message: string) => {
			const id = Date.now();
			update((notifications) => [
				...notifications,
				{ id, type, message },
			]);
			return id;
		},
		remove: (id: number) => {
			update((notifications) => notifications.filter((n) => n.id !== id));
		},
	};
}

export const notifications = createNotificationStore();
