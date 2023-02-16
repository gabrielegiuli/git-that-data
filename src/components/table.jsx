export default function EmailTable(props) {
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