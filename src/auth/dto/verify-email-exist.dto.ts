import { IsNotEmpty, IsString, MinLength } from "class-validator";


export class VerifyEmailExisteDto {

    @IsNotEmpty()
    @IsString()
    email: string;

}