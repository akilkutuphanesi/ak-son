import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080', // Spring Boot ayağa kalkınca bu porttan çalışacak
    withCredentials: true,
});

export default api;