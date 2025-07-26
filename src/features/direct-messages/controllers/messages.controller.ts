import { Controller } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { Logged } from "src/common/decorators/logged.decorator";

@ApiTags("Messages")
@ApiBearerAuth()
@Controller("messages")
@Logged()
export class MessagesController {}
