import { useState, useEffect, useRef } from "react";

interface ContactsSearchProps {
  onSearchChange: (value: string) => void;
}

export function ContactsSearch({ onSearchChange }: ContactsSearchProps) {
  const [input, setInput] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      onSearchChange(input);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [input, onSearchChange]);

  return (
    <div className="contacts-search" data-testid="contacts-search">
      <div className="clients-search-wrapper">
        <svg className="clients-search-icon" width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3" />
          <path d="M9.5 9.5L12.5 12.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
        <input
          className="clients-search-input"
          data-testid="contacts-search-input"
          type="text"
          placeholder="Search contacts by name, email, title, phone, or location..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>
    </div>
  );
}
