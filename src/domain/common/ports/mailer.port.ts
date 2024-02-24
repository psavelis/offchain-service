export type MailMessage = {
	from?: string;
	to: string;
	subject: string;
	html: string;
	text?: string;
};

export type Stringable = string | number | undefined  ;

export type MailerPort = {
	sendMail(message: MailMessage): Promise<void>;
	parserTemplate(template: string, variables: Record<string, Stringable>): string;
};
