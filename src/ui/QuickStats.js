import React from "react";
import { connect } from "react-redux";
import { ArrowUp, ArrowDown } from "react-feather";
import { Tooltip, OverlayTrigger, Popover } from "react-bootstrap";

import { formatSizeInBytes } from "./Util";

class QuickStats extends React.Component {
    render() {
        let qs = this.props.quickstats;

        if (qs === undefined) {
            return null;
        } else {
            const totalsTooltip = (
                <Tooltip placement={"left"}>
                    <div><strong>DL Total: </strong>{formatSizeInBytes(qs.downloadedBytes)}</div>
                    <div><strong>UL Total: </strong>{formatSizeInBytes(qs.uploadedBytes)}</div>
                </Tooltip>
            );
            const limitsPopover = (
                <Popover id="limitsPopover" title="Speed limits">
                    <div><strong>DL: </strong>10240 KB/s</div>
                    <div><strong>UL: </strong>10240 KB/s</div>
                </Popover>
            );
            return (
                <OverlayTrigger placement={"left"} overlay={totalsTooltip}>
                        <div id={"quickstats"}>
                            <OverlayTrigger trigger={"click"} placement={"bottom"} overlay={limitsPopover}>
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
                            </OverlayTrigger>
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