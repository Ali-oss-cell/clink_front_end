import { Header } from '../Header/Header';
import { Footer } from '../Footer/Footer';
import type { User } from '../../../types/simple-auth';
import styles from './Layout.module.scss';

interface LayoutProps {
  children: React.ReactNode;
  user?: User | null;
  isAuthenticated?: boolean;
  showFooter?: boolean;
  className?: string;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  user,
  isAuthenticated = false,
  showFooter = true,
  className = ''
}) => {
  return (
    <div className={`${styles.layout} ${className}`}>
      <Header
        isAuthenticated={isAuthenticated}
        userRole={user?.role}
        userName={user?.full_name || user?.first_name}
      />
      
      <main className={styles.main}>
        {children}
      </main>
      
      {showFooter && <Footer />}
    </div>
  );
};
