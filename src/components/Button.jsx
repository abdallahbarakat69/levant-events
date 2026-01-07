import React from 'react';
import styles from './Button.module.css';

const Button = ({ children, variant = 'primary', type = 'button', onClick, className = '', disabled = false, ...props }) => {
    return (
        <button
            type={type}
            className={`${styles.button} ${styles[variant]} ${className}`}
            onClick={onClick}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
