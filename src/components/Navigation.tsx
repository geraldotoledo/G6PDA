import React from 'react';
import { ScanText, ShoppingBag, Pill, AlertCircle, BookOpen } from 'lucide-react';

export type ActiveTab = 'SCANNER' | 'PANTRY' | 'DRUGS' | 'EMERGENCY' | 'ABOUT';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'SCANNER' as ActiveTab, label: 'Scanner', icon: ScanText },
    { id: 'PANTRY' as ActiveTab, label: 'Despensa', icon: ShoppingBag },
    { id: 'DRUGS' as ActiveTab, label: 'Remédios', icon: Pill },
    { id: 'EMERGENCY' as ActiveTab, label: 'Emergência', icon: AlertCircle },
    { id: 'ABOUT' as ActiveTab, label: 'Sobre', icon: BookOpen }
  ];

  return (
    <nav className="bottom-nav no-print" aria-label="Navegação principal">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onTabChange(tab.id)}
            className={`nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={21} aria-hidden="true" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
