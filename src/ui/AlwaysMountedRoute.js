import React from 'react';
import { connect } from "react-redux";
import { withRouter } from 'react-router-dom';

class AlwaysMountedRoute extends React.Component {

    render() {
        let display = this.props.show ? "block" : "none";
        return (
            <div style={{display: display}}>
                {React.createElement(this.props.component)}
            </div>
        );
    }

}

function mapStateToProps(state, own_props) {
    const urlpath = own_props.location.pathname;
    return ({
        show: urlpath === own_props.path,
    });
}
export default withRouter(connect(mapStateToProps)(AlwaysMountedRoute));