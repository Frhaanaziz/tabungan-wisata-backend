import { IsEnum, IsNotEmpty } from 'class-validator';

enum UserRole {
  student = 'student',
  teacher = 'teacher',
  admin = 'admin',
}

export class UpdateUserRoleDto {
  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole;
}
