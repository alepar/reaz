import React from 'react';
import { connect } from "react-redux";
import { withRouter } from 'react-router-dom';

class AlwaysMountedRoute extends React.Component {

    render() {
        let display = this.props.show ? "block" : "none";

        if (this.props.show && !this.props.seenBefore) {
            this.props.dispatch({
                type: "reducers.ui.alwaysmounted.showing",
                path: this.props.urlpath,
            });
        }

        if (this.props.show || this.props.seenBefore) {
            return (
                <div style={{display: display}}>
                    {React.createElement(this.props.component)}
                </div>
            );
        } else {
            return <div/>;
        }
    }

}

function mapStateToProps(state, own_props) {
    const urlpath = own_props.location.pathname;
    return ({
        urlpath: urlpath,
        show: urlpath === own_props.path,
        seenBefore: state.ui.alwaysmounted[own_props.path] === undefined ? false : state.ui.alwaysmounted[own_props.path],
    });
}
export default withRouter(connect(mapStateToProps)(AlwaysMountedRoute));