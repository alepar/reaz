import React from 'react';
import { connect } from "react-redux";
import { Route , Switch} from 'react-router';
import { withRouter } from 'react-router-dom';
import reticulate from 'reticulating-splines';

import AlwaysMountedRoute from "./AlwaysMountedRoute";
import TorrentGrid from "./TorrentGrid";
import NavBar from "./NavBar";
import QuickStats from "./QuickStats";
import Options from "./Options";
import Stats from "./Stats";
import TorrentView from "./TorrentView";
import Upload from "./Upload";
import ConnectionStatus from "./ConnectionStatus";

class App extends React.Component {

    constructor(props) {
        super(props);

        if (true === this.props.loading) {
            this.props.dispatch({
                type: "sagas.serverstate.fetch",
                paused: false,
            });
        }
    }

    render() {
        if (this.props.loading === true) {
            return (
                <div>
                <div style={{
                    display: "inline-block",
                    position: "fixed",
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    width: "120px",
                    height: "140px",
                    margin: "auto",
                }}>
                    <div className="loader"/>
                </div>
                <div style={{
                    display: "inline-block",
                    position: "fixed",
                    top: 150,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    width: "300px",
                    height: "20px",
                    margin: "auto",
                    textAlign: "center",
                }}>
                    <div>{reticulate.random()}</div>
                </div>
                </div>
            );
        } else {
            return (
                <div>
                    <div style={{height: "50px"}}>
                        <NavBar />
                    </div>

                    <div style={{position: "absolute", top: 2, right: 10, display: "flex"}}>
                        <div style={{flex: "none", width: "95px"}}>
                            <QuickStats />
                        </div>
                        <div style={{flex: "none", width: "30px", display: "flex", alignItems: "center", justifyContent: "center"}}>
                            <ConnectionStatus />
                        </div>
                    </div>

                    <div>
                        <AlwaysMountedRoute path={"/"} component={TorrentGrid}/>
                        <Switch>
                            <Route path={"/upload"} component={Upload}/>
                            <Route path={"/options"} component={Options}/>
                            <Route path={"/stats"} component={Stats}/>
                            <Route path={"/torrent/:hash"} component={TorrentView}/>
                        </Switch>
                    </div>
                </div>
            );
        }
    }

}

function mapStateToProps(state, own_props) {
    return ({
        loading: state.serverstate.loading,
    });
}
export default withRouter(connect(mapStateToProps)(App));