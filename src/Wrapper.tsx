import { useEffect, useRef } from "react";

export interface WrapperProps {
    children : any;
    onOutsideClick: Function;
    disabled: boolean;
    wrapperStyle: object;
    className: string;
}

export default function Wrapper({ children, onOutsideClick, disabled, wrapperStyle }: WrapperProps) {
    const wrapperRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const triggered = (e: { target: any }) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                if (!e.target.classList.contains('ignore')) {
                    onOutsideClick(e)
                }
            }
        }
        if (!disabled) {
            document.addEventListener("mousedown", triggered);
        }
        return () => {
            document.removeEventListener("mousedown", triggered);
        };
    });

    return (
        <div
        ref={ wrapperRef }
        className='wrapper'
        style={ wrapperStyle }
        >
            {children}
        </div>
    )
}