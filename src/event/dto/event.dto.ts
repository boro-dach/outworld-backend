import { IsDate, IsDateString, IsISO8601, IsString } from "class-validator";

export class EventDto {
    @IsString({message: 'title has to contain text'})
    title: string;

    @IsString({message: 'description has to contain text'})
    description: string;

    @IsISO8601()
    date: string;
}