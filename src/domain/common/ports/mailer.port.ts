export interface MailMessage {
    from?: string;
    to: string;
    subject: string;
    html: string;
    text?: string;
}

export interface MailerPort {
    sendMail(message: MailMessage): Promise<void>;
    parserTemplate(template: string, variables: Record<string, string | number>): string;
}
