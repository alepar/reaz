import React from 'react';
import { connect } from "react-redux";
import { Table, Panel, Grid, Row, Col } from "react-bootstrap";
import dateFormat from "dateformat";

import { formatSizeInBytes } from "./Util";

class TorrentView extends React.Component {

    render() {
        const download = this.props.download;

        const createdEpochMillis = download.createdEpochMillis / 1000;
        const createdDate = new Date(0);
        createdDate.setUTCSeconds(createdEpochMillis);
        const createdString = dateFormat(createdDate, "yyyy/mm/dd HH:MM Z");

        let comment;
        if (download.comment.match("^\\w+://.*$")) {
            comment = <a href={download.comment} target={"_blank"}>{download.comment}</a>;
        } else {
            comment = <span>{download.comment}</span>;
        }

        let etaValue = download.etaSecs;
        let etaSuffix = " sec";
        if (etaValue > 60) {
            etaValue /= 60;
            etaSuffix = " min";
        }
        if (etaValue > 60) {
            etaValue /= 60;
            etaSuffix = " hrs";
        }
        if (etaValue > 24) {
            etaValue /= 24;
            etaSuffix = " days";
        }
        let etaString;
        if (etaValue > 30) {
            etaString = "\u221E"
        } else {
            etaString = etaValue.toFixed(0) + etaSuffix;
        }

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
                                            <td>{download.torrentName}</td>
                                        </tr>
                                        <tr>
                                            <td>Size</td>
                                            <td>{formatSizeInBytes(download.sizeBytes)}</td>
                                        </tr>
                                        <tr>
                                            <td>Hash</td>
                                            <td>{download.hash}</td>
                                        </tr>
                                        <tr>
                                            <td>Status</td>
                                            <td>{download.status}</td>
                                        </tr>
                                        <tr>
                                            <td>Comment</td>
                                            <td>{comment}</td>
                                        </tr>
                                        <tr>
                                            <td>Added on</td>
                                            <td>{createdString}</td>
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
                                        <td>{download.downloadBps === 0 ? "-" : formatSizeInBytes(download.downloadBps)+"/s"}</td>
                                    </tr>
                                    <tr>
                                        <td>DLed</td>
                                        <td>{download.downloadedBytes === 0 ? "-" : formatSizeInBytes(download.downloadedBytes) + " (" + (download.downloadedBytes/download.sizeBytes*100).toFixed(0) + "%)"}</td>
                                    </tr>
                                    <tr>
                                        <td>Seeds</td>
                                        <td>{download.connectedSeeds} ({download.scrapedSeeds >= 0 ? download.scrapedSeeds : "-"})</td>
                                    </tr>
                                    {download.etaSecs > 0 && (
                                    <tr>
                                        <td>ETA</td>
                                        <td>{etaString}</td>
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
                                        <td>{download.uploadBps === 0 ? "-" : formatSizeInBytes(download.uploadBps)+"/s"}</td>
                                    </tr>
                                    <tr>
                                        <td>ULed</td>
                                        <td>{download.uploadedBytes === 0 ? "-" : formatSizeInBytes(download.uploadedBytes)}</td>
                                    </tr>
                                    <tr>
                                        <td>Leechers</td>
                                        <td>{download.connectedLeechers} ({download.scrapedLeechers >= 0 ? download.scrapedLeechers : "-"})</td>
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

// TODO files table
// TODO files link
// TODO set priority
// TODO torrent actions

function mapStateToProps(state, own_props) {
    const hash = own_props.match.params.hash;
    return ({
        hash: hash,
        download: state.serverstate.downloads[hash],
        files: state.serverstate.downloadFiles[hash],
    });
}
export default connect(mapStateToProps)(TorrentView);