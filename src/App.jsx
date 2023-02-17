import { useState, useEffect } from 'react'
import { token } from '../auth/github_credentials';
import { removeDuplicates } from './other/utils';
import { getCommits, getIssues, getPullRequests } from './other/api';
import CommitsGraph from './components/commits_graph';
import IssuesGraph from './components/issues_graph';
import EmailTable from './components/table';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import './App.css'
import PRGraph from './components/pr_graph';

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
  const [recordSize, setRecordSize] = useState(false)

  const [isTableLoading, setIsTableLoading] = useState(true)
  const [isPRLoading, setIsPRLoading] = useState(true)
  const [isIssuesLoading, setIsIssuesLoading] = useState(true)
  const [isCommitsLoading, setIsCommitsLoading] = useState(true)

  useEffect(() => {setIsTableLoading(false)}, [list])
  useEffect(() => {setIsPRLoading(false)}, [pullRequests])
  useEffect(() => {setIsIssuesLoading(false)}, [issues])
  useEffect(() => {setIsCommitsLoading(false)}, [commits])

  const setAllLoading = () => {
    setIsTableLoading(true)
    setIsPRLoading(true)
    setIsIssuesLoading(true)
    setIsCommitsLoading(true)
  }

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
    setIsBlank(false)
    setAllLoading()
    setAuthEmails([])
    getIssues(name, DEFAULT_MAX_REQUEST, token)
      .then(result => {
        setIssues(result)
      })
      .catch(error => alert("An error has occurred, please check the name and try again"))
    getPullRequests(name, DEFAULT_MAX_REQUEST, recordSize, token)
      .then(result => {
        setPullRequests(result)
        console.log(pullRequests)
      })
    getCommits(name, DEFAULT_MAX_REQUEST, token)
      .then(result => {
        updateCommitters(result)
        setCommits(result)
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
        <div className="form-control w-48 pt-2" >
          <div className="tooltip tooltip-bottom" data-tip="Limits API rate burn">
            <label className="label cursor-pointer">
              <span className="label-text">Aggregate PR Size</span>
              <input type="checkbox" className="toggle" defaultChecked={recordSize} onChange={e => setRecordSize(e.target.checked)}/>
            </label>
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
          <div className="form-control w-48 pt-2" >
          <div className="tooltip tooltip-bottom" data-tip="Limits API rate burn">
            <label className="label cursor-pointer">
              <span className="label-text">Aggregate PR Size</span>
              <input type="checkbox" className="toggle" defaultChecked={recordSize} onChange={e => setRecordSize(e.target.checked)}/>
            </label>
          </div>
        </div>
          <div className='recharts-container'>
            <PRGraph data={pullRequests} loading={isPRLoading}/>
            <IssuesGraph data={issues} loading={isIssuesLoading}/>
            <CommitsGraph data={commits} authEmails={authEmails} loading={isCommitsLoading}/>
          </div>
          <EmailTable list={list} handle={updateSelected} loading={isTableLoading}/>
        </div>
      </ThemeProvider>
    )
  }
}