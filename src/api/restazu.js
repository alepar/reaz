import axios from 'axios';

// todo authentication
// todo xsrf

export const baseURL = '';

const client = axios.create({
    baseURL: baseURL,
    timeout: 10000
});

export default class Restazu {

    static fetchState(params) {
        return client.get("/private/api/serverstate", {params: params});
    }

    static upload(params) {
        const formdata = new FormData();
        for (let f of params.files) {
            formdata.append("files", f);
        }
        return client.post("/private/api/upload", formdata, {headers:{'Content-Type': 'multipart/form-data'}});
    }

}
