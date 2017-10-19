import PropTypes from 'prop-types';
import React from 'react';
import { connect } from "react-redux";

import ReactDataGrid from "react-data-grid";

import dateFormat from "dateformat";

import { formatSizeInBytes } from "./Util";
import TorrentLink from "./TorrentLink";

class TorrentGrid extends React.Component {

    constructor(props) {
        super(props);

        this._columns = [
            {
                key: 'createdEpochMillis',
                name: 'Added',
                width: 70,
                formatter: DateFormatter,
                sortable: true,
            }, {
                key: 'torrentName',
                name: 'Name',
                sortable: true,
                formatter: NameFormatter,
                getRowMetaData: (row) => row,
            }, {
                key: 'status',
                name: 'Status',
                width: 100,
                sortable: true,
                cellClass: "aligncenter",
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
                key: 'downloadBps',
                name: 'DL speed',
                width: 75,
                formatter: SpeedFormatter,
                cellClass: "alignright",
                sortable: true,
            }, {
                key: 'uploadBps',
                name: 'UL speed',
                width: 75,
                formatter: SpeedFormatter,
                cellClass: "alignright",
                sortable: true,
            }, {
                key: 'uploadedBytes',
                name: 'ULed',
                width: 65,
                formatter: SizeFormatter,
                cellClass: "alignright",
                sortable: true,
            },
        ];
    }

    rowGetter(i) {
        const idx = this.props.gridstate.sortDirection === "ASC" ? i : this.props.gridstate.hashArray.length - i -1;
        const hash = this.props.gridstate.hashArray[idx];
        return this.props.downloads[hash];
    }

    handleGridSort(sortColumn, sortDirection) {
        this.props.dispatch({
            type: "reducers.torrentgrid.sortchanged",
            sortColumn: sortColumn,
            sortDirection: sortDirection,
        });
    }

    onRowsSelected(rows) {
        this.props.dispatch({
            type: "reducers.ui.torrentgtid.hashSelectionChanged",
            hashes: rows.map(r => r.row.hash),
            selected: true,
        });
    }

    onRowsDeselected(rows) {
        this.props.dispatch({
            type: "reducers.ui.torrentgtid.hashSelectionChanged",
            hashes: rows.map(r => r.row.hash),
            selected: false,
        });
    }

    render() {
        let selectedHashes = {};
        if (this.props.gridstate.selectedHashes !== undefined) {
            selectedHashes = this.props.gridstate.selectedHashes;
        }
        selectedHashes = Object.keys(selectedHashes);

        return (<ReactDataGrid
                    rowKey={"hash"}
                    columns={this._columns}
                    rowGetter={i => this.rowGetter(i)}
                    rowsCount={this.props.gridstate.hashArray.length}
                    minHeight={750}
                    rowHeight={26}
                    onGridSort={(col, dir) => this.handleGridSort(col, dir)}
                    rowSelection={{
                        showCheckbox: true,
                        enableShiftSelect: true,
                        onRowsSelected: r => this.onRowsSelected(r),
                        onRowsDeselected: r => this.onRowsDeselected(r),
                        selectBy: { keys: {
                            rowKey: 'hash',
                            values: selectedHashes,
                        }}
                    }}
                />);
        // TODO https://stackoverflow.com/questions/36862334/get-viewport-window-height-in-reactjs
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

class SpeedFormatter extends React.Component {
    render() {
        if (0 === this.props.value) {
            return (
                <div>-</div>
            );
        } else {
            return (
                <div>{formatSizeInBytes(this.props.value)}/s</div>
            );
        }
    }
}

SpeedFormatter.propTypes = {
    value: PropTypes.number.isRequired
};

class DateFormatter extends React.Component {
    render() {
        const utcSeconds = this.props.value / 1000;
        const date = new Date(0);
        date.setUTCSeconds(utcSeconds);
        return (<div>{dateFormat(date, "yy/mm/dd")}</div>);
    }
}

DateFormatter.propTypes = {
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

class NameFormatter extends React.Component {
    render() {
        const row = this.props.dependentValues;
        return (
            <TorrentLink hash={row.hash} name={row.torrentName} />
        );
    }
}

function mapStateToProps(state) {
    return ({
        downloads: state.serverstate.downloads || {},
        gridstate: state.ui.torrentgrid,
    });
}
export default connect(mapStateToProps)(TorrentGrid);


// todo search https://stackoverflow.com/questions/6334692/how-to-use-a-lucene-analyzer-to-tokenize-a-string
// todo start/stop/force/delete actions
// todo position column