import { ComposedChart, Bar, Legend, XAxis, YAxis, Tooltip, Line } from 'recharts';
import { groupBy, getPosition } from '../other/utils';

function processData(data, authEmails) {
  const processed_commits = []
  for (const commit of data) {
    var element = commit.commit.committer
    var date = element.date.substring(0, getPosition(element.date, 'T', 1))
    var month = element.date.substring(0, getPosition(element.date, '-', 2))
    var day = date.substring(getPosition(date, '-', 2) + 1, date.length)

    var week = Math.floor(day / 7) + 1
    if (week >= 5) {
      week = 4
    }
    var stamp = month + 'W' + week;

    var new_commit = { email: commit.commit.author.email, stamp: stamp }
    processed_commits.push(new_commit)
  }

  var grouped_commits = groupBy(processed_commits, 'stamp')
  var out_data = []

  for (stamp in grouped_commits) {
    var auth = 0
    var non_auth = 0
    var count = grouped_commits[stamp].length

    for (var commit of grouped_commits[stamp]) {
      if (authEmails.indexOf(commit.email) == -1) {
        non_auth++
      } else {
        auth++
      }
    }

    var new_out = { stamp: stamp, non_auth: non_auth, auth: auth, count: count }
    out_data.push(new_out)
    out_data.sort((a, b) => (a.stamp > b.stamp) ? 1 : -1)

  }

  const cumulative = []
  var prev = 0
  out_data.map(commit => {
    prev += commit.count
    cumulative.push({ Total: prev, stamp: commit.stamp, Authors: commit.auth, NonAuthors: commit.non_auth })
  })

  return cumulative
}

export default function CommitsGraph({ data, authEmails }) {
  const cumulative = processData(data, authEmails)
  return (
    <ComposedChart width={900} height={500} data={cumulative} className='recharts-wrapper'>
      <XAxis dataKey="stamp" />
      <YAxis label={{ value: 'New Commits', angle: -90, position: 'insideLeft' }} yAxisId="left" />
      <YAxis yAxisId="right" orientation="right" />
      <Bar type="monotone" dataKey="Authors" barSize={30} fill="#82ca9d" yAxisId="left" stackId="a" />
      <Bar type="monotone" dataKey="NonAuthors" barSize={30} fill="#8884d8" yAxisId="left" stackId="a" />
      <Line type="monotone" dataKey="Total" yAxisId="right" />
      <Legend />
      <Tooltip />
    </ComposedChart>
  )
}

