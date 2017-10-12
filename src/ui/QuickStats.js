import React from "react";
import { connect } from "react-redux";
import { ArrowUp, ArrowDown } from "react-feather";
import { Tooltip, OverlayTrigger } from "react-bootstrap";

import { formatSizeInBytes } from "./Util";

class QuickStats extends React.Component {
    render() {
        let qs = this.props.quickstats;

        if (qs === undefined) {
            return null;
        } else {
            const tooltip = (
                <Tooltip placement={"left"}>
                    <div><strong>DL Total: </strong>{formatSizeInBytes(qs.downloadedBytes)}</div>
                    <div><strong>UL Total: </strong>{formatSizeInBytes(qs.uploadedBytes)}</div>
                </Tooltip>
            );
            return (
                <OverlayTrigger placement={"left"} overlay={tooltip}>
                    <div id={"quickstats"}>
                        <table width={"100%"}>
                            <tbody>
                                <tr style={{color: "Crimson"}}>
                                    <td>DL<ArrowDown size={10}/></td>
                                    <td className={"alignright"}>{qs.downloadBps > 0 ? formatSizeInBytes(qs.downloadBps) + "/s" : "-"}</td>
                                </tr>
                                <tr style={{color: "ForestGreen"}}>
                                    <td>UL<ArrowUp size={10}/></td>
                                    <td className={"alignright"}>{qs.uploadBps > 0 ? formatSizeInBytes(qs.uploadBps) + "/s" : "-"}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </OverlayTrigger>
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