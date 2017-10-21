import { fork, takeLatest, takeEvery } from "redux-saga/effects";
import { call, put } from "redux-saga/effects";
import Bencode from "bencode-js";
import { TextEncoder, TextDecoder } from "text-encoding";

import Restazu from "../api/restazu";

export function* sagas() {
    yield [
        fork(takeLatest, "sagas.serverstate.fetch", serverstateFetchList),
        fork(takeEvery, "sagas.ui.upload.addlocal", uiUploadAddLocal),
        fork(takeLatest, "sagas.ui.upload.submit", uiUploadSubmit),
    ]
}

export function* uiUploadAddLocal(action) {
    const reader = new FileReader();
    reader.readAsText(action.file, "windows-1252");
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

    let name = decoded.info.name;
    const nameBytes = new TextEncoder("windows-1252", { NONSTANDARD_allowLegacyEncoding: true }).encode(name);
    name = new TextDecoder("utf-8").decode(nameBytes);

    yield put({
        type: "reducers.ui.upload.additem",
        item: {
            type: "local",
            name: name,
            filename: action.file.name,
            file: action.file,
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

export function* uiUploadSubmit(action) {
    const files = action.files;

    try {
        yield put({
            type: "reducers.ui.upload.uploading",
        });

        const response = yield call(Restazu.upload, {files: files});

        yield put({
            type: "reducers.ui.upload.uploaded",
            success: response.status === 200,
        });
    } catch(e) {
        console.log(e); // TODO
        yield put({
            type: "reducers.ui.upload.uploaded",
            success: false,
        });
    }
}

export function* serverstateFetchList(action) {
    // TODO ability to pause updates for a while

    let token = undefined;
    let tokenTimestampMillis = undefined;
    let retries = 0;

    while (true) {
        let requestStarted = new Date().getTime();

        try {
            const response = yield call(Restazu.fetchState, {token: token});

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