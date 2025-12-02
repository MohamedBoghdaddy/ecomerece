import "../Styles/navbar.css";
import SearchResult from "./SearchResult";

function SearchResultsList({ results }) {
  return (
    <div className="results-list">
      {results.map((result, id) => (
        <SearchResult result={result} key={id} />
      ))}
    </div>
  );
}

export default SearchResultsList;
