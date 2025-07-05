import { IsString, Min } from 'class-validator';

export class CreateArticleDto {
  @IsString()
  @Min(1)
  title: string;

  @IsString()
  @Min(1)
  text: string;
}
