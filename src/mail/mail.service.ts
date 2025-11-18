import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { SendMailOptions } from './interfaces/emailOptions';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter;

  constructor(private readonly configService: ConfigService) {
    // Verificar que nodemailer esté disponible
    if (!nodemailer || !nodemailer.createTransport) {
      throw new Error('Nodemailer no está disponible correctamente');
    }

    // Validar variables de configuración
    const mailerService = this.configService.get<string>('MAILER_SERVICE');
    const mailerEmail = this.configService.get<string>('MAILER_EMAIL');
    const senderPassword = this.configService.get<string>('MAILER_SECRET_KEY');

    if (!mailerService || !mailerEmail || !senderPassword) {
      throw new Error('Configuración de correo electrónico incompleta');
    }

    // Crear el transporter
    this.transporter = nodemailer.createTransport({
      service: mailerService,
      auth: {
        user: mailerEmail,
        pass: senderPassword,
      }
    });

    this.logger.log('Servicio de correo inicializado correctamente');
  }

  async sendEmail(options: SendMailOptions): Promise<boolean> {
    const { to, subject, htmlBody, attachements = [] } = options;

    try {
      const postToProvider = this.configService.get<boolean>('SEND_EMAIL');
      if (!postToProvider) {
        this.logger.log(`[Modo prueba] Email no enviado a: ${to}`);
        return true;
      }

      await this.transporter.sendMail({
        to,
        subject,
        html: htmlBody,
        attachements,
      });

      this.logger.log(`Email enviado exitosamente a: ${to}`);
      return true;
    } catch (error) {
      this.logger.error(`Error al enviar email a ${to}:`, error.message);
      return false;
    }
  }
}