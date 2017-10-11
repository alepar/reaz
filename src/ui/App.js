import React from 'react';
import { User } from "react-feather";

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
                    <div style={{width: "200px", float: "right"}}>
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