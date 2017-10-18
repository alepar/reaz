import axios from 'axios';

const client = axios.create({
    baseURL: 'https://reaz.alepar.ru',
    timeout: 10000
});

export default class Restazu {

    static fetchState(params) {
        return client.get("/api/private/serverstate", {params: params});
    }

}
