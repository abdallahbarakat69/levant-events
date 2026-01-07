import React from 'react';
import styles from './Input.module.css';

const Input = ({ label, type = 'text', name, value, onChange, placeholder, required = false, ...props }) => {
    return (
        <div className={styles.inputGroup}>
            {label && <label className={styles.label} htmlFor={name}>{label}</label>}
            <input
                id={name}
                name={name}
                type={type}
                className={styles.input}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                {...props}
            />
        </div>
    );
};

export default Input;
