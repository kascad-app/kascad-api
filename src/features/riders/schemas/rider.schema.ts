import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

import {
  AccountStatus,
  type Availibility as AvailibilityType,
  ContractType,
  GenderIdentity,
  type Image as ImageType,
  Language,
  NonCompetitionAward as NonCompetitionAwardType,
  Performance as RiderPerformanceType,
  type PerformanceSummary as PerformanceSummaryType,
  ProfileRole,
  ProfileType,
  type Rider as IRider,
  type RiderIdentifier as RiderIdentifierType,
  type RiderIdentity as RiderIdentityType,
  type RiderPreferences as RiderPreferencesType,
  SocialNetwork,
  type SponsorSummary as SponsorSummaryType,
  type Sport,
  Strava as StravaType,
  StravaIdentifier as StravaIdentifierType,
  TrainingFrequency as TrainingFrequencyType,
  TricksVideo as TricksVideoType,
  WeatherCondition,
} from "@kascad-app/shared-types";

import * as bcrypt from "bcrypt";
import type { HydratedDocument } from "mongoose";
import { Model } from "mongoose";
import { ProfileStatus } from "src/config/database/base.schema";

const SALT_ROUNDS = 12;

export type RiderDocument = HydratedDocument<
  Rider & {
    // generateAccountValidationToken: (_size: number) => Promise<string>;
    getEncryptedPassword: (_password: string) => Promise<string>;
    compareEncryptedPassword: (_password: string) => Promise<boolean>;
  }
>;

export interface RiderModel extends Model<RiderDocument> {
  archiveAndClearMonthlyViews(): Promise<void>;
}

@Schema({
  _id: true,
})
class ViewEntry {
  _id: string;

  @Prop({ type: String, required: true })
  idUser: string;

  @Prop({ type: Date, required: true })
  timestamp: Date;
}

@Schema({ _id: false })
class View {
  @Prop({ type: Number, default: 0 })
  lastMonthViews: number;

  @Prop({ type: [ViewEntry], default: [] })
  viewEntries: ViewEntry[];
}

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

  @Prop({
    type: String,
  })
  bio?: string;
}

@Schema({
  _id: false,
})
class StravaIdentifier implements StravaIdentifierType {
  @Prop({
    type: String,
  })
  token_type: string;

  @Prop({
    type: Number,
  })
  expires_at: number;

  @Prop({
    type: Number,
  })
  expires_in: number;

  @Prop({
    type: String,
  })
  refresh_token: string;

  @Prop({
    type: String,
  })
  access_token: string;

  @Prop({
    type: String,
  })
  athlete: string;
}

@Schema({
  _id: false,
})
class Strava implements StravaType {
  @Prop({
    type: Boolean,
    default: false,
  })
  isLinked: boolean;

  @Prop({
    type: StravaIdentifier,
    default: () => ({}),
  })
  identifier?: StravaIdentifierType;
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

  @Prop({
    type: String,
    unique: true,
    required: true,
  })
  slug: string;

  @Prop({
    type: String,
  })
  phoneNumber?: string;

  @Prop({
    type: String,
    unique: true,
    sparse: true,
  })
  username?: string;

  @Prop({
    type: Strava,
    default: () => ({}),
  })
  strava: StravaType;
}

@Schema({
  _id: false,
})
class RiderPreferences implements RiderPreferencesType {
  @Prop({
    type: [String],
    default: [],
  })
  sports: Sport[];

  @Prop({
    type: String,
    default: Language.FR,
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
  _id: false,
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
  _id: false,
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
class RiderPerformanceSummary implements PerformanceSummaryType {
  @Prop({
    type: Number,
    default: 0,
  })
  totalPodiums: number;

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
class SponsorSummary implements SponsorSummaryType {
  @Prop({
    type: Number,
    default: 0,
  })
  totalSponsors: number;

  @Prop({
    type: [String],
    default: [],
  })
  wishListSponsors: string[];

  @Prop({
    type: [String],
    default: [],
  })
  currentSponsors: string[];
}

@Schema({
  _id: false,
})
class RiderImage implements ImageType {
  @Prop({
    type: String,
  })
  url: string;

  @Prop({
    type: String,
  })
  alt?: string;

  @Prop({
    type: Date,
  })
  uploadDate: Date;
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
  _id: false,
})
class Availibility implements AvailibilityType {
  @Prop({
    type: Boolean,
    default: false,
  })
  isAvailable: boolean;

  @Prop({
    type: String,
  })
  contractType: ContractType;
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
  minimize: false,
  id: true,
  indexes: [
    { "status.status": 1 },
    { "identity.country": 1, "preferences.sports": 1 },
    { "identity.gender": 1, "availibility.isAvailable": 1 },
    { "preferences.sports": 1, "availibility.contractType": 1 },
    { "identity.country": 1, "identity.city": 1 },
    { "identity.birthDate": 1 },
    { "identity.languageSpoken": 1 },
    { "preferences.networks": 1 },
    { "availibility.isAvailable": 1, "availibility.contractType": 1 },
    { "views.lastMonthViews": -1 },
    { createdAt: -1 },
    {
      "identity.firstName": "text",
      "identity.lastName": "text",
      "identity.fullName": "text",
      "identity.bio": "text",
      "identifier.username": "text",
    },
    {
      "preferences.sports": 1,
      "identity.country": 1,
      "availibility.isAvailable": 1,
    },
    { "identity.birthDate": 1, "preferences.sports": 1 },
    { "identifier.username": 1 },
    { "identity.bio": 1 },
  ],
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
    default: () => ({}),
  })
  preferences: RiderPreferences;
  @Prop({
    type: String,
    required: true,
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
    type: RiderPerformanceSummary,
    default: () => ({}),
  })
  performanceSummary: PerformanceSummaryType;

  @Prop({
    type: TrainingFrequency,
  })
  trainingFrequency: TrainingFrequency;

  @Prop({
    type: SponsorSummary,
    default: () => ({}),
  })
  sponsorSummary: SponsorSummaryType;

  @Prop({
    type: [RiderImage],
    default: [],
  })
  images: ImageType[];

  @Prop({
    type: [NonCompetitionAward],
    default: [],
  })
  nonCompetitionAwards: NonCompetitionAward[];

  @Prop({
    type: Availibility,
    default: () => ({}),
  })
  availibility: AvailibilityType;

  @Prop({ type: View, default: () => ({}) })
  views: View;
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

RiderSchema.virtual("tempViewsStats").get(function (this: RiderDocument) {
  const now = new Date();

  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const startOfWeek = new Date(now);
  const day = startOfWeek.getDay();
  const diffToMonday = (day === 0 ? -6 : 1) - day;
  startOfWeek.setDate(startOfWeek.getDate() + diffToMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  const viewEntries = this.views.viewEntries || [];

  const monthlyViews = viewEntries.filter(
    (v: ViewEntry) => new Date(v.timestamp) >= firstDayOfMonth,
  ).length;

  const weeklyViews = viewEntries.filter(
    (v: ViewEntry) => new Date(v.timestamp) >= startOfWeek,
  ).length;

  return {
    weeklyViews,
    monthlyViews,
  };
});

RiderSchema.statics.archiveAndClearMonthlyViews = async function () {
  const now = new Date();
  const monthAgo = new Date(now);
  monthAgo.setMonth(now.getMonth() - 1);
  const riders = await this.find();
  for (const rider of riders) {
    const viewObj = rider.views;
    if (!viewObj) continue;
    const viewEntries = viewObj.viewEntries || [];
    const lastMonthViewsArr = viewEntries.filter(
      (v: ViewEntry) => v.timestamp >= monthAgo && v.timestamp < now,
    );
    viewObj.lastMonthViews = lastMonthViewsArr.length;

    viewObj.viewEntries = viewEntries.filter(
      (v: ViewEntry) => v.timestamp >= now,
    );

    await rider.save();
  }
};
