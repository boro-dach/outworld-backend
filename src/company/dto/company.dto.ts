import {
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  @Min(1)
  @Max(24)
  title: string;

  @IsString()
  @Min(1)
  @Max(64)
  description: string;

  @IsNotEmpty()
  @IsString()
  @Matches('/^\d{8}$/')
  @Length(8, 8)
  payCard: string;
}

export class AddEmployeeDto {
  @IsString()
  @IsNotEmpty()
  companyId: string;

  @IsString()
  @IsNotEmpty()
  employeeId: string;
}
