import React from "react";

interface WrapperProps {
  title: string;
  children: React.ReactNode;
}

export const Wrapper = (props: WrapperProps) => {
  const { title, children } = props;

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="font-bold text-[30px] mb-2">| {title} |</div> {/* Render title content */}
      <div className="w-full">{children}</div> {/* Render children content */}
    </div>
  );
};
