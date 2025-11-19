import { Injectable, Logger } from '@nestjs/common';
import * as brevo from '@getbrevo/brevo';
import { ConfigService } from '@nestjs/config';
import { SendMailOptions } from './interfaces/emailOptions';

@Injectable()
export class MailerService {

  private apiInstance: brevo.TransactionalEmailsApi = new brevo.TransactionalEmailsApi();;
  private readonly logger = new Logger();

  constructor( 
    private readonly configService: ConfigService,
  ) {
    this.apiInstance.setApiKey(
      brevo.TransactionalEmailsApiApiKeys.apiKey,
      this.configService.get<string>("BREVO_API_KEY")!,
    );
  }

  async sendEmail(sendMailOptions: SendMailOptions) {
    try {
      const { htmlBody, subject, to } = sendMailOptions;
      const sendSmtpEmail = new brevo.SendSmtpEmail();

      sendSmtpEmail.subject = subject;
      sendSmtpEmail.to = [{ email: to }];

      sendSmtpEmail.sender = {
        name: "Soporte",
        email: this.configService.get<string>("MAILER_EMAIL"),
      };

      sendSmtpEmail.htmlContent = htmlBody;

      const result = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      this.logger.log(`Email enviado exitosamente a: ${to}`);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
}