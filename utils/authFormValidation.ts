import { AUTH_FIELD_LIMITS } from "@/constants/authLimits";
import { getPasswordValidationError } from "@/utils/passwordValidation";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLoginForm(login: string, password: string): string | null {
    const trimmedLogin = login.trim();

    if (!trimmedLogin || !password.trim()) {
        return "Wprowadź login i hasło";
    }

    if (trimmedLogin.length > AUTH_FIELD_LIMITS.login.max) {
        return `Login może mieć maksymalnie ${AUTH_FIELD_LIMITS.login.max} znaków`;
    }

    if (password.length > AUTH_FIELD_LIMITS.password.max) {
        return `Hasło może mieć maksymalnie ${AUTH_FIELD_LIMITS.password.max} znaków`;
    }

    return null;
}

export function validateRegisterForm(
    login: string,
    email: string,
    password: string
): string | null {
    const trimmedLogin = login.trim();
    const trimmedEmail = email.trim();

    if (!trimmedLogin || !trimmedEmail || !password.trim()) {
        return "Wypełnij wszystkie pola";
    }

    if (trimmedLogin.length > AUTH_FIELD_LIMITS.login.max) {
        return `Login może mieć maksymalnie ${AUTH_FIELD_LIMITS.login.max} znaków`;
    }

    if (!EMAIL_PATTERN.test(trimmedEmail)) {
        return "Podaj poprawny adres email";
    }

    if (trimmedEmail.length > AUTH_FIELD_LIMITS.email.max) {
        return `Email może mieć maksymalnie ${AUTH_FIELD_LIMITS.email.max} znaków`;
    }

    return getPasswordValidationError(password);
}
