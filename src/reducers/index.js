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

            return new_state;

        default:
            return state;
    }
}
