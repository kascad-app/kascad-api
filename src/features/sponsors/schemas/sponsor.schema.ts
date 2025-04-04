import {
  type SponsorIdentity as SponsorIdentityType,
  type SponsorPreferences as SponsorPreferencesType,
  type SponsorIdentifier as SponsorIdentifierType,
  type Sponsor as ISponsor,
  type Language,
  SocialNetwork,
  type Sport,
  ProfileType,
  ProfileRole,
  AccountStatus,
} from "@kascad-app/shared-types";
import * as bcrypt from "bcrypt";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import type { HydratedDocument } from "mongoose";
import { ProfileStatus } from "src/config/database/base.schema";

const SALT_ROUNDS = 12;

export type SponsorDocument = HydratedDocument<
  Sponsor & {
    // generateAccountValidationToken: (_size: number) => Promise<string>;
    getEncryptedPassword: (_password: string) => Promise<string>;
    compareEncryptedPassword: (_password: string) => Promise<boolean>;
  }
>;

@Schema({
  _id: false,
})
class SponsorIdentity implements SponsorIdentityType {
  @Prop({
    type: String,
  })
  companyName: string;

  @Prop({
    type: String,
  })
  website: string;

  @Prop({
    type: String,
  })
  logo: string;
}

@Schema({
  _id: false,
})
class SponsorIdentifier implements SponsorIdentifierType {
  @Prop({
    type: String,
    match:
      /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g,
    required: true,
    unique: true,
  })
  email: string;

  phoneNumber?: string;
}

@Schema({
  _id: false,
})
class SponsorPreferences implements SponsorPreferencesType {
  sports: Sport[];

  @Prop({
    type: String,
    default: [],
  })
  languages: Language;

  @Prop({
    type: String,
    enum: Object.values(SocialNetwork),
    default: [],
  })
  networks: SocialNetwork[];
}

@Schema({
  toObject: {
    virtuals: true,
    versionKey: false,
    transform: transformValue,
  },
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: transformValue,
  },
  id: true,
})
export class Sponsor implements ISponsor {
  _id: string;

  @Prop({
    type: SponsorIdentifier,
  })
  identifier: SponsorIdentifier;

  @Prop({
    type: String,
    match: /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{5,}$/,
    required: true,
  })
  password: string;

  @Prop({
    type: SponsorIdentity,
  })
  identity: SponsorIdentity;

  @Prop({
    type: SponsorPreferences,
  })
  preferences: SponsorPreferences;

  @Prop({
    default: [],
  })
  partnerships: string[];

  @Prop({
    type: String,
    enum: Object.values(ProfileType),
  })
  type: ProfileType;

  displayName?: string;

  description?: string;

  avatarUrl?: string;

  @Prop({
    type: String,
    enum: Object.values(ProfileRole),
    default: ProfileRole.USER,
  })
  role: ProfileRole;

  @Prop({
    type: ProfileStatus,
  })
  status: ProfileStatus;

  @Prop({
    type: Boolean,
    default: false,
  })
  verified: boolean;

  @Prop({
    type: Boolean,
    default: false,
  })
  isAvailable: boolean;

  @Prop({
    type: Date,
    default: Date.now,
  })
  updatedAt: Date;

  @Prop({
    type: Date,
    default: Date.now,
  })
  createdAt: Date;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformValue(_: unknown, ret: { [key: string]: any }) {
  delete ret.password;
}

export const SponsorSchema = SchemaFactory.createForClass<Sponsor>(Sponsor);

SponsorSchema.methods.getEncryptedPassword = (
  password: string,
): Promise<string> => {
  return bcrypt.hash(String(password), SALT_ROUNDS);
};

SponsorSchema.methods.compareEncryptedPassword = function (password: string) {
  return bcrypt.compare(password, this.password);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
SponsorSchema.pre("save", async function (next: any) {
  this.createdAt = new Date();
  this.status = {
    status: AccountStatus.ACTIVE,
    onboardingCompleted: false,
  };

  if (this.isModified("password")) {
    this.password = await (this as SponsorDocument).getEncryptedPassword(
      this.password,
    );
  }

  next();
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
SponsorSchema.pre("updateOne", function (next: any) {
  this.updateOne({}, { $set: { updatedAt: new Date() } });
  next();
});
