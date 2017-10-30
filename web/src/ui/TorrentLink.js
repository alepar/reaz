import React from 'react';
import { connect } from "react-redux";
import { push } from 'react-router-redux'

class TorrentLink extends React.Component {

    handleClick(e) {
        e.preventDefault();

        this.props.dispatch({
            type: "reducers.ui.navbar.additem",
            item: {
                hash: this.props.hash,
                name: this.props.name,
            },
        });

        this.props.dispatch(push("/torrent/" + this.props.hash));
    }

    render() {
        return (
            <a href={"/torrent/" + this.props.hash} onClick={e => this.handleClick(e)}>
                {this.props.name}
            </a>
        );
    }

}

function mapStateToProps(state) {
    return ({});
}
export default connect(mapStateToProps)(TorrentLink);
