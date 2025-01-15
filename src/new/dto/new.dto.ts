import { IsISO8601, IsString } from "class-validator";

export class NewDto {
    @IsString()
    title: string;

    @IsString()
    content: string;

    @IsISO8601({
        strict: false
    })
    date: string;
}