import React from 'react';
import { connect } from "react-redux";
import { Route } from 'react-router';
import { withRouter } from 'react-router-dom';

import TorrentGrid from "./TorrentGrid";
import NavBar from "./NavBar";
import QuickStats from "./QuickStats";
import Options from "./Options";
import Stats from "./Stats";
import TorrentView from "./TorrentView";

class App extends React.Component {

    constructor(props) {
        super(props);

        if (true === this.props.loading) {
            this.props.dispatch({
                type: "sagas.serverstate.fetch",
            });
        }
    }

    render() {
        if (this.props.loading === true) {
            return (
                <div style={{
                    display: "inline-block",
                    position: "fixed",
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    width: "120px",
                    height: "120px",
                    margin: "auto",
                }}>
                    <div className="loader"/>
                </div>
            );
        } else {
            return (
                <div>
                    <div id={"navbar-container"}>
                        <div style={{float: "left"}}>
                            <NavBar />
                        </div>
                        <div style={{width: "95px", float: "right"}}>
                            <QuickStats />
                        </div>
                    </div>

                    <div>
                        <Route exact path={"/"} component={TorrentGrid}/>
                        <Route path={"/options"} component={Options}/>
                        <Route path={"/stats"} component={Stats}/>
                        <Route path={"/torrent/:hash"} component={TorrentView}/>
                    </div>
                </div>
            );
        }
    }

}

// TODO do not rerender torrent grid, it is expensive and loses grid's state like scroll position, etc
// https://github.com/ReactTraining/react-router/issues/4988

function mapStateToProps(state) {
    return ({
        loading: state.serverstate.loading,
    });
}
export default withRouter(connect(mapStateToProps)(App));