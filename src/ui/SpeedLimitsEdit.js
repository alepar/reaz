import React from "react";
import { connect } from "react-redux";
import { RIENumber } from 'riek'

class SpeedLimitEdit extends React.Component {
    render() {
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
        this.props.dispatch({
            type: "reducers.limits.set",
            limits: {
                dl: Number(v.dlLimit)
            },
        });
    }

    setUlLimit(v) {
        this.props.dispatch({
            type: "reducers.limits.set",
            limits: {
                ul: Number(v.ulLimit)
            },
        });
    }
}

function mapStateToProps(state) {
    return {
        dlLimit: state.limits.dl || 0,
        ulLimit: state.limits.ul || 0,
    };
}
export default connect(mapStateToProps)(SpeedLimitEdit);