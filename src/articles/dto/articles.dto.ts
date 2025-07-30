import { IsEnum, IsString, Min } from 'class-validator';
import { ArticleType } from 'generated/prisma';

export class CreateArticleDto {
  @IsString()
  @Min(1)
  title: string;

  @IsString()
  @Min(1)
  text: string;

  @IsEnum(ArticleType)
  type: ArticleType;
}

export class LikeArticleDto {
  @IsString()
  articleId: string;
}

export class DeleteArticleDto {
  @IsString()
  articleId: string;
}
