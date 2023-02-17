import { ComposedChart, Bar, Legend, XAxis, YAxis, Tooltip, Line } from 'recharts';
import { groupBy, getPosition } from '../other/utils';
import { CircularProgress } from '@mui/material';

function processData(data) {
    const processed_prs = []
    for (var pr of data) {
        var date = pr.created_at.substring(0, getPosition(pr.created_at, 'T', 1))
        var month = pr.created_at.substring(0, getPosition(pr.created_at, '-', 2))
        var day = date.substring(getPosition(date, '-', 2) + 1, date.length)

        var week = Math.floor(day / 7) + 1
        if (week >= 5) {
            week = 4
        }
        var stamp = month + 'W' + week;

        var new_pr = { size: pr.size, date: pr.created_at, stamp: stamp }
        processed_prs.push(new_pr)
    }

    var grouped_prs = groupBy(processed_prs, 'stamp')
    var out_data = []

    for (stamp in grouped_prs) {
        var m = 0
        var l = 0
        var xl = 0
        var xxl = 0
        var closed_number = 0

        var count = grouped_prs[stamp].length

        for (var pr of grouped_prs[stamp]) {

            if (pr.state == 'closed') {
                closed_number++
            }

            if (pr.size == 'm') {
                m++
            } else if (pr.size == 'l') {
                l++
            } else if (pr.size == 'xl') {
                xl++
            } else if (pr.size == 'xxl') {
                xxl++
            }
        }

        var new_out = { stamp: date, count: count, m: m, l: l, xl: xl, xxl: xxl, closed_number: closed_number }
        out_data.push(new_out)
    }
    out_data.sort((a, b) => (a.stamp > b.stamp) ? 1 : -1)

    const cumulative = []
    var prev = 0
    out_data.map(pr => {
        prev += pr.count
        cumulative.push({ Total: prev, M: pr.m, L: pr.l, XL: pr.xl, XXL: pr.xxl, stamp: pr.stamp, Count: pr.count, Closed: pr.closed_number })
    })
    return cumulative
}

export default function PRGraph({ data, loading }) {
    const cumulative = processData(data)
    if (loading) {
        return (
            <div className='outer'>
                <div className='blurr below'>
                    <ComposedChart width={900} height={500} data={cumulative} className='recharts-wrapper'>
                        <XAxis dataKey="stamp" />
                        <YAxis label={{ value: 'New Pull Requests', angle: -90, position: 'insideLeft' }} yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Bar type="monotone" dataKey="M" barSize={30} fill="#8884d8" yAxisId="left" stackId="a" />
                        <Bar type="monotone" dataKey="L" barSize={30} fill="#82ca9d" yAxisId="left" stackId="a" />
                        <Bar type="monotone" dataKey="XL" barSize={30} fill="#ffc658" yAxisId="left" stackId="a" />
                        <Bar type="monotone" dataKey="XXL" barSize={30} fill="#5F9EA0" yAxisId="left" stackId="a" />
                        <Line type="monotone" dataKey="Total" yAxisId="right" />
                        <Legend />
                    </ComposedChart>
                </div>
                <div className='top'>
                        <CircularProgress size="7rem"/>
                </div>
            </div>

        )
    } else {
        return (
            <ComposedChart width={900} height={500} data={cumulative} className='recharts-wrapper'>
                <XAxis dataKey="stamp" />
                <YAxis label={{ value: 'New Pull Requests', angle: -90, position: 'insideLeft' }} yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Bar type="monotone" dataKey="M" barSize={30} fill="#8884d8" yAxisId="left" stackId="a" />
                <Bar type="monotone" dataKey="L" barSize={30} fill="#82ca9d" yAxisId="left" stackId="a" />
                <Bar type="monotone" dataKey="XL" barSize={30} fill="#ffc658" yAxisId="left" stackId="a" />
                <Bar type="monotone" dataKey="XXL" barSize={30} fill="#5F9EA0" yAxisId="left" stackId="a" />
                <Line type="monotone" dataKey="Total" yAxisId="right" />
                <Legend />
                <Tooltip />
            </ComposedChart>
        )
    }
}