import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Length,
  Matches,
  Max,
} from 'class-validator';

export class CreateCardDto {
  @IsNotEmpty()
  @IsString()
  @Max(16)
  title: string;

  @IsNotEmpty()
  @IsString()
  @Matches('/^\d{8}$/')
  @Length(8, 8)
  cardNumber: string;
}

export class SendToCardDto {
  @IsNotEmpty()
  @IsString()
  @Matches('/^\d{8}$/')
  @Length(8, 8)
  fromCard: string;

  @IsNotEmpty()
  @IsString()
  @Matches('/^\d{8}$/')
  @Length(8, 8)
  toCard: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  amount: number;
}
