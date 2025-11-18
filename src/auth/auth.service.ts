import { BadRequestException, Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-auth.dto';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginUserDto, UpdateUserDto, VerifyEmailExisteDto } from './dto';
import { ResponseInterface } from './interfaces/response-success.interface';
import { MailService } from '../mail/mail.service';
import { addMinutes } from 'date-fns';
import { ConfirmPasswordDto } from './dto/confirm-password.dto';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class AuthService {

  private logger: Logger = new Logger();

  constructor( 
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly mailerService: MailService,
    private readonly configService: ConfigService,
  ) {}

  async createUser(createAuthDto: CreateUserDto): Promise<ResponseInterface> {
    
    try {

      const { password, ...rest } = createAuthDto;
      const passwordHashed = this.hashedPassword(password);    

      const newUser = await this.userRepository.create({password: passwordHashed, ...rest});
      await this.userRepository.save(newUser);
      const parseUser = this.parseUser(newUser);
      return {
        success: true,
        message: "User creado Existoso",
        data:{
          user: parseUser,
        }
      };
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async login( loginUserDto: LoginUserDto ):Promise<ResponseInterface> {
    const user = await this.findOne(loginUserDto.email);

    if ( !user.isActive ){
      throw new UnauthorizedException('User Unauthorised, please talk with admin')
    }

    if ( !bcrypt.compareSync(loginUserDto.password, user.password) )
        throw new BadRequestException('Email/Password do not match')

    const parseUser = this.parseUser(user);

    return {
      success: true,
      message: "Login Existoso",
      data:{
        user: parseUser,
      }
    };
  }

  private parseUser( user: User ): Omit<User, 'password'>{
    const { password, ...rest } = user;
    return rest;
  }

  async updatePassword( verifyEmailExisteDto: VerifyEmailExisteDto ): Promise<ResponseInterface>{
    const { email } = verifyEmailExisteDto;
    const user: User = await this.findOne(email);

    user.otp_code = this.getOptCode();

    user.verificationTokenExpires = addMinutes(new Date(), 5);

    await this.userRepository.save(user);
    this.sendEmail(email, 'Confirmation password', user.otp_code );
    const parseUser = this.parseUser(user);
    return {
      success: true,
      message: "Se va enviado un codigo a su email",
      data: {
        user: parseUser,
      }
    }
  }


  private async sendEmail( to: string, subject: string, otp_code: number ){
    const htmlBody = `
  <div style="font-family: Arial, sans-serif; padding: 20px;">
    <h2 style="color: #0A66C2;">Recuperación de contraseña</h2>

    <p>Hola,</p>

    <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta asociada a este correo.</p>

    <p style="font-size: 16px; color: #333;">
      Tu código de verificación es:
    </p>

    <!-- CONTENEDOR CENTRADO PARA EMAILS -->
    <table width="100%" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center">
          <div style="
            background: #f1f5fe;
            padding: 15px;
            font-size: 28px;
            text-align: center;
            letter-spacing: 4px;
            font-weight: bold;
            border-radius: 10px;
            width: 200px;
          ">
            ${otp_code}
          </div>
        </td>
      </tr>
    </table>

    <p style="margin-top: 20px; color: #555;">
      Este código es válido por <strong>5 minutos</strong>.  
      Si no solicitaste este cambio, puedes ignorar este mensaje.
    </p>

    <p style="margin-top: 30px;">Saludos,<br>
    <strong>Equipo de Seguridad</strong></p>
  </div>
`;

    await this.mailerService.sendEmail({to, subject, htmlBody: htmlBody});
  }


  async confirmPassword( confirmPasswordDto: ConfirmPasswordDto, email: string ) {
    try {
      const { otp_code, password } = confirmPasswordDto;
      const user = await this.userRepository.findOne({
        where: {
          otp_code,
          email
        },
      });

      if( !user || user.verificationTokenExpires! < new Date()){
        return {
          success: false,
          message: 'codigo Código inválido o expirado',
          data: null,
        };
      }

      user.password = this.hashedPassword(password);
      user.verificationTokenExpires = null;
      user.otp_code = null;
      await this.userRepository.save(user);
      
      return {
        success: true,
        message: 'Contraseña actualizado correctamente',
        data: null,
      };

    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  private getOptCode(): number{
    return Math.floor(Math.random() * 900000) + 100000;
  }


  async findOneByDNI( DNI: string ): Promise<ResponseInterface> {
    try {
      const user = await this.userRepository.findOneByOrFail({DNI})
      const parseUser = this.parseUser(user);
      return {
        success: true,
        message: "Login Existoso",
        data:{
          user: parseUser,
        }
      };
    } catch (error) {
      this.handleDBErrors({
        code:'error-01',
        detail: `${DNI} not found`
      });
    }
  }

  private async findOne( email: string ): Promise<User> {
    try {
      const user = await this.userRepository.findOneByOrFail({email})
      return user;
    } catch (error) {
      this.handleDBErrors({
        code:'error-01',
        detail: `${email} not found`
      });
    }
  }



  async findOneByEmail( email: string ): Promise<ResponseInterface> {
    try {
      const user = await this.userRepository.findOneByOrFail({email})
      const parseUser = this.parseUser(user);
      return {
        success: true,
        message: "Login Existoso",
        data:{
          user: parseUser,
        }
      };
    } catch (error) {
      this.handleDBErrors({
        code:'error-01',
        detail: `${email} not found`
      });
    }
  }

  async update( email: string, updateUserDto: UpdateUserDto) {
    try {
        const { user } = (await this.findOneByEmail( email )).data;

        // ✅ Actualiza un usuario sin sobrescribir datos válidos existentes.
        // 1. Busca el usuario por email y lanza error si no existe.
        // 2. Limpia el DTO eliminando campos vacíos o undefined para evitar perder información.
        // 3. Fusiona solo los campos válidos al usuario existente.
        // 4. Guarda los cambios en la base de datos y maneja posibles errores.
        const cleanedUpdateDto = Object.fromEntries(
          Object.entries(updateUserDto).filter(([_, value]) => value !== undefined && value !== '')
        );

        Object.assign(user, cleanedUpdateDto);

        return await this.userRepository.save(user);
    } catch (error) {
        this.handleDBErrors(error);
    }
  }

  async remove( email: string ): Promise<boolean> {
    try {
      const { user } = (await this.findOneByEmail(email)).data;

      user.isActive = false;

      await this.userRepository.save(user);
      return true;
    } catch (error) {
      this.handleDBErrors(error);
    }


  }

  private hashedPassword( password: string ): string{
    const passowrdHashed = bcrypt.hashSync(password, 10 );
    return passowrdHashed;
  }


  private handleDBErrors( error: any ): never {

    if ( error.code === '23505'){
      throw new BadRequestException( error.detail.replace('key', ''), "nose que hice");
    }

    if ( error.code === 'error-01' ){
      throw new BadRequestException( error.detail.replace('key', ''));
    }

    if( error.code === '400'){
      throw new BadRequestException(error.detail.replace('key', ''))
    }

    this.logger.error( error );
      throw new InternalServerErrorException('Please check server logs');

  }

}
