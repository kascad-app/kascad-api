import { ProfileType } from "@kascad-app/shared-types";

import {
  ConversationStatus,
  ConversationType,
} from "../schemas/conversation.schema";

import { Types } from "mongoose";

export interface FindExistingConversationParams {
  currentParticipant: {
    userId: Types.ObjectId;
    userType: ProfileType;
  };
  targetParticipant: {
    userId: Types.ObjectId;
    userType: ProfileType;
  };
  contextType?: ConversationType;
}

export function getFindExistingConversationPipeline(
  params: FindExistingConversationParams,
): any[] {
  const {
    currentParticipant,
    targetParticipant,
    contextType = ConversationType.PRIVATE,
  } = params;

  return [
    // Match conversations with active status
    {
      $match: {
        status: ConversationStatus.ACTIVE,
      },
    },

    // Match conversations where both participants exist
    {
      $match: {
        $and: [
          {
            participants: {
              $elemMatch: {
                userId: currentParticipant.userId,
                userType: currentParticipant.userType,
              },
            },
          },
          {
            participants: {
              $elemMatch: {
                userId: targetParticipant.userId,
                userType: targetParticipant.userType,
              },
            },
          },
        ],
      },
    },

    // Match context type (optional context or specific type)
    {
      $match: {
        $or: [{ context: { $exists: false } }, { "context.type": contextType }],
      },
    },

    // Ensure conversation has exactly 2 participants
    {
      $match: {
        $expr: {
          $eq: [{ $size: "$participants" }, 2],
        },
      },
    },

    // Add computed field to check if participants match exactly
    {
      $addFields: {
        participantUserIds: {
          $map: {
            input: "$participants",
            as: "participant",
            in: "$$participant.userId",
          },
        },
      },
    },

    // Match only conversations where participant IDs match exactly
    {
      $match: {
        participantUserIds: {
          $all: [currentParticipant.userId, targetParticipant.userId],
        },
      },
    },

    // Remove the computed field
    {
      $unset: "participantUserIds",
    },

    // Sort by most recent first
    {
      $sort: {
        updatedAt: -1,
      },
    },

    // Limit to 1 result (get the most recent matching conversation)
    {
      $limit: 1,
    },
  ];
}
