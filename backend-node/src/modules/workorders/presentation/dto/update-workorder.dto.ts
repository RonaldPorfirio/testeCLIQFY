import { PartialType } from '@nestjs/swagger';

import { CreateWorkorderDto } from './create-workorder.dto';

export class UpdateWorkorderDto extends PartialType(CreateWorkorderDto) {}
