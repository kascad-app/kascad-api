import { applyDecorators } from "@nestjs/common";
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from "@nestjs/swagger";

export const ApiSwaggerGetUserConversations = () =>
  applyDecorators(
    ApiOperation({
      summary: "Get user conversations",
      description:
        "Retrieves paginated conversations for the authenticated user with participant details and last message information.",
    }),
    ApiQuery({
      name: "page",
      description: "Page number for pagination",
      example: 1,
      type: "number",
      required: false,
    }),
    ApiQuery({
      name: "limit",
      description: "Number of conversations per page (max 100)",
      example: 20,
      type: "number",
      required: false,
    }),
    ApiQuery({
      name: "contextType",
      description: "Filter conversations by context type",
      enum: ["offer", "custom_rider", "general"],
      required: false,
    }),
    ApiResponse({
      status: 200,
      description: "Conversations retrieved successfully",
      schema: {
        type: "object",
        properties: {
          conversations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                _id: { type: "string", description: "Conversation ID" },
                participants: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      userId: { type: "string", description: "User ID" },
                      userType: {
                        type: "string",
                        enum: ["rider", "sponsor"],
                        description: "User type",
                      },
                      profile: {
                        type: "object",
                        description: "User profile information",
                        properties: {
                          firstName: { type: "string" },
                          lastName: { type: "string" },
                          profilePicture: { type: "string" },
                        },
                      },
                    },
                  },
                },
                context: {
                  type: "object",
                  properties: {
                    type: {
                      type: "string",
                      enum: ["offer", "custom_rider", "general"],
                    },
                    referenceId: { type: "string" },
                  },
                },
                lastMessage: {
                  type: "object",
                  properties: {
                    content: { type: "string" },
                    createdAt: { type: "string", format: "date-time" },
                    senderId: { type: "string" },
                    senderType: {
                      type: "string",
                      enum: ["rider", "sponsor"],
                    },
                  },
                },
                status: {
                  type: "string",
                  enum: ["active", "archived", "deleted"],
                },
                createdAt: {
                  type: "string",
                  format: "date-time",
                },
                updatedAt: {
                  type: "string",
                  format: "date-time",
                },
              },
            },
          },
          pagination: {
            type: "object",
            properties: {
              currentPage: { type: "number" },
              totalPages: { type: "number" },
              totalItems: { type: "number" },
              itemsPerPage: { type: "number" },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: "Bad Request - Invalid query parameters",
    }),
    ApiResponse({
      status: 401,
      description: "Unauthorized - User not authenticated",
    }),
    ApiResponse({
      status: 500,
      description: "Internal Server Error",
    }),
  );

export const ApiSwaggerCreateConversation = () =>
  applyDecorators(
    ApiOperation({
      summary: "Create or get a conversation",
      description:
        "Creates a new conversation between the authenticated user and a target user, or returns an existing conversation if one already exists.",
    }),
    ApiBody({
      description: "Conversation creation details",
      schema: {
        type: "object",
        properties: {
          targetUserId: {
            type: "string",
            description: "MongoDB ObjectId of the target user",
            example: "64f1b2c3d4e5f6g7h8i9j0k1",
          },
          targetUserType: {
            type: "string",
            enum: ["rider", "sponsor"],
            description: "Type of the target user",
          },
          context: {
            type: "object",
            description: "Optional conversation context",
            properties: {
              type: {
                type: "string",
                enum: ["offer", "custom_rider", "general"],
                description: "Context type",
              },
              referenceId: {
                type: "string",
                description: "Reference ID for the context",
              },
            },
          },
        },
        required: ["targetUserId", "targetUserType"],
      },
    }),
    ApiResponse({
      status: 201,
      description: "Conversation created or retrieved successfully",
      schema: {
        type: "object",
        properties: {
          _id: { type: "string", description: "Conversation ID" },
          participants: {
            type: "array",
            items: {
              type: "object",
              properties: {
                userId: { type: "string" },
                userType: { type: "string", enum: ["rider", "sponsor"] },
              },
            },
          },
          context: {
            type: "object",
            properties: {
              type: {
                type: "string",
                enum: ["offer", "custom_rider", "general"],
              },
              referenceId: { type: "string" },
            },
          },
          status: {
            type: "string",
            enum: ["active", "archived", "deleted"],
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: "Bad Request - Invalid input data",
    }),
    ApiResponse({
      status: 401,
      description: "Unauthorized - User not authenticated",
    }),
    ApiResponse({
      status: 404,
      description: "Not Found - Target user not found",
    }),
    ApiResponse({
      status: 500,
      description: "Internal Server Error",
    }),
  );

export const ApiSwaggerGetConversationById = () =>
  applyDecorators(
    ApiOperation({
      summary: "Get a specific conversation",
      description:
        "Retrieves a specific conversation by ID. Only participants in the conversation can access it.",
    }),
    ApiParam({
      name: "conversationId",
      description: "MongoDB ObjectId of the conversation",
      example: "64f1b2c3d4e5f6g7h8i9j0k1",
      type: "string",
    }),
    ApiResponse({
      status: 200,
      description: "Conversation retrieved successfully",
      schema: {
        type: "object",
        properties: {
          _id: { type: "string", description: "Conversation ID" },
          participants: {
            type: "array",
            items: {
              type: "object",
              properties: {
                userId: { type: "string" },
                userType: { type: "string", enum: ["rider", "sponsor"] },
              },
            },
          },
          context: {
            type: "object",
            properties: {
              type: {
                type: "string",
                enum: ["offer", "custom_rider", "general"],
              },
              referenceId: { type: "string" },
            },
          },
          status: {
            type: "string",
            enum: ["active", "archived", "deleted"],
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: "Bad Request - Invalid conversation ID",
    }),
    ApiResponse({
      status: 401,
      description: "Unauthorized - User not authenticated",
    }),
    ApiResponse({
      status: 403,
      description: "Forbidden - User not authorized for this conversation",
    }),
    ApiResponse({
      status: 404,
      description: "Not Found - Conversation not found",
    }),
    ApiResponse({
      status: 500,
      description: "Internal Server Error",
    }),
  );

export const ApiSwaggerDeleteConversation = () =>
  applyDecorators(
    ApiOperation({
      summary: "Delete a conversation",
      description:
        "Soft deletes a conversation. Only participants in the conversation can delete it.",
    }),
    ApiParam({
      name: "conversationId",
      description: "MongoDB ObjectId of the conversation to delete",
      example: "64f1b2c3d4e5f6g7h8i9j0k1",
      type: "string",
    }),
    ApiResponse({
      status: 204,
      description: "Conversation deleted successfully",
    }),
    ApiResponse({
      status: 400,
      description: "Bad Request - Invalid conversation ID",
    }),
    ApiResponse({
      status: 401,
      description: "Unauthorized - User not authenticated",
    }),
    ApiResponse({
      status: 403,
      description: "Forbidden - User not authorized for this conversation",
    }),
    ApiResponse({
      status: 404,
      description: "Not Found - Conversation not found",
    }),
    ApiResponse({
      status: 500,
      description: "Internal Server Error",
    }),
  );
