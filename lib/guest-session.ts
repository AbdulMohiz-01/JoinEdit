import Cookies from 'js-cookie';

const COOKIE_NAME = 'jointedit_guest_session';
const COOKIE_EXPIRY = 1; // 1 day

export function getGuestSessionToken(): string | undefined {
    return Cookies.get(COOKIE_NAME);
}

export function setGuestSessionToken(token: string): void {
    Cookies.set(COOKIE_NAME, token, {
        expires: COOKIE_EXPIRY,
        sameSite: 'lax'
    });
}

export function removeGuestSessionToken(): void {
    Cookies.remove(COOKIE_NAME);
}

export function generateGuestName(): string {
    const randomNum = Math.floor(Math.random() * 9000) + 1000;
    return `Guest #${randomNum}`;
}
