import axios from 'axios';

// todo authentication
// todo xsrf

const client = axios.create({
    baseURL: 'https://reaz.alepar.ru',
    timeout: 10000
});

export default class Restazu {

    static fetchState(params) {
        return client.get("/api/private/serverstate", {params: params});
    }

}
