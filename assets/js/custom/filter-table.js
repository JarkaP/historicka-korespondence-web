/* global Tabulator ajaxUrl homeUrl lettersSuffix */

var table, selectAuthor, selectRecipient, selectOrigin, selectDestination

function getTimestampFromDate(year, month, day) {
    let d = new Date()
    d.setFullYear(year ? year : 0, month ? month - 1 : 0, day ? day : 1)
    return d.getTime()
}

function listLetterMultiData(data) {
    if (!Array.isArray(data)) {
        return data
    }

    let list = ''
    data.forEach((author) => {
        list += `<li>${author}</li>`
    })

    return `<ul class="list-unstyled mb-0">${list}</ul>`
}

function sortLetterMultiData(aData, bData) {
    let a = aData // if is string
    let b = bData // if is string

    if (!aData) {
        a = ''
    } else if (Array.isArray(aData) && aData[0]) {
        a = aData[0]
    }

    if (!bData) {
        b = ''
    } else if (Array.isArray(bData) && bData[0]) {
        b = bData[0]
    }

    return a.localeCompare(b)
}

function countData(data, filtered) {
    let authors = {}
    let recipients = {}
    let origins = {}
    let destinations = {}
    let years = { min: null, max: null }

    data.map((item) => {
        if (filtered) {
            item = item.getData()
        }

        authors = countDataDimension(authors, item.aut)
        recipients = countDataDimension(recipients, item.rec)
        origins = countDataDimension(origins, item.ori)
        destinations = countDataDimension(destinations, item.des)
        years = getMinMaxYears(years, item.yy)
    })

    return {
        authors: authors,
        recipients: recipients,
        origins: origins,
        destinations: destinations,
        years: years,
    }
}

function countDataDimension(resultData, row) {
    if (!row || row == 'null') {
        return resultData
    }

    if (Array.isArray(row)) {
        row.forEach((r) => {
            if (!resultData.hasOwnProperty(r)) {
                resultData[r] = 1
            } else {
                resultData[r]++
            }
        })
    } else {
        if (!resultData.hasOwnProperty(row)) {
            resultData[row] = 1
        } else {
            resultData[row]++
        }
    }

    return resultData
}

function updateSelects(data, filtered) {
    const counted = countData(data, filtered)
    selectAuthor.setData(createSelectData(counted.authors))
    selectRecipient.setData(createSelectData(counted.recipients))
    selectOrigin.setData(createSelectData(counted.origins))
    selectDestination.setData(createSelectData(counted.destinations))

    if (!table) {
        return
    }

    table.getFilters().forEach((currentFilter) => {
        if (currentFilter.field == 'aut') {
            setSingleSelectByFilter(selectAuthor, currentFilter)
        }

        if (currentFilter.field == 'rec') {
            setSingleSelectByFilter(selectRecipient, currentFilter)
        }

        if (currentFilter.field == 'ori') {
            setSingleSelectByFilter(selectOrigin, currentFilter)
        }

        if (currentFilter.field == 'des') {
            setSingleSelectByFilter(selectDestination, currentFilter)
        }
    })
}

function setSingleSelectByFilter(select, currentFilter) {
    select.setData([
        select.data.data.find((item) => {
            return item.value == currentFilter.value
        }),
    ])
}

function createSelectData(data) {
    let result = []

    data = Object.entries(data)

    data.sort((a, b) => {
        return b[1] - a[1]
    })

    result.push({ placeholder: true, text: '', value: '' })

    data.forEach((item) => {
        result.push({
            text: item[0] + ' (' + item[1] + ')',
            value: item[0],
        })
    })

    return result
}

function setSelects() {
    selectAuthor = new SlimSelect({
        allowDeselect: true,
        onChange: (info) => {
            updateFilters(info.value, 'aut')
        },
        select: '#author',
    })

    selectRecipient = new SlimSelect({
        allowDeselect: true,
        onChange: (info) => {
            updateFilters(info.value, 'rec')
        },
        select: '#recipient',
    })

    selectOrigin = new SlimSelect({
        allowDeselect: true,
        onChange: (info) => {
            updateFilters(info.value, 'ori')
        },
        select: '#origin',
    })

    selectDestination = new SlimSelect({
        allowDeselect: true,
        onChange: (info) => {
            updateFilters(info.value, 'des')
        },
        select: '#destination',
    })
}

function updateFilters(filterValue, filterName) {
    let currentFilters = table.getFilters()

    currentFilters.forEach((currentFilter) => {
        if (currentFilter.field == filterName) {
            table.removeFilter(
                currentFilter.field,
                currentFilter.type,
                currentFilter.value
            )
        }
    })

    if (filterValue && filterValue != 'undefined') {
        table.addFilter(filterName, 'like', filterValue)
    }
}

function getMinMaxYears(resultData, year) {
    year = parseInt(year)

    if (!Number.isInteger(year) || year == 0) {
        return resultData
    }

    if (resultData.min == null || resultData.min > year) {
        resultData.min = year
    }

    if (resultData.max == null || resultData.max < year) {
        resultData.max = year
    }

    return resultData
}

if (document.getElementById('letters')) {
    setSelects()

    table = new Tabulator('#letters-table', {
        ajaxResponse: function (url, params, response) {
            sessionStorage.setItem(
                lettersSuffix + '-letters',
                JSON.stringify(response)
            )

            return response
        },
        columns: [
            {
                field: 'id',
                formatter: function (cell) {
                    const id = cell.getValue()
                    return `<a href="${homeUrl}browse/letter/${id}" target="_blank">Detail</a>`
                },
                frozen: true,
                title: '',
                width: 54,
            },
            {
                field: 'sig',
                formatter: 'textarea',
                title: 'Signature',
            },
            {
                field: 'date',
                formatter: 'textarea',
                mutator: function (value, data) {
                    let year = data.yy ? data.yy : 0
                    let month = data.mm ? data.mm : 0
                    let day = data.dd ? data.dd : 0
                    return `${year}/${month}/${day}`
                },
                sorter: function (a, b, aRow, bRow) {
                    let aRowData = aRow.getData()
                    let bRowData = bRow.getData()

                    a = getTimestampFromDate(
                        aRowData.yy,
                        aRowData.mm,
                        aRowData.dd
                    )

                    b = getTimestampFromDate(
                        bRowData.yy,
                        bRowData.mm,
                        bRowData.dd
                    )

                    return a - b
                },
                title: 'Date',
            },
            {
                field: 'aut',
                formatter: function (cell) {
                    cell.getElement().style.whiteSpace = 'normal'
                    return listLetterMultiData(cell.getValue())
                },
                sorter: function (a, b) {
                    return sortLetterMultiData(a, b)
                },
                title: 'Author',
                variableHeight: true,
            },
            {
                field: 'rec',
                formatter: function (cell) {
                    cell.getElement().style.whiteSpace = 'normal'
                    return listLetterMultiData(cell.getValue())
                },
                sorter: function (a, b) {
                    return sortLetterMultiData(a, b)
                },
                title: 'Recipient',
                variableHeight: true,
            },
            {
                field: 'ori',
                formatter: function (cell) {
                    cell.getElement().style.whiteSpace = 'normal'
                    return listLetterMultiData(cell.getValue())
                },
                sorter: function (a, b) {
                    return sortLetterMultiData(a, b)
                },
                title: 'Origin',
                variableHeight: true,
            },
            {
                field: 'des',
                formatter: function (cell) {
                    cell.getElement().style.whiteSpace = 'normal'
                    return listLetterMultiData(cell.getValue())
                },
                sorter: function (a, b) {
                    return sortLetterMultiData(a, b)
                },
                title: 'Destination',
                variableHeight: true,
            },
        ],
        dataFiltered: function (filters, rows) {
            document.getElementById('search-count').innerHTML = rows.length
            updateSelects(rows, true)
        },
        dataLoaded: function (data) {
            document.getElementById('letters-filter').classList.remove('d-none')
            document.getElementById('counter').classList.remove('d-none')
            document.getElementById('total-count').innerHTML = data.length
            updateSelects(data, false)
        },
        layout: 'fitColumns',
        maxHeight: '100%',
        pagination: 'local',
        paginationSize: 10,
        resizableColumns: false,
        selectable: false,
        tooltips: true,
    })

    if (sessionStorage[lettersSuffix + '-letters']) {
        table.setData(
            JSON.parse(sessionStorage.getItem(lettersSuffix + '-letters'))
        )
    } else {
        table.setData(
            ajaxUrl + '/?action=index_hiko_letters&type=' + lettersSuffix
        )
    }
}
