import axios from 'axios'
import { range } from './utils';

const DEFAULT_PER_PAGE = 100;

async function structuredRequest(repo, maxRequestAmount, token, requestFunction) {
    const patchRes = await requestFunction(repo, token)
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
            return requestFunction(repo, token, page);
        })
    )

    const out = []
    resArray.map(res => {
        const { data } = res;
        out.push(...data);
    })

    return out
}

async function getPullRequestSize(repo, token, number) {
    let url = `https://api.github.com/repos/${repo}/pulls/${number}`

    const result = await axios.get(url, {
        headers: {
            Accept: "application/vnd.github.v3.star+json",
            Authorization: token ? `token ${token}` : "",
        },
    })

    const total = result.data.additions + result.data.deletions

    if (total < 100) {
        return "m"
    } else if (total < 500) {
        return "l"
    } else if (total < 1000) {
        return "xl"
    } else {
        return "xxl"
    }

}

function getPullRequestsPage(repo, token, page) {
    let url = `https://api.github.com/repos/${repo}/pulls?per_page=${DEFAULT_PER_PAGE}&state=all`

    if (page !== undefined) {
        url = `${url}&page=${page}`;
    }

    return axios.get(url, {
        headers: {
            Accept: "application/vnd.github.v3.star+json",
            Authorization: token ? `token ${token}` : "",
        },
    })
}

function getCommitsPage(repo, token, page) {
    let url = `https://api.github.com/repos/${repo}/commits?per_page=${DEFAULT_PER_PAGE}`

    if (page !== undefined) {
        url = `${url}&page=${page}`;
    }

    return axios.get(url, {
        headers: {
            Accept: "application/vnd.github.v3.star+json",
            Authorization: token ? `token ${token}` : "",
        },
    })
}

function getIssuesPage(repo, token, page) {
    let url = `https://api.github.com/repos/${repo}/issues?state=all&per_page=${DEFAULT_PER_PAGE}`

    if (page !== undefined) {
        url = `${url}&page=${page}`;
    }

    return axios.get(url, {
        headers: {
            Accept: "application/vnd.github.v3.star+json",
            Authorization: token ? `token ${token}` : "",
        },
    })
}

export const getPullRequests = async (repo, maxRequestAmount, aggregateSize, token) => {

    if (!aggregateSize) {
        return structuredRequest(repo, maxRequestAmount, token, getPullRequestsPage)
    }

    const list_items = await structuredRequest(repo, maxRequestAmount, token, getPullRequestsPage)
    console.log(list_items.length)
    const results = new Array(list_items.length)

    // https://stackoverflow.com/questions/53948280/how-to-throttle-promise-all-to-5-promises-per-second
    async function doBlock(startIndex) {
        // Shallow-copy a block of promises to work on
        const currBlock = list_items.slice(startIndex, startIndex + maxRequestAmount);
        // Await the completion. If any fail, it will throw and that's good.
        const blockResults = await Promise.all(
            list_items.map(async (element) => {
                element.size = await getPullRequestSize(repo, token, element.number)
                return element
            })
        )
        // Assuming all succeeded, copy the results into the results array
        for (let ix = 0; ix < blockResults.length; ix++) {
            results[ix + startIndex] = blockResults[ix];
        }
    }

    for (let iBlock = 0; iBlock < list_items.length; iBlock += maxRequestAmount) {
        await doBlock(iBlock);
    }

    return results
}

export const getCommits = async (repo, maxRequestAmount, token) => structuredRequest(repo, maxRequestAmount, token, getCommitsPage)
export const getIssues = async (repo, maxRequestAmount, token) => structuredRequest(repo, maxRequestAmount, token, getIssuesPage)