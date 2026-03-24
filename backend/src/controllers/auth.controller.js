import * as authService from "../services/auth.service.js";

export async function register(req, res) {
  const result = await authService.registerUser(req.body);
  res.status(201).json(result);
}

export async function login(req, res) {
  const result = await authService.loginUser(req.body);
  res.status(200).json(result);
}

export async function me(req, res) {
  const user = await authService.getCurrentUser(req.user.userId);
  res.status(200).json({ user });
}
