import "../Styles/navbar.css";

function SearchResult({ result }) {
  return (
    <div className="search-result">
      <p>{result.products}</p>
    </div>
  );
}

export default SearchResult;
