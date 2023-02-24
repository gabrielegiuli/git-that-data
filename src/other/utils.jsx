export function groupBy(xs, key) {
    return xs.reduce(function (rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  };
  
  export function getPosition(string, subString, index) {
    return string.split(subString, index).join(subString).length;
  }

  export function removeDuplicates(myArr, prop) {
    return myArr.filter((obj, pos, arr) => {
      return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos
    })
  }
  
  export function range(from, to) {
    const r = [];
    for (let i = from; i <= to; i++) {
      r.push(i);
    }
    return r;
  }