import { fork, takeLatest } from "redux-saga/effects";
import { call, put } from "redux-saga/effects";

import Restazu from "../api/restazu";

export function* sagas() {
    yield [
        fork(takeLatest, "sagas.torrents.list.fetch", torrentsFetchList),
    ]
}

export function* torrentsFetchList(action) {
    const list = yield call(Restazu.getList);

    yield put({
        type: "reducers.torrents.list.update",
        list: list.data,
    });

    yield put({
        type: "sagas.torrents.list.fetch"
    });
}