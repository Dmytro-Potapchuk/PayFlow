import { AUTH_FIELD_LIMITS } from "@/constants/authLimits";

const HAS_LETTER = /[A-Za-z]/;
const HAS_DIGIT = /\d/;

export const PASSWORD_REQUIREMENTS_MESSAGE =
    "Hasło musi mieć co najmniej 6 znaków, zawierać literę i cyfrę";

export function isPasswordStrongEnough(password: string): boolean {
    const trimmed = password.trim();

    if (trimmed.length < AUTH_FIELD_LIMITS.password.min) {
        return false;
    }

    if (trimmed.length > AUTH_FIELD_LIMITS.password.max) {
        return false;
    }

    return HAS_LETTER.test(trimmed) && HAS_DIGIT.test(trimmed);
}

export function getPasswordValidationError(password: string): string | null {
    if (!password.trim()) {
        return "Hasło nie może być puste";
    }

    if (password.length > AUTH_FIELD_LIMITS.password.max) {
        return `Hasło może mieć maksymalnie ${AUTH_FIELD_LIMITS.password.max} znaków`;
    }

    if (!isPasswordStrongEnough(password)) {
        return PASSWORD_REQUIREMENTS_MESSAGE;
    }

    return null;
}
