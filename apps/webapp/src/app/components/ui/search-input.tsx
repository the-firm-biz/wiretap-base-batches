import { textStyles } from '@/app/styles/template-strings';
import { CloseIcon } from '../icons/CloseIcon';
import { SearchIcon } from '../icons/SearchIcon';
import { Input } from './input';

interface SearchInputProps extends React.ComponentProps<'input'> {
  onClear?: () => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  onClear,
  ...props
}) => {
  const isEmpty = props.value === '';
  return (
    <div className="relative">
      <SearchIcon className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2" />
      <Input className={`${textStyles.compact} pl-7`} {...props} />
      {onClear && !isEmpty && (
        <button
          className="absolute cursor-pointer right-2 top-1/2 h-4 w-4 -translate-y-1/2"
          onClick={onClear}
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
