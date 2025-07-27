import {
  ConversationStatus,
  ConversationType,
  ProfileType,
} from "@kascad-app/shared-types";

import { PipelineStage, Types } from "mongoose";

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
): PipelineStage[] {
  const {
    currentParticipant,
    targetParticipant,
    contextType = ConversationType.PRIVATE,
  } = params;

  return [
    {
      $match: {
        status: ConversationStatus.ACTIVE,
        participants: {
          $all: [
            {
              $elemMatch: {
                userId: currentParticipant.userId,
                userType: currentParticipant.userType,
              },
            },
            {
              $elemMatch: {
                userId: targetParticipant.userId,
                userType: targetParticipant.userType,
              },
            },
          ],
        },
        $expr: {
          $eq: [{ $size: "$participants" }, 2],
        },
        $or: [{ context: { $exists: false } }, { "context.type": contextType }],
      },
    },
    {
      $sort: {
        updatedAt: -1,
      },
    },
    {
      $limit: 1,
    },
  ];
}
