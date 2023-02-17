# git-that-data
The missing analytics for GitHub repos. 

## Usage
Simply write the repo name (`<owner>/<repo>`) in the search-bar and hit go! Three plots will appear
- Pull Requests: shows the weekly activity in terms of pull requests, also discerning between M, L, XL and XXL pull request sizes (if enabled before searching)
- Issues: shows the weekly activity in newly opened and closed issues
- Commits: shows the weekly activitz in commits. By selecting committers from the table below, one can see how much a certain group of committers took engaged in the develpment of the repo

In addition, a table listing all the contributors of the repo will appear below the charts. It is also possible to export the table data in a `.csv` file.

## Under the Hood
This WebApp is built using _Vite_, _React_, _MaterialUI_ and _DaisyUI_. Data is directly pulled from GitHub using the [GitHub APIs](https://docs.github.com/en/rest) 

### Known Issues
- The graphical user interface is not optimized for different screen sizes (e.g., not mobile-comaptible) and only dark mode is avaialble
- Table checkboxes do not get reset when performing a new search
- Rate limiting (most likely to happen when aggregating pull request data) is not flagged to the user and results in an "infinite" loading time for the charts
- Pressing the enter button does not trigger the search
- If any of the timeseries data is not present (e.g., one repo does not have any pull request) the affected charts get stuck in loading