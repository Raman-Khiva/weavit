export const BASE_URL =
    __ENV.BASE_URL ?? "https://api.weavit.tech";

export const TOKEN = __ENV.CLERK_TOKEN;

export const REQUEST_PARAMS = {
    headers: {
        Authorization: `Bearer ${TOKEN}`,
    },
};
