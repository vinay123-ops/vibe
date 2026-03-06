import User from '../models/user.model.js';

export const queryUsers = async () => {
  // Logic to fetch users from MongoDB
  return await User.find({});
};