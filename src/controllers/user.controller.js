import catchAsync from '../utils/catchAsync.js';
import { userService } from '../services/index.js';
export const getUsers = catchAsync(async (req, res) => {
  const users = await userService.queryUsers();
  res.send(users);
});