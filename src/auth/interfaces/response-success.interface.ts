import { User } from "../entities/user.entity"



export interface ResponseInterface {
    success: boolean;
    message: string;
    data: {
        user: Omit<User, 'password'>;
    }
}