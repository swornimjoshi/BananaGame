import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

/**
 * Reusable Chunky 3D Button Component
 * Variants: 'primary' | 'secondary' | 'ghost' | 'danger'
 * Sizes: 'sm' | 'md' | 'lg'
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  to,
  type = 'button',
  className = '',
  id,
  title,
  icon,
  as: Component,
  ...props
}) => {
  // Variant CSS class names
  const variantClass = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
  }[variant] || 'btn-primary';

  // Size CSS class names
  const sizeClass = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
  }[size] || '';

  const combinedClass = `btn ${variantClass} ${sizeClass} ${className}`.trim();

  // If `to` is provided, render Link wrapped with motion
  if (to) {
    return (
      <motion.div
        whileHover={!disabled ? { scale: 1.02 } : {}}
        whileTap={!disabled ? { y: 3 } : {}}
        style={{ display: 'inline-block' }}
      >
        <Link
          to={to}
          id={id}
          className={combinedClass}
          title={title}
          aria-disabled={disabled}
          onClick={disabled ? (e) => e.preventDefault() : onClick}
          {...props}
        >
          {icon && <span className="btn-icon">{icon}</span>}
          {children}
        </Link>
      </motion.div>
    );
  }

  // If custom Component is provided
  if (Component) {
    return (
      <Component
        id={id}
        className={combinedClass}
        onClick={onClick}
        disabled={disabled}
        title={title}
        {...props}
      >
        {icon && <span className="btn-icon">{icon}</span>}
        {children}
      </Component>
    );
  }

  return (
    <motion.button
      id={id}
      type={type}
      className={combinedClass}
      onClick={onClick}
      disabled={disabled}
      title={title}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { y: 3 } : {}}
      {...props}
    >
      {icon && <span className="btn-icon">{icon}</span>}
      {children}
    </motion.button>
  );
};

export default Button;
