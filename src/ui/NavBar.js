import React from 'react';
import { connect } from "react-redux";
import { Nav, NavItem, NavDropdown, MenuItem, Glyphicon } from "react-bootstrap";
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
            <Nav bsStyle={"tabs"} className={"topmenunavbar"}>
                <LinkContainer exact to={"/"}>
                    <NavItem><Glyphicon glyph="th-list"/></NavItem>
                </LinkContainer>
                <LinkContainer to={"/upload"}>
                    <NavItem><Glyphicon glyph="plus"/></NavItem>
                </LinkContainer>
                <LinkContainer to={"/stats"}>
                    <NavItem><Glyphicon glyph="stats"/></NavItem>
                </LinkContainer>
                <LinkContainer to={"/options"}>
                    <NavItem><Glyphicon glyph="cog"/></NavItem>
                </LinkContainer>
                <NavDropdown
                    id="nav-dropdown"
                    title={<Glyphicon glyph="eye-open" />}
                    disabled={this.props.viewhistory.length === 0}
                    active={this.props.isTorrentViewPage}
                >
                    {this.props.viewhistory.map(item => this.renderViewItem(item))}
                </NavDropdown>
            </Nav>
        );
    }
}

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
