const Search =({searchKey, setSearchKey}) =>{
    return (
        <div className="user-search-area">
            <input type='text' 
                className="user-search-text"
                value={searchKey}
                onChange={(e)=> setSearchKey(e.target.value)}
            />
            <i className="fa fa-search user-search-btn" aria-hidden="true" />
        </div>
    )

}
export default Search