import { ForwardedRef, forwardRef } from "react";

import Link from "next/link";
import { BeatLoader } from "react-spinners";

interface ButtonProps {
  children?: React.ReactNode;
  variant?: "contained" | "outlined" | "text";
  className?: string;
  childClassName?: string;
  preIcon?: React.ReactNode;
  postIcon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  loaderColor?: string;
  path?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  buttonStyle?: React.CSSProperties;
  buttonProps?: React.HTMLProps<HTMLButtonElement>;
}

// eslint-disable-next-line react/display-name
const ButtonBase: React.FC<ButtonProps> = forwardRef(
  (
    {
      children,
      variant = "contained",
      className = "",
      childClassName = "",
      preIcon,
      postIcon,
      loading,
      disabled,
      loaderColor = "white",
      buttonStyle,
      ...buttonProps
    },
    ref: ForwardedRef<HTMLButtonElement>
  ) => {
    let buttonClassName: string;

    if (variant === "contained") {
      buttonClassName =
        "flex items-center block bg-purple min-h-[58px] px-12 rounded-8 text-white font-public normal-case font-semibold hover:bg-white hover:text-blue";
    } else if (variant === "outlined") {
      buttonClassName =
        "border border-purple min-h-[58px] px-12 border-solid text-white font-public normal-case font-semibold rounded-8 hover:bg-white hover:text-blue hover:border-transparent";
    } else {
      buttonClassName =
        "relative flex items-center justify-center z-10 text-white font-public normal-case font-semibold hover:bg-transparent px-0 bg-transparent";
      childClassName = `relative before:content-[''] before:absolute before:bg-white before:w-[0px] before:h-[2px] before:z-0 before:bottom-0 hover:before:w-full before:transition-all ${childClassName}`;
    }

    buttonClassName = `${buttonClassName} ${className} transition-all duration-350`;
    childClassName = `m-auto ${childClassName}`;

    return (
      <button
        ref={ref}
        {...buttonProps}
        disabled={disabled || loading}
        className={buttonClassName}
        style={buttonStyle}
      >
        {loading ? (
          <BeatLoader color={loaderColor} className="m-auto" />
        ) : (
          <>
            {!!preIcon && (
              <div className="mr-3 flex items-center justify-center">
                {preIcon}
              </div>
            )}

            <div className={childClassName}>{children}</div>

            {!!postIcon && (
              <div className="ml-3 flex items-center justify-center">
                {postIcon}
              </div>
            )}
          </>
        )}
      </button>
    );
  }
);

const Button: React.FC<ButtonProps> = ({ path, ...props }) => {
  if (path) {
    return (
      <Link href={path}>
        <ButtonBase {...props} />
      </Link>
    );
  }

  return <ButtonBase {...props} />;
};

export default Button;
