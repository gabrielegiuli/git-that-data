import axios from 'axios'
import { range } from './utils';

const DEFAULT_PER_PAGE = 100;

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

export default async function getCommits(repo, maxRequestAmount, token) {
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