import { IsNotEmpty, IsNumber, IsString, Min, MinLength } from "class-validator";


export class ConfirmPasswordDto {


    @IsNotEmpty()
    @IsNumber()
    otp_code: number;

    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    password: string;

}