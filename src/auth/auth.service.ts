import { BadRequestException, Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-auth.dto';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginUserDto, UpdateUserDto } from './dto';
import { ResponseInterface } from './interfaces/response-success.interface';


@Injectable()
export class AuthService {

  private logger: Logger = new Logger();

  constructor( 
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
