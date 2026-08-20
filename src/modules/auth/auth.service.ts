import { prisma } from '../../config/database';
import { verifyPassword } from '../../core/utils/password.service';
import { generateAccessToken } from '../../core/utils/token.service';
import { UnauthorizedError } from '../../core/errors/AppError';
import { logger } from '../../config/logger';

export const loginAdmin = async (email: string, passwordPlain: string) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user || !user.is_active) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const isPasswordValid = await verifyPassword(passwordPlain, user.password_hash);

  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Update last_login_at gracefully
  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { last_login_at: new Date() },
    });
  } catch (err) {
    logger.warn({ err, userId: user.id }, 'Failed to update last_login_at');
  }

  const token = generateAccessToken({
    userId: user.id,
    email: user.email,
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
    },
  };
};
