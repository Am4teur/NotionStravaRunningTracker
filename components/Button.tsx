interface IButtonProps {
  children: string;
  onClick?: () => {} | void;
  disabled?: boolean;
  color?: string;
  stravaIcon?: boolean;
  notionIcon?: boolean;
  type?: "button" | "submit" | "reset" | undefined;
}

const Button = ({
  children,
  onClick,
  disabled = false,
  color = "bg-blue-500",
  stravaIcon = false,
  type,
}: IButtonProps) => {
  return disabled ? (
    <button
      className={`${color} text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed inline-flex items-center gap-2`}
      type={type}
    >
      {stravaIcon ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 64 64"
        >
          <path
            d="M41.03 47.852l-5.572-10.976h-8.172L41.03 64l13.736-27.124h-8.18"
            fill="#f9b797"
          />
          <path
            d="M27.898 21.944l7.564 14.928h11.124L27.898 0 9.234 36.876H20.35"
            fill="#f05222"
          />
        </svg>
      ) : null}

      <span>{children}</span>
    </button>
  ) : (
    <button
      className={`${color} hover:${color} text-white font-bold py-2 px-4 rounded inline-flex items-center gap-2`}
      onClick={onClick}
    >
      {stravaIcon ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 64 64"
        >
          <path
            d="M41.03 47.852l-5.572-10.976h-8.172L41.03 64l13.736-27.124h-8.18"
            fill="#f9b797"
          />
          <path
            d="M27.898 21.944l7.564 14.928h11.124L27.898 0 9.234 36.876H20.35"
            fill="#f05222"
          />
        </svg>
      ) : null}
      <span>{children}</span>
    </button>
  );
};

export default Button;
