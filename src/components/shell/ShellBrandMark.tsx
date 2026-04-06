import { NavLink } from 'react-router-dom';
import styles from './ShellBrandMark.module.scss';

interface ShellBrandMarkProps {
  to: string;
  onClick?: () => void;
}

export const ShellBrandMark: React.FC<ShellBrandMarkProps> = ({ to, onClick }) => {
  return (
    <NavLink to={to} className={styles.link} onClick={onClick} aria-label="Tailored Psychology home">
      <img src="/logo-icon.png" alt="Tailored Psychology" className={styles.logo} />
    </NavLink>
  );
};
