import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

import { HydratedDocument } from "mongoose";

interface ISavedSearch {
  _id: string;
  name: string;
  sponsorId: string;
  filters: {
    [key: string]: string;
  };
}

@Schema({
  _id: true,
})
export class SavedSearch implements ISavedSearch {
  _id: string;

  @Prop({
    type: String,
    required: true,
  })
  name: string;

  @Prop({
    type: String,
    required: true,
  })
  sponsorId: string;

  @Prop({
    type: Object,
    required: true,
  })
  filters: {
    [key: string]: string;
  };
}

export const SavedSearchSchema =
  SchemaFactory.createForClass<SavedSearch>(SavedSearch);

export type SavedSearchDocument = HydratedDocument<SavedSearch>;
