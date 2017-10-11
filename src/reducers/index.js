import { combineReducers } from "redux";
import { routerReducer } from "react-router-redux";

export const reducers = combineReducers({
    routing: routerReducer,
    torrents: torrents,
});

function torrents(state = {}, action) {
    switch (action.type) {
        case "reducers.torrents.list.update":
            let new_state = JSON.parse(JSON.stringify(
                Object.assign({}, state, {list: null})
            ));

            new_state.list = action.list;

            let downloadedBytes = 0;
            let downloadBps = 0;
            let uploadedBytes = 0;
            let uploadBps = 0;
            for (let torrent of new_state.list) {
                downloadedBytes += torrent.downloadedBytes;
                downloadBps += torrent.downloadBps;
                uploadedBytes += torrent.uploadedBytes;
                uploadBps += torrent.uploadBps;
            }

            new_state.quickstats = {
                downloadedBytes: downloadedBytes,
                downloadBps: downloadBps,
                uploadedBytes: uploadedBytes,
                uploadBps: uploadBps,
            };

            return new_state;

        default:
            return state;
    }
}
