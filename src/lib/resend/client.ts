import { Resend } from "resend";
import { env } from "@/lib/env";

let _resend: Resend | null = null;

export function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(env.RESEND_API_KEY);
  }
  return _resend;
}

export const FROM_EMAIL = () => env.RESEND_FROM_EMAIL;
