import React from 'react';
import { connect } from "react-redux";
import { Nav, NavItem, NavDropdown, MenuItem, Glyphicon, OverlayTrigger, Tooltip } from "react-bootstrap";
import { withRouter } from 'react-router-dom'
import { LinkContainer } from "react-router-bootstrap";

class SimpleTooltip extends React.Component {

    render() {
        const tooltip = (
            <Tooltip>
                <div><strong>{this.props.text}</strong></div>
            </Tooltip>
        );

        return (
            <OverlayTrigger placement={"bottom"} overlay={tooltip} delayShow={500} delayHide={150}>
                {this.props.children}
            </OverlayTrigger>
        );
    }

}

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
                <SimpleTooltip text={"Browse torrents"}>
                    <LinkContainer exact to={"/"}>
                        <NavItem><Glyphicon glyph="th-list"/></NavItem>
                    </LinkContainer>
                </SimpleTooltip>
                <SimpleTooltip text={"Upload torrent"}>
                    <LinkContainer to={"/upload"}>
                        <NavItem><Glyphicon glyph="plus"/></NavItem>
                    </LinkContainer>
                </SimpleTooltip>
                <SimpleTooltip text={"Explore statistics"}>
                    <LinkContainer to={"/stats"}>
                        <NavItem><Glyphicon glyph="stats"/></NavItem>
                    </LinkContainer>
                </SimpleTooltip>
                <SimpleTooltip text={"Options"}>
                    <LinkContainer to={"/options"}>
                        <NavItem><Glyphicon glyph="cog"/></NavItem>
                    </LinkContainer>
                </SimpleTooltip>
                <SimpleTooltip text={"Viewed torrents history"}>
                    <NavDropdown
                        id="nav-dropdown"
                        title={<Glyphicon glyph="eye-open" />}
                        disabled={this.props.viewhistory.length === 0}
                        active={this.props.isTorrentViewPage}
                    >
                        {this.props.viewhistory.map(item => this.renderViewItem(item))}
                    </NavDropdown>
                </SimpleTooltip>
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
