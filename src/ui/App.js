import React from 'react';
import { connect } from "react-redux";

import ReactDataGrid from "react-data-grid";
import { ProgressBar } from "react-bootstrap";

class App extends React.Component {

    constructor(props) {
        super(props);

        this._columns = [
            { key: 'torrentName', name: 'Name', sortable: true },
            { key: 'status', name: 'Status', width: 100, sortable: true },
            { key: 'sizeBytes', name: 'Size', width: 120, sortable: true },
            { key: 'uploadBps', name: 'UL speed', width: 100, sortable: true },
            { key: 'uploadedBytes', name: 'ULed', width: 120, sortable: true },
        ];

        if (0 === this.props.list.length) {
            this.props.dispatch({
                type: "sagas.torrents.list.fetch",
            });
        }
    }

    rowGetter(i) {
        return this.props.list[i];
    }

    render() {
        if (this.props.list.length) {
            return (
                <ReactDataGrid
                    rowKey={"key"}
                    columns={this._columns}
                    rowGetter={i => this.rowGetter(i)}
                    rowsCount={this.props.list.length}
                    minHeight={750}
                />
            );
        } else {
            return (
                <div style={{
                        display: "inline-block",
                        position: "fixed",
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0,
                        width: "150px",
                        height: "40px",
                        margin: "auto",
                }}>
                    <ProgressBar active now={100}/>
                </div>
            );
        }
    }
}

function mapStateToProps(state) {
    return ({
        list: state.torrents.list || [],
    });
}
export default connect(mapStateToProps)(App);
