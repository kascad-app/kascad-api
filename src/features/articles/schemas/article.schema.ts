import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { type Article as IArticle } from "@kascad-app/shared-types";
import { HydratedDocument } from "mongoose";

export type ArticleDocument = HydratedDocument<Article>;

@Schema({
  toObject: {
    virtuals: true,
    versionKey: false,
  },
  toJSON: {
    virtuals: true,
    versionKey: false,
  },
  id: true,
  minimize: false,
})
export class Article implements IArticle {
  _id: string;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  urlImage: string;

  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: String })
  excerpt?: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const ArticleSchema = SchemaFactory.createForClass<Article>(Article);

ArticleSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  if (!this.createdAt) {
    this.createdAt = new Date();
  }
  next();
});

ArticleSchema.pre("updateOne", function (next) {
  this.updateOne({}, { $set: { updatedAt: new Date() } });
  next();
});
