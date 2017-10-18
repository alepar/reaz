import React from 'react';
import { connect } from "react-redux";
import { Nav, NavItem } from "react-bootstrap";
import { withRouter } from 'react-router-dom'
import { LinkContainer } from "react-router-bootstrap";

class NavBar extends React.Component {
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
            </Nav>
        );
    }
}

function mapStateToProps(state) {
    return {

    };
}
export default withRouter(connect(mapStateToProps)(NavBar));
