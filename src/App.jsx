import React, { useState } from 'react'
import './App.css'

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
            <EmailRow element={element} key={i} number={i+1}/>
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

export default function App() {
  
  const [list, setList] = useState([])
  const [name, setName] = useState("")

  const updateList = () => {
    const url = 'https://api.github.com/repos/' + name + '/commits?per_page=100'
    fetch(url)
    .then((response) => response.json())
    .then((data) => {
      var new_list = []
      data.forEach(element => {
        new_list.push({
          email: element.commit.author.email, 
          name: element.commit.author.name
        })
      })
      new_list = removeDuplicates(new_list, 'email')
      setList(new_list)
    })
    .catch(() => alert("Check the repo name and try again"))

  }

  return ( 
    <div>
      <div className='search'>
        <div className='component'>
          <input type="text" placeholder="Repo Name..." className="input w-full max-w-xs" value={name} onChange={evt => setName(evt.target.value)}/>
        </div>
        <div className='component'>
          <button className="btn btn-primary" onClick={updateList}>Button</button>
        </div>
      </div>
      <EmailTable list={list}/>
    </div>
  )
}