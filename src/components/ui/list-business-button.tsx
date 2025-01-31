export const ListBusinessButton = () => {
  return (
    <button
      className="group relative inline-block w-full md:w-auto cursor-pointer outline-none border-0 bg-transparent p-0 text-base font-inherit"
    >
      <span className="absolute top-0 left-0 h-10 w-10 rounded-full bg-wedding-primary transition-all duration-450 ease-out group-hover:w-full group-hover:shadow-lg group-active:scale-95">
        <span className="absolute top-1/2 left-3 -translate-y-1/2 w-4 h-0.5">
          <span className="absolute right-0.5 -top-1 h-2.5 w-2.5 rotate-45 border-t-2 border-r-2 border-white"></span>
        </span>
      </span>
      <span className="relative block py-3 px-6 text-center font-bold uppercase tracking-wider text-wedding-text/50 transition-all duration-450 ease-out group-hover:translate-x-0 group-hover:text-white">
        List Business
      </span>
    </button>
  );
};