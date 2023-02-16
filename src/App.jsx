import React, { useState } from 'react'
import axios from 'axios'
import './App.css'

const DEFAULT_PER_PAGE = 100;
const DEFAULT_MAX_REQUEST = 20;

function EmailTable(props) {
  return (
    <div className="overflow-x-auto">
      <table className="table w-full">
        <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {props.list.map((element, i) =>
            <EmailRow element={element} key={i} number={i + 1} />
          )}
        </tbody>
      </table>
    </div>
  )
}

function EmailRow(props) {
  return (
    <tr>
      <th>{props.number}</th>
      <th>{props.element.name}</th>
      <td>{props.element.email}</td>
    </tr>
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
  const [name, setName] = useState("")

  const updateCommitters = (result) => {
    const new_list = []
      result.map(element => {
        const new_author = {name: element.commit.author.name, email: element.commit.author.email}
        new_list.push(new_author)
      })
      setList(removeDuplicates(new_list, 'email'))
  }

  const updateData = () => {
    getCommits(name, DEFAULT_MAX_REQUEST)
    .then(result => {
      updateCommitters(result)
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
      <EmailTable list={list} />
    </div>
  )
}