type Props = {
  options: string[];
  defaultSelected: string;
  id: string;
  onSelectedChange: (selected: string) => void;
};

const Dropdown = ({
  options,
  defaultSelected,
  id,
  onSelectedChange,
}: Props) => {
  const renderedOptions = options.map((option) => {
    return (
      <option key={option} value={option}>
        {option}
      </option>
    );
  });

  return (
    <select
      id={id}
      className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
      onChange={(e) => onSelectedChange(e.target.value)}
      defaultValue={defaultSelected}
    >
      {renderedOptions}
    </select>
  );
};

export default Dropdown;
