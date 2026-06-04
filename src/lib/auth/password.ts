// Password policy — single source of truth shared by the client-side strength
// meter and the server-side sign-up validation, so the UI guidance and the
// enforced rule can never drift apart.

export const PASSWORD_MIN_LENGTH = 10;

export interface PasswordRule {
  id: string;
  label: string;
  test: (pw: string) => boolean;
}

export const PASSWORD_RULES: PasswordRule[] = [
  {
    id: "length",
    label: `At least ${PASSWORD_MIN_LENGTH} characters`,
    test: (pw) => pw.length >= PASSWORD_MIN_LENGTH,
  },
  {
    id: "case",
    label: "Upper & lowercase letters",
    test: (pw) => /[a-z]/.test(pw) && /[A-Z]/.test(pw),
  },
  {
    id: "number",
    label: "At least one number",
    test: (pw) => /[0-9]/.test(pw),
  },
  {
    id: "symbol",
    label: "At least one symbol",
    test: (pw) => /[^A-Za-z0-9]/.test(pw),
  },
];

export interface PasswordCheck {
  /** True when every rule is satisfied. */
  ok: boolean;
  /** Number of satisfied rules (0–4) — drives the strength meter. */
  score: number;
  /** Per-rule pass/fail for the guidance checklist. */
  rules: { id: string; label: string; met: boolean }[];
  /** Human-readable strength label. */
  label: "Too weak" | "Weak" | "Fair" | "Good" | "Strong";
  /** First unmet requirement, suitable for an error message. */
  firstUnmet?: string;
}

const LABELS: PasswordCheck["label"][] = [
  "Too weak",
  "Weak",
  "Fair",
  "Good",
  "Strong",
];

export function checkPassword(pw: string): PasswordCheck {
  const rules = PASSWORD_RULES.map((r) => ({
    id: r.id,
    label: r.label,
    met: r.test(pw),
  }));
  const score = rules.filter((r) => r.met).length;
  const ok = score === PASSWORD_RULES.length;
  return {
    ok,
    score,
    rules,
    label: LABELS[score] ?? "Too weak",
    firstUnmet: rules.find((r) => !r.met)?.label,
  };
}
