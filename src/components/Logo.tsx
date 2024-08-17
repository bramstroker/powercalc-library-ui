export interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

const Logo = (props: LogoProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    data-name="Layer 2"
    viewBox="0 0 50.41 60.79"
    {...props}
  >
    <path
      d="m16.17 26.61-8.08 6.84v-23.2c0-.61.5-1.11 1.11-1.11h6.97v17.48Zm10.55-8.92-8.08 6.84V9.14h8.08v8.55Zm2.47-2.1V9.13h7.63l-7.63 6.46ZM6.11 59.15s0-.01.01-.02l7.18-12.54.47-.81 5.31-9.29H8.43c-.39 0-.57-.48-.27-.73l8-6.77 2.47-2.09 8.08-6.84 2.47-2.09 8.08-6.84-8.08 14.61-2.47 4.48h6.98c.77 0 1.26.81.92 1.49L25.2 50.52l2.19-.19c6.09-.52 11.55-3.21 15.63-7.29a25.066 25.066 0 0 0 7.38-17.65C50.49 11.44 38.7.02 24.75.02H9.64C4.32 0 0 4.32 0 9.64v47.87c0 3.35 4.44 4.54 6.11 1.65Z"
      data-name="Layer 1"
      style={{
        fill: "#fff",
        strokeWidth: 0,
      }}
    />
  </svg>
);
export default Logo;
