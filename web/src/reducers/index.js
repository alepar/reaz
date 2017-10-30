import { combineReducers } from "redux";
import { routerReducer } from "react-router-redux";


const partialReducers = combineReducers({
    router: routerReducer,
    serverstate: serverstate,
    ui: ui,
});

export const reducers = (s, a) => globalreducer(partialReducers(s, a), a);

function globalreducer(state, action) {
    switch (action.type) {
        case "reducers.serverstate.update":
        case "reducers.torrentgrid.sortchanged":
            // recalculates list of items to be displayed in TorrentGrid
            // has to be called every time list (set of downloads or their ordering) changes
            // depends on being called after reducers from combineReducers()

            const gridstate = state.ui.torrentgrid;

            const new_gridstate = Object.assign({}, gridstate);

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

            return merge(state, {ui: {torrentgrid: new_gridstate}});

        default:
            return state;
    }
}

function initialServerState() {
    return {
        loading: true,
    };
}
function serverstate(state = initialServerState(), action) {
    let new_state;
    switch (action.type) {
        case "reducers.serverstate.connectionupdate":
            return merge(state, { connectionstate: action.state});

        case "reducers.serverstate.update":
            new_state = merge(state, action.response.diff.updated);
            new_state.loading = false;

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

            new_state.connectionstate = {
                status: "ok",
                message: "Connected"
            };

            return new_state;

        default:
            return state;
    }
}

function initialUiState() {
    return {
        torrentgrid: {},
        torrentview: {},
        viewhistory: [],
        upload: {},
        alwaysmounted: {},
    };
}
function ui(state = initialUiState(), action) {
    switch (action.type) {
        case "reducers.ui.upload.uploading": {
            return merge(state, {upload: {uploading: true}});
        }

        case "reducers.ui.upload.uploaded": {
            if (action.success) {
                return merge(state, {upload: {uploading: false, nextid: 0, items: []}})
            } else {
                // TODO indicate upload failure
                return merge(state, {upload: {uploading: false}})
            }
        }

        case "reducers.ui.alwaysmounted.showing": {
            const add_alwaysmounted = {};
            add_alwaysmounted[action.path] = true;
            return merge(state, {alwaysmounted: add_alwaysmounted});
        }

        case "reducers.ui.upload.reset": {
            return replace(state, [], "upload", "items");
        }

        case "reducers.ui.upload.removeitem": {
            const uploadstate = state.upload;
            const id = action.id;

            if (uploadstate.items) {
                const new_items = uploadstate.items.filter(i => i.id !== id);
                return replace(state, new_items, "upload", "items");
            }

            return state;
        }

        case "reducers.ui.upload.additem": {
            const uploadstate = state.upload;
            const item = action.item;
            const new_id = uploadstate.nextid === undefined ? 0 : uploadstate.nextid;

            const new_uploadstate = Object.assign({}, uploadstate);
            new_uploadstate.nextid = new_id + 1;
            item.id = new_id;
            new_uploadstate.items = new_uploadstate.items ? new_uploadstate.items.slice() : [];
            new_uploadstate.items.push(item);

            return replace(state, new_uploadstate, "upload");
        }

        case "reducers.ui.torrentgrid.hashSelectionChanged":
            const gridstate = state.torrentgrid;
            const selectedHashes = {};

            if (gridstate.selectedHashes !== undefined) {
                 Object.assign(selectedHashes, gridstate.selectedHashes);
            }

            if (action.selected) {
                for (let hash of action.hashes) {
                    selectedHashes[hash] = 1;
                }
            } else {
                for (let hash of action.hashes) {
                    delete selectedHashes[hash];
                }
            }

            return replace(state, selectedHashes, "torrentgrid", "selectedHashes");

        case "reducers.torrentview.sortchanged":
            const hash = action.hash;
            const viewstate = state.torrentview[hash] || {};

            const new_viewstate = merge(viewstate, {
                sortColumn: action.sortColumn,
                sortDirection: action.sortDirection,
            });
            return replace(state, new_viewstate, "torrentview", hash);

        case "reducers.ui.viewhistory.additem":
            const viewhistory = state.viewhistory;

            let new_viewhistory = viewhistory.filter(it => it.hash !== action.item.hash);
            let newend = new_viewhistory.length;
            if (new_viewhistory.length === 20) {
                newend=19;
            }
            new_viewhistory = new_viewhistory.slice(0, newend);

            new_viewhistory.unshift(action.item);

            return replace(state, new_viewhistory, "viewhistory");

        default:
            return state;
    }
}

function replace(obj, newval, ...path) {
    if (obj === undefined) obj = {};
    const newobj = Object.assign({}, obj);

    if (path.length === 1) {
        newobj[path[0]] = newval;
    } else {
        newobj[path[0]] = replace(obj[path[0]], newval, path.slice(1, path.length));
    }

    return newobj;
}

function merge(oldobj, newobj) {
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