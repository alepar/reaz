import { fork, takeLatest } from "redux-saga/effects";
import { call, put } from "redux-saga/effects";

import Restazu from "../api/restazu";

export function* sagas() {
    yield [
        fork(takeLatest, "sagas.serverstate.fetch", serverstateFetchList),
    ]
}

export function* serverstateFetchList(action) {
    let token = undefined;
    let tokenTimestampMillis = undefined;
    let retries = 0;

    while (true) {
        let requestStarted = new Date().getTime();

        try {
            let response = yield call(Restazu.fetchState, {token: token});

            if (response.status === 200) {
                yield put({
                    type: "reducers.serverstate.update",
                    response: response.data,
                });

                token = response.data.token;
                tokenTimestampMillis = new Date().getTime();
                retries = 0;
            } else {
                throw new Error("Bad response from server: " + response.status);
            }
        } catch (e) {
            retries++;
            if (retries > 3 || (tokenTimestampMillis !== undefined && new Date().getTime()-tokenTimestampMillis > 30000)) {
                token = undefined;
                tokenTimestampMillis = undefined;
            }
            console.log("Failed to fetch serverstatus: " + e);
        }

        // pause for a sec
        yield call(() => new Promise((resolve, reject) =>{
            setTimeout(()=>resolve(""), 1000-new Date().getTime()+requestStarted);
        }));
    }
}