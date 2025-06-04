import { HttpException, HttpStatus } from "@nestjs/common";

import { APIError, StatusCode } from "@kascad-app/shared-types";

export class BadRequest extends HttpException {
  constructor(message: string, errors?: { [key: string]: string }) {
    const response: APIError = {
      success: false,
      message: message,
      statusCode: StatusCode.ClientErrorBadRequest,
      errors: errors,
    };
    super(response, HttpStatus.BAD_REQUEST);
  }
}
