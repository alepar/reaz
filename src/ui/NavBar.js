import React from 'react';
import { connect } from "react-redux";
import { Nav, NavItem } from "react-bootstrap";

class NavBar extends React.Component {
    render() {
        return (
            <Nav bsStyle={"tabs"}>
                {/*<IndexLinkContainer to={"/"}>*/}
                    <NavItem>Browse</NavItem>
                {/*</IndexLinkContainer>*/}
                {/*<LinkContainer to={"/user-edit"}>*/}
                    <NavItem>Options</NavItem>
                {/*</LinkContainer>*/}
                    <NavItem>etc...</NavItem>
            </Nav>
        );
    }
}

function mapStateToProps(state) {
    return {

    };
}
export default connect(mapStateToProps)(NavBar);
