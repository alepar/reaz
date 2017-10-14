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

    while (true) {
        try {
            let response = yield call(Restazu.fetchState, {token: token});

            if (response.status === 200) {
                yield put({
                    type: "reducers.serverstate.update",
                    response: response.data,
                });

                token = response.data.token;
            } else {
                throw new Error("Bad response from server: " + response.status);
            }
        } catch (e) {
            // TODO warn connection is having  problems
        }

        // pause for a sec
        yield call(() => new Promise((resolve, reject) =>{
            setTimeout(()=>resolve(""), 1000);
        }));
    }
}