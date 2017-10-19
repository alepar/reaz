import React from 'react';

import { Route } from 'react-router';

import TorrentGrid from "./TorrentGrid";
import NavBar from "./NavBar";
import QuickStats from "./QuickStats";
import Options from "./Options";
import Stats from "./Stats";
import TorrentView from "./TorrentView";

export default class App extends React.Component {

    render() {
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