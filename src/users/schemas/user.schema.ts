import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Document, Model, model } from 'mongoose';

export type UserDocument = User &
  Document & {
    password: string;
    passwordReset?: {
      token: string;
      expiration: Date;
    };
    checkPassword(password: string): Promise<boolean>;
  };

export interface IUserModel extends Model<UserDocument> {
  /**
   * Uses the same method as the schema to validate an email. Matches HTML 5.2 spec.
   *
   * @param {string} email address to validate
   * @returns {boolean} if the email is valid
   * @memberof IUserModel
   */
  validateEmail(email: string): boolean;
}

export interface IPasswordReset {
  token: string;
  expiration: Date;
}

@Schema({ timestamps: true })
@ObjectType()
export class User {
  @Field(() => ID)
  _id: string;

  @Field(() => String)
  @Prop({
    required: true,
    unique: true,
    validate: { validator: validateEmail },
  })
  email: string;

  @Prop({ required: true })
  password: string;

  @Field(() => [String])
  @Prop({
    type: [String],
    required: true,
  })
  permissions: string[];

  @Prop({
    type: Boolean,
    default: true,
  })
  enabled: boolean;

  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

function validateEmail(email: string) {
  const expression =
    /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return expression.test(email);
}

UserSchema.statics.validateEmail = function (email: string): boolean {
  return validateEmail(email);
};

UserSchema.pre<UserDocument>('save', function (next) {
  // Make sure not to rehash the password if it is already hashed
  if (!this.isModified('password')) {
    return next();
  }

  // Generate a salt and use it to hash the user's password
  bcrypt.genSalt(10, (genSaltError, salt) => {
    if (genSaltError) {
      return next(genSaltError);
    }

    bcrypt.hash(this.password, salt, (err, hash) => {
      if (err) {
        return next(err);
      }
      this.password = hash;
      next();
    });
  });
});

UserSchema.methods.checkPassword = function (
  password: string,
): Promise<boolean> {
  const user = this as UserDocument;

  return new Promise((resolve, reject) => {
    bcrypt.compare(password, user.password, (error, isMatch) => {
      if (error) {
        reject(error);
      }

      resolve(isMatch);
    });
  });
};

export const UserModel: IUserModel = model<UserDocument, IUserModel>(
  'User',
  UserSchema,
);
