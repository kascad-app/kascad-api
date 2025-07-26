import { Controller } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { Logged } from "src/common/decorators/logged.decorator";

@ApiTags("Conversations")
@ApiBearerAuth()
@Controller("conversations")
@Logged()
export class ConversationsController {}
