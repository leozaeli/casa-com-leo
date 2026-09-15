const paths = {
  diagonal: 'M6 18 18 6M6 6h12v12',
  right: 'M4 12h16m-6-6 6 6-6 6',
  down: 'M12 4v16m-6-6 6 6 6-6',
  left: 'M20 12H4m6-6-6 6 6 6',
  close: 'm6 6 12 12M6 18 18 6',
};

export default function ExperienceIcon({ direction = 'diagonal' }) {
  return (
    <svg className="experience-icon" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d={paths[direction]} />
    </svg>
  );
}
