import http from 'k6/http';
import { check, fail } from 'k6';

const BASE_URL = __ENV.BASE_URL;

if (!BASE_URL) {
    fail('BASE_URL is required');
}

export const options = {
    vus: 5,
    iterations: 100,
};

export default function () {
    const response = http.get(`${BASE_URL}/health`);

    check(response, {
        'status is 200': (r) => r.status === 200,
    });
}
