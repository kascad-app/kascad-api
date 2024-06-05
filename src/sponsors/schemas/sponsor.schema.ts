import {
  GenderIdentity,
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
} from '@kascad-app/shared-types';
import * as bcrypt from 'bcrypt';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import { ProfileStatus } from 'src/config/database/base.schema';

const SALT_ROUNDS = 12;

export type UserDocument = HydratedDocument<
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
  companyName: string;

  website: string;

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

  languages: Language;

  @Prop({
    type: String,
    enum: Object.values(SocialNetwork),
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
class Sponsor implements ISponsor {
  _id: string;

  identifier: SponsorIdentifier;

  @Prop({
    type: String,
    match: /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{5,}$/,
    required: true,
  })
  password: string;

  identity: SponsorIdentity;

  preferences: SponsorPreferences;

  partnerships: string[];

  @Prop({
    type: String,
    enum: Object.values(ProfileType),
  })
  type: ProfileType;

  displayName: string;

  description?: string;

  avatarUrl?: string;

  @Prop({
    type: String,
    enum: Object.values(ProfileRole),
    default: ProfileRole.USER,
  })
  role: ProfileRole;

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
SponsorSchema.pre('save', async function (next: any) {
  this.createdAt = new Date();
  this.status = {
    status: AccountStatus.ACTIVE,
    onboardingCompleted: false,
  };

  if (this.isModified('password')) {
    this.password = await (this as UserDocument).getEncryptedPassword(
      this.password,
    );
  }

  next();
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
SponsorSchema.pre('updateOne', function (next: any) {
  this.updateOne({}, { $set: { updatedAt: new Date() } });
  next();
});
