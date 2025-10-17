import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from './dto';
import { ResponseInterface } from './interfaces/response-success.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async create(@Body() loginUserDto: LoginUserDto): Promise<ResponseInterface> {
    return await this.authService.login(loginUserDto);
  }

  @Post('signUp')
  async singUup(
    @Body() createAuthDto: CreateUserDto,
  ): Promise<ResponseInterface> {
    return await this.authService.createUser( createAuthDto );
  }

  @Get('findOneByEmail')
  async findOneByEmail(@Query('email') email: string): Promise<ResponseInterface> {
    return await this.authService.findOneByEmail( email );
  }

  @Get('findOneByDNI')
  async findOneByDNI(@Query('DNI') DNI: string):Promise<ResponseInterface> {
    return await this.authService.findOneByDNI( DNI );
  }

  @Patch('updateUser')
  update(
    @Query('email') email: string, 
    @Body() updateUser: UpdateUserDto
  ) {
    return this.authService.update( email, updateUser );
  }

  //!TODO falta activar los cors y el ngrok

  @Delete('deleteUser')
  async remove(
    @Query('email') email: string
  ):Promise<boolean> {
    return await this.authService.remove( email );
  }
}
