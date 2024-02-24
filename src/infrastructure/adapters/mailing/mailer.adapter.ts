import {createTransport, type Transporter} from 'nodemailer';
import {type Settings} from '../../../domain/common/settings';
import {
  type MailerPort,
  type MailMessage,
  type Stringable,
} from '../../../domain/common/ports/mailer.port';

export default class MailerAdapter implements MailerPort {
  static instance: MailerAdapter;
  private readonly transporter: Transporter;

  static getInstance(settings: Settings) {
    if (!MailerAdapter.instance) {
      MailerAdapter.instance = new MailerAdapter(settings.smtp);
    }

    return MailerAdapter.instance;
  }

  constructor(private readonly settings: Settings['smtp']) {
    this.transporter = createTransport({
      host: this.settings.host,
      port: +this.settings.port,
      secure: false,
      auth: {
        user: this.settings.username,
        pass: this.settings.password,
      },
      tls: {
        ciphers: 'SSLv3',
      },
    });
  }

  async sendMail(message: MailMessage): Promise<void> {
    await this.transporter.sendMail({
      from: this.settings.sender,
      replyTo: this.settings.replyTo,
      ...message,
    });
  }

  parserTemplate(
    template: string,
    variables: Record<string, Stringable>,
  ): string {
    let parsed = template;

    for (const [key, value] of Object.entries(variables)) {
      parsed = parsed.replace(new RegExp(`{{${key}}}`, 'g'), `${value}`);
    }

    return parsed;
  }
}
