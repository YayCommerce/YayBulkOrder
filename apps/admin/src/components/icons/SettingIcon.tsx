import { cn } from '@/lib/utils';

const SettingIcon = ({ className = '', ...props }) => (
  <svg
    viewBox="0 0 17 16"
    data-icon="setting"
    width="17"
    height="17"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn('text-[#1D2327]', className)}
    {...props}
  >
    <path d="M1.125 5.95247V10.0396C1.125 11.5412 1.125 11.5412 2.54167 12.4975L6.4375 14.75C7.02542 15.09 7.98167 15.09 8.5625 14.75L12.4583 12.4975C13.875 11.5412 13.875 11.5412 13.875 10.0467V5.95247C13.875 4.45789 13.875 4.45789 12.4583 3.50164L8.5625 1.24914C7.98167 0.909137 7.02542 0.909137 6.4375 1.24914L2.54167 3.50164C1.125 4.45789 1.125 4.45789 1.125 5.95247Z" />
    <path d="M7.5 10.125C8.67364 10.125 9.625 9.17364 9.625 8C9.625 6.82636 8.67364 5.875 7.5 5.875C6.32636 5.875 5.375 6.82636 5.375 8C5.375 9.17364 6.32636 10.125 7.5 10.125Z" />
  </svg>
);

export default SettingIcon;
