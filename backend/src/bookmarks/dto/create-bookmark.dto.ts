import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateBookmarkDto {
  @ApiProperty({ description: 'कोणता प्रश्न साठवायचा' })
  @IsString()
  questionId!: string;
}
