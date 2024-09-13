import {
  GenderIdentity,
  type RiderIdentity as RiderIdentityType,
  type RiderPreferences as RiderPreferencesType,
  type RiderIdentifier as RiderIdentifierType,
  type Rider as IRider,
  TricksVideo as TricksVideoType,
  type Language,
  Performance as RiderPerformanceType,
  NonCompetitionAward as NonCompetitionAwardType,
  TrainingFrequency as TrainingFrequencyType,
  SocialNetwork,
  type Sport,
  ProfileType,
  ProfileRole,
  AccountStatus,
  WeatherCondition,
} from "@kascad-app/shared-types";
import * as bcrypt from "bcrypt";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import type { HydratedDocument } from "mongoose";
import { ProfileStatus } from "src/config/database/base.schema";

const SALT_ROUNDS = 12;

export type RiderDocument = HydratedDocument<
  Rider & {
    // generateAccountValidationToken: (_size: number) => Promise<string>;
    getEncryptedPassword: (_password: string) => Promise<string>;
    compareEncryptedPassword: (_password: string) => Promise<boolean>;
  }
>;

@Schema({
  _id: false,
})
class RiderIdentity implements RiderIdentityType {
  @Prop({
    type: String,
  })
  firstName: string;

  @Prop({
    type: String,
  })
  lastName: string;

  @Prop({
    type: String,
  })
  fullName: string;

  @Prop({
    type: String,
    enum: Object.values(GenderIdentity),
  })
  gender: GenderIdentity;

  @Prop({
    type: Date,
  })
  birthDate: Date;

  @Prop({
    type: String,
  })
  country: string;

  @Prop({
    type: [String],
  })
  languageSpoken: string[];

  @Prop({
    type: String,
  })
  city: string;

  @Prop({
    type: String,
  })
  practiceLocation: string;
}

@Schema({
  _id: false,
})
class RiderIdentifier implements RiderIdentifierType {
  @Prop({
    type: String,
    match:
      /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g,
    required: true,
    unique: true,
  })
  email: string;

  phoneNumber?: string;

  @Prop({
    type: String,
    unique: true,
    sparse: true,
  })
  username?: string;
}

@Schema()
class RiderPreferences implements RiderPreferencesType {
  @Prop({
    type: [String],
    default: [],
  })
  sports: Sport[];

  @Prop({
    type: String,
    default: [],
  })
  languages: Language;

  @Prop({
    type: [String],
    enum: Object.values(SocialNetwork),
    default: [],
  })
  networks: SocialNetwork[];
}

@Schema({
  id: false,
})
class RiderPerformance implements RiderPerformanceType {
  @Prop({
    type: Date,
  })
  startDate: Date;

  @Prop({
    type: Date,
  })
  endDate: Date;

  @Prop({
    type: String,
  })
  eventName: string;

  @Prop({
    type: String,
  })
  category: string;

  @Prop({
    type: Number,
  })
  ranking?: number;

  @Prop({
    type: {
      country: String,
      city: String,
    },
  })
  location: {
    country: string;
    city: string;
  };

  @Prop({
    type: String,
    enum: Object.values(WeatherCondition),
  })
  weather: WeatherCondition;

  @Prop({
    type: String,
  })
  notes?: string;
}

@Schema({
  id: false,
})
class TricksVideo implements TricksVideoType {
  @Prop({
    type: String,
  })
  url: string;

  @Prop({
    type: String,
  })
  title: string;

  @Prop({
    type: String,
  })
  description?: string;

  @Prop({
    type: Date,
  })
  uploadDate: Date;

  @Prop({
    type: RiderPerformance,
  })
  relatedPerformance?: RiderPerformance;
}

@Schema({
  _id: false,
})
class TrainingFrequency implements TrainingFrequencyType {
  @Prop({
    type: Number,
  })
  sessionsPerWeek: number;

  @Prop({
    type: Number,
  })
  hoursPerSession: number;
}

@Schema({
  _id: false,
})
class NonCompetitionAward implements NonCompetitionAwardType {
  @Prop({
    type: Date,
  })
  date: Date;

  @Prop({
    type: String,
  })
  title: string;

  @Prop({
    type: String,
  })
  description: string;

  @Prop({
    type: String,
  })
  source: string;
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
class Rider implements IRider {
  _id: string;

  @Prop({
    type: RiderIdentifier,
  })
  identifier: RiderIdentifier;

  @Prop({
    type: String,
    match: /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{5,}$/,
    required: true,
  })
  password: string;

  @Prop({
    type: RiderIdentity,
  })
  identity: RiderIdentity;

  @Prop({
    type: RiderPreferences,
  })
  preferences: RiderPreferences;

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

  @Prop({
    type: [RiderPerformance],
    default: [],
  })
  performances: RiderPerformance[];

  @Prop({
    type: [TricksVideo],
    default: [],
  })
  performanceVideos: TricksVideo[];

  @Prop({
    type: TrainingFrequency,
  })
  trainingFrequency: TrainingFrequency;

  @Prop({
    type: [String],
    default: [],
  })
  currentSponsors: string[];

  @Prop({
    type: [NonCompetitionAward],
    default: [],
  })
  nonCompetitionAwards: NonCompetitionAward[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformValue(_: unknown, ret: { [key: string]: any }) {
  delete ret.password;
}

export const RiderSchema = SchemaFactory.createForClass<Rider>(Rider);

RiderSchema.methods.getEncryptedPassword = (
  password: string,
): Promise<string> => {
  return bcrypt.hash(String(password), SALT_ROUNDS);
};

RiderSchema.methods.compareEncryptedPassword = function (password: string) {
  return bcrypt.compare(password, this.password);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
RiderSchema.pre("save", async function (next: any) {
  this.createdAt = new Date();
  this.status = {
    status: AccountStatus.ACTIVE,
    onboardingCompleted: false,
  };

  if (this.isModified("password")) {
    this.password = await (this as RiderDocument).getEncryptedPassword(
      this.password,
    );
  }

  next();
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
RiderSchema.pre("updateOne", function (next: any) {
  this.updateOne({}, { $set: { updatedAt: new Date() } });
  next();
});
