import React from "react";
import { connect } from "react-redux";
import { RIENumber } from 'riek'

class SpeedLimitEdit extends React.Component {
    render() {
        // todo cursor: hand, link style
        return (
            <div className={"speed-limit-edit"}>
                <div>
                    <strong>DL: </strong>
                    <RIENumber
                        value={this.props.dlLimit}
                        change={(v) => this.setDlLimit(v)}
                        propName='dlLimit'
                        classEditing={"speed-limit-edit-input"}
                    />
                    &nbsp;KB/s
                </div>
                <div>
                    <strong>UL: </strong>
                    <RIENumber
                        value={this.props.ulLimit}
                        change={(v) => this.setUlLimit(v)}
                        propName='ulLimit'
                        classEditing={"speed-limit-edit-input"}
                    />
                    &nbsp;KB/s
                </div>
            </div>
        );
    }

    setDlLimit(v) {
        //todo set limit
    }

    setUlLimit(v) {
        //todo set limit
    }
}

function mapStateToProps(state) {
    return {
        dlLimit: state.serverstate.speedLimits.dlBps || 0,
        ulLimit: state.serverstate.speedLimits.ulBps || 0,
    };
}
export default connect(mapStateToProps)(SpeedLimitEdit);