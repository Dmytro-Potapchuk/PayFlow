import { ValidationError } from "./errors";
import {
    getPasswordValidationError,
    PASSWORD_REQUIREMENTS_MESSAGE,
} from "@/utils/passwordValidation";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function assertNonEmptyString(
    value: string,
    fieldLabel: string
): asserts value is string {
    if (!value || !value.trim()) {
        throw new ValidationError(`${fieldLabel} nie może być puste`);
    }
}

export function assertEmail(value: string): void {
    assertNonEmptyString(value, "Email");
    if (!EMAIL_PATTERN.test(value.trim())) {
        throw new ValidationError("Podaj poprawny adres email");
    }
}

export function assertMinLength(
    value: string,
    minLength: number,
    fieldLabel: string
): void {
    assertNonEmptyString(value, fieldLabel);
    if (value.trim().length < minLength) {
        throw new ValidationError(
            `${fieldLabel} musi mieć co najmniej ${minLength} znaków`
        );
    }
}

export function assertPasswordStrength(password: string): void {
    const error = getPasswordValidationError(password);
    if (error) {
        throw new ValidationError(
            error === "Hasło nie może być puste"
                ? PASSWORD_REQUIREMENTS_MESSAGE
                : error
        );
    }
}

export function assertToken(token: string): void {
    assertNonEmptyString(token, "Token");
}

export function assertResourceId(id: string, fieldLabel: string): void {
    assertNonEmptyString(id, fieldLabel);
}

export function assertPositiveNumber(
    value: number,
    fieldLabel: string
): void {
    if (!Number.isFinite(value) || value <= 0) {
        throw new ValidationError(`${fieldLabel} musi być większe od zera`);
    }
}

export function assertMinAmount(
    value: number,
    min: number,
    fieldLabel: string
): void {
    if (!Number.isFinite(value) || value < min) {
        throw new ValidationError(
            `${fieldLabel} musi być większe lub równe ${min}`
        );
    }
}

export function assertCurrencyCode(
    currencyCode: string
): asserts currencyCode is "EUR" | "USD" {
    if (currencyCode !== "EUR" && currencyCode !== "USD") {
        throw new ValidationError("Obsługiwane waluty: EUR i USD");
    }
}

export function assertUserRole(
    role: string
): asserts role is "user" | "admin" {
    if (role !== "user" && role !== "admin") {
        throw new ValidationError('Rola musi być "user" lub "admin"');
    }
}
