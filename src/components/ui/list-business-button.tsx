export const ListBusinessButton = () => {
  return (
    <div className="relative h-10">
      <button className="flex items-center justify-around h-10 px-4 bg-wedding-secondary cursor-pointer shadow-[4px_6px_0px_#4a4a4a] border-4 border-wedding-text rounded-xl relative overflow-hidden z-10 transition-all duration-250 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_3px_0px_#4a4a4a] active:saturate-75 group">
        <div className="relative flex justify-start items-center overflow-hidden max-w-[35%] text-sm font-semibold text-wedding-text">
          <span className="relative transform -translate-x-full transition-all duration-250 group-hover:translate-x-0">
            List Business
          </span>
          <span className="relative transform -translate-x-full transition-all duration-250 group-hover:translate-x-0">
            List Business
          </span>
        </div>
        <div className="p-1 ml-2 border-2 border-wedding-text rounded-full bg-wedding-primary relative overflow-hidden transition-all duration-250 group-hover:translate-x-[5px] group-active:translate-x-[8px] z-10">
          <svg width={16} height={16} viewBox="0 0 45 38" fill="none" xmlns="http://www.w3.org/2000/svg" className="align-middle">
            <path d="M43.7678 20.7678C44.7441 19.7915 44.7441 18.2085 43.7678 17.2322L27.8579 1.32233C26.8816 0.34602 25.2986 0.34602 24.3223 1.32233C23.346 2.29864 23.346 3.88155 24.3223 4.85786L38.4645 19L24.3223 33.1421C23.346 34.1184 23.346 35.7014 24.3223 36.6777C25.2986 37.654 26.8816 37.654 27.8579 36.6777L43.7678 20.7678ZM0 21.5L42 21.5V16.5L0 16.5L0 21.5Z" fill="#4a4a4a" />
          </svg>
          <div className="absolute inset-0 bg-wedding-secondary transform -translate-x-full transition-transform duration-250 group-hover:translate-x-0 rounded-full"></div>
        </div>
        <div className="absolute inset-0 bg-wedding-primary transform -translate-x-full transition-transform duration-250 group-hover:translate-x-0 rounded-xl -z-10"></div>
      </button>
    </div>
  );
};