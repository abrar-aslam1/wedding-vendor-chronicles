import { MainNav } from "@/components/MainNav";
import { SearchContainer } from "@/components/search/SearchContainer";

const Search = () => {
  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <SearchContainer />
    </div>
  );
};

export default Search;