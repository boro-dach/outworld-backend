import { IsString } from "class-validator";

export class CreateApplicationDto {
    @IsString({message: 'application has to contain text'})
    text: string;
}