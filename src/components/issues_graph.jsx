import { ComposedChart, Bar, Legend, XAxis, YAxis, Tooltip, Line } from 'recharts';
import { groupBy, getPosition } from '../other/utils';

function processData(data) {
    const processed_issues = []
    for (var issue of data) {
        var date = issue.created_at.substring(0, getPosition(issue.created_at, 'T', 1))
        var month = issue.created_at.substring(0, getPosition(issue.created_at, '-', 2))
        var day = date.substring(getPosition(date, '-', 2) + 1, date.length)

        var week = Math.floor(day / 7) + 1
        if (week >= 5) {
            week = 4
        }
        var stamp = month + 'W' + week;

        var new_issue = { state: issue.state, date: issue.created_at, stamp: stamp }
        processed_issues.push(new_issue)
    }

    var grouped_issues = groupBy(processed_issues, 'stamp')
    var out_data = []

    for (stamp in grouped_issues) {
        var open = 0
        var closed = 0
        var count = grouped_issues[stamp].length

        for (var issue of grouped_issues[stamp]) {
            if (issue.state == 'open') {
                open++
            } else if (issue.state == 'closed') {
                closed++
            }
        }

        var new_out = { stamp: stamp, open: open, closed: closed, count: count }
        out_data.push(new_out)
    }
    out_data.sort((a, b) => (a.stamp > b.stamp) ? 1 : -1)

    const cumulative = []
    var prev = 0
    out_data.map(issue => {
        prev += issue.count
        cumulative.push({ Total: prev, Open: issue.open, Closed: issue.closed, stamp: issue.stamp })
    })
    return cumulative
}

export default function IssuesGraph({ data }) {
    const cumulative = processData(data)
    return (
        <ComposedChart width={900} height={500} data={cumulative} className='recharts-wrapper'>
            <XAxis dataKey="stamp" />
            <YAxis label={{ value: 'New Issues', angle: -90, position: 'insideLeft' }} yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Bar type="monotone" dataKey="Open" barSize={30} fill="#82ca9d" yAxisId="left" stackId="a" />
            <Bar type="monotone" dataKey="Closed" barSize={30} fill="#8884d8" yAxisId="left" stackId="a" />
            <Line type="monotone" dataKey="Total" yAxisId="right" />
            <Legend />
            <Tooltip />
        </ComposedChart>
    )
}