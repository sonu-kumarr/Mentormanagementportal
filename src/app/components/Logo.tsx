export default function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'size-8',
    md: 'size-12',
    lg: 'size-16',
  };

  return (
    <div className={`${sizes[size]} relative flex items-center justify-center`}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Book base */}
        <path
          d="M20 25 L20 80 L50 75 L80 80 L80 25 L50 30 Z"
          fill="#4F46E5"
          stroke="#3730A3"
          strokeWidth="2"
        />
        {/* Book pages */}
        <path
          d="M25 30 L25 75 L48 71 L48 26 Z"
          fill="#6366F1"
        />
        <path
          d="M52 26 L52 71 L75 75 L75 30 Z"
          fill="#818CF8"
        />
        {/* Book spine */}
        <path
          d="M48 26 L50 30 L52 26 L52 71 L50 75 L48 71 Z"
          fill="#312E81"
        />
        {/* Graduation cap on book */}
        <path
          d="M50 15 L35 20 L35 25 L50 30 L65 25 L65 20 Z"
          fill="#DC2626"
          stroke="#991B1B"
          strokeWidth="1.5"
        />
        <path
          d="M65 25 L68 35 L50 35 L50 30 Z"
          fill="#B91C1C"
        />
        {/* Lines on book pages */}
        <line x1="30" y1="40" x2="43" y2="38" stroke="#E0E7FF" strokeWidth="1" />
        <line x1="30" y1="48" x2="43" y2="46" stroke="#E0E7FF" strokeWidth="1" />
        <line x1="30" y1="56" x2="43" y2="54" stroke="#E0E7FF" strokeWidth="1" />
        <line x1="57" y1="38" x2="70" y2="40" stroke="#C7D2FE" strokeWidth="1" />
        <line x1="57" y1="46" x2="70" y2="48" stroke="#C7D2FE" strokeWidth="1" />
        <line x1="57" y1="54" x2="70" y2="56" stroke="#C7D2FE" strokeWidth="1" />
      </svg>
    </div>
  );
}
