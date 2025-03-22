import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { MdAdd, MdSearch, MdClose } from "react-icons/md";
import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";

interface ReleaseHeaderProps {
  onCreateClick: () => void;
  onSearch: (query: string) => void;
}

export const ReleaseHeader = ({ onCreateClick, onSearch }: ReleaseHeaderProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedValue] = useDebounce(searchQuery, 300); // 300ms 延迟

  // 使用 useEffect 监听防抖后的值
  useEffect(() => {
    onSearch(debouncedValue);
  }, [debouncedValue, onSearch]);

  const handleClearSearch = () => {
    setSearchQuery("");
    onSearch("");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-blue-600">Skeleton Release Management</h1>
        <Button
          onClick={onCreateClick}
          className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white h-12 px-6 flex gap-2 items-center justify-center font-medium shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-200"
        >
          <MdAdd className="w-5 h-5" />
          <span>Create Release</span>
        </Button>
      </div>

      <div className="relative">
        <Input
          type="text"
          placeholder="Search by release number or skeleton number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border-blue-200 bg-blue-50/50 focus:bg-white focus:ring-2 focus:ring-blue-200/50 h-12 pl-12 pr-10 text-sm transition-all duration-200"
        />
        <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
        {searchQuery && (
          <button
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
          >
            <MdClose className="w-4 h-4 text-gray-500 hover:text-gray-700" />
          </button>
        )}
      </div>
    </div>
  );
}; 