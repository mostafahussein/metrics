//Imports
import rss from "rss-parser"

//Setup
export default async function({login, q, imports, data, account}, {enabled = false, extras = false} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!q.rss) || (!imports.metadata.plugins.rss.enabled(enabled, {extras})))
      return null

    //Load inputs
    let {source, limit} = imports.metadata.plugins.rss.inputs({data, account, q})
    if (!source)
      throw {error: {message: "RSS feed URL is not set"}}

    //Set User-Agent header
    const parser = new rss({ //eslint-disable-line new-cap
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "DNT": "1",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1"
      }
    })

    //Load rss feed
    const {title, description, link, items} = await parser.parseURL(source)
    const feed = items.map(({title, link, isoDate: date}) => ({title, link, date: new Date(date)}))

    //Limit feed
    if (limit > 0) {
      console.debug(`metrics/compute/${login}/plugins > rss > keeping only ${limit} items`)
      feed.splice(limit)
    }

    //Results
    return {source: title, description, link, feed}
  }
  //Handle errors
  catch (error) {
    throw imports.format.error(error)
  }
}
