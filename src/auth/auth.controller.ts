import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto, VerifyEmailExisteDto, UpdateUserDto, ConfirmPasswordDto } from './dto';
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

  @Post('forget-password')
  async updatePasswordUser(
    @Body() verifyEmailExisteDto: VerifyEmailExisteDto
  ){
    return await this.authService.updatePassword(verifyEmailExisteDto);
  }

  @Post('confirm-password/:email')
  async confirmPassword(
    @Param('email') email: string,
    @Body() confirmPasswordDto: ConfirmPasswordDto,
  ){
    return await this.authService.confirmPassword(confirmPasswordDto, email);
  }

  //!TODO falta activar los cors y el ngrok

  @Delete('deleteUser')
  async remove(
    @Query('email') email: string
  ):Promise<boolean> {
    return await this.authService.remove( email );
  }
}
