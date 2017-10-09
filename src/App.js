import React, {Component} from 'react';
import ReactDataGrid from "react-data-grid";

import data from "./data";

import './App.css';

class App extends Component {

    constructor() {
        super();

        this._columns = [
            { key: 'name', name: 'Name', sortable: true },
            { key: 'status', name: 'Status', width: 80, sortable: true },
            { key: 'sizeBytes', name: 'Size', width: 120, sortable: true },
            { key: 'uploadSpeedBytesPerSec', name: 'UL speed', width: 100, sortable: true },
            { key: 'uploadedBytes', name: 'ULed', width: 120, sortable: true },
            { key: 'availability', name: 'Avail.', width: 60, sortable: true },
        ];

        this.state = {
            selectedIndexes: [],
            rows: data.slice(),
        };
    }

    handleGridSort(sortColumn, sortDirection) {
        const comparer = (a, b) => {
            if (sortDirection === 'ASC') {
                return (a[sortColumn] > b[sortColumn]) ? 1 : -1;
            } else if (sortDirection === 'DESC') {
                return (a[sortColumn] < b[sortColumn]) ? 1 : -1;
            }
        };

        const rows = sortDirection === 'NONE' ? data.slice() : this.state.rows.sort(comparer);

        this.setState({
            rows: rows,
            selectedIndexes: this.state.selectedIndexes,
        });
    }

    onRowsSelected(rows) {
        this.setState({selectedIndexes: this.state.selectedIndexes.concat(rows.map(r => r.rowIdx))});
    }

    onRowsDeselected(rows) {
        let rowIndexes = rows.map(r => r.rowIdx);
        this.setState({selectedIndexes: this.state.selectedIndexes.filter(i => rowIndexes.indexOf(i) === -1 )});
    }

    rowGetter(i) {
        return this.state.rows[i];
    }

    render() {
        return (
            <ReactDataGrid
                rowKey={"key"}
                columns={this._columns}
                rowGetter={i => this.rowGetter(i)}
                rowsCount={this.state.rows.length}
                minHeight={750}
                rowSelection={{
                    showCheckbox: true,
                    enableShiftSelect: true,
                    onRowsSelected: r => this.onRowsSelected(r),
                    onRowsDeselected: r => this.onRowsDeselected(r),
                    selectBy: {
                        indexes: this.state.selectedIndexes
                    }
                }}
                onGridSort={(col, dir) => this.handleGridSort(col, dir)}
            />
        );
    }
}

export default App;
