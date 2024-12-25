import { IsEnum, IsInt, IsNumber, IsString } from "class-validator";

export enum Status {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
}

export class UpdateApplicationDto {
    @IsEnum(Status, {message: 'status must be one of PENDING, APPROVED, REJECTED'})
    status: Status
}