import PropTypes from 'prop-types';
import React from 'react';
import { connect } from "react-redux";
import { Table, Panel, Grid, Row, Col } from "react-bootstrap";
import dateFormat from "dateformat";
import ReactDataGrid from "react-data-grid";

import { formatSizeInBytes } from "./Util";

class TorrentView extends React.Component {

    constructor(props) {
        super(props);

        this._columns = [
            {
                key: 'idx',
                name: '#',
                cellClass: "aligncenter",
                sortable: true,
                width: 40,
            },             {
                key: 'path',
                name: 'File name',
                sortable: true,
            }, {
                key: 'done',
                name: 'Done',
                width: 60,
                sortable: true,
                formatter: DoneFormatter,
                cellClass: "aligncenter",
                getRowMetaData: (row) => row,
            }, {
                key: 'sizeBytes',
                name: 'Size',
                width: 65,
                formatter: SizeFormatter,
                cellClass: "alignright",
                sortable: true,
            }, {
                key: 'priority',
                name: 'Priority',
                width: 100,
                cellClass: "aligncenter",
                sortable: true,
            },
        ];

        props.dispatch({
            type: "reducers.ui.viewhistory.additem",
            item: {
                name: props.download.torrentName,
                hash: props.download.hash,
            }
        });
    }

    handleGridSort(sortColumn, sortDirection) {
        this.props.dispatch({
            type: "reducers.torrentview.sortchanged",
            hash: this.props.hash,
            sortColumn: sortColumn,
            sortDirection: sortDirection,
        });
    }

    rowGetter(sortedIndexes, i) {
        if (this.props.state.sortDirection === "DESC") {
            return this.props.files[sortedIndexes[sortedIndexes.length - i - 1]];
        } else {
            return this.props.files[sortedIndexes[i]];
        }
    }

    render() {
        const download = this.props.download;
        const sortedIndexes = this.calculateSortedIndexes();

        return (
            <div>
                <Grid>
                    <Row className="show-grid">
                        <Col xs={12}>
                            <h4>{download.torrentName}</h4>
                        </Col>
                    </Row>
                    <Row className="show-grid">
                        <Col xs={6}>
                            <Panel header="Details">
                                <Table condensed striped>
                                    <tbody>
                                        <tr>
                                            <td>Added on</td>
                                            <td>{formatEpochMillis(download.createdEpochMillis)}</td>
                                        </tr>
                                        <tr>
                                            <td>Size</td>
                                            <td>{formatSizeInBytes(download.sizeBytes)}</td>
                                        </tr>
                                        <tr>
                                            <td>Status</td>
                                            <td>{download.status}</td>
                                        </tr>
                                        <tr>
                                            <td>Comment</td>
                                            <td>{formatComment(download.comment)}</td>
                                        </tr>
                                        <tr>
                                            <td>Hash</td>
                                            <td>{download.hash}</td>
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
                                        <td>{formatEta(download.etaSecs)}</td>
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
                            <ReactDataGrid
                                rowKey={"idx"}
                                columns={this._columns}
                                rowGetter={i => this.rowGetter(sortedIndexes, i)}
                                rowsCount={Object.keys(this.props.files).length}
                                minHeight={400}
                                rowHeight={26}
                                onGridSort={(col, dir) => this.handleGridSort(col, dir)}
                            />
                        </Col>
                    </Row>
                </Grid>

            </div>
        );
    }

    calculateSortedIndexes() {
        const files = this.props.files;
        const sortedIndexes = Object.keys(files);

        const sortColumn = this.props.state.sortColumn === undefined || this.props.state.sortDirection === "NONE" ? "idx" : this.props.state.sortColumn;

        let valueExtractor = idx => files[idx][sortColumn];
        let valueComparator = (l, r) => {
            if (l < r) return -1;
            if (l === r) return 0;
            return 1;
        };

        switch (sortColumn) {
            case "path":
                valueComparator = Intl.Collator().compare;
                break;
            case "done":
                valueExtractor = idx => files[idx].downloadedBytes / files[idx].sizeBytes;
                break;
            default:
        }
        sortedIndexes.sort((l, r) => {
            let vall = valueExtractor(l);
            let valr = valueExtractor(r);
            return valueComparator(vall, valr);
        });
        return sortedIndexes;
    }
}

function formatEpochMillis(createdEpochMillis) {
    const createdDate = new Date(0);
    createdDate.setUTCSeconds(createdEpochMillis / 1000);
    return dateFormat(createdDate, "yyyy/mm/dd HH:MM Z");
}

function formatEta(etaValue) {
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

    if (etaValue > 30) {
        return "\u221E"
    } else {
        return etaValue.toFixed(0) + etaSuffix;
    }
}

function formatComment(comment) {
    if (comment.match("^\\w+://.*$")) {
        return <a href={comment} target={"_blank"}>{comment}</a>;
    } else {
        return <span>{comment}</span>;
    }
}

class SizeFormatter extends React.Component {
    render() {
        if (0 === this.props.value) {
            return (
                <div>-</div>
            );
        } else {
            return (
                <div>{formatSizeInBytes(this.props.value)}</div>
            );
        }
    }
}

SizeFormatter.propTypes = {
    value: PropTypes.number.isRequired
};

class DoneFormatter extends React.Component {
    render() {
        const row = this.props.dependentValues;
        let pct = row.downloadedBytes / row.sizeBytes * 100;
        if (pct > 100) pct = 100;
        pct = pct.toFixed(0);
        return (
            <div>{pct}%</div>
        );
    }
}

// TODO files link
// TODO set priority
// TODO torrent actions
// TODO figure out size of the table

function mapStateToProps(state, own_props) {
    const hash = own_props.match.params.hash;
    return ({
        hash: hash,
        download: state.serverstate.downloads[hash],
        files: state.serverstate.downloadFiles[hash],
        state: state.ui.torrentview[hash] || {},
    });
}
export default connect(mapStateToProps)(TorrentView);