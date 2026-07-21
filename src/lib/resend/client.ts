import { Resend } from "resend";

let _resend: Resend | null = null;

export function getResend(): Resend {
  if (!_resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error(
        "RESEND_API_KEY is not set. Add it to your deployment's environment variables."
      );
    }
    _resend = new Resend(apiKey);
  }
  return _resend;
}

export const FROM_EMAIL = () => {
  const email = process.env.RESEND_FROM_EMAIL;
  if (!email) {
    throw new Error(
      "RESEND_FROM_EMAIL is not set. Add it to your deployment's environment variables."
    );
  }
  return email;
};
