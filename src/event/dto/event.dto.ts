import { IsDate, IsString } from "class-validator";

export class EventDto {
    @IsString({message: 'title has to contain text'})
    title: string;

    @IsString({message: 'description has to contain text'})
    description: string;

    @IsDate({message: 'date has to be a date'})
    date: Date;
}