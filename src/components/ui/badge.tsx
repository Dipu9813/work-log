import * as React from "react"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className = '', variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-gradient-to-r from-[#D91A7A] to-[#E91E63] text-white shadow-sm',
      secondary: 'bg-gradient-to-r from-[#F26522] to-[#FCC30B] text-white shadow-sm',
      destructive: 'bg-red-500 text-white shadow-sm',
      outline: 'border-2 border-[#D91A7A] text-[#D91A7A] bg-white'
    }
    return (
      <div
        ref={ref}
        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variants[variant]} ${className}`}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"

export { Badge }