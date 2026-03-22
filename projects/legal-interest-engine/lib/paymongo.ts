import crypto from 'crypto';

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const expected = hmac.digest('hex');

  // Use timingSafeEqual to prevent timing attacks
  try {
    const expectedBuf = Buffer.from(expected, 'hex');
    const signatureBuf = Buffer.from(signature, 'hex');

    if (expectedBuf.length !== signatureBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuf, signatureBuf);
  } catch {
    return false;
  }
}

export async function createCheckoutSession(
  plan: 'consumer' | 'professional',
  userId: string,
  email: string
): Promise<string> {
  // Placeholder — will be filled when PayMongo creds are available
  // Returns checkout URL
  void plan;
  void userId;
  void email;
  throw new Error('PayMongo checkout not yet configured.');
}
