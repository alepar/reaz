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

    static upload(params) {
        const formdata = new FormData();
        for (let f of params.files) {
            formdata.append("files", f);
        }
        return client.post("/api/private/upload", formdata, {headers:{'Content-Type': 'multipart/form-data'}});
    }

}
