import { useState } from 'react';
import { useI18n } from '../../i18n/context';
import { FaSearch, FaTimes } from 'react-icons/fa';

type OracleSearchProps = {
  onSearchChange: (query: string) => void;
};

export function OracleSearch({ onSearchChange }: OracleSearchProps) {
  const { t } = useI18n();
  const [query, setQuery] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearchChange(value);
  };

  const handleClear = () => {
    setQuery('');
    onSearchChange('');
  };

  return (
    <div className="oracle-search">
      <FaSearch className="search-icon" />
      <input
        type="text"
        className="search-input"
        placeholder={t('search.placeholder')}
        value={query}
        onChange={handleChange}
      />
      {query && (
        <button 
          className="search-clear"
          onClick={handleClear}
          aria-label="Clear search"
        >
          <FaTimes />
        </button>
      )}
    </div>
  );
}
