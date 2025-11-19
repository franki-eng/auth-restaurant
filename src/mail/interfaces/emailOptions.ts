
export interface SendMailOptions {
    to: string;
    subject: string;
    htmlBody: string;
    attachements?: Attachement[];
}
  
export interface Attachement {
    filename: string;
    path: string;
}

