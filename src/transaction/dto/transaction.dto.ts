import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class DepositDto {
  @IsNotEmpty()
  @IsString()
  @Matches('/^\d{8}$/')
  @Length(8, 8)
  cardNumber: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  amount: number;
}

export class ConfirmDepositDto {
  @IsNotEmpty()
  @IsString()
  confirmationCode: string;
}

export class WithdrawDto {
  @IsNotEmpty()
  @IsString()
  @Matches('/^\d{8}$/')
  @Length(8, 8)
  cardNumber: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  amount: number;
}

export class ConfirmWithdrawDto {
  @IsNotEmpty()
  @IsString()
  confirmationCode: string;
}
