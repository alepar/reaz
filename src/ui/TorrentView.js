import React from 'react';
import { connect } from "react-redux";
import { Table, Panel, Grid, Row, Col } from "react-bootstrap";

class TorrentView extends React.Component {

    render() {
        return (
            <div>
                <Grid>
                    <Row className="show-grid">
                        <Col xs={6}>
                            <Panel header="Details">
                                <Table condensed striped>
                                    <tbody>
                                        <tr>
                                            <td>Name</td>
                                            <td>{this.props.download.torrentName}</td>
                                        </tr>
                                        <tr>
                                            <td>Size</td>
                                            <td>{this.props.download.sizeBytes}</td>
                                        </tr>
                                        <tr>
                                            <td>Hash</td>
                                            <td>{this.props.download.hash}</td>
                                        </tr>
                                        <tr>
                                            <td>Status</td>
                                            <td>{this.props.download.status}</td>
                                        </tr>
                                        <tr>
                                            <td>Comment</td>
                                            <td>{this.props.download.comment}</td>
                                        </tr>
                                        <tr>
                                            <td>Added on</td>
                                            <td>{this.props.download.createdEpochMillis}</td>
                                        </tr>
                                    </tbody>
                                </Table>
                            </Panel>
                        </Col>
                        <Col xs={3}>
                            <Panel header="Download">
                                <Table condensed striped>
                                    <tbody>
                                    <tr>
                                        <td>DL Speed</td>
                                        <td>{this.props.download.downloadBps}</td>
                                    </tr>
                                    <tr>
                                        <td>DLed</td>
                                        <td>{this.props.download.downloadedBytes}</td>
                                    </tr>
                                    <tr>
                                        <td>Seeds</td>
                                        <td>{this.props.download.connectedSeeds} ({this.props.download.scrapedSeeds})</td>
                                    </tr>
                                    {this.props.download.etaSecs > 0 && (
                                    <tr>
                                        <td>ETA</td>
                                        <td>{this.props.download.etaSecs}</td>
                                    </tr>
                                    )}
                                    </tbody>
                                </Table>
                            </Panel>
                        </Col>
                        <Col xs={3}>
                            <Panel header="Upload">
                                <Table condensed striped>
                                    <tbody>
                                    <tr>
                                        <td>UL Speed</td>
                                        <td>{this.props.download.uploadBps}</td>
                                    </tr>
                                    <tr>
                                        <td>ULed</td>
                                        <td>{this.props.download.uploadedBytes}</td>
                                    </tr>
                                    <tr>
                                        <td>Leechers</td>
                                        <td>{this.props.download.connectedLeechers} ({this.props.download.scrapedLeechers})</td>
                                    </tr>
                                    </tbody>
                                </Table>
                            </Panel>
                        </Col>
                    </Row>

                    <Row className="show-grid">
                        <Col xs={12}>
                            <Panel header="Files">
                                <div style={{whiteSpace: "pre-wrap"}}>
                                    {JSON.stringify(this.props.files, null, 2)}
                                </div>
                            </Panel>
                        </Col>
                    </Row>
                </Grid>

            </div>
        );
    }

}

// TODO formatting
// TODO scraped negatives
// TODO active links in comments
// TODO files table
// TODO files link
// TODO set priority

function mapStateToProps(state, own_props) {
    const hash = own_props.match.params.hash;
    return ({
        hash: hash,
        download: state.serverstate.downloads[hash],
        files: state.serverstate.downloadFiles[hash],
    });
}
export default connect(mapStateToProps)(TorrentView);