import { combineReducers } from "redux";
import { routerReducer } from "react-router-redux";

export const reducers = combineReducers({
    routing: routerReducer,
    serverstate: serverstate,
});

function serverstate(state = {}, action) {
    let new_state;
    switch (action.type) {
        case "reducers.serverstate.update":
            new_state = merge(state, action.response.diff.updated);

            // TODO handle deleted

            let downloadedBytes = 0;
            let downloadBps = 0;
            let uploadedBytes = 0;
            let uploadBps = 0;
            for (let d of Object.values(new_state.downloads)) {
                downloadedBytes += d.downloadedBytes;
                downloadBps += d.downloadBps;
                uploadedBytes += d.uploadedBytes;
                uploadBps += d.uploadBps;
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

export function merge(oldobj, newobj) {
    if (!isObject(newobj) || !isObject(oldobj)) {
        return newobj;
    }

    const merged = Object.assign({}, oldobj);
    for (const key in newobj) {
        const newchild = newobj[key];
        if (isObject(newchild)) {
            merged[key] = merge(merged[key], newchild)
        } else {
            merged[key] = newchild;
        }
    }

    return merged;
}

function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item) && item !== null);
}