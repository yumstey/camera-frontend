import http from './http';

export async function loginUser(username, password) {
    const { data } = await http.post('/auth/login', { username, password });
    return data;
}

export async function registerUser(username, password) {
    const { data } = await http.post('/auth/register', { username, password });
    return data;
}
