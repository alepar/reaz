import React from 'react';
import { connect } from "react-redux";
import { Nav, NavItem, NavDropdown, MenuItem } from "react-bootstrap";
import { withRouter } from 'react-router-dom'
import { LinkContainer } from "react-router-bootstrap";

class NavBar extends React.Component {

    renderViewItem(item) {
        return (
            <LinkContainer to={"/torrent/"+item.hash}>
                <MenuItem>
                    {item.name}
                </MenuItem>
            </LinkContainer>
        );
    }

    render() {

        return (
            <Nav bsStyle={"tabs"}>
                <LinkContainer exact to={"/"}>
                    <NavItem>List</NavItem>
                </LinkContainer>
                <LinkContainer to={"/stats"}>
                    <NavItem>Stats</NavItem>
                </LinkContainer>
                <LinkContainer to={"/options"}>
                    <NavItem>Options</NavItem>
                </LinkContainer>
                <NavDropdown
                    id="nav-dropdown"
                    title={"View" + (this.props.isTorrentViewPage ? ": "+this.props.torrentName : "")}
                    disabled={this.props.viewhistory.length === 0}
                    active={this.props.isTorrentViewPage}
                >
                    {this.props.viewhistory.map(item => this.renderViewItem(item))}
                </NavDropdown>
            </Nav>
        );
    }
}

// TODO list of open torrent views
// TODO upload

function mapStateToProps(state, own_props) {
    const urlpath = own_props.location.pathname;
    const isTorrentViewPage = urlpath.startsWith("/torrent/");
    let torrentName = "";
    if (isTorrentViewPage) {
        let hash = urlpath.replace(/\/torrent\/(.*)/, "$1");
        torrentName = state.serverstate.downloads[hash].torrentName;
    }
    return {
        torrentName: torrentName,
        isTorrentViewPage: isTorrentViewPage,
        viewhistory: state.ui.viewhistory || [],
    };
}
export default withRouter(connect(mapStateToProps)(NavBar));
