export default function WhatsAppFloat({ minimalOnMobile = false }) {
  return (
    <button className={`whatsapp-float${minimalOnMobile ? ' whatsapp-float-refined' : ''}`} type="button" data-popup="fale-comigo" aria-label="Falar no WhatsApp">
      {minimalOnMobile && (
        <svg className="contact-outline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
          <path d="M20.5 11.5a8.5 8.5 0 0 1-12.7 7.4L3 20l1.1-4.8a8.5 8.5 0 1 1 16.4-3.7Z" />
          <path d="m8.1 7.3 1.7-.3 1 2.5-1.1 1a9 9 0 0 0 3.8 3.8l1-1.1 2.5 1-.3 1.7c-.1.6-.7 1-1.3.9A10.9 10.9 0 0 1 7.2 8.6c-.1-.6.3-1.2.9-1.3Z" />
        </svg>
      )}
      <svg className="contact-brand-icon" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
        <path
          fill="#fff"
          d="M16.001 3C9.1 3 3.5 8.6 3.5 15.5c0 2.4.67 4.65 1.83 6.57L3 29l7.1-2.3a12.4 12.4 0 0 0 5.9 1.5h.01c6.9 0 12.5-5.6 12.5-12.5S22.9 3 16 3zm0 22.7h-.01a10.2 10.2 0 0 1-5.2-1.43l-.37-.22-3.86 1.25 1.27-3.76-.24-.39a10.17 10.17 0 0 1-1.56-5.42c0-5.64 4.59-10.23 10.24-10.23 2.74 0 5.31 1.07 7.24 3 1.93 1.93 3 4.5 3 7.24 0 5.65-4.6 10.24-10.24 10.24zm5.6-7.66c-.31-.15-1.82-.9-2.1-1-.28-.1-.49-.15-.69.15-.2.3-.79 1-.97 1.2-.18.2-.36.23-.67.08-.31-.15-1.3-.48-2.48-1.53-.92-.82-1.54-1.83-1.72-2.14-.18-.31-.02-.47.13-.62.14-.14.31-.36.46-.54.15-.18.2-.31.31-.51.1-.2.05-.38-.02-.53-.08-.15-.69-1.67-.95-2.28-.25-.6-.5-.52-.69-.53h-.59c-.2 0-.53.08-.8.38-.28.3-1.05 1.02-1.05 2.5s1.08 2.9 1.23 3.1c.15.2 2.13 3.25 5.16 4.56.72.31 1.28.5 1.72.64.72.23 1.38.2 1.9.12.58-.09 1.82-.74 2.08-1.46.26-.72.26-1.33.18-1.46-.08-.13-.28-.2-.59-.36z"
        />
      </svg>
    </button>
  );
}
