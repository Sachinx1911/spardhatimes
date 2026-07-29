import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class AnswerDto {
  @ApiProperty()
  @IsString()
  questionId!: string;

  /** "A".."D", multiple choice साठी "A,C", किंवा न सोडवलेल्यासाठी null. */
  @ApiProperty({ nullable: true, example: 'A' })
  @IsOptional()
  @IsString()
  chosenOption!: string | null;

  @ApiProperty({ description: 'सेकंदात' })
  @IsInt()
  @Min(0)
  // एका प्रश्नावर 24 तासांहून जास्त वेळ हा फक्त बिघडलेला client असू शकतो.
  @Max(86_400)
  timeSpent!: number;
}

export class SubmitAttemptDto {
  @ApiProperty({ type: [AnswerDto] })
  @IsArray()
  // सर्वात मोठा test 100 प्रश्नांचा आहे; मोकळी मर्यादा ठेवली तर एकच विनंती
  // लाखो नोंदी पाठवून transaction अडवू शकते.
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers!: AnswerDto[];

  @ApiProperty({ description: 'एकूण घेतलेला वेळ, सेकंदात' })
  @IsInt()
  @Min(0)
  @Max(86_400)
  timeTakenSeconds!: number;
}
