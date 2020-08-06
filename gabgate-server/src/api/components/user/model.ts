import { Document, Model, model, Schema } from 'mongoose';

export interface IUser extends Document {
	email: string;
	friends: string[];
	password: string;
	username: string;
}

export const userSchema: Schema = new Schema({
	createdAt: Date,
	email: String,
	friends: [String],
	password: String,
	username: String
});

// tslint:disable-next-line:variable-name
export const User: Model<IUser> = model<IUser>('User', userSchema);
