import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity({name: 'users'})
export class User {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', { unique: true })
    email: string;

    @Column('text')
    password: string;

    @Column('text')
    name: string;

    @Column('text')
    lastName: string;

    @Column('text', { unique: true })
    DNI: string;

    @Column('boolean', { default: true })
    isActive: boolean;

    @Column({ type: 'timestamp', nullable: true })
    verificationTokenExpires: Date | null;

    @Column('int',{ nullable: true})
    otp_code: number | null;

}
