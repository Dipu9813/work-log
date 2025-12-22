import * as React from "react"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background transform hover:scale-105 active:scale-95';
    const variants = {
      default: 'bg-gradient-to-r from-[#D91A7A] to-[#E91E63] text-white hover:from-[#C5197D] hover:to-[#D91A7A] shadow-md hover:shadow-lg',
      destructive: 'bg-red-600 text-white hover:bg-red-700 shadow-md',
      outline: 'border-2 border-[#D91A7A] bg-white hover:bg-pink-50 text-[#D91A7A]',
      secondary: 'bg-gradient-to-r from-[#F26522] to-[#FCC30B] text-white hover:from-[#E55512] hover:to-[#EBB300] shadow-md hover:shadow-lg',
      ghost: 'hover:bg-pink-50 text-[#D91A7A]',
      link: 'underline-offset-4 hover:underline text-[#D91A7A]'
    };

    const sizes = {
      default: 'h-10 py-2 px-4',
      sm: 'h-9 px-3 rounded-lg',
      lg: 'h-11 px-8 rounded-lg'
    }

    return (
      <button
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }