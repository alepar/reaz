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
        const uploading = this.props.uploading;

        return (<tr key={item.id}>
            <td>{item.name}</td>
            <td>{item.filename}</td>
            <td>{formatSizeInBytes(item.size)}</td>
            <td>{item.filesCount}</td>
            { !uploading && <td>
                <a href={""} onClick={(e) => { e.preventDefault(); this.removeItem(item.id); }}>
                    <Glyphicon glyph={"remove"}/>
                </a>
            </td>}
        </tr>)
    }

    handleCancel() {
        this.props.dispatch({
            type: "reducers.ui.upload.reset",
        });
    }

    handleSubmit() {
        this.props.dispatch({
            type: "sagas.ui.upload.submit",
            files: this.props.items.map(i => i.file),
        });
    }

    render() {
        const uploading = this.props.uploading;

        return (
            <Grid style={{paddingTop: "20px"}}>
                <Row>
                    <Col xs={4}>
                        <FormControl id={"fileinput"} style={{display: "none"}} type={"file"} onChange={e => this.handleFiles(e.target.files)} multiple accept={".torrent"}/>
                        <ButtonToolbar>
                            <ButtonGroup>
                                <Button bsStyle="success" disabled={this.props.items.length === 0 || uploading} onClick={() => this.handleSubmit()}>Upload</Button>
                            </ButtonGroup>
                            <ButtonGroup>
                                <Button bsStyle="primary" onClick={() => document.getElementById("fileinput").click()} disabled={uploading}>Add local file</Button>
                                <Button bsStyle="primary" disabled={uploading}>Add URL</Button>
                            </ButtonGroup>
                            <ButtonGroup>
                                <Button onClick={() => this.handleCancel()} disabled={this.props.items.length === 0 || uploading}>Cancel</Button>
                            </ButtonGroup>
                        </ButtonToolbar>

                    </Col>
                    <Col xs={1}><div className={"uploading"} style={{display: uploading ? "block" : "none"}} /></Col>
                </Row>

                {this.props.items.length > 0 && <Row className="show-grid" style={{paddingTop: "20px"}}>
                    <Col xs={12}>
                        <Table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Filename/URL</th>
                                    <th width={"90px"}>Size</th>
                                    <th width={"60px"}>Files</th>
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

// TODO magnet links / urls

function mapStateToProps(state, own_props) {
    return ({
        items: state.ui.upload.items || [],
        uploading: state.ui.upload.uploading === undefined ? false : state.ui.upload.uploading,
    });
}
export default connect(mapStateToProps)(Upload);