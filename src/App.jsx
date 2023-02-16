import { useState } from 'react'
import { removeDuplicates } from './other/utils';
import { getCommits, getIssues } from './other/api';
import CommitsGraph from './components/graphs';
import EmailTable from './components/table';
import './App.css'

const DEFAULT_MAX_REQUEST = 20;

export default function App() {

  const [list, setList] = useState([])
  const [commits, setCommits] = useState([])
  const [name, setName] = useState("")
  const [authEmails, setAuthEmails] = useState([])
  const [isBlank, setIsBlank] = useState(true)

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
    setAuthEmails([])
    getCommits(name, DEFAULT_MAX_REQUEST)
      .then(result => {
        updateCommitters(result)
        setCommits(result)
        setIsBlank(false)
      })
      .catch(error => alert("An error has occurred, please check the name and try again"))
    getIssues(name, DEFAULT_MAX_REQUEST)
      .then(result => {
        console.log(result[1])
      })
  }

  if (isBlank) {
    return (
      <div className="form-control">
        <div className="input-group">
          <input type="text" placeholder="Search…" className="input input-bordered w-full" value={name} onChange={evt => setName(evt.target.value)} />
          <button className="btn btn-square" onClick={updateData}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </button>
        </div>
      </div>
    )
  } else {
    return (
      <div>
        <div className="form-control">
          <div className="input-group">
            <input type="text" placeholder="Search…" className="input input-bordered w-full" value={name} onChange={evt => setName(evt.target.value)} />
            <button className="btn btn-square" onClick={updateData}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
          </div>
        </div>
        <div className='recharts-container'>
          <CommitsGraph data={commits} authEmails={authEmails} />
        </div>
        <EmailTable list={list} handle={updateSelected} />
      </div>
    )
  }
}