import { combineReducers } from "redux";
import { routerReducer } from "react-router-redux";

export const reducers = (s, a) => {
    const combined = combineReducers({
        routing: routerReducer,
        serverstate: serverstate,
        ui: ui,
    });

    return globalreducer(combined(s, a), a);
};

function ui(state = {}, action) {
    return state;
}

function globalreducer(state = {}, action) {
    switch (action.type) {
        case "reducers.serverstate.update":
        case "reducers.torrentgrid.sortchanged":
            // recalculates list of items to be displayed in TorrentGrid
            // has to be called every time list (set of downloads or their ordering) changes
            // depends on being called after reducers from combineReducers()

            const gridstate = state.ui !== undefined ? state.ui.torrentgrid : {};

            const new_gridstate = Object.assign({}, gridstate);

            if (state.serverstate === undefined || state.serverstate.downloads === undefined) {
                new_gridstate.loading = true;
            } else {
                new_gridstate.loading = false;
                const downloads = state.serverstate.downloads;

                new_gridstate.hashArray = [];

                for (let d of Object.keys(downloads)) {
                    new_gridstate.hashArray.push(d);
                }

                if (undefined !== action.sortDirection) {
                    new_gridstate.sortDirection = action.sortDirection;
                }
                if (undefined !== action.sortColumn) {
                    new_gridstate.sortColumn = action.sortColumn;
                }

                if (new_gridstate.sortDirection === undefined || new_gridstate.sortDirection === "NONE") {
                    new_gridstate.sortDirection = "DESC";
                    new_gridstate.sortColumn = "createdEpochMillis";
                }

                new_gridstate.hashArray = new_gridstate.hashArray.slice();

                let valueExtractor = h => downloads[h][new_gridstate.sortColumn];
                let valueComparator = (l, r) => {
                    if (l<r) return -1;
                    if (l === r) return 0;
                    return 1;
                };

                switch(new_gridstate.sortColumn) {
                    case "torrentName":
                    case "status":
                        valueComparator = Intl.Collator().compare;
                        break;
                    case "done":
                        valueExtractor = h => downloads[h].downloadedBytes / downloads[h].sizeBytes;
                        break;
                    default:
                }
                new_gridstate.hashArray.sort((l, r) => {
                    let vall = valueExtractor(l);
                    let valr = valueExtractor(r);
                    return valueComparator(vall, valr);
                });
            }

            return merge(state, {ui: {torrentgrid: new_gridstate}});

        default:
            return state;
    }
}

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