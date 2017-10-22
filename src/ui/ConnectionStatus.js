import React from 'react';
import { connect } from "react-redux";
import {Button, Glyphicon, OverlayTrigger, Tooltip} from "react-bootstrap";

class ConnectionStatus extends React.Component {

    toggleConnection(e) {
        this.props.dispatch({
            type: "sagas.serverstate.fetch",
            paused: !this.props.connectionstate.paused,
        });
    }

    render() {
        const state = this.props.connectionstate;

        const statusTooltip = (
            <Tooltip id="statusTooltip">
                <div><strong>Connection status: </strong>{state.status}</div>
            </Tooltip>
        );

        const statusColor = state.paused ? "gold" : (state.isOk ? "green" : "red");
        const glyph = state.paused ? "pause" : "globe";

        return (
            <OverlayTrigger placement={"bottom"} overlay={statusTooltip}>
                <div style={{fontSize: "20px", color: statusColor, paddingTop: "5px"}}>
                    <Glyphicon glyph={glyph} onClick={e => this.toggleConnection(e)} style={{cursor: "pointer"}}/>
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