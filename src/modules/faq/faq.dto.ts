import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateFaqDto {
  @IsOptional()
  question: string;

  @IsOptional()
  answer: string;

  @IsOptional()
  questionInEnglish: string;

  @IsOptional()
  answerInEnglish: string;
}

export class UpdateFaqDto extends CreateFaqDto {}