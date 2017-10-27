import React from 'react';
import ReactDOM from 'react-dom';

import createHistory from 'history/createBrowserHistory'
import { createStore, applyMiddleware, compose } from "redux";
import { Provider } from "react-redux";
import { ConnectedRouter, routerMiddleware as buildRouterMiddleware } from 'react-router-redux';
import createSagaMiddleware from "redux-saga";

import { reducers } from "./reducers/index"
import { sagas } from "./sagas/index";

import './index.css';

import App from './ui/App';
import { unregister } from './registerServiceWorker';

const sagaMiddleware = createSagaMiddleware();

const history = createHistory();
const routerMiddleware = buildRouterMiddleware(history);

const middleware = applyMiddleware(sagaMiddleware, routerMiddleware);

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(reducers, composeEnhancers(middleware));
sagaMiddleware.run(sagas);

ReactDOM.render(
    <Provider store={store}>
        <ConnectedRouter history={history}>
            <App />
        </ConnectedRouter>
    </Provider>,
    document.getElementById('root')
);

unregister();

// TODO http://lab.ejci.net/favico.js/ :)