import { FC, memo } from "react";
import ReactMarkdown, { Options } from "react-markdown";

export const MemoizedReactMarkdown: FC<Options> = memo( // Look into this
    ReactMarkdown,
    (prevProps, nextProps) =>
        prevProps.children === nextProps.children &&
        prevProps.className === nextProps.className,
);
