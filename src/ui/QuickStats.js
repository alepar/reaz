import React from "react";
import { connect } from "react-redux";
import { ArrowUp, ArrowDown } from "react-feather";
import { Table } from "react-bootstrap";

import { formatSizeInBytes } from "./Util";

class QuickStats extends React.Component {
    render() {
        let qs = this.props.quickstats;

        if (qs === undefined) {
            return null;
        } else {
            return (
                <table width={"100%"}>
{/*
                    <thead>
                        <tr>
                            <th>Speed</th>
                            <th className={"aligncenter"}>Limit</th>
                            <th className={"alignright"}>Total</th>
                        </tr>
                    </thead>
*/}
                    <tbody>
                        <tr style={{color: "Crimson"}}>
                            <td>DL<ArrowDown size={10}/> {qs.downloadBps > 0 ? formatSizeInBytes(qs.downloadBps) + "/s" : "-"}</td>
                            <td className={"aligncenter"}>[--]</td>
                            <td className={"alignright"}>({qs.downloadedBytes > 0 ? formatSizeInBytes(qs.downloadedBytes) : "-"})</td>
                        </tr>
                        <tr style={{color: "ForestGreen"}}>
                            <td>UL<ArrowUp size={10}/> {qs.uploadBps > 0 ? formatSizeInBytes(qs.uploadBps) + "/s" : "-"}</td>
                            <td className={"aligncenter"}>[--]</td>
                            <td className={"alignright"}>({qs.uploadedBytes > 0 ? formatSizeInBytes(qs.uploadedBytes) : "-"})</td>
                        </tr>
                    </tbody>
                </table>
            );
        }
    }
}

function mapStateToProps(state) {
    return {
        quickstats: state.torrents.quickstats || undefined,
    };
}
export default connect(mapStateToProps)(QuickStats);