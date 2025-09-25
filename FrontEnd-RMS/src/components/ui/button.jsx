

export default function Button({ onPress, caption, variant, size, className, ...props }) {
    //Base classes that apply for all button
    const baseClasses = "rounded-full font-normal border-none cursor-pointer flex items-center justify-center transition-all duration-200";

    // Variant classes based on the variant prop
    const variants = {
        primary: "bg-blue-500 text-white hover:bg-blue-700",    
        secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
        outline: "bg-transparent border border-gray-300 text-gray-800 hover:bg-gray-100",
        text: "bg-transparent text-blue-600 hover:bg-blue-50",
    };
    // Size classes based on the size prop
    const sizes = {
        small: "px-3 py-1 text-sm",
        medium: "px-4 py-2 text-base",
        large: "px-5 py-3 text-lg",
    };
    

    // Combine all classes
    const buttonClasses =`
        ${baseClasses}
        ${variants[variant]}
        ${sizes[size]}
    
        ${className || ""}
    `.trim().replace(/\s+/g, ' ');

    return (
        <button
            onClick={onPress}
            className={buttonClasses}
            
            {...props}
        >
            {caption}
        </button>
    );
}

