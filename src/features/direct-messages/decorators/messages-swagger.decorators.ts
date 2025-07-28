import { applyDecorators } from "@nestjs/common";
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from "@nestjs/swagger";

export const ApiSwaggerCreateMessage = () =>
  applyDecorators(
    ApiOperation({
      summary: "Create a new message",
      description:
        "Creates a new message in the specified conversation. The sender is automatically marked as having read the message.",
    }),
    ApiBody({
      description: "Message content and conversation details",
      schema: {
        type: "object",
        properties: {
          conversationId: {
            type: "string",
            description: "MongoDB ObjectId of the conversation",
            example: "64f1b2c3d4e5f6g7h8i9j0k1",
          },
          content: {
            type: "string",
            description: "Message content",
            example: "Hello, I'm interested in your offer!",
            minLength: 1,
            maxLength: 5000,
          },
          messageType: {
            type: "string",
            enum: ["text", "image", "file"],
            description: "Type of message",
            default: "text",
          },
        },
        required: ["conversationId", "content"],
      },
    }),
    ApiResponse({
      status: 201,
      description: "Message created successfully",
      schema: {
        type: "object",
        properties: {
          _id: { type: "string", description: "Message ID" },
          conversationId: {
            type: "string",
            description: "Conversation ID",
          },
          senderId: { type: "string", description: "Sender user ID" },
          senderType: {
            type: "string",
            enum: ["rider", "sponsor"],
            description: "Sender user type",
          },
          content: { type: "string", description: "Message content" },
          messageType: {
            type: "string",
            enum: ["text", "image", "file"],
            description: "Type of message",
          },
          readBy: {
            type: "array",
            description: "Array of users who have read the message",
            items: {
              type: "object",
              properties: {
                userId: { type: "string", description: "User ID" },
                userType: {
                  type: "string",
                  enum: ["rider", "sponsor"],
                  description: "User type",
                },
                readAt: {
                  type: "string",
                  format: "date-time",
                  description: "Read timestamp",
                },
              },
            },
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Creation timestamp",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            description: "Last update timestamp",
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: "Bad Request - Invalid input data",
      schema: {
        type: "object",
        properties: {
          statusCode: { type: "number", example: 400 },
          message: {
            type: "array",
            items: { type: "string" },
            example: ["content should not be empty", "Invalid conversationId"],
          },
          error: { type: "string", example: "Bad Request" },
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: "Unauthorized - User not authenticated",
      schema: {
        type: "object",
        properties: {
          statusCode: { type: "number", example: 401 },
          message: { type: "string", example: "Unauthorized" },
        },
      },
    }),
    ApiResponse({
      status: 403,
      description: "Forbidden - User not authorized for this conversation",
      schema: {
        type: "object",
        properties: {
          statusCode: { type: "number", example: 403 },
          message: {
            type: "string",
            example: "User is not authorized for this conversation",
          },
          error: { type: "string", example: "Forbidden" },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: "Not Found - Conversation not found",
      schema: {
        type: "object",
        properties: {
          statusCode: { type: "number", example: 404 },
          message: { type: "string", example: "Conversation not found" },
          error: { type: "string", example: "Not Found" },
        },
      },
    }),
    ApiResponse({
      status: 500,
      description: "Internal Server Error",
      schema: {
        type: "object",
        properties: {
          statusCode: { type: "number", example: 500 },
          message: { type: "string", example: "Internal server error" },
        },
      },
    }),
  );

export const ApiSwaggerGetMessages = () =>
  applyDecorators(
    ApiOperation({
      summary: "Get messages from a conversation",
      description:
        "Retrieves paginated messages from a specific conversation. Only authenticated users who are participants in the conversation can access messages.",
    }),
    ApiParam({
      name: "conversationId",
      description: "MongoDB ObjectId of the conversation",
      example: "64f1b2c3d4e5f6g7h8i9j0k1",
      type: "string",
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
      description: "Number of messages per page (max 100)",
      example: 20,
      type: "number",
      required: false,
    }),
    ApiResponse({
      status: 200,
      description: "Messages retrieved successfully",
      schema: {
        type: "object",
        properties: {
          messages: {
            type: "array",
            items: {
              type: "object",
              properties: {
                _id: { type: "string", description: "Message ID" },
                conversationId: {
                  type: "string",
                  description: "Conversation ID",
                },
                senderId: { type: "string", description: "Sender user ID" },
                senderType: {
                  type: "string",
                  enum: ["rider", "sponsor"],
                  description: "Sender user type",
                },
                content: { type: "string", description: "Message content" },
                messageType: {
                  type: "string",
                  enum: ["text", "image", "file"],
                  description: "Type of message",
                },
                readBy: {
                  type: "array",
                  description: "Array of users who have read the message",
                  items: {
                    type: "object",
                    properties: {
                      userId: { type: "string", description: "User ID" },
                      userType: {
                        type: "string",
                        enum: ["rider", "sponsor"],
                        description: "User type",
                      },
                      readAt: {
                        type: "string",
                        format: "date-time",
                        description: "Read timestamp",
                      },
                    },
                  },
                },
                createdAt: {
                  type: "string",
                  format: "date-time",
                  description: "Creation timestamp",
                },
                updatedAt: {
                  type: "string",
                  format: "date-time",
                  description: "Last update timestamp",
                },
              },
            },
          },
          pagination: {
            type: "object",
            properties: {
              currentPage: { type: "number", description: "Current page" },
              totalPages: { type: "number", description: "Total pages" },
              totalItems: { type: "number", description: "Total items" },
              itemsPerPage: {
                type: "number",
                description: "Items per page",
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: "Bad Request - Invalid parameters",
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

export const ApiSwaggerGetMessageById = () =>
  applyDecorators(
    ApiOperation({
      summary: "Get message by ID",
      description:
        "Retrieves a specific message by its ID. Only accessible to users who are participants in the message's conversation.",
    }),
    ApiParam({
      name: "id",
      description: "Message MongoDB ObjectId",
      example: "64f1b2c3d4e5f6g7h8i9j0k1",
      type: "string",
    }),
    ApiResponse({
      status: 200,
      description: "Message retrieved successfully",
      schema: {
        type: "object",
        properties: {
          _id: { type: "string", description: "Message ID" },
          conversationId: { type: "string", description: "Conversation ID" },
          senderId: { type: "string", description: "Sender user ID" },
          senderType: {
            type: "string",
            enum: ["rider", "sponsor"],
            description: "Sender user type",
          },
          content: { type: "string", description: "Message content" },
          messageType: {
            type: "string",
            enum: ["text", "image", "file"],
            description: "Type of message",
          },
          readBy: {
            type: "array",
            description: "Array of users who have read the message",
            items: {
              type: "object",
              properties: {
                userId: { type: "string", description: "User ID" },
                userType: {
                  type: "string",
                  enum: ["rider", "sponsor"],
                  description: "User type",
                },
                readAt: {
                  type: "string",
                  format: "date-time",
                  description: "Read timestamp",
                },
              },
            },
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Creation timestamp",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            description: "Last update timestamp",
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: "Bad Request - Invalid message ID",
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
      description: "Not Found - Message not found",
    }),
    ApiResponse({
      status: 500,
      description: "Internal Server Error",
    }),
  );

export const ApiSwaggerDeleteMessage = () =>
  applyDecorators(
    ApiOperation({
      summary: "Delete a message",
      description:
        "Soft deletes a message. Only the message sender can delete their own messages.",
    }),
    ApiParam({
      name: "id",
      description: "MongoDB ObjectId of the message to delete",
      example: "64f1b2c3d4e5f6g7h8i9j0k1",
      type: "string",
    }),
    ApiResponse({
      status: 200,
      description: "Message deleted successfully",
    }),
    ApiResponse({
      status: 400,
      description: "Bad Request - Invalid message ID",
    }),
    ApiResponse({
      status: 401,
      description: "Unauthorized - User not authenticated",
    }),
    ApiResponse({
      status: 403,
      description: "Forbidden - User cannot delete this message",
    }),
    ApiResponse({
      status: 404,
      description: "Not Found - Message not found",
    }),
    ApiResponse({
      status: 500,
      description: "Internal Server Error",
    }),
  );

export const ApiSwaggerMarkAsRead = () =>
  applyDecorators(
    ApiOperation({
      summary: "Mark messages as read",
      description:
        "Marks the specified messages as read by the authenticated user. Only marks messages that haven't been read by this user yet.",
    }),
    ApiBody({
      description: "Array of message IDs to mark as read",
      schema: {
        type: "object",
        properties: {
          messageIds: {
            type: "array",
            items: {
              type: "string",
              description: "Message MongoDB ObjectId",
              example: "64f1b2c3d4e5f6g7h8i9j0k1",
            },
            minItems: 1,
            description: "Array of message IDs to mark as read",
          },
        },
        required: ["messageIds"],
      },
    }),
    ApiResponse({
      status: 200,
      description: "Messages marked as read successfully",
      schema: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: {
            type: "string",
            example: "Messages marked as read successfully",
          },
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
      status: 500,
      description: "Internal Server Error",
    }),
  );

export const ApiSwaggerMarkAllAsRead = () =>
  applyDecorators(
    ApiOperation({
      summary: "Mark all messages in conversation as read",
      description:
        "Marks all unread messages in the specified conversation as read by the authenticated user.",
    }),
    ApiParam({
      name: "conversationId",
      description: "Conversation MongoDB ObjectId",
      example: "64f1b2c3d4e5f6g7h8i9j0k1",
      type: "string",
    }),
    ApiResponse({
      status: 200,
      description: "All messages in conversation marked as read successfully",
      schema: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: {
            type: "string",
            example: "All messages marked as read successfully",
          },
        },
      },
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

export const ApiSwaggerGetUnreadCount = () =>
  applyDecorators(
    ApiOperation({
      summary: "Get total unread message count",
      description:
        "Returns the total number of unread messages for the authenticated user across all conversations.",
    }),
    ApiResponse({
      status: 200,
      description: "Unread count retrieved successfully",
      schema: {
        type: "object",
        properties: {
          unreadCount: {
            type: "number",
            description: "Total number of unread messages",
            example: 15,
          },
        },
      },
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

export const ApiSwaggerGetUnreadCountsByConversation = () =>
  applyDecorators(
    ApiOperation({
      summary: "Get unread message counts by conversation",
      description:
        "Returns the number of unread messages for each conversation for the authenticated user. Useful for displaying badges in conversation lists.",
    }),
    ApiResponse({
      status: 200,
      description: "Unread counts by conversation retrieved successfully",
      schema: {
        type: "array",
        items: {
          type: "object",
          properties: {
            conversationId: {
              type: "string",
              description: "Conversation MongoDB ObjectId",
              example: "64f1b2c3d4e5f6g7h8i9j0k1",
            },
            unreadCount: {
              type: "number",
              description: "Number of unread messages in this conversation",
              example: 3,
            },
          },
        },
      },
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
