// src/components/common/Card.jsx
export default function Card({ children, onClick }) {
  return (
    <div
  onClick={onClick}
  className="relative bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-lg 
                 border border-gray-200 dark:border-slate-700 cursor-pointer group 
                 transition-colors duration-300 overflow-visible"
>
      {children}
    </div>
  );
}
