import axios from 'axios';

export default class Restazu {

    static getList(action) {
        return axios.get("https://reaz.alepar.ru/api/private/torrents");
    }

}
