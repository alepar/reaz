import React from 'react';
import { connect } from "react-redux";
import {Glyphicon, OverlayTrigger, Tooltip} from "react-bootstrap";

class ConnectionStatus extends React.Component {

    toggleConnection(e) {
        let status = this.props.connectionstate.status;
        if (status !== "connecting") {
            this.props.dispatch({
                type: "sagas.serverstate.fetch",
                paused: status !== "paused"
            });
        }
    }

    render() {
        const state = this.props.connectionstate;

        const statusTooltip = (
            <Tooltip id="statusTooltip">
                <div><strong>{state.message}</strong></div>
            </Tooltip>
        );

        let statusColor;
        let glyph = "globe";
        let style = { cursor: "pointer"};
        switch(state.status) {
            case "ok":
                statusColor = "green";
                break;
            case "paused":
                statusColor = "gold";
                glyph = "pause";
                break;
            case "connecting":
                statusColor = "grey";
                style = {};
                break;
            case "error":
                statusColor = "red";
                break;
            default:
                statusColor = "blue";
                glyph = "question-sign";
        }

        return (
            <OverlayTrigger placement={"bottom"} overlay={statusTooltip}>
                <div style={{fontSize: "20px", color: statusColor, paddingTop: "5px"}}>
                    <Glyphicon glyph={glyph} onClick={e => this.toggleConnection(e)} style={style}/>
                </div>
            </OverlayTrigger>
        );
    }

}

function mapStateToProps(state, own_props) {
    return ({
        connectionstate: state.serverstate.connectionstate,
    });
}
export default connect(mapStateToProps)(ConnectionStatus);