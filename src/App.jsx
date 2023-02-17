import { useState } from 'react'
import { token } from '../auth/github_credentials'; 
import { removeDuplicates } from './other/utils';
import { getCommits, getIssues, getPullRequests } from './other/api';
import CommitsGraph from './components/commits_graph';
import IssuesGraph from './components/issues_graph';
import EmailTable from './components/table';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import './App.css'

const DEFAULT_MAX_REQUEST = 20;

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

export default function App() {

  const [pullRequests, setPullRequests] = useState([])
  const [issues, setIssues] = useState([])
  const [list, setList] = useState([])
  const [commits, setCommits] = useState([])
  const [name, setName] = useState("")
  const [authEmails, setAuthEmails] = useState([])
  const [isBlank, setIsBlank] = useState(true)

  const updateSelected = (ids) => {
    const selectedNames = ids.map((id) => {
      return list[id].email
    })
    setAuthEmails(selectedNames)
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
    getIssues(name, DEFAULT_MAX_REQUEST, token)
    .then(result => {
      setIssues(result)
    })
    .catch(error => alert("An error has occurred, please check the name and try again"))
    getPullRequests(name, DEFAULT_MAX_REQUEST, token)
    .then(result => {
      setPullRequests(result)
      console.log(pullRequests)
    })
    getCommits(name, DEFAULT_MAX_REQUEST, token)
      .then(result => {
        updateCommitters(result)
        setCommits(result)
        setIsBlank(false)
      })
      .catch(error => alert("An error has occurred, please check the name and try again"))
  }

  if (isBlank) {
    return (
      <ThemeProvider theme={darkTheme}>
        <div className="form-control">
          <div className="input-group">
            <input type="text" placeholder="Search…" className="input input-bordered w-full" value={name} onChange={evt => setName(evt.target.value)} />
            <button className="btn btn-square" onClick={updateData}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
          </div>
        </div>
      </ThemeProvider>
    )
  } else {
    return (
      <ThemeProvider theme={darkTheme}>
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
            <IssuesGraph data={issues}/>
            <CommitsGraph data={commits} authEmails={authEmails} />
          </div>
          <EmailTable list={list} handle={updateSelected} />
        </div>
      </ThemeProvider>
    )
  }
}