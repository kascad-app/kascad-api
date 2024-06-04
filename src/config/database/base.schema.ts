import { AccountStatus, type ProfileStatus } from '@kascad-app/shared-types';
import { Prop, Schema } from '@nestjs/mongoose';

@Schema({
  _id: false,
})
class ProfileStatusClass implements ProfileStatus {
  @Prop({
    type: String,
    enum: Object.values(AccountStatus),
    default: AccountStatus.ACTIVE,
  })
  status: AccountStatus;

  reason?: string;

  since?: Date;

  @Prop({
    type: Boolean,
    default: false,
  })
  onboardingCompleted: boolean;
}

export { ProfileStatusClass as ProfileStatus };
