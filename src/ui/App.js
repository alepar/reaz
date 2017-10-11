import React from 'react';

import TorrentGrid from "./TorrentGrid";
import NavBar from "./NavBar";
import QuickStats from "./QuickStats";

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
                    <TorrentGrid />
                </div>
            </div>
        );
    }

}