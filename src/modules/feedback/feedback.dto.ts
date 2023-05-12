import { IsInt, IsNotEmpty, Max, Min, IsPhoneNumber, IsDefined, ValidateIf, IsUUID } from 'class-validator';

export class CreateFeedbackDto {
  @IsDefined({ message: 'Either review or rating is required' })
  @ValidateIf(o => !o.rating)
  review?: string;

  @IsDefined({ message: 'Either review or rating is required' })
  @ValidateIf(o => !o.review)
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsNotEmpty()
  @IsPhoneNumber('IN', { message: 'Invalid phone number' })
  phoneNumber: string;
}
