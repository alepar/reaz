import { fork, takeLatest, takeEvery } from "redux-saga/effects";
import { call, put } from "redux-saga/effects";
import Bencode from "bencode-js";

import Restazu from "../api/restazu";

export function* sagas() {
    yield [
        fork(takeLatest, "sagas.serverstate.fetch", serverstateFetchList),
        fork(takeEvery, "sagas.ui.upload.addlocal", uiUploadAddLocal),
    ]
}

export function* uiUploadAddLocal(action) {
    const reader = new FileReader();
    reader.readAsText(action.file, "ISO-8859-1");
    const text = yield call(() => promisify(reader));

    const decoded = Bencode.decode(text);

    let filesCount;
    let totalSize = 0;
    if (decoded.info.files) {
        filesCount = decoded.info.files.length;
        for (let f of decoded.info.files) {
            totalSize += f.length;
        }
    } else {
        filesCount = 1;
        totalSize = decoded.info.length;
    }

    yield put({
        type: "reducers.ui.upload.additem",
        item: {
            type: "local",
            name: decoded.info.name,
            filename: action.file.name,
            text: text,
            size: totalSize,
            filesCount: filesCount,
        }
    });
}

function promisify(obj) {
    return new Promise(function(resolve, reject) {
        obj.onload =
            obj.onerror = function(evt) {
                obj.onload =
                    obj.onerror = null;

                evt.type === 'load'
                    ? resolve(obj.result || obj)
                    : reject(new Error('Failed to read the blob/file'))
            }
    })
}

export function* serverstateFetchList(action) {
    // TODO ability to pause updates for a while

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