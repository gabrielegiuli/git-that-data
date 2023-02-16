import { ComposedChart, Bar, Legend, XAxis, YAxis, Tooltip, Line } from 'recharts';
import { useState, useCallback } from 'react'
import axios from 'axios'
import './App.css'

const DEFAULT_PER_PAGE = 100;
const DEFAULT_MAX_REQUEST = 20;

function EmailTable(props) {
  return (
    <div className="table-wrp block max-h-96">
      <table className="table table-zebra w-full">
        <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody className="h-96 overflow-y-auto">
          {props.list.map((element, i) =>
            <EmailRow element={element} key={i} number={i + 1} handle={props.handle} />
          )}
        </tbody>
      </table>
    </div>
  )
}

function EmailRow(props) {
  return (
    <tr>
      <th>
        <label>
          <input type="checkbox" className="checkbox" onChange={evt => props.handle(evt.target.checked, props.element.email)} />
        </label>
      </th>
      <th>{props.element.name}</th>
      <td>{props.element.email}</td>
    </tr>
  )
}

function BarGraph({ data, authEmails }) {

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
    console.log()
  })

  return (
    <ComposedChart width={850} height={400} data={cumulative}>
      <XAxis dataKey="stamp" />
      <YAxis label={{ value: 'New Commits', angle: -90, position: 'insideLeft' }} yAxisId="left" />
      <YAxis label={{ value: 'New Commits', angle: -90, position: 'insideLeft' }} yAxisId="right" orientation="right" />
      <Bar type="monotone" dataKey="Authors" barSize={30} fill="#8884d8" yAxisId="left" stackId="a"/>
      <Bar type="monotone" dataKey="NonAuthors" barSize={30} fill="#82ca9d" yAxisId="left" stackId="a"/>
      <Line type="monotone" dataKey="Total" yAxisId="right" />
      <Legend/>
      <Tooltip/>
    </ComposedChart>
  )
}

function removeDuplicates(myArr, prop) {
  return myArr.filter((obj, pos, arr) => {
    return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos
  })
}

function range(from, to) {
  const r = [];
  for (let i = from; i <= to; i++) {
    r.push(i);
  }
  return r;
}

function groupBy(xs, key) {
  return xs.reduce(function (rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

function getPosition(string, subString, index) {
  return string.split(subString, index).join(subString).length;
}

function getCommitsPage(repo, token, page) {
  let url = `https://api.github.com/repos/${repo}/commits?per_page=${DEFAULT_PER_PAGE}`;

  if (page !== undefined) {
    url = `${url}&page=${page}`;
  }

  return axios.get(url, {
    headers: {
      Accept: "application/vnd.github.v3.star+json",
      Authorization: token ? `token ${token}` : "",
    },
  });
}

async function getCommits(repo, maxRequestAmount, token) {
  const patchRes = await getCommitsPage(repo, token)
  const headerLink = patchRes.headers["link"] || "";

  let pageCount = 1;
  const regResult = /next.*&page=(\d*).*last/.exec(headerLink);

  if (regResult) {
    if (regResult[1] && Number.isInteger(Number(regResult[1]))) {
      pageCount = Number(regResult[1]);
    }
  }

  if (pageCount === 1 && patchRes?.data?.length === 0) {
    throw {
      status: patchRes.status,
      data: [],
    };
  }

  const requestPages = [];
  if (pageCount < maxRequestAmount) {
    requestPages.push(...range(1, pageCount));
  } else {
    range(1, maxRequestAmount).map((i) => {
      requestPages.push(Math.round((i * pageCount) / maxRequestAmount) - 1);
    });
    if (!requestPages.includes(1)) {
      requestPages.unshift(1);
    }
  }

  const resArray = await Promise.all(
    requestPages.map((page) => {
      return getCommitsPage(repo, token, page);
    })
  );

  const commits = []
  resArray.map(res => {
    const { data } = res;
    commits.push(...data);
  })

  return commits
}

export default function App() {

  const [list, setList] = useState([])
  const [commits, setCommits] = useState([])
  const [name, setName] = useState("")
  const [authEmails, setAuthEmails] = useState([])

  const updateSelected = (newState, email) => {
    var new_emails = [...authEmails]
    if (!newState) {
      new_emails = authEmails.filter(x => x !== email);
    } else {
      new_emails.push(email)
    }
    console.log(new_emails)
    setAuthEmails(new_emails)
  }

  const updateCommitters = (result) => {
    const new_list = []
    result.map(element => {
      const new_author = { name: element.commit.author.name, email: element.commit.author.email }
      new_list.push(new_author)
    })
    setList(removeDuplicates(new_list, 'email'))
  }

  const updateData = () => {
    getCommits(name, DEFAULT_MAX_REQUEST)
      .then(result => {
        updateCommitters(result)
        setCommits(result)
      })
      .catch(error => alert("An error has occurred, please check the name and try again"))
  }

  return (
    <div>
      <div className='search'>
        <div className='component'>
          <input type="text" placeholder="Repo Name..." className="input w-full max-w-xs" value={name} onChange={evt => setName(evt.target.value)} />
        </div>
        <div className='component'>
          <button className="btn btn-primary" onClick={updateData}>Button</button>
        </div>
      </div>
      <BarGraph data={commits} authEmails={authEmails} />
      <EmailTable list={list} handle={updateSelected} />
    </div>
  )
}