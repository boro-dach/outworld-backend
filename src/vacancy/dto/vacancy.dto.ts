import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
  Validate,
  ValidateNested,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Jobs, PaymentPeriod, SalaryType } from 'generated/prisma';

@ValidatorConstraint({ name: 'isSalaryLogicCorrect', async: false })
export class IsSalaryLogicCorrectConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any, args: ValidationArguments) {
    const salary = args.object as CreateSalaryDto;
    if (!salary || !salary.type) {
      return false;
    }
    if (salary.type === SalaryType.FIXED) {
      return (
        typeof salary.fixedAmount === 'number' &&
        salary.fixedAmount > 0 &&
        salary.minAmount === undefined &&
        salary.maxAmount === undefined
      );
    }
    if (salary.type === SalaryType.RANGE) {
      return (
        typeof salary.minAmount === 'number' &&
        typeof salary.maxAmount === 'number' &&
        salary.minAmount > 0 &&
        salary.maxAmount > 0 &&
        salary.maxAmount >= salary.minAmount &&
        salary.fixedAmount === undefined
      );
    }
    return false;
  }

  defaultMessage() {
    return 'Salary data is invalid. For FIXED type, only "fixedAmount" is required. For RANGE type, "minAmount" and "maxAmount" are required (and maxAmount must be >= minAmount).';
  }
}

export class CreateSalaryDto {
  @IsEnum(SalaryType)
  @IsNotEmpty()
  @Validate(IsSalaryLogicCorrectConstraint)
  type: SalaryType;

  @IsEnum(PaymentPeriod)
  @IsNotEmpty()
  period: PaymentPeriod;

  @IsOptional()
  @IsInt()
  @IsPositive()
  fixedAmount?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  minAmount?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  maxAmount?: number;
}

export class CreateVacancyDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5, {
    message: 'Title is too short. Minimum length is 5 characters.',
  })
  @MaxLength(100, {
    message: 'Title is too long. Maximum length is 100 characters.',
  })
  title: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(20, {
    message: 'Description is too short. Minimum length is 20 characters.',
  })
  description: string;

  @IsEnum(Jobs, { message: 'Invalid occupation type.' })
  @IsNotEmpty()
  occupation: Jobs;

  @IsString()
  @IsNotEmpty()
  companyId: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CreateSalaryDto)
  salary?: CreateSalaryDto;
}
