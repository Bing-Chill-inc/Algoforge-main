import { Logger } from "../utils/logger";
import { server } from "./setup";

import { describe, expect, test } from "bun:test";
import { UserSet } from "./user.set";
import { MailService } from "../mail/mail.service";
import { Utilisateur } from "../db/schemas/Utilisateur.schema";

describe("Mail: send mails", () => {
	test("Mail de confirmation inscription.", async () => {
		// Given
		const destination = UserSet.validUser.email;
		const user = new Utilisateur();
		user.pseudo = UserSet.validUser.pseudo;
		const token = "test";

		// When
		await MailService.sendConfirmationMail(destination, user, token);

		// Then
		expect(1).toBe(1);
	});
});
