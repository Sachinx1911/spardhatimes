import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MinLength } from 'class-validator';

export class LoginDto {
  /**
   * 10 आकडी भारतीय मोबाइल क्रमांक. Client कडून "+91 98765 43210" किंवा
   * "98765 43210" असं काहीही येऊ शकतं, म्हणून service मध्ये आधी normalize होतो.
   */
  @ApiProperty({ example: '9876543210' })
  @IsString()
  @Matches(/^(\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}$/, {
    message: 'मोबाइल क्रमांक बरोबर नाही.',
  })
  phone!: string;

  @ApiProperty({ example: 'secret123', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'Password किमान 6 अक्षरांचा हवा.' })
  password!: string;
}

export class RefreshDto {
  @ApiProperty()
  @IsString()
  refreshToken!: string;
}
