import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface TransProps {
  children: string;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  [key: string]: any;
}

/**
 * Usage: <Trans>Your text here</Trans>
 * Optionally: <Trans as="span" className="font-bold">Text</Trans>
 */
const Trans: React.FC<TransProps> = ({ children, as = 'span', className, ...rest }) => {
  const { t } = useLanguage();
  const Tag = as as any;
  return (
    <Tag data-i18n={children} className={className} {...rest}>
      {t(children)}
    </Tag>
  );
};

export default Trans;
