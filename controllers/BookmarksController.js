const Repository = require('../models/Repository');
const Bookmark = require('../models/bookmark');

module.exports =
    class BookmarksController extends require('./Controller') {
        constructor(req, res, params) {
            super(req, res, params);
            this.bookmarksRepository = new Repository('Bookmarks');
        }
        head(){
            this.response.ETag(this.bookmarksRepository.getEtag());
        }
        queryStringParamsList() {
            let content = "<div style=font-family:arial>";
            content += "<h4>List of parameters in query strings:</h4>";
            content += "<h4>? sort=key <br> return all bookmarks sorted by key values (Id, Name, Category, Url)";
            content += "<h4>? sort=key,desc <br> return all bookmarks sorted by descending key values";
            content += "<h4>? key=value <br> return the bookmark with key value = value";
            content += "<h4>? key=value* <br> return the bookmark with key value that start with value";
            content += "<h4>? key=*value* <br> return the bookmark with key value that contains value";
            content += "<h4>? key=*value <br> return the bookmark with key value end with value";
            content += "<h4>page?limit=int&offset=int <br> return limit bookmarks of page offset";
            content += "</div>";
            return content;
        }
        queryStringHelp() {
            // expose all the possible query strings
            this.res.writeHead(200, { 'content-type': 'text/html' });
            this.res.end(this.queryStringParamsList());
        }
        // GET: api/bookmarks
        // GET: api/bookmarks?sort=key&key=value....
        // GET: api/bookmarks/{id}
        get(id) {
            if (this.params) {
                if (Object.keys(this.params).length > 0) {
                    this.response.JSON(this.bookmarksRepository.getAll(this.params));
                } else {
                    this.queryStringHelp();
                }
            }
            else {
                if (!isNaN(id)) {
                    this.response.JSON(this.bookmarksRepository.get(id));
                }
                else {
                    this.response.JSON(this.bookmarksRepository.getAll(this.params));
                }
            }
        }
        // POST: api/bookmarks body payload[{"Id": ..., "Name": "...", "Url": "...", "Category": "..."}]
        post(bookmark) {
            // validate bookmark before insertion
            if (Bookmark.valid(bookmark)) {
                // avoid duplicate names
                if (this.bookmarksRepository.findByField('Name', bookmark.Name) !== null) {
                    this.response.conflict();
                } else {
                    let newBookmark = this.bookmarksRepository.add(bookmark);
                    if (newBookmark)
                        this.response.created(newBookmark);
                    else
                        this.response.internalError();
                }
            } else
                this.response.unprocessable();
        }
        // PUT: api/bookmarks body payload[{"Id":..., "Name": "...", "Url": "...", "Category": "..."}]
        put(bookmark) {
            // validate bookmark before updating
            if (Bookmark.valid(bookmark)) {
                let foundBookmark = this.bookmarksRepository.findByField('Name', bookmark.Name);
                if (foundBookmark != null) {
                    if (foundBookmark.Id != bookmark.Id) {
                        this.response.conflict();
                        return;
                    }
                }
                if (this.bookmarksRepository.update(bookmark))
                    this.response.ok();
                else
                    this.response.notFound();
            } else
                this.response.unprocessable();
        }
        // DELETE: api/bookmarks/{id}
        remove(id) {
            if (this.bookmarksRepository.remove(id))
                this.response.accepted();
            else
                this.response.notFound();
        }
    }