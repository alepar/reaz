import React from 'react';
import { connect } from "react-redux";
import {Button, ButtonGroup, ButtonToolbar, FormControl, Glyphicon} from "react-bootstrap";
import { Table, Grid, Row, Col } from "react-bootstrap";

import { formatSizeInBytes } from "./Util";

class Upload extends React.Component {

    handleFiles(files) {
        for (let file of files) {
            this.props.dispatch({
                type: "sagas.ui.upload.addlocal",
                file: file,
            });
        }
    }

    removeItem(id) {
        this.props.dispatch({
            type: "reducers.ui.upload.removeitem",
            id: id,
        });
    }

    renderItem(item) {
        return (<tr key={item.id}>
            <td>{item.name}</td>
            <td>{item.filename}</td>
            <td>{formatSizeInBytes(item.size)}</td>
            <td>{item.filesCount}</td>
            <td>
                <a href={""} onClick={(e) => { e.preventDefault(); this.removeItem(item.id); }}>
                    <Glyphicon glyph={"remove"}/>
                </a>
            </td>
        </tr>)
    }

    handleCancel() {
        this.props.dispatch({
            type: "reducers.ui.upload.reset",
        });
    }

    render() {
        return (
            <Grid>
                <Row className="show-grid">
                    <Col xs={12}>
                        <h4>Upload</h4>
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <FormControl id={"fileinput"} style={{display: "none"}} type={"file"} onChange={e => this.handleFiles(e.target.files)} multiple accept={".torrent"}/>
                        <ButtonToolbar>
                            <ButtonGroup>
                                <Button bsStyle="success" disabled={this.props.items.length === 0}>Submit</Button>
                            </ButtonGroup>
                            <ButtonGroup>
                                <Button bsStyle="primary" onClick={() => document.getElementById("fileinput").click()}>Add local file</Button>
                                <Button bsStyle="primary">Add URL</Button>
                            </ButtonGroup>
                            <ButtonGroup>
                                <Button onClick={() => this.handleCancel()} disabled={this.props.items.length === 0}>Cancel</Button>
                            </ButtonGroup>
                        </ButtonToolbar>

                    </Col>
                </Row>
                {this.props.items.length > 0 && <Row className="show-grid">
                    <Col xs={12}>
                        <Table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Filename</th>
                                    <th>Size</th>
                                    <th>Files</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.props.items.map(item => this.renderItem(item))}
                            </tbody>
                        </Table>
                    </Col>
                </Row>}
            </Grid>
        );
    }

}

// TODO submit
// TODO magnet links

function mapStateToProps(state, own_props) {
    return ({
        items: state.ui.upload.items || [],
    });
}
export default connect(mapStateToProps)(Upload);