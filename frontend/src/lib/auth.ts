import { SignJWT, jwtVerify } from "jose";

const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error("JWT_SECRET no está configurado.");
}

const secretKey = new TextEncoder().encode(secret);

export type SessionPayload = {
  userId: number;
  name: string;
  email: string;
};

export async function createSessionToken(user: SessionPayload) {
  return await new SignJWT({
    userId: user.userId,
    name: user.name,
    email: user.email,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

export async function verifySessionToken(token: string) {
  const { payload } = await jwtVerify(token, secretKey);

  return payload;
}